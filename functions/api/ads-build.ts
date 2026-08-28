/* ───── Find keywords til et produkt og byg annoncegrupper af dem (admin) ─────
 *
 * GET  /api/ads-build?productId=thumpgo
 *   Én rangeret liste af RIGTIGE søgefraser: Googles egne idéer for
 *   produktsiden, plus de søgetermer kontoen selv har fået klik på. Med
 *   volumen, intention og besked om frasen allerede ligger i kontoen.
 *
 * POST /api/ads-build
 *   { action: "validate" | "create" } — grupperne man har valgt at bygge
 *   { action: "save_terms" }          — frø til Google, gemt pr. produkt
 *
 * Rækkefølgen er hele pointen. Værktøjet byggede tidligere fraser ud af
 * produktnavnet og slog bagefter volumen op på sine egne opfindelser: for
 * Mackie Thump GO blev det nitten keywords med nul søgninger, serveret som
 * syv annoncegrupper klar til upload. Google kunne hele tiden fortælle, at
 * "lej højtaler" søges 210 gange om måneden — kunden søger på kategorien,
 * ikke på modellen.
 *
 * Nu kommer fraserne udefra, mennesket vælger dem der giver mening, og
 * grupperne bygges af udvalget. Ingen efterspørgsel, ingen gruppe.
 *
 * Serveren validerer alt igen før noget skrives — samme grundregel som
 * pricing.ts: det klienten sender er et ønske, ikke en sandhed.
 */

import { requireAdmin } from "./_lib/adminAuth";
import {
  AdsNotConfigured,
  BOFU_LABEL,
  createAdGroup,
  findLabel,
  keywordIdeas,
  labelCriteria,
  listAdGroups,
  listKeywords,
  listSearchTerms,
  missingConfig,
  SEARCH_CAMPAIGN_ID,
  type ExistingKeyword,
  type GoogleAdsEnv,
  type NewAdGroup,
} from "./_lib/googleads";
import { classify, hasRentalWord, samhandler, seedTerms, type ThemeKey } from "../../src/lib/adsIntent";
import { validateAdCopy, type AdCopy } from "../../src/lib/adsCopy";
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
const KV_MANUAL = "ads_manual_keywords";
const KV_LOG = "ads_build_log";

/** Standardbud i mikroenheder. Samme niveau som BOFU-grupperne står på. */
const DEFAULT_BID_MICROS = 9_000_000;
/** Et bud under en krone serverer reelt ikke — det var Yderområders fejl. */
const MIN_BID_MICROS = 1_000_000;
const MAX_BID_MICROS = 50_000_000;
/** Googles loft for frø i ét opslag — og dermed for egne fraser pr. produkt. */
const MAX_MANUAL = 20;
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

/* ───── Keyword-opdagelse ───── */

/** Hvor mange dage tilbage vi kigger efter egne søgetermer. */
const SEARCH_TERM_DAYS = 180;
/** Under det her er frasen for smal til at bære sin egen annoncegruppe. */
const MIN_VOLUME = 10;

