/* ───── Ads-oversigt (admin) ─────
 *
 * Kobler produkter til Google Ads-annoncegrupper og viser, hvad man skal vide
 * for at træffe en beslutning: er produktet udsolgt i den kommende weekend,
 * hvad er dækningsbidraget, og hvad koster annoncerne.
 *
 * Slukker IKKE noget af sig selv. Statusændringer sker kun når nogen trykker.
 * Regler defineres i /api/ads-rules og eksekveres ikke endnu — med vilje.
 */

import { requireAdmin } from "./_lib/adminAuth";
import { bundlePartsFromCatalog, expandBookings, loadInventoryPair } from "./_lib/inventory";
import {
  addDays,
  loadBookings,
  soldOutDaysByProduct,
  upcomingWeekend,
  type LoadedBooking,
} from "./_lib/bookings";

import { productCatalog, CatalogMissingError } from "./_lib/catalog";
import {
  AdsNotConfigured,
  listAdGroups,
  missingConfig,
  setAdGroupStatus,
  type AdGroupRow,
  type GoogleAdsEnv,
} from "./_lib/googleads";

// upcomingWeekend lå her tidligere. Flyttet til _lib så udsalget kan bruge den
// uden at trække hele ads-modulet med; re-eksporteres så gamle kald virker.
export { upcomingWeekend };

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

async function readJson<T>(kv: KVNamespace, key: string, fallback: T): Promise<T> {
  const raw = await kv.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
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
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  const kv = context.env.BOOKINGS;
  const today = new Date().toISOString().slice(0, 10);
  const horizonEnd = addDays(today, 60);

  try {
    const [catalogRaw, pair, mapping, economics, bookings] = await Promise.all([
      readJson<unknown>(kv, "products_catalog", null),
      loadInventoryPair(kv),
      readJson<Record<string, string[]>>(kv, KV_MAPPING, {}),
      readJson<Record<string, Economics>>(kv, KV_ECONOMICS, {}),
      loadBookings(kv),
    ]);

    // Udsolgt = intet tilbage at tage imod, heller ikke JIT
    const inventory = pair.bookable;
    let catalog;
    try {
      catalog = productCatalog(catalogRaw);
    } catch (e) {
      if (e instanceof CatalogMissingError) {
        console.error("[ads]", e.message);
        return json({ error: e.message }, 503);
      }
      throw e;
    }
    // Kapacitet regnes på pakkers dele; statistikken beholder de rå id'er, så
    // en annonce for karaokepakken tælles som karaokepakken
    const soldOut = soldOutDaysByProduct(
      expandBookings(bookings, bundlePartsFromCatalog(catalogRaw)), inventory, today, horizonEnd,
    );
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
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

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
