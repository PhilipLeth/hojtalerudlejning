/** Ledighed til booking-flowet: hvad er optaget i en periode.
 *
 * Regner nu på præcis samme logik som udsolgt-oversigten, kalenderen,
 * weekendudsalget og annoncereglerne: bookedProductIds() for hvad en ordre
 * optager, kataloget for hvad en pakke består af, og "inventory" i KV for hvor
 * mange vi har.
 *
 * Før havde denne fil sin egen kopi: en liste på ni produkter, hvor tilvalg kun
 * blev talt hvis de stod i listen, og hvor en pakke blev talt under sit eget
 * pakke-id. Konsekvensen var at kunden kunne booke den samme karaokemaskine to
 * gange, mens admin så den som udsolgt.
 */
import { bookedProductIds } from "./_lib/bookings";
import {
  bundlePartsFromCatalog,
  bundleSlots,
  loadInventoryPair,
} from "./_lib/inventory";
import { expandProductIds } from "./_lib/occupancy";

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
  const url = new URL(context.request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!from || !to) {
    return new Response(JSON.stringify({ error: "Missing from/to query params" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    const [pair, catalogRaw] = await Promise.all([
      loadInventoryPair(context.env.BOOKINGS),
      context.env.BOOKINGS.get("products_catalog"),
    ]);
    // Kunden må booke op til det vi tager imod: det ejede plus den overbooking
    // vi selv har sat, fordi resten kan skaffes til dagen (JIT).
    const inventory = pair.bookable;
    const bundleParts = bundlePartsFromCatalog(catalogRaw);

    // Optaget pr. fysisk produkt. Pakker tælles på deres dele, så en booking af
    // karaokepakken optager maskinen, skærmen og højtalerne hver for sig.
    const booked: Record<string, number> = {};

    const qFrom = from.slice(0, 10);
    const qTo = to.slice(0, 10);

    const list = await context.env.BOOKINGS.list({ prefix: "booking_" });
    for (const key of list.keys) {
      const value = await context.env.BOOKINGS.get(key.name);
      if (!value) continue;

      let booking: Record<string, unknown>;
      try {
        booking = JSON.parse(value);
      } catch {
        continue;
      }

      // Kun aktive bookinger — afleveret udstyr er tilbage på hylden, og en
      // annulleret booking skal frigive sine datoer med det samme
      const status = String(booking.status || "");
      if (status === "afleveret" || status.startsWith("annulleret")) continue;

      const bPickup = String(booking.pickup || "").slice(0, 10);
      const bReturn = String(booking.returnDate || "").slice(0, 10);
      if (!bPickup || !bReturn) continue;
      if (!(bPickup < qTo && bReturn > qFrom)) continue;

      // Ikke unique: to af samme produkt på én ordre optager to enheder
      for (const id of expandProductIds(bookedProductIds(booking), bundleParts)) {
        booked[id] = (booked[id] ?? 0) + 1;
      }
    }

    // Pakkerne har ikke eget lager — deres ledighed er den snævreste dels.
    // Udtrykt som total/optaget, så klienten kan regne "rest" på samme måde
    // for en pakke som for et enkelt produkt.
    for (const [bundleId, parts] of Object.entries(bundleParts)) {
      const slots = bundleSlots(parts, inventory, booked);
      if (!slots) continue;
      inventory[bundleId] = slots.total;
      booked[bundleId] = slots.used;
    }

    // Blokerede datoer i perioden
    const blockedDates: Array<{ date: string; reason: string; products: string[] }> = [];
    const blockedList = await context.env.BOOKINGS.list({ prefix: "blocked_" });
    for (const key of blockedList.keys) {
      const date = key.name.replace("blocked_", "");
      if (date < qFrom || date > qTo) continue;
      const val = await context.env.BOOKINGS.get(key.name);
      if (!val) continue;
      try {
        const parsed = JSON.parse(val);
        blockedDates.push({ date, reason: parsed.reason || "", products: parsed.products || [] });
      } catch {
        blockedDates.push({ date, reason: "", products: [] });
      }
    }

    return new Response(JSON.stringify({ inventory, booked, blocked_dates: blockedDates }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    console.error("Availability error:", e);
    return new Response(JSON.stringify({ error: "Failed to check availability" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
