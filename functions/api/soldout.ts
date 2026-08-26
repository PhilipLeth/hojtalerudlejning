/* ───── Udsolgt-oversigt (admin) ─────
 *
 * Beregner per dag hvilke produkter der er/var udsolgt — både bagud og
 * frem i tid — ud fra bookinger vs. lagerbeholdning i KV.
 * I modsætning til /api/availability tælles ALLE bookinger med (også
 * "afleveret"), så historikken viser hvad der reelt var udsolgt.
 */

import { addDays, bookedProductIds } from "./_lib/bookings";
import { hentBookingIndex } from "./_lib/bookingIndex";
import { bundlePartsFromCatalog, loadInventoryPair } from "./_lib/inventory";
import { expandProductIds } from "./_lib/occupancy";

import { requireAdmin } from "./_lib/adminAuth";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;


  const today = new Date().toISOString().slice(0, 10);
  const from = url.searchParams.get("from") || addDays(today, -60);
  const to = url.searchParams.get("to") || addDays(today, 90);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) {
    return new Response(JSON.stringify({ error: "Invalid from/to (YYYY-MM-DD)" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    // "Udsolgt" betyder at der ikke er mere at tage imod — også ikke JIT. Det er
    // grundlaget for at slukke annoncer, og vi slukker ikke for noget vi kan skaffe.
    const [pair, catalogRaw] = await Promise.all([
      loadInventoryPair(context.env.BOOKINGS),
      context.env.BOOKINGS.get("products_catalog"),
    ]);
    const inventory = pair.bookable;
    const bundleParts = bundlePartsFromCatalog(catalogRaw);

    // Optaget pr. dag pr. produkt: dag D er optaget når pickup <= D < return
    const perDay: Record<string, Record<string, number>> = {};

    // Gennem bookingIndex frem for et list-opslag pr. besøg — se
    // _lib/bookingIndex.ts. Gratis KV giver 1.000 list-operationer i døgnet,
    // og admin-siderne brugte dem sammen med kundernes ledighedstjek.
    const index = await hentBookingIndex(context.env.BOOKINGS, context as unknown as ExecutionContext);

    for (const entry of index.bookinger) {
      const booking = entry.data;

      const pickup = String(booking.pickup || "").slice(0, 10);
      const ret = String(booking.returnDate || "").slice(0, 10);
      if (!pickup || !ret) continue;

      // Uden for det forespurgte vindue
      if (ret <= from || pickup > to) continue;

      // Annullerede bookinger optog aldrig noget — de skal heller ikke i historikken
      if (String(booking.status || "").startsWith("annulleret")) continue;

      // Pakker optager deres dele, ikke sig selv
      const ids = expandProductIds(bookedProductIds(booking), bundleParts);
      if (!ids.length) continue;

      for (let day = pickup < from ? from : pickup; day < ret && day <= to; day = addDays(day, 1)) {
        const dayMap = (perDay[day] ??= {});
        for (const pid of ids) {
          dayMap[pid] = (dayMap[pid] || 0) + 1;
        }
      }
    }

    // Blokerede datoer i vinduet tæller som udsolgt (produkter=[] blokerer alt)
    const blocked: Record<string, string[]> = {};
    for (const b of index.blokerede) {
      if (b.date < from || b.date > to) continue;
      blocked[b.date] = b.products;
    }

    // Saml kun dage hvor noget er udsolgt/blokeret
    const days: Array<{
      date: string;
      soldOut: Array<{ id: string; booked: number; total: number }>;
      blocked?: string[];
    }> = [];

    const allDates = new Set<string>([...Object.keys(perDay), ...Object.keys(blocked)]);
    for (const date of [...allDates].sort()) {
      const soldOut: Array<{ id: string; booked: number; total: number }> = [];
      const dayMap = perDay[date] || {};
      for (const [pid, count] of Object.entries(dayMap)) {
        const total = inventory[pid];
        // Kun produkter med kendt lager kan være udsolgt
        if (total !== undefined && count >= total) {
          soldOut.push({ id: pid, booked: count, total });
        }
      }
      soldOut.sort((a, b) => a.id.localeCompare(b.id));
      if (soldOut.length || date in blocked) {
        days.push({ date, soldOut, ...(date in blocked ? { blocked: blocked[date] } : {}) });
      }
    }

    return new Response(JSON.stringify({ from, to, today, inventory, days }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    console.error("Soldout error:", e);
    return new Response(JSON.stringify({ error: "Failed to compute sold out overview" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