interface FoundKeyword {
  text: string;
  /** Gennemsnitlige månedlige søgninger i Danmark. */
  volume: number;
  competition: string | null;
  /** Har vi selv fået klik på frasen? Det er bevis frem for estimat. */
  clicks: number;
  impressions: number;
  /** "google" = Googles idé, "egen" = vores egen søgetermerapport. */
  sources: string[];
  intent: ThemeKey;
  rental: boolean;
  /** Ligger frasen allerede i kontoen? Så byder vi mod os selv. */
  duplicateIn: string | null;
  /** Foreslået afkrydset: lejeintention, volumen nok, ikke i kontoen. */
  recommended: boolean;
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Saml Googles idéer og vores egne søgetermer til én liste.
 *
 * De to kilder svarer på hver sit spørgsmål. Google siger hvad der SØGES
 * på — bredt, estimeret, også fraser vi aldrig har vist en annonce på.
 * Søgetermerapporten siger hvad der er blevet KLIKKET på hos os. Det andet
 * er få rækker, men det er kvitteringer frem for skøn, og en frase med klik
 * fortjener sit eget keyword uanset hvad estimatet siger.
 */
function mergeKeywords(
  ideas: Array<{ text: string; volume: number; competition: string | null }>,
  terms: Array<{ text: string; clicks: number; impressions: number }>,
  existing: Map<string, ExistingKeyword>,
  /** Fraser brugeren selv har skrevet ind. De står altid på listen. */
  manual: string[] = [],
  /** Produktets søgetermer — målestok for om en frase hører til her. */
  productTerms: string[] = [],
): FoundKeyword[] {
  const merged = new Map<string, FoundKeyword>();

  const touch = (text: string): FoundKeyword => {
    const key = text.trim().toLowerCase();
    let row = merged.get(key);
    if (!row) {
      const dupe = existing.get(key);
      row = {
        text: key,
        volume: 0,
        competition: null,
        clicks: 0,
        impressions: 0,
        sources: [],
        intent: classify(key),
        rental: hasRentalWord(key),
        duplicateIn: dupe ? `${dupe.campaignName} / ${dupe.adGroupName}` : null,
        recommended: false,
      };
      merged.set(key, row);
    }
    return row;
  };

  for (const idea of ideas) {
    const row = touch(idea.text);
    row.volume = Math.max(row.volume, idea.volume);
    row.competition = idea.competition;
    if (!row.sources.includes("google")) row.sources.push("google");
  }

  for (const term of terms) {
    const row = touch(term.text);
    row.clicks += term.clicks;
    row.impressions += term.impressions;
    if (!row.sources.includes("egen")) row.sources.push("egen");
  }

  // Egne fraser står på listen uanset hvad Google mener om dem
  const egne = new Set(manual.map((m) => m.trim().toLowerCase()).filter(Boolean));
  for (const text of egne) {
    const row = touch(text);
    if (!row.sources.includes("manuel")) row.sources.unshift("manuel");
  }

  for (const row of merged.values()) {
    // Har man selv skrevet frasen ind, er valget truffet — også når Google
    // melder nul. Lange fraser har sjældent målbar volumen i Danmark, og
    // phrase match fanger dem alligevel.
    if (row.sources.includes("manuel")) {
      row.recommended = !row.duplicateIn;
      continue;
    }
    // Et klik er bevis nok i sig selv; ellers kræves der målt efterspørgsel.
    // En frase der allerede ligger i kontoen skal ikke bydes op imod sig selv.
    // Og den skal handle om PRODUKTET — ellers ender "udlejning af soundbox"
    // afkrydset på discokuglen, fordi begge indeholder ordet "udlejning".
    row.recommended =
      row.rental &&
      !row.duplicateIn &&
      samhandler(row.text, productTerms) &&
      (row.clicks > 0 || row.volume >= MIN_VOLUME);
  }

  const rang = (r: FoundKeyword) => (r.sources.includes("manuel") ? 0 : 1);
  return [...merged.values()].sort(
    (a, b) =>
      rang(a) - rang(b) ||
      b.clicks - a.clicks ||
      b.volume - a.volume ||
      a.text.localeCompare(b.text, "da"),
  );
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  const kv = context.env.BOOKINGS;
  const productId = new URL(context.request.url).searchParams.get("productId") ?? "";

  try {
    const [catalogRaw, termsMap, manualMap, mapping] = await Promise.all([
      readJson<unknown>(kv, KV_CATALOG, null),
      readJson<Record<string, string[]>>(kv, KV_TERMS, {}),
      readJson<Record<string, string[]>>(kv, KV_MANUAL, {}),
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

    const pages = pageSets(catalog);
    const terms = termsMap[productId]?.length ? termsMap[productId] : seedTerms(product.name);
    const manual = manualMap[productId] ?? [];

    let keywords: FoundKeyword[] = [];
    let adsError: string | null = null;
    const missing = missingConfig(context.env);
    if (missing.length) {
      adsError = `Google Ads er ikke konfigureret. Mangler: ${missing.join(", ")}`;
    } else {
      try {
        const [ideas, egneIdeer, searchTerms, kws] = await Promise.all([
          // Produktsiden er det stærkeste frø: Google læser den og svarer med
          // det, folk faktisk søger efter, som siden kan besvare
          keywordIdeas(context.env, { url: `https://lejhojtaler.dk${product.page}`, seeds: terms }),
          // Volumen på de fraser brugeren selv har skrevet ind. Google svarer
          // altid på et frø, også når tallet er nul.
          manual.length ? keywordIdeas(context.env, { seeds: manual }) : Promise.resolve([]),
          listSearchTerms(context.env, { from: isoDaysAgo(SEARCH_TERM_DAYS), to: isoDaysAgo(0) }),
          listKeywords(context.env),
        ]);
        const egneSæt = new Set(manual.map((m) => m.toLowerCase()));
        keywords = mergeKeywords(
          // Kun volumen for de fraser der rent faktisk blev spurgt om —
          // et frø-opslag returnerer også Googles egne forslag ovenpå
          [...ideas, ...egneIdeer.filter((i) => egneSæt.has(i.text))],
          // Kun egne søgetermer om det samme PRODUKT. Målestokken er
          // produktordet, ikke lejeordet — se samhandler() i adsIntent.
          searchTerms.filter((t) => samhandler(t.text, terms)),
          new Map(kws.map((k) => [k.text, k])),
          manual,
          [...terms, ...manual, product.name],
        );
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
      manual,
      keywords,
      /**
       * Nul her betyder: der er ingen efterspørgsel at bygge en annoncegruppe
       * på. Det er et gyldigt svar, og langt bedre end syv tomme grupper.
       */
      recommendedCount: keywords.filter((k) => k.recommended).length,
      minVolume: MIN_VOLUME,
      defaultBidMicros: DEFAULT_BID_MICROS,
      campaignId: SEARCH_CAMPAIGN_ID,
      existingAdGroupIds: mapping[productId] ?? [],
      // Siderne sendes med, så admin kan validere med præcis samme facit som
      // serveren i stedet for at få fejlen først ved upload
      knownPages: pages.known,
      pausedPages: pages.paused,
      deliveryPrice: deliveryPrice(catalog),
      englishPage: hasEnglish(product.page),
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
  | { action: "save_manual"; productId: string; keywords: string[] }
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
  /** Produktets søgetermer — målestok for om gruppen handler om produktet. */
  productTerms: string[],
  /** Gruppenavne der allerede findes i kontoen, med småt. */
  existingNames: Set<string>,
): { group: NewAdGroup; primary: string } | { errors: string[] } {
  const errors: string[] = [];

  const name = (input.name ?? "").replace(/\s+/g, " ").trim();
  if (!name) errors.push("Annoncegruppen mangler navn.");
  if (name.length > 255) errors.push(`Gruppenavnet er for langt: ${name.length} tegn.`);
  // To grupper med samme navn byder mod hinanden og er umulige at skelne i
  // rapporterne. Et gentaget tryk på Opret må ikke lave dem forfra.
  if (name && existingNames.has(name.toLowerCase())) {
    errors.push(`Der findes allerede en annoncegruppe der hedder "${name}".`);
  }

  const keywords = strings(input.keywords?.map((k) => k?.text), 50).map((text) => ({
    text: text.toLowerCase(),
    matchType: "PHRASE" as const,
  }));
  if (!keywords.length) errors.push(`${name || "Gruppen"} har ingen keywords — den ville vise intet.`);

  const primary = (input.primary ?? keywords[0]?.text ?? "").toLowerCase();
  if (primary && !keywords.some((k) => k.text === primary)) {
    errors.push(`Frasen "${primary}" står ikke blandt gruppens keywords.`);
  }

  // Sidste værn mod det, der skete 28. august 2026: en annoncegruppe ved navn
  // "Discokugle 40 cm — Udlejning: soundbox", der pegede på /discokugle.
  // Et keyword om et andet produkt end landingssiden er en fejl, uanset
  // hvordan det kom med — også hvis nogen har skrevet det ind i hånden.
  const fremmede = keywords.filter((k) => !samhandler(k.text, productTerms));
  if (fremmede.length) {
    errors.push(
      `Handler ikke om produktet: ${fremmede.map((k) => `"${k.text}"`).join(", ")}. ` +
        `Landingssiden er produktets egen, så keywordet skal være det også.`,
    );
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
    if (body.action === "save_manual") {
      if (!body.productId) return json({ error: "productId mangler" }, 400);
      // Egne fraser er keywords, ikke frø: de gemmes som skrevet, og de
      // ryger med på listen uanset hvad Google mener om volumen
      const keywords = [
        ...new Set(strings(body.keywords, MAX_MANUAL).map((k) => k.toLowerCase())),
      ];
      const map = await readJson<Record<string, string[]>>(kv, KV_MANUAL, {});
      if (keywords.length) map[body.productId] = keywords;
      else delete map[body.productId];
      await kv.put(KV_MANUAL, JSON.stringify(map));
      return json({ ok: true, keywords });
    }

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

    const [termsMap, manualMap] = await Promise.all([
      readJson<Record<string, string[]>>(kv, KV_TERMS, {}),
      readJson<Record<string, string[]>>(kv, KV_MANUAL, {}),
    ]);
    // Egne fraser tæller med som målestok: har man bevidst skrevet
    // "lej lyskæder" ind på lyskæderne, er det produktet man mener
    const productTerms = [
      ...(termsMap[product.id]?.length ? termsMap[product.id] : seedTerms(product.name)),
      ...(manualMap[product.id] ?? []),
      product.name,
    ];

    // Navne der allerede findes i kontoen — mod dubletter ved gentaget tryk
    let existingNames = new Set<string>();
    try {
      existingNames = new Set((await listAdGroups(context.env)).map((g) => g.name.toLowerCase()));
    } catch {
      // Kan vi ikke læse kontoen, oprettes der ikke noget alligevel — det
      // fejler i næste kald med en besked fra Google
    }

    const prepared: Array<{ group: NewAdGroup; primary: string }> = [];
    const errors: string[] = [];
    for (const input of groups) {
      const result = prepareGroup(input, pages, productTerms, existingNames);
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
