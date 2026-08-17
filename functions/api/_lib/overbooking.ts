/** Overbooking: bookinger vi har taget imod uden at eje udstyret endnu.
 *
 * Vi tillader det med vilje, produkt for produkt: står der overbooking 2 på
 * røgmaskinen, tager vi to bookinger mere end vi har maskiner, fordi de kan
 * købes eller lejes ind til dagen (JIT). Men så SKAL nogen vide det — ellers
 * står vi fredag eftermiddag med en kunde og ingen maskine.
 *
 * Derfor: en push med det samme når en booking lander ud over det vi ejer, og
 * en "skal skaffes"-liste i /admin/lager som ikke forsvinder, når man swiper
 * beskeden væk.
 */

import { addDays, bookedProductIds, loadBookings, type LoadedBooking } from "./bookings";
import {
  bundlePartsFromCatalog,
  expandBookings,
  loadInventoryPair,
  productLabels,
} from "./inventory";
import { PRODUCT_LABELS, expandProductIds } from "./occupancy";
import { KV_PUSH_SUBS, loadSubscriptions } from "../push";
import { sendPush } from "../../../src/lib/webpush";

/** Ét produkt der mangler enheder på én dag */
export interface OverbookHit {
  id: string;
  name: string;
  /** Dagen hvor det er værst i den periode vi ser på */
  day: string;
  /** Hvor mange bookinger der er den dag */
  booked: number;
  /** Hvor mange vi ejer */
  owned: number;
  /** Hvor mange der skal skaffes = booked - owned */
  missing: number;
}

export interface OverbookEnv {
  BOOKINGS: KVNamespace;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
}

/** Optaget pr. dag pr. fysisk produkt — pakker tælles på deres dele */
function countsByDay(
  bookings: LoadedBooking[],
  from: string,
  to: string,
): Record<string, Record<string, number>> {
  const perDay: Record<string, Record<string, number>> = {};
  for (const b of bookings) {
    for (let day = b.pickup; day < b.returnDate; day = addDays(day, 1)) {
      if (day < from || day > to) continue;
      const dayMap = (perDay[day] ??= {});
      for (const id of b.productIds) dayMap[id] = (dayMap[id] ?? 0) + 1;
    }
  }
  return perDay;
}

/**
 * Hvor er vi over det vi ejer, i vinduet from..to?
 *
 * `only` begrænser til bestemte produkter — brugt lige efter en booking, hvor
 * kun dens egne produkter er interessante. Uden den ser vi på alt, hvilket er
 * det /admin/lager viser som "skal skaffes".
 */
export function findOverbooking(
  bookings: LoadedBooking[],
  owned: Record<string, number>,
  labels: Record<string, string>,
  from: string,
  to: string,
  only?: Set<string>,
): OverbookHit[] {
  const perDay = countsByDay(bookings, from, to);
  // Værste dag pr. produkt — det er antallet vi skal skaffe
  const worst = new Map<string, OverbookHit>();

  for (const [day, counts] of Object.entries(perDay)) {
    for (const [id, booked] of Object.entries(counts)) {
      if (only && !only.has(id)) continue;
      const have = owned[id];
      // Uden lagertal er der ikke noget loft at overskride
      if (typeof have !== "number" || booked <= have) continue;
      const hit: OverbookHit = {
        id,
        name: labels[id] || id,
        day,
        booked,
        owned: have,
        missing: booked - have,
      };
      const prev = worst.get(id);
      if (!prev || hit.missing > prev.missing || (hit.missing === prev.missing && hit.day < prev.day)) {
        worst.set(id, hit);
      }
    }
  }

  return [...worst.values()].sort((a, b) => (a.day === b.day ? b.missing - a.missing : a.day.localeCompare(b.day)));
}

/** Alt vi mangler at skaffe fra i dag og de næste `days` dage */
export async function overbookingAhead(kv: KVNamespace, today: string, days = 120): Promise<OverbookHit[]> {
  const [{ owned }, catalogRaw, bookings] = await Promise.all([
    loadInventoryPair(kv),
    kv.get("products_catalog"),
    loadBookings(kv),
  ]);
  const parts = bundlePartsFromCatalog(catalogRaw);
  return findOverbooking(
    expandBookings(bookings, parts),
    owned,
    productLabels(catalogRaw, PRODUCT_LABELS),
    today,
    addDays(today, days),
  );
}

/** "fre 21. aug" — kort nok til en låseskærm */
function shortDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export function overbookingPush(hits: OverbookHit[]): { title: string; body: string } {
  const linjer = hits.map((h) => `${h.name}: ${h.booked} booket, vi har ${h.owned} · ${shortDay(h.day)}`);
  return {
    title:
      hits.length === 1
        ? "Overbooking registreret"
        : `Overbooking registreret — ${hits.length} produkter`,
    body: `${linjer.join("\n")}\n${hits.length === 1 ? "Skal skaffes" : "Skal skaffes"} inden udlevering.`,
  };
}

/**
 * Kaldes lige efter en booking er gemt: ramte den ud over det vi ejer?
 *
 * Bevidst best-effort — en booking må aldrig fejle, fordi en push ikke kunne
 * sendes. Returnerer de fund der blev varslet, så kalderen kan logge dem.
 */
export async function notifyOverbooking(
  env: OverbookEnv,
  booking: Record<string, unknown>,
  bookingId: string,
): Promise<OverbookHit[]> {
  const kv = env.BOOKINGS;
  const pickup = String(booking.pickup || "").slice(0, 10);
  const returnDate = String(booking.returnDate || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pickup) || !/^\d{4}-\d{2}-\d{2}$/.test(returnDate)) return [];

  const [{ owned }, catalogRaw, bookings] = await Promise.all([
    loadInventoryPair(kv),
    kv.get("products_catalog"),
    loadBookings(kv),
  ]);
  const parts = bundlePartsFromCatalog(catalogRaw);
  // Kun de produkter DENNE booking optager — resten er ikke nyt
  const mine = new Set(expandProductIds(bookedProductIds(booking), parts));
  if (mine.size === 0) return [];

  const hits = findOverbooking(
    expandBookings(bookings, parts),
    owned,
    productLabels(catalogRaw, PRODUCT_LABELS),
    pickup,
    addDays(returnDate, -1),
    mine,
  );
  if (hits.length === 0) return [];

  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return hits;

  const subs = await loadSubscriptions(kv);
  if (subs.length === 0) return hits;

  const { title, body } = overbookingPush(hits);
  const payload = JSON.stringify({
    title,
    body,
    url: "/admin/lager",
    // Egen tag, så overbookings-beskeden ikke erstatter "Ny booking"-beskeden
    tag: `overbooking_${bookingId}`,
  });

  const results = await Promise.all(
    subs.map((s) =>
      sendPush(s, payload, { publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY },
        VAPID_SUBJECT || "mailto:info@lejhojtaler.dk"),
    ),
  );
  const gone = new Set(results.filter((r) => r.gone).map((r) => r.endpoint));
  if (gone.size) {
    await kv.put(KV_PUSH_SUBS, JSON.stringify(subs.filter((s) => !gone.has(s.endpoint))));
  }

  return hits;
}
