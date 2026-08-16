/* ───── Fredagsudsalg (admin) ─────
 *
 * GET  → hvad står ledigt de næste weekender, og hvad ville rabatten koste.
 * POST → gemmer kampagnens udkast (procent + undtagne produkter).
 *
 * Kampagnen er et UDKAST. Den gives ikke til nogen kunde: /api/discount,
 * booking-flowet og Stripe kender den ikke. Formålet er at se tallene et par
 * weekender, før noget bliver kundevendt — samme fremgangsmåde som
 * ads-reglerne i /api/ads-rules.
 */

import { DEFAULT_INVENTORY, loadBookings, nextWeekends } from "./_lib/bookings";
import { CatalogMissingError, productCatalog } from "./_lib/catalog";
import { DEFAULT_CAMPAIGN, KV_SALE_CAMPAIGN, normalizeSaleCode, parseCampaign, weekendSale } from "./_lib/weekendSale";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const MAX_WEEKENDS = 12;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const denied = unauthorized(context);
  if (denied) return denied;

  const url = new URL(context.request.url);
  const requested = Number(url.searchParams.get("weekends"));
  const count = Number.isFinite(requested) && requested >= 1 ? Math.min(Math.round(requested), MAX_WEEKENDS) : 4;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const kv = context.env.BOOKINGS;
    const [campaignRaw, catalogRaw, inventoryRaw, bookings] = await Promise.all([
      readJson<unknown>(kv, KV_SALE_CAMPAIGN, null),
      readJson<unknown>(kv, "products_catalog", null),
      readJson<Record<string, number>>(kv, "inventory", {}),
      loadBookings(kv),
    ]);

    const campaign = campaignRaw ? parseCampaign(campaignRaw) : DEFAULT_CAMPAIGN;
    const inventory = { ...DEFAULT_INVENTORY, ...inventoryRaw };

    let catalog;
    try {
      catalog = productCatalog(catalogRaw);
    } catch (e) {
      if (e instanceof CatalogMissingError) {
        console.error("[udsalg]", e.message);
        return json({ error: e.message }, 503);
      }
      throw e;
    }

    const weekends = nextWeekends(today, count).map((w) =>
      weekendSale(bookings, inventory, catalog, campaign, w),
    );

    return json({
      today,
      campaign,
      weekends,
      /** Ingen kunde ser kampagnen endnu. Ændres først når rabatten gives automatisk. */
      live: campaign.active,
      note: campaign.active
        ? `Udsalget er aktivt. Koden "${campaign.code}" giver ${campaign.pct}% på udstyr der står ledigt hele weekenden.`
        : "Slået fra. Koden afvises som enhver anden ukendt kode.",
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Ukendt fejl" }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const denied = unauthorized(context);
  if (denied) return denied;

  let body: { pct?: unknown; excluded?: unknown; note?: unknown; code?: unknown; active?: unknown };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  const pct = Number(body.pct);
  if (!Number.isFinite(pct) || pct < 1 || pct > 99) {
    return json({ error: `Ugyldig procent: ${body.pct} — brug 1-99` }, 400);
  }
  if (body.excluded !== undefined && !Array.isArray(body.excluded)) {
    return json({ error: "excluded skal være en liste af produkt-ider" }, 400);
  }
  const excluded = ((body.excluded as unknown[]) ?? []).filter((id): id is string => typeof id === "string");
  if (typeof body.note !== "undefined" && typeof body.note !== "string") {
    return json({ error: "note skal være tekst" }, 400);
  }

  const code = normalizeSaleCode(body.code);
  if (!code || !/^[a-z0-9-]{2,30}$/.test(code)) {
    return json({ error: `Ugyldig kode: "${body.code}" — brug 2-30 tegn, bogstaver/tal/bindestreg` }, 400);
  }

  const campaign = parseCampaign({
    pct,
    excluded,
    code,
    active: body.active === true,
    note: body.note as string | undefined,
  });
  await context.env.BOOKINGS.put(KV_SALE_CAMPAIGN, JSON.stringify(campaign));
  return json({ ok: true, campaign });
};
