/* ───── Weekendudsalg: offentlig status ─────
 *
 * GET /api/udsalg-aktiv — ingen secret. Svarer på det ene spørgsmål sitet
 * skal bruge: skal der vises et udsalg lige nu, og hvad består det af?
 *
 * Svarer kun aktivt når BEGGE dele holder:
 *   1. admin har tændt kontakten i /admin/udsalg
 *   2. der faktisk står noget tilbage hele den kommende weekend
 *
 * Punkt 2 er det vigtige. Uden det ville popup'en råbe "udsalg" på en weekend,
 * hvor alt er udlejet — kunden klikker ind og finder ingenting.
 */

import { loadBookings, upcomingWeekend } from "./_lib/bookings";
import { bundlePartsFromCatalog, effectiveInventory, expandBookings } from "./_lib/inventory";
import { productCatalog } from "./_lib/catalog";
import { KV_SALE_CAMPAIGN, parseCampaign, weekendSale } from "./_lib/weekendSale";

interface Env {
  BOOKINGS: KVNamespace;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
  // Kort cache: kontakten skal slå igennem hurtigt, men et udsalg ændrer sig
  // ikke fra sekund til sekund
  "Cache-Control": "public, max-age=60",
};

const inactive = () =>
  new Response(JSON.stringify({ active: false }), { status: 200, headers: corsHeaders });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

async function readJson(kv: KVNamespace, key: string): Promise<unknown> {
  const raw = await kv.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const kv = context.env.BOOKINGS;
    const campaignRaw = await readJson(kv, KV_SALE_CAMPAIGN);
    if (!campaignRaw) return inactive();

    const campaign = parseCampaign(campaignRaw);
    if (!campaign.active) return inactive();

    const [catalogRaw, inventoryRaw, bookings] = await Promise.all([
      readJson(kv, "products_catalog"),
      readJson(kv, "inventory"),
      loadBookings(kv),
    ]);

    // Udsalget gælder udstyr vi ejer og som står stille — ikke JIT-enheder.
    // Pakker optager deres dele, så en booket festpakke ikke sætter delene til salg.
    const inventory = effectiveInventory(inventoryRaw);
    const counted = expandBookings(bookings, bundlePartsFromCatalog(catalogRaw));
    const today = new Date().toISOString().slice(0, 10);
    const weekend = upcomingWeekend(today);
    const sale = weekendSale(counted, inventory, productCatalog(catalogRaw), campaign, weekend);

    if (sale.unitsOnSale === 0) return inactive();

    return new Response(
      JSON.stringify({
        active: true,
        code: campaign.code,
        pct: campaign.pct,
        weekend: { from: weekend.from, to: weekend.to, days: weekend.days },
        // Kun navn og pris — resten af tilbuddet er admins tal
        products: sale.offers
          .filter((o) => o.onSale)
          .map((o) => ({ id: o.productId, name: o.name, price: o.price, salePrice: o.salePrice })),
      }),
      { status: 200, headers: corsHeaders },
    );
  } catch (e) {
    // Manglende katalog eller KV-uheld: intet udsalg. Sitet skal aldrig gå ned
    // af en kampagne.
    console.error("[udsalg-aktiv]", e);
    return inactive();
  }
};
