/* ───── Find idéer til nye annoncegrupper (admin) ─────
 *
 * GET /api/ads-ideas?round=0
 *
 * Byggeren på /admin/ads/opret svarer på "hvad skal jeg bruge til DET her
 * produkt". Den her svarer på det spørgsmål, man har når man ikke ved hvor
 * man skal starte: hvor er der efterspørgsel, vi IKKE dækker?
 *
 * To kilder, og forskellen mellem dem er vigtig:
 *
 *   Googles idéer  — fraser folk søger på, som en af vores sider kan besvare.
 *                    Estimater, men de peger på markedet.
 *   Egne søgetermer — fraser nogen faktisk har klikket på hos os UDEN at vi
 *                    ejer dem som keyword. Vi har betalt for de klik gennem
 *                    en bredere frase; ejer vi dem selv, kan vi skrive en
 *                    annonce der passer.
 *
 * Alt der allerede ligger i kontoen trækkes fra. En idé er pr. definition
 * noget, der ikke er gjort endnu.
 *
 * `round` roterer gennem kataloget, fem sider ad gangen. Et opslag hos Google
 * pr. side er ikke gratis, og hele kataloget på én gang ville hverken være
 * hurtigt eller til at læse.
 */

import { requireAdmin } from "./_lib/adminAuth";
import {
  keywordIdeas,
  listKeywords,
  listSearchTerms,
  missingConfig,
  type GoogleAdsEnv,
} from "./_lib/googleads";
import { classify, hasRentalWord, phraseCovers, samhandler, seedTerms, udenforOmraadet, type ThemeKey } from "../../src/lib/adsIntent";
import { productCatalog, type CatalogProduct } from "./_lib/catalog";
import { PAUSEDE_SIDER } from "../../src/lib/products";

