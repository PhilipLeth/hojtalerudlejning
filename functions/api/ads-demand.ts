/* ───── Efterspørgselskortet: hvor kan kunderne komme fra? (admin) ─────
 *
 * GET  /api/ads-demand
 * POST /api/ads-demand  { action: "save_seeds", seeds: string[] }
 *
 * Byggeren (/admin/ads/opret) starter i produktet, og idélisten
 * (/admin/ads/ideer) starter i katalogets sider — begge kan derfor kun se
 * efterspørgsel for noget, vi allerede har en side til. Det her værktøj
 * vender det om og starter i efterspørgslen selv: behovs- og
 * anledningsfraser som frø hos Google, plus ALLE kontoens egne søgetermer,
 * uden katalogfilter.
 *
 * Klyngerne samles efter hvor kunden kommer fra — anledningen når frasen
 * nævner én (bryllup, konfirmation, julefrokost), ellers produktordet — og
 * hver klynge peger på den bedste eksisterende landingsside. Findes der
 * ingen, siger kortet det højt: "mangler side". Det er ikke en fejl men et
 * svar — en klynge uden en side, der kan besvare den, er ikke en annonce,
 * det er en opgave om at bygge en side først. Se prd'ens afsnit om
 * manglende lejlighedssider.
 *
 * Alt der allerede ligger som keyword i kontoen trækkes fra, som i /ideer:
 * kortet viser det, der ikke er gjort endnu.
 */

import { requireAdmin } from "./_lib/adminAuth";
import {
  keywordIdeas,
  listKeywords,
  listSearchTerms,
  missingConfig,
  type GoogleAdsEnv,
} from "./_lib/googleads";
import {
  classify,
  hasRentalWord,
  headTerm,
  occasionWord,
  phraseCovers,
  productWords,
  samhandler,
  seedTerms,
  udenforOmraadet,
  type ThemeKey,
} from "../../src/lib/adsIntent";
import { productCatalog, type CatalogProduct } from "./_lib/catalog";
import { PAUSEDE_SIDER } from "../../src/lib/products";

