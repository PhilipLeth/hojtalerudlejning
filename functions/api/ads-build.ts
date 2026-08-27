/* ───── Byg annoncegrupper til ét produkt (admin) ─────
 *
 * GET  /api/ads-build?productId=roeg
 *   Forslag til fem temagrupper: keywords med søgevolumen og dublet-mærke,
 *   færdig annoncetekst og landingsside. Skriver intet.
 *
 * POST /api/ads-build
 *   { action: "validate" }  → sender alt til Google med validateOnly, så
 *                             policy- og formatfejl kommer frem før upload
 *   { action: "create" }    → opretter grupperne
 *   { action: "save_terms" }→ gemmer produktets søgetermer
 *
 * Klienten må rette teksten undervejs, men serveren validerer alt igen før
 * noget skrives: tegngrænser, at frasen står i annoncen, og at landingssiden
 * findes og ikke er et produkt vi har taget af sortimentet. Samme grundregel
 * som i pricing.ts — det klienten sender er et ønske, ikke en sandhed.
 *
 * Nye grupper oprettes PAUSED og skrives ind i `ads_mapping`, så de er bundet
 * til deres produkt fra første sekund. Det er dét, der gør at udsolgt-reglerne
 * i /api/ads-rules dækker dem uden videre.
 */

import { requireAdmin } from "./_lib/adminAuth";
import {
  AdsNotConfigured,
  BOFU_LABEL,
  createAdGroup,
  findLabel,
  keywordVolume,
  labelCriteria,
  listKeywords,
  missingConfig,
  SEARCH_CAMPAIGN_ID,
  type ExistingKeyword,
  type GoogleAdsEnv,
  type NewAdGroup,
} from "./_lib/googleads";
import { adGroupName, intentThemes, seedTerms, type IntentTheme } from "../../src/lib/adsIntent";
import { buildAdCopy, validateAdCopy, type AdCopy } from "../../src/lib/adsCopy";
import { productCatalog, type CatalogProduct } from "./_lib/catalog";
import { PAUSEDE_SIDER } from "../../src/lib/products";
import { hasEnglish } from "../../src/lib/enPages";