interface Env extends GoogleAdsEnv {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const KV_CATALOG = "products_catalog";
const KV_TERMS = "ads_terms";
const KV_MANUAL = "ads_manual_keywords";
const KV_MAPPING = "ads_mapping";

/** Sider pr. runde. Ét Google-opslag hver. */
const BATCH = 5;
/** Under det her er frasen for smal til at bære sin egen annoncegruppe. */
const MIN_VOLUME = 10;
/** Hvor langt tilbage vi kigger efter egne søgetermer. */
const SEARCH_TERM_DAYS = 180;
const MAX_IDEAS = 60;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

export interface Idea {
  text: string;
  volume: number;
  clicks: number;
  impressions: number;
  intent: ThemeKey;
  /** "google" = markedet, "egen" = klik vi allerede har betalt for. */
  source: "google" | "egen";
  productId: string;
  productName: string;
  page: string;
  /**
   * Ejer vi allerede en bredere frase, som phrase match fanger den her med?
   * Så er idéen ikke ny trafik, men en chance for en mere præcis annonce.
   */
  coveredBy: string | null;
  /**
   * Stedet frasen peger på, hvis vi ikke kører dertil. Så er den ikke en idé
   * til en annoncegruppe, men en kandidat til et negativt keyword.
   */
  outsideArea: string | null;
}

/** Sider vi må sende trafik til: har en produktside, ikke skjult, ikke pauset. */
export function annonceerbare(catalog: CatalogProduct[]): CatalogProduct[] {
  const pauset = new Set(PAUSEDE_SIDER);
  return catalog.filter((p) => !!p.page && !p.hidden && !pauset.has(p.page));
}

/** Rundens udsnit. Roterer, så man kommer hele kataloget igennem over tid. */
export function udsnit<T>(alle: T[], round: number, batch = BATCH): T[] {
  if (!alle.length) return [];
  const start = ((round * batch) % alle.length + alle.length) % alle.length;
  const ud: T[] = [];
  for (let i = 0; i < Math.min(batch, alle.length); i++) {
    ud.push(alle[(start + i) % alle.length]);
  }
  return ud;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  const kv = context.env.BOOKINGS;
  const round = Math.max(0, Math.floor(Number(new URL(context.request.url).searchParams.get("round")) || 0));

  try {
    const [catalogRaw, termsMap, manualMap, mapping] = await Promise.all([
      readJson<unknown>(kv, KV_CATALOG, null),
      readJson<Record<string, string[]>>(kv, KV_TERMS, {}),
      readJson<Record<string, string[]>>(kv, KV_MANUAL, {}),
      readJson<Record<string, string[]>>(kv, KV_MAPPING, {}),
    ]);

    const catalog = productCatalog(catalogRaw);
    const kandidater = annonceerbare(catalog);
    const termerFor = (p: CatalogProduct) => [
      ...(termsMap[p.id]?.length ? termsMap[p.id] : seedTerms(p.name)),
      ...(manualMap[p.id] ?? []),
      p.name,
    ];

    const missing = missingConfig(context.env);
    if (missing.length) {
      return json({
        error: `Google Ads er ikke konfigureret. Mangler: ${missing.join(", ")}`,
        totalPages: kandidater.length,
      }, 503);
    }

    const valgte = udsnit(kandidater, round);

    const [searchTerms, eksisterende] = await Promise.all([
      listSearchTerms(context.env, { from: isoDaysAgo(SEARCH_TERM_DAYS), to: isoDaysAgo(0) }),
      listKeywords(context.env),
    ]);
    const ejet = new Set(eksisterende.map((k) => k.text));
    /** Den bredeste frase vi ejer, som phrase match fanger `text` med. */
    const dækket = (text: string) => eksisterende.find((k) => phraseCovers(k.text, text))?.text ?? null;

    const ideas: Idea[] = [];
    const set = new Set<string>();

    const tilføj = (
      text: string,
      p: CatalogProduct,
      source: Idea["source"],
      volume: number,
      clicks: number,
      impressions: number,
    ) => {
      const nøgle = `${p.id}|${text}`;
      if (set.has(nøgle) || ejet.has(text)) return;
      set.add(nøgle);
      ideas.push({
        text,
        volume,
        clicks,
        impressions,
        intent: classify(text),
        source,
        productId: p.id,
        productName: p.name,
        page: p.page!,
        coveredBy: dækket(text),
        outsideArea: udenforOmraadet(text),
      });
    };

    // Kilde 1: Googles idéer for rundens sider
    const perSide = await Promise.all(
      valgte.map(async (p) => {
        try {
          return {
            p,
            ideas: await keywordIdeas(context.env, {
              url: `https://lejhojtaler.dk${p.page}`,
              seeds: termerFor(p),
            }),
          };
        } catch {
          // Én side der fejler må ikke tage runden med sig
          return { p, ideas: [] };
        }
      }),
    );
    for (const { p, ideas: fundne } of perSide) {
      const termer = termerFor(p);
      for (const i of fundne) {
        if (!hasRentalWord(i.text) || i.volume < MIN_VOLUME) continue;
        if (!samhandler(i.text, termer)) continue;
        tilføj(i.text, p, "google", i.volume, 0, 0);
      }
    }

    // Kilde 2: egne søgetermer med klik, som vi ikke ejer — men kun for
    // rundens sider. Første forsøg lod dem gælde hele kataloget, og så viste
    // runde 1 og runde 2 nøjagtig det samme: klik sorterer øverst, og de
    // samme tolv fraser fyldte begge runder. Så roterer ingenting.
    for (const t of searchTerms) {
      if (!t.clicks || !hasRentalWord(t.text) || ejet.has(t.text)) continue;
      const match = valgte.find((p) => samhandler(t.text, termerFor(p)));
      if (match) tilføj(t.text, match, "egen", 0, t.clicks, t.impressions);
    }

    ideas.sort((a, b) => b.clicks - a.clicks || b.volume - a.volume);

    return json({
      round,
      pages: valgte.map((p) => ({ id: p.id, name: p.name, page: p.page })),
      totalPages: kandidater.length,
      rounds: Math.ceil(kandidater.length / BATCH),
      ideas: ideas.slice(0, MAX_IDEAS),
      minVolume: MIN_VOLUME,
      /** Produkter der allerede har annoncegrupper — til at se hvad der mangler. */
      dækkedeProdukter: Object.keys(mapping).filter((id) => (mapping[id] ?? []).length),
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Ukendt fejl" }, 500);
  }
};