interface Env extends GoogleAdsEnv {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const KV_CATALOG = "products_catalog";
const KV_SEEDS = "ads_demand_seeds";

/** Googles loft pr. opslag er 20 frø; to opslag er nok til kortet. */
const MAX_SEEDS = 40;
const SEED_CHUNK = 20;
/** Under det her er Googles estimat for tyndt til at flytte noget. */
const MIN_VOLUME = 10;
const SEARCH_TERM_DAYS = 180;
const MAX_CLUSTERS = 40;
const MAX_KEYWORDS_PER_CLUSTER = 12;

/**
 * Standardfrøene er behov og anledninger — ikke produkter. De er skrevet af
 * årshjulet og kontoens egne søgetermer: kunden søger på det hun skal
 * (fest, bryllup, konfirmation) eller på kategorien (lydanlæg, festlys),
 * ikke på Mackie Thump GO. Redigerbare i KV, så listen kan vokse af erfaring.
 */
export const DEFAULT_DEMAND_SEEDS = [
  // Kategori/behov
  "lej højtaler",
  "leje af lydanlæg",
  "lej musikanlæg",
  "lydanlæg til fest",
  "musikanlæg til fest",
  "lej festlys",
  "lej lyd og lys",
  "lej pa anlæg",
  "lej mikrofon",
  "lej karaoke",
  "lej projektor",
  "lej soundboks",
  // Anledninger — årshjulets købsintente søgninger
  "lyd til bryllup",
  "lyd til konfirmation",
  "lyd til fødselsdag",
  "lyd til julefrokost",
  "lyd til nytårsfest",
  "lyd til polterabend",
  "lyd til havefest",
  "lyd til firmafest",
  "musik til bryllup",
  "højtaler til fest",
];

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

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

/* ───── Klyngerne ───── */

export interface DemandKeyword {
  text: string;
  volume: number;
  clicks: number;
  impressions: number;
  intent: ThemeKey;
  /** "google" = markedet siger det, "egen" = vi har selv betalt klik på det. */
  sources: string[];
  /** Ejer vi en bredere frase, som phrase match fanger den her med? */
  coveredBy: string | null;
  outsideArea: string | null;
}

export interface DemandCluster {
  /** Anledningen, hvis klyngen er samlet om én — ellers null. */
  occasion: string | null;
  /** Læsbar overskrift: anledningen eller produktordene fra den stærkeste frase. */
  label: string;
  keywords: DemandKeyword[];
  /** Summeret over fraser INDEN FOR området — dem uden for tæller ikke som marked. */
  volume: number;
  clicks: number;
  /** Bedste eksisterende landingsside — eller null: "mangler side". */
  productId: string | null;
  productName: string | null;
  page: string | null;
}

/**
 * Hvor kommer kunden fra? Anledning OG produktord tilsammen.
 *
 * Første udgave lod anledningen vinde alene, og så kollapsede alt med "fest"
 * i sig til én klynge: "fest højtalere", "røgkanon til fest", "leje lys til
 * fest" og "fest og leg frederiksværk" i samme bunke. "Fest" er ikke en
 * anledning på linje med bryllup — det er et suffiks på næsten enhver
 * udlejningssøgning. En klynge med fem forskellige produkter kan pr.
 * definition ikke have ÉN rigtig landingsside, og findSide måtte gætte.
 *
 * Nu er nøglen anledning + produktord, så "fest højtalere", "fest
 * højttaler", "højtalere til fest" og "højtaler fest" bliver én stram gruppe
 * — samme søgning, samme svar, én annoncetekst der kan bære frasen i
 * overskriften. Det er den enhed en annoncegruppe skal være.
 */
export function demandKey(text: string): string {
  const produkt = [...productWords(text)].sort().join(" ");
  const anledning = occasionWord(text);
  return anledning ? `anledning:${anledning}|${produkt}` : `produkt:${produkt}`;
}

/**
 * Er frasen overhovedet efterspørgsel, vi kan svare på? Lejeord er det
 * sikreste signal. En anledningsfrase uden lejeord ("lyd til konfirmation")
 * tæller også — men kun når der står et produktord ved siden af anledningen,
 * ellers ville "konfirmation" alene (gaver, tøj, tale) drukne kortet.
 */
export function erEfterspoergsel(text: string): boolean {
  if (hasRentalWord(text)) return true;
  return Boolean(occasionWord(text)) && productWords(text).size > 0;
}

/** Saml rækkerne i klynger efter hvor kunden kommer fra. */
export function demandClusters(rows: DemandKeyword[]): DemandCluster[] {
  const buckets = new Map<string, DemandKeyword[]>();
  for (const row of rows) {
    const key = demandKey(row.text);
    const list = buckets.get(key) ?? [];
    list.push(row);
    buckets.set(key, list);
  }

  const out: DemandCluster[] = [];
  for (const list of buckets.values()) {
    const sorted = [...list].sort(
      (a, b) => b.clicks - a.clicks || b.volume - a.volume || a.text.localeCompare(b.text, "da"),
    );
    const inde = sorted.filter((k) => !k.outsideArea);
    const anledning = occasionWord(sorted[0].text);
    out.push({
      occasion: anledning,
      label: anledning
        ? [anledning, headTerm(sorted[0].text)].filter(Boolean).join(" · ")
        : headTerm(sorted[0].text) || sorted[0].text,
      keywords: sorted.slice(0, MAX_KEYWORDS_PER_CLUSTER),
      volume: inde.reduce((sum, k) => sum + k.volume, 0),
      clicks: inde.reduce((sum, k) => sum + k.clicks, 0),
      productId: null,
      productName: null,
      page: null,
    });
  }
  return out.sort((a, b) => b.clicks - a.clicks || b.volume - a.volume);
}

export interface SideKandidat {
  /** Produkt-id — eller null for en kategoriside, som byggeren ikke kan bygge mod. */
  id: string | null;
  name: string;
  page: string;
  terms: string[];
}

/**
 * Kategorisiderne — landingssider uden produkt i kataloget. Uden dem meldte
 * kortet "mangler side" for lydanlæg (100/md), mens /lydanlaeg — stigesiden
 * annoncerne netop SKAL lande på ved brede søgninger, se prd'ens
 * pakkearkitektur — stod færdigbygget. Produkterne prøves først, så en
 * produktside vinder når begge matcher lige godt.
 */
export const KATEGORI_SIDER: Array<Omit<SideKandidat, "id"> & { id: null }> = [
  { id: null, name: "Lydanlæg-stigen", page: "/lydanlaeg", terms: ["lydanlæg", "musikanlæg", "anlæg", "højtaleranlæg", "pa anlæg"] },
  { id: null, name: "Lydudstyr", page: "/lydudstyr", terms: ["lydudstyr"] },
  { id: null, name: "Lej højtaler", page: "/lej-hojtaler", terms: ["højtaler", "højttaler"] },
  { id: null, name: "Festlys", page: "/festlys", terms: ["festlys", "festbelysning", "lys"] },
  { id: null, name: "Festlyd", page: "/festlyd", terms: ["festlyd"] },
  { id: null, name: "Lysshow", page: "/lysshow", terms: ["lysshow"] },
  { id: null, name: "AV-udstyr", page: "/av-udstyr", terms: ["av udstyr"] },
];

/**
 * Den bedste eksisterende landingsside til en klynge — målt på hvor mange af
 * klyngens fraser, der handler om sidens produkt. Ingen match betyder
 * "mangler side", og det er hele pointen at sige det højt: klyngen er så en
 * side-opgave, ikke en annonce-opgave.
 */
export function findSide(texts: string[], kandidater: SideKandidat[]): SideKandidat | null {
  let bedst: SideKandidat | null = null;
  let bedstScore = 0;
  for (const k of kandidater) {
    const score = texts.filter((t) => samhandler(t, k.terms)).length;
    if (score > bedstScore) {
      bedst = k;
      bedstScore = score;
    }
  }
  return bedst;
}

/* ───── HTTP ───── */

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  const kv = context.env.BOOKINGS;
  try {
    const [catalogRaw, gemteFrø] = await Promise.all([
      readJson<unknown>(kv, KV_CATALOG, null),
      readJson<string[]>(kv, KV_SEEDS, []),
    ]);

    const seeds = (gemteFrø.length ? gemteFrø : DEFAULT_DEMAND_SEEDS).slice(0, MAX_SEEDS);

    const missing = missingConfig(context.env);
    if (missing.length) {
      return json({ error: `Google Ads er ikke konfigureret. Mangler: ${missing.join(", ")}` }, 503);
    }

    const catalog = productCatalog(catalogRaw);
    const pauset = new Set(PAUSEDE_SIDER);
    // Landingssiden findes på produktets EGET navn — ikke på dets redigerbare
    // Google-frø. De to ting har hver sit job, præcis som prd'en siger om frø
    // kontra keywords: frø er hvad Google skal lede ud fra, navnet er hvad
    // siden handler om. Blandes de sammen, arver findSide enhver udvidelse:
    // Mackie Thump GO havde fået frøet "højtaler" og vandt derfor klyngen
    // "fest højtalere" (110/md) fra kategorisiden /lej-hojtaler — en generisk
    // kategorisøgning sendt til én bestemt model.
    const kandidater: SideKandidat[] = catalog
      .filter((p): p is CatalogProduct & { page: string } => !!p.page && !p.hidden && !pauset.has(p.page!))
      .map((p) => ({
        id: p.id,
        name: p.name,
        page: p.page,
        terms: [...seedTerms(p.name), p.name],
      }));

    // Frøene i bidder af 20 — Googles loft pr. opslag
    const chunks: string[][] = [];
    for (let i = 0; i < seeds.length; i += SEED_CHUNK) chunks.push(seeds.slice(i, i + SEED_CHUNK));

    const [ideLister, searchTerms, eksisterende] = await Promise.all([
      Promise.all(chunks.map((c) => keywordIdeas(context.env, { seeds: c }))),
      listSearchTerms(context.env, { from: isoDaysAgo(SEARCH_TERM_DAYS), to: isoDaysAgo(0) }),
      listKeywords(context.env),
    ]);
    const ejet = new Set(eksisterende.map((k) => k.text));
    const dækket = (text: string) => eksisterende.find((k) => phraseCovers(k.text, text))?.text ?? null;

    const rows = new Map<string, DemandKeyword>();
    const touch = (text: string): DemandKeyword => {
      let row = rows.get(text);
      if (!row) {
        row = {
          text,
          volume: 0,
          clicks: 0,
          impressions: 0,
          intent: classify(text),
          sources: [],
          coveredBy: dækket(text),
          outsideArea: udenforOmraadet(text),
        };
        rows.set(text, row);
      }
      return row;
    };

    // Kilde 1: markedet. Googles idéer ud fra behovs- og anledningsfrøene.
    for (const liste of ideLister) {
      for (const idea of liste) {
        if (ejet.has(idea.text) || idea.volume < MIN_VOLUME || !erEfterspoergsel(idea.text)) continue;
        const row = touch(idea.text);
        row.volume = Math.max(row.volume, idea.volume);
        if (!row.sources.includes("google")) row.sources.push("google");
      }
    }

    // Kilde 2: kvitteringerne. Egne søgetermer med klik, vi ikke ejer —
    // hele kontoen, IKKE afgrænset til et produkt. Det er netop pointen.
    for (const t of searchTerms) {
      if (!t.clicks || ejet.has(t.text) || !erEfterspoergsel(t.text)) continue;
      const row = touch(t.text);
      row.clicks += t.clicks;
      row.impressions += t.impressions;
      if (!row.sources.includes("egen")) row.sources.push("egen");
    }

    // Produkterne først: matcher både en produktside og en kategoriside
    // lige godt, hører klyngen til på produktet — det er det, man kan bygge.
    const alleSider = [...kandidater, ...KATEGORI_SIDER.filter((k) => !pauset.has(k.page))];

    const clusters = demandClusters([...rows.values()]).slice(0, MAX_CLUSTERS);
    for (const c of clusters) {
      const side = findSide(c.keywords.filter((k) => !k.outsideArea).map((k) => k.text), alleSider);
      if (side) {
        c.productId = side.id;
        c.productName = side.name;
        c.page = side.page;
      }
    }

    return json({
      seeds,
      seededDefaults: gemteFrø.length === 0,
      maxSeeds: MAX_SEEDS,
      minVolume: MIN_VOLUME,
      clusters,
      manglerSide: clusters.filter((c) => !c.page).length,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Ukendt fejl" }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  let body: { action?: string; seeds?: unknown };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }
  if (body.action !== "save_seeds") return json({ error: "Ukendt action" }, 400);

  const seeds = (Array.isArray(body.seeds) ? body.seeds : [])
    .filter((s): s is string => typeof s === "string")
    .map((s) => s.replace(/\s+/g, " ").trim().toLowerCase())
    .filter((s) => s && s.length <= 80);
  const unikke = [...new Set(seeds)].slice(0, MAX_SEEDS);
  if (!unikke.length) return json({ error: "Ingen frø at gemme" }, 400);

  await context.env.BOOKINGS.put(KV_SEEDS, JSON.stringify(unikke));
  return json({ ok: true, seeds: unikke });
};