interface Env extends GoogleAdsEnv {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const KV_CATALOG = "products_catalog";
const KV_MAPPING = "ads_mapping";
const KV_TERMS = "ads_terms";
const KV_LOG = "ads_build_log";

/** Standardbud i mikroenheder. Samme niveau som BOFU-grupperne står på. */
const DEFAULT_BID_MICROS = 9_000_000;
/** Et bud under en krone serverer reelt ikke — det var Yderområders fejl. */
const MIN_BID_MICROS = 1_000_000;
const MAX_BID_MICROS = 50_000_000;
/** Loft pr. upload, så en fejlagtig POST ikke fylder kontoen. */
const MAX_GROUPS_PER_REQUEST = 12;
/** Kun de seneste kørsler gemmes — loggen er til at kigge tilbage, ikke et arkiv. */
const LOG_LIMIT = 100;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

async function readJson<T>(kv: KVNamespace, key: string, fallback: T): Promise<T> {
  const raw = await kv.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Prisen for levering én vej, som annonceteksten skriver.
 * Hentes af det levende katalog — står den anderledes i KV end i koden, er
 * det KV der gælder for kunden, og så skal annoncen sige det samme.
 */
function deliveryPrice(catalog: CatalogProduct[]): number {
  return catalog.find((p) => p.id === "levering_ud")?.price ?? 0;
}

/** Sider vi må sende trafik til, og sider vi ikke må. */
function pageSets(catalog: CatalogProduct[]): { known: string[]; paused: string[] } {
  const known: string[] = [];
  const paused = new Set(PAUSEDE_SIDER);
  for (const p of catalog) {
    if (!p.page) continue;
    known.push(p.page);
    // Et produkt kan være skjult i KV uden at være skjult i koden
    if (p.hidden) paused.add(p.page);
  }
  return { known: [...new Set(known)], paused: [...paused] };
}

/* ───── Forslaget ───── */

interface ProposedKeyword {
  text: string;
  matchType: "PHRASE";
  bofu: boolean;
  /** Gennemsnitlige månedlige søgninger. null = Google kender ikke frasen. */
  volume: number | null;
  /** Findes frasen allerede i kontoen? Så byder vi mod os selv. */
  duplicateIn: string | null;
  /** Foreslået afkrydset i UI'et. */
  recommended: boolean;
}

interface ProposedGroup {
  themeKey: string;
  label: string;
  name: string;
  primary: string;
  keywords: ProposedKeyword[];
  cpcBidMicros: number;
  finalUrl: string;
  path1?: string;
  headlines: string[];
  descriptions: string[];
  errors: string[];
}

function proposeGroups(
  product: CatalogProduct,
  themes: IntentTheme[],
  volumes: Record<string, number | null>,
  existing: Map<string, ExistingKeyword>,
  pages: { known: string[]; paused: string[] },
  deliveryPrice: number,
): ProposedGroup[] {
  return themes.map((theme) => {
    const copy: AdCopy = buildAdCopy(
      { name: product.name, price: product.price, page: product.page!, contents: product.contents },
      theme,
      { deliveryPrice },
    );
    const keywords: ProposedKeyword[] = theme.keywords.map((k) => {
      const dupe = existing.get(k.text);
      const volume = volumes[k.text] ?? null;
      return {
        text: k.text,
        matchType: k.matchType,
        bofu: k.bofu,
        volume,
        duplicateIn: dupe ? `${dupe.campaignName} / ${dupe.adGroupName}` : null,
        // Uden lejeord, uden volumen eller allerede i kontoen: vis den, men
        // lad være med at krydse den af. Det er sådan man undgår at bygge
        // endnu en gruppe der aldrig viser noget.
        recommended: k.bofu && !dupe && volume !== 0,
      };
    });

    return {
      themeKey: theme.key,
      label: theme.label,
      name: adGroupName(product.name, theme),
      primary: theme.primary,
      keywords,
      cpcBidMicros: DEFAULT_BID_MICROS,
      finalUrl: copy.finalUrl,
      path1: copy.path1,
      headlines: copy.headlines,
      descriptions: copy.descriptions,
      errors: validateAdCopy(copy, theme.primary, pages.known, pages.paused),
    };
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  const kv = context.env.BOOKINGS;
  const productId = new URL(context.request.url).searchParams.get("productId") ?? "";

  try {
    const [catalogRaw, termsMap, mapping] = await Promise.all([
      readJson<unknown>(kv, KV_CATALOG, null),
      readJson<Record<string, string[]>>(kv, KV_TERMS, {}),
      readJson<Record<string, string[]>>(kv, KV_MAPPING, {}),
    ]);

    // productCatalog falder tilbage på kodens katalog, hvis KV er tomt — så
    // annoncerne bygges på præcis det, kunden ser på sitet
    const catalog = productCatalog(catalogRaw);

    const products = catalog.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      page: p.page,
      hidden: p.hidden,
      adGroupCount: (mapping[p.id] ?? []).length,
    }));

    // Uden et valgt produkt er svaret bare listen at vælge fra
    if (!productId) return json({ products, campaignId: SEARCH_CAMPAIGN_ID });

    const product = catalog.find((p) => p.id === productId);
    if (!product) return json({ error: `Ukendt produkt: ${productId}`, products }, 404);
    if (!product.page) {
      return json({ error: `${product.name} har ingen produktside at sende trafik til.`, products }, 400);
    }

    const terms = termsMap[productId]?.length ? termsMap[productId] : seedTerms(product.name);
    const themes = intentThemes(terms, { english: hasEnglish(product.page) });
    const pages = pageSets(catalog);
    const alleFraser = themes.flatMap((t) => t.keywords.map((k) => k.text));

    // Google Ads er valgfrit — forslaget skal kunne ses uden credentials,
    // bare uden volumen og dublet-tjek.
    let volumes: Record<string, number | null> = {};
    let existing = new Map<string, ExistingKeyword>();
    let adsError: string | null = null;
    const missing = missingConfig(context.env);
    if (missing.length) {
      adsError = `Google Ads er ikke konfigureret. Mangler: ${missing.join(", ")}`;
    } else {
      try {
        const [vol, kws] = await Promise.all([
          keywordVolume(context.env, alleFraser),
          listKeywords(context.env),
        ]);
        volumes = vol;
        existing = new Map(kws.map((k) => [k.text, k]));
      } catch (e) {
        adsError = e instanceof Error ? e.message : "Ukendt fejl mod Google Ads";
      }
    }

    return json({
      products,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        page: product.page,
        contents: product.contents ?? [],
      },
      terms,
      seededTerms: !termsMap[productId]?.length,
      groups: proposeGroups(product, themes, volumes, existing, pages, deliveryPrice(catalog)),
      campaignId: SEARCH_CAMPAIGN_ID,
      existingAdGroupIds: mapping[productId] ?? [],
      // Siderne sendes med, så admin kan validere med præcis samme facit som
      // serveren i stedet for at få fejlen først ved upload
      knownPages: pages.known,
      pausedPages: pages.paused,
      deliveryPrice: deliveryPrice(catalog),
      adsConfigured: missing.length === 0,
      adsError,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Ukendt fejl" }, 500);
  }
};

/* ───── Skrivning ───── */

interface GroupInput {
  name?: string;
  themeKey?: string;
  primary?: string;
  cpcBidMicros?: number;
  keywords?: Array<{ text?: string }>;
  headlines?: string[];
  descriptions?: string[];
  finalUrl?: string;
  path1?: string;
}

type PostBody =
  | { action: "save_terms"; productId: string; terms: string[] }
  | { action: "validate" | "create"; productId: string; groups: GroupInput[] };

function strings(list: unknown, max: number): string[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((s): s is string => typeof s === "string")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, max);
}

/**
 * Gør ét indsendt forslag til noget vi tør sende til Google.
 *
 * Returnerer enten gruppen eller en liste af fejl — aldrig en halvt godkendt
 * gruppe.
 */
function prepareGroup(
  input: GroupInput,
  pages: { known: string[]; paused: string[] },
): { group: NewAdGroup; primary: string } | { errors: string[] } {
  const errors: string[] = [];

  const name = (input.name ?? "").replace(/\s+/g, " ").trim();
  if (!name) errors.push("Annoncegruppen mangler navn.");
  if (name.length > 255) errors.push(`Gruppenavnet er for langt: ${name.length} tegn.`);

  const keywords = strings(input.keywords?.map((k) => k?.text), 50).map((text) => ({
    text: text.toLowerCase(),
    matchType: "PHRASE" as const,
  }));
  if (!keywords.length) errors.push(`${name || "Gruppen"} har ingen keywords — den ville vise intet.`);

  const primary = (input.primary ?? keywords[0]?.text ?? "").toLowerCase();
  if (primary && !keywords.some((k) => k.text === primary)) {
    errors.push(`Frasen "${primary}" står ikke blandt gruppens keywords.`);
  }

  const bid = Number(input.cpcBidMicros ?? DEFAULT_BID_MICROS);
  if (!Number.isFinite(bid) || bid < MIN_BID_MICROS || bid > MAX_BID_MICROS) {
    errors.push(
      `Buddet skal ligge mellem ${MIN_BID_MICROS / 1_000_000} og ${MAX_BID_MICROS / 1_000_000} kr.`,
    );
  }

  const copy: AdCopy = {
    headlines: strings(input.headlines, 15),
    descriptions: strings(input.descriptions, 4),
    finalUrl: typeof input.finalUrl === "string" ? input.finalUrl : "",
    path1: typeof input.path1 === "string" ? input.path1.slice(0, 15) : undefined,
  };
  errors.push(...validateAdCopy(copy, primary, pages.known, pages.paused));

  if (errors.length) return { errors: errors.map((e) => `${name || "Gruppe"}: ${e}`) };

  return {
    primary,
    group: {
      name,
      cpcBidMicros: Math.round(bid),
      // Altid pauset ved oprettelse. Den tændes bevidst fra /admin/ads, når
      // nogen har kigget den igennem i Google Ads-UI'et.
      status: "PAUSED",
      keywords,
      finalUrl: copy.finalUrl,
      headlines: copy.headlines,
      descriptions: copy.descriptions,
      path1: copy.path1,
    },
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  let body: PostBody;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  const kv = context.env.BOOKINGS;

  try {
    if (body.action === "save_terms") {
      if (!body.productId) return json({ error: "productId mangler" }, 400);
      const terms = strings(body.terms, 20).map((t) => t.toLowerCase());
      const map = await readJson<Record<string, string[]>>(kv, KV_TERMS, {});
      if (terms.length) map[body.productId] = terms;
      else delete map[body.productId];
      await kv.put(KV_TERMS, JSON.stringify(map));
      return json({ ok: true, terms });
    }

    if (body.action !== "validate" && body.action !== "create") {
      return json({ error: "Ukendt action" }, 400);
    }

    if (!body.productId) return json({ error: "productId mangler" }, 400);
    const groups = Array.isArray(body.groups) ? body.groups : [];
    if (!groups.length) return json({ error: "Ingen grupper at oprette" }, 400);
    if (groups.length > MAX_GROUPS_PER_REQUEST) {
      return json({ error: `Højst ${MAX_GROUPS_PER_REQUEST} grupper ad gangen` }, 400);
    }

    const catalog = productCatalog(await readJson<unknown>(kv, KV_CATALOG, null));
    const product = catalog.find((p) => p.id === body.productId);
    if (!product) return json({ error: `Ukendt produkt: ${body.productId}` }, 404);

    const pages = pageSets(catalog);
    const prepared: Array<{ group: NewAdGroup; primary: string }> = [];
    const errors: string[] = [];
    for (const input of groups) {
      const result = prepareGroup(input, pages);
      if ("errors" in result) errors.push(...result.errors);
      else prepared.push(result);
    }
    // Alt eller intet: en delvis upload efterlader kontoen i en tilstand,
    // ingen har besluttet.
    if (errors.length) return json({ ok: false, errors }, 400);

    const validateOnly = body.action === "validate";
    const created: Array<{ name: string; adGroupId: string; keywords: number }> = [];
    const warnings: string[] = [];

    // Preflight på ALLE grupper først. Uden det kan gruppe fire blive afvist
    // af Google — for en overskrift mod policy, fx — efter at de tre første
    // er oprettet, og så står kontoen halvt bygget. Samme forholdsregel som
    // launch_bofu_lys.py tager, og grunden er den samme.
    for (const { group } of prepared) {
      await createAdGroup(context.env, group, { validateOnly: true });
    }
    if (validateOnly) {
      return json({ ok: true, validateOnly: true, groups: prepared.length });
    }

    // Labelet slås op én gang; kan det ikke findes, oprettes grupperne
    // alligevel — mærket er til rapportering, ikke til visning.
    let labelRn: string | null = null;
    try {
      labelRn = await findLabel(context.env, BOFU_LABEL);
      if (!labelRn) warnings.push(`Labelet "${BOFU_LABEL}" findes ikke — keywords blev ikke mærket.`);
    } catch (e) {
      warnings.push(`Kunne ikke slå labelet op: ${e instanceof Error ? e.message : "ukendt fejl"}`);
    }

    for (const { group } of prepared) {
      const result = await createAdGroup(context.env, group, { validateOnly: false });

      created.push({ name: group.name, adGroupId: result.adGroupId, keywords: group.keywords.length });

      if (labelRn && result.criterionResourceNames.length) {
        try {
          await labelCriteria(context.env, labelRn, result.criterionResourceNames);
        } catch (e) {
          warnings.push(
            `${group.name}: keywords blev oprettet, men ikke mærket (${e instanceof Error ? e.message : "ukendt fejl"}).`,
          );
        }
      }
    }

    // Bind grupperne til produktet med det samme. Uden den linje her er en ny
    // gruppe usynlig for udsolgt-reglerne i /api/ads-rules.
    const mapping = await readJson<Record<string, string[]>>(kv, KV_MAPPING, {});
    mapping[product.id] = [
      ...new Set([...(mapping[product.id] ?? []), ...created.map((c) => c.adGroupId).filter(Boolean)]),
    ];
    await kv.put(KV_MAPPING, JSON.stringify(mapping));

    const log = await readJson<unknown[]>(kv, KV_LOG, []);
    log.unshift({
      at: new Date().toISOString(),
      by: auth.name,
      productId: product.id,
      productName: product.name,
      campaignId: SEARCH_CAMPAIGN_ID,
      groups: created,
    });
    await kv.put(KV_LOG, JSON.stringify(log.slice(0, LOG_LIMIT)));

    return json({ ok: true, created, warnings, mapping: mapping[product.id] });
  } catch (e) {
    const status = e instanceof AdsNotConfigured ? 503 : 500;
    return json({ error: e instanceof Error ? e.message : "Ukendt fejl" }, status);
  }
};
