/* ───── Ads-oversigt (admin) ─────
 *
 * Kobler produkter til Google Ads-annoncegrupper og viser, hvad man skal vide
 * for at træffe en beslutning: er produktet udsolgt i den kommende weekend,
 * hvad er dækningsbidraget, og hvad koster annoncerne.
 *
 * Slukker IKKE noget af sig selv. Statusændringer sker kun når nogen trykker.
 * Regler defineres i /api/ads-rules og eksekveres ikke endnu — med vilje.
 */

import {
  DEFAULT_INVENTORY,
  addDays,
  loadBookings,
  soldOutDaysByProduct,
  type LoadedBooking,
} from "./_lib/bookings";
import {
  AdsNotConfigured,
  listAdGroups,
  missingConfig,
  setAdGroupStatus,
  type AdGroupRow,
  type GoogleAdsEnv,
} from "./_lib/googleads";

interface Env extends GoogleAdsEnv {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const KV_MAPPING = "ads_mapping";
const KV_ECONOMICS = "product_economics";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

/** Fallback når intet katalog er gemt i admin. Matcher src/lib/products.ts. */
const FALLBACK_PRODUCTS: Array<{ id: string; name: string; price: number }> = [
  { id: "thumpgo", name: "Mackie Thump GO", price: 345 },
  { id: "party", name: "Lille højtalerpakke", price: 395 },
  { id: "soundboks", name: "Soundboks 4", price: 595 },
  { id: "festival", name: "Stor højtalerpakke", price: 695 },
  { id: "lys", name: "Lys-pakke", price: 495 },
  { id: "rog", name: "Røgmaskine", price: 245 },
  { id: "subwoofer", name: 'Subwoofer 12"', price: 295 },
  { id: "stativer", name: "Stativer", price: 95 },
  { id: "taske", name: "Bæretaske", price: 95 },
];

interface Economics {
  /** Indkøbspris / hvad udstyret kostede. Bruges kun til afskrivningsoverblik. */
  purchasePrice?: number;
  /** Variabel omkostning pr. udlejning: rengøring, slid, transport. */
  costPerRental?: number;
  note?: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function unauthorized(context: { request: Request; env: Env }): Response | null {
  const secret = new URL(context.request.url).searchParams.get("secret");
  if (!context.env.ADMIN_SECRET || secret !== context.env.ADMIN_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
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

/** Fredag→mandag i den førstkommende weekend. Fredag selv tæller som "kommende". */
export function upcomingWeekend(today: string): { from: string; to: string; days: string[] } {
  const dow = new Date(`${today}T00:00:00Z`).getUTCDay(); // 0=søn
  const daysUntilFriday = (5 - dow + 7) % 7;
  const from = addDays(today, daysUntilFriday);
  const days = [from, addDays(from, 1), addDays(from, 2)]; // fre, lør, søn
  return { from, to: addDays(from, 3), days };
}

function productCatalog(saved: unknown): Array<{ id: string; name: string; price: number }> {
  const groups = saved as Record<string, Array<{ id?: string; name?: string; price?: number }> | null> | null;
  if (!groups) return FALLBACK_PRODUCTS;
  const out: Array<{ id: string; name: string; price: number }> = [];
  const seen = new Set<string>();
  for (const list of Object.values(groups)) {
    for (const p of list ?? []) {
      if (!p?.id || seen.has(p.id)) continue;
      seen.add(p.id);
      out.push({ id: p.id, name: p.name || p.id, price: Number(p.price) || 0 });
    }
  }
  return out.length ? out : FALLBACK_PRODUCTS;
}

/** Bookinger og omsætning pr. produkt, målt på kurv-varer med kendt productId. */
function statsByProduct(bookings: LoadedBooking[]): Record<string, { bookings: number; revenue: number }> {
  const out: Record<string, { bookings: number; revenue: number }> = {};
  for (const b of bookings) {
    const counted = new Set<string>();
    for (const id of b.productIds) {
      if (counted.has(id)) continue;
      counted.add(id);
      (out[id] ??= { bookings: 0, revenue: 0 }).bookings += 1;
    }
    for (const item of b.cartItems) {
      if (!item?.productId) continue;
      (out[item.productId] ??= { bookings: 0, revenue: 0 }).revenue += Number(item.price) || 0;
    }
  }
  return out;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const denied = unauthorized(context);
  if (denied) return denied;

  const kv = context.env.BOOKINGS;
  const today = new Date().toISOString().slice(0, 10);
  const horizonEnd = addDays(today, 60);

  try {
    const [catalogRaw, inventoryRaw, mapping, economics, bookings] = await Promise.all([
      readJson<unknown>(kv, "products_catalog", null),
      readJson<Record<string, number>>(kv, "inventory", DEFAULT_INVENTORY),
      readJson<Record<string, string[]>>(kv, KV_MAPPING, {}),
      readJson<Record<string, Economics>>(kv, KV_ECONOMICS, {}),
      loadBookings(kv),
    ]);

    const inventory = { ...DEFAULT_INVENTORY, ...inventoryRaw };
    const catalog = productCatalog(catalogRaw);
    const soldOut = soldOutDaysByProduct(bookings, inventory, today, horizonEnd);
    const stats = statsByProduct(bookings);
    const weekend = upcomingWeekend(today);

    // Google Ads er valgfrit — oversigten skal virke også uden credentials.
    let adGroups: AdGroupRow[] = [];
    let adsError: string | null = null;
    const missing = missingConfig(context.env);
    if (missing.length) {
      adsError = `Google Ads er ikke konfigureret. Mangler: ${missing.join(", ")}`;
    } else {
      try {
        adGroups = await listAdGroups(context.env);
      } catch (e) {
        adsError = e instanceof Error ? e.message : "Ukendt fejl mod Google Ads";
      }
    }
    const adGroupById = new Map(adGroups.map((g) => [g.id, g]));

    const products = catalog.map((p) => {
      const days = soldOut[p.id] ?? [];
      const weekendSoldOut = weekend.days.filter((d) => days.includes(d));
      const s = stats[p.id] ?? { bookings: 0, revenue: 0 };
      const econ = economics[p.id] ?? {};
      const contribution =
        typeof econ.costPerRental === "number" ? p.price - econ.costPerRental : null;

      return {
        id: p.id,
        name: p.name,
        price: p.price,
        inventory: inventory[p.id] ?? null,
        economics: econ,
        contributionPerRental: contribution,
        marginPct: contribution !== null && p.price > 0 ? Math.round((contribution / p.price) * 100) : null,
        bookings: s.bookings,
        revenue: Math.round(s.revenue),
        avgOrderValue: s.bookings ? Math.round(s.revenue / s.bookings) : null,
        soldOutDays: days,
        soldOutNext60: days.length,
        weekend: {
          from: weekend.from,
          days: weekend.days,
          soldOutDays: weekendSoldOut,
          fullyBooked: weekendSoldOut.length === weekend.days.length,
        },
        adGroups: (mapping[p.id] ?? []).map((id) => {
          const g = adGroupById.get(id);
          return g
            ? { id, name: g.name, status: g.status, campaignName: g.campaignName }
            : { id, name: null, status: null, campaignName: null };
        }),
      };
    });

    return json({
      today,
      weekend,
      products,
      adGroups,
      mapping,
      adsConfigured: missing.length === 0,
      adsError,
      /** Regler eksekveres ikke — se /api/ads-rules. */
      rulesEngineActive: false,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Ukendt fejl" }, 500);
  }
};

type PostBody =
  | { action: "set_ad_group_status"; adGroupId: string; status: "ENABLED" | "PAUSED"; validateOnly?: boolean }
  | { action: "save_mapping"; mapping: Record<string, string[]> }
  | { action: "save_economics"; economics: Record<string, Economics> };

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const denied = unauthorized(context);
  if (denied) return denied;

  let body: PostBody;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  try {
    if (body.action === "save_mapping") {
      await context.env.BOOKINGS.put(KV_MAPPING, JSON.stringify(body.mapping ?? {}));
      return json({ ok: true });
    }

    if (body.action === "save_economics") {
      await context.env.BOOKINGS.put(KV_ECONOMICS, JSON.stringify(body.economics ?? {}));
      return json({ ok: true });
    }

    if (body.action === "set_ad_group_status") {
      if (body.status !== "ENABLED" && body.status !== "PAUSED") {
        return json({ error: "status skal være ENABLED eller PAUSED" }, 400);
      }
      await setAdGroupStatus(context.env, String(body.adGroupId), body.status, {
        validateOnly: body.validateOnly === true,
      });
      return json({ ok: true, adGroupId: body.adGroupId, status: body.status, validateOnly: body.validateOnly === true });
    }

    return json({ error: "Ukendt action" }, 400);
  } catch (e) {
    const status = e instanceof AdsNotConfigured ? 503 : 500;
    return json({ error: e instanceof Error ? e.message : "Ukendt fejl" }, status);
  }
};
