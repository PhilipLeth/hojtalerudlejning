/** Lager, ét sted på serveren.
 *
 * Alle svar om ledighed skal komme fra samme tal: booking-flowet
 * (/api/availability), udsolgt-oversigten, kalenderen, weekendudsalget og
 * annoncereglerne. Beholdningen ligger i KV under "inventory" som
 * productId → antal, og pakker har ikke deres eget tal — de låner delenes.
 *
 * Der er TO tal pr. produkt, og de svarer på hver sit spørgsmål:
 *
 *   owned    ("inventory")          — hvad vi ejer og har på hylden
 *   bookable (owned + overbooking)  — hvad vi tager imod, fordi resten kan
 *                                     købes eller lejes ind til dagen (JIT)
 *
 * Hvem bruger hvad:
 *   bookable → /api/availability (må kunden booke?), soldout, ads, ads-rules
 *              (skal annoncerne slukkes? nej, så længe vi kan skaffe mere) og
 *              produktfeeds ("in stock").
 *   owned    → belægningskalenderen (baner ud over det ejede markeres som
 *              overbooking), weekendudsalget og rabatkoderne (vi giver ikke
 *              rabat på udstyr vi mangler at købe) og overbooking-varslingen.
 */

import { isBundleProduct, rentalProducts as defaultRentals } from "../../../src/lib/products";
import { DEFAULT_INVENTORY, type LoadedBooking } from "./bookings";
import { expandProductIds } from "./occupancy";

export const INVENTORY_KEY = "inventory";
/** Hvor mange vi derudover tager imod pr. produkt, fordi de kan skaffes JIT */
export const OVERBOOK_KEY = "inventory_overbook";

/** Opfundet combo-SKU fra et gammelt katalog — ikke noget der står på en hylde */
const NOT_PHYSICAL = ["festival_bas"];

/**
 * Lagertallene som resten af koden skal regne med: det gemte over defaults fra
 * koden. Mangler et produkt helt, har det ikke noget lagertal — og kan dermed
 * ikke blive udsolgt. Det er et hul, ikke et valg; /admin/lager viser hvilke.
 */
export function effectiveInventory(input: unknown): Record<string, number> {
  // Kaldes både med den rå KV-streng og med et allerede parset objekt
  let stored: Record<string, unknown> = {};
  if (typeof input === "string" && input) {
    try {
      const parsed = JSON.parse(input);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) stored = parsed;
    } catch {
      // ugyldigt JSON i KV må ikke tage ledighedsberegningen ned
    }
  } else if (input && typeof input === "object" && !Array.isArray(input)) {
    stored = input as Record<string, unknown>;
  }
  const out: Record<string, number> = { ...DEFAULT_INVENTORY };
  for (const [id, value] of Object.entries(stored)) {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) out[id] = Math.round(n);
  }
  for (const id of NOT_PHYSICAL) delete out[id];
  return out;
}

/**
 * Overbooking pr. produkt: hvor mange vi tager imod ud over det vi ejer.
 *
 * Ingen defaults — overbooking er et aktivt valg pr. produkt, aldrig noget der
 * gælder fordi ingen har sagt fra. Et produkt uden lagertal får ingen
 * overbooking, for uden et loft er der ikke noget at overskride.
 */
export function effectiveOverbook(input: unknown, owned?: Record<string, number>): Record<string, number> {
  let stored: Record<string, unknown> = {};
  if (typeof input === "string" && input) {
    try {
      const parsed = JSON.parse(input);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) stored = parsed;
    } catch {
      // ugyldigt JSON må ikke tage ledighedsberegningen ned
    }
  } else if (input && typeof input === "object" && !Array.isArray(input)) {
    stored = input as Record<string, unknown>;
  }
  const out: Record<string, number> = {};
  for (const [id, value] of Object.entries(stored)) {
    if (NOT_PHYSICAL.includes(id)) continue;
    if (owned && typeof owned[id] !== "number") continue;
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) out[id] = Math.round(n);
  }
  return out;
}

/** Hvad vi tager imod i alt: det ejede plus det vi kan skaffe til dagen */
export function bookableInventory(
  owned: Record<string, number>,
  overbook: Record<string, number>,
): Record<string, number> {
  const out = { ...owned };
  for (const [id, extra] of Object.entries(overbook)) {
    if (typeof out[id] === "number") out[id] += extra;
  }
  return out;
}

/** Begge tal, læst i én omgang — se filens hoved for hvem der bruger hvad */
export async function loadInventoryPair(
  kv: KVNamespace,
): Promise<{ owned: Record<string, number>; overbook: Record<string, number>; bookable: Record<string, number> }> {
  const [ownedRaw, overbookRaw] = await Promise.all([kv.get(INVENTORY_KEY), kv.get(OVERBOOK_KEY)]);
  const owned = effectiveInventory(ownedRaw);
  const overbook = effectiveOverbook(overbookRaw, owned);
  return { owned, overbook, bookable: bookableInventory(owned, overbook) };
}

/**
 * Produktnavne fra kataloget, med belægningskalenderens navne som fallback for
 * ids der ikke længere findes i kataloget (gamle bookinger).
 */
export function productLabels(
  catalog: unknown,
  fallback: Record<string, string> = {},
): Record<string, string> {
  const labels = { ...fallback };
  if (!catalog) return labels;
  try {
    const cat = (typeof catalog === "string" ? JSON.parse(catalog) : catalog) as {
      speakers?: Array<{ id?: string; da?: { name?: string } }>;
      addons?: Array<{ id?: string; da?: { label?: string } }>;
      rentalProducts?: Array<{ id?: string; name_da?: string }>;
    };
    for (const s of cat.speakers || []) if (s.id && s.da?.name) labels[s.id] = s.da.name;
    for (const a of cat.addons || []) if (a.id && a.da?.label) labels[a.id] = a.da.label;
    for (const r of cat.rentalProducts || []) if (r.id && r.name_da) labels[r.id] = r.name_da;
  } catch {
    // uden katalog er fallback-navnene det bedste vi har
  }
  return labels;
}

/**
 * Pakke → dele. Udledt af kataloget (KV hvis gemt, ellers koden), så en pakke
 * ikke kan optage andre produkter i lagerlogikken end den viser kunden.
 */
export function bundlePartsFromCatalog(catalog: unknown): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const p of defaultRentals) {
    if (isBundleProduct(p)) out[p.id] = p.bundle!.parts.map((part) => part.productId);
  }
  if (!catalog) return out;
  try {
    const cat = (typeof catalog === "string" ? JSON.parse(catalog) : catalog) as {
      rentalProducts?: Array<{ id?: string; bundle?: { parts?: Array<{ productId?: string }> } }>;
    };
    for (const p of cat.rentalProducts || []) {
      const parts = (p.bundle?.parts || [])
        .map((x) => x?.productId)
        .filter((x): x is string => typeof x === "string" && x.length > 0);
      if (p.id && parts.length) out[p.id] = parts;
    }
  } catch {
    // uden katalog gælder kodens pakker
  }
  return out;
}

/**
 * Pakkens pladser: den snævreste del bestemmer. Har vi to lys-pakker og én stor
 * højtalerpakke, kan vi udleje én stor festpakke — ikke to.
 *
 * Returnerer null hvis bare én del mangler lagertal: så ved vi ikke nok til at
 * afvise en booking, og pakken forbliver ubegrænset som før.
 */
export function bundleSlots(
  parts: string[],
  inventory: Record<string, number>,
  booked: Record<string, number>,
): { total: number; used: number } | null {
  if (!parts.length) return null;
  let total = Infinity;
  let remaining = Infinity;
  for (const part of parts) {
    const stock = inventory[part];
    if (typeof stock !== "number") return null;
    total = Math.min(total, stock);
    remaining = Math.min(remaining, stock - (booked[part] ?? 0));
  }
  if (total === Infinity) return null;
  return { total, used: Math.max(0, total - remaining) };
}

/**
 * Bookinger med pakker skiftet ud med deres fysiske dele.
 *
 * Bruges alle steder hvor spørgsmålet er kapacitet: er der en ledig enhed
 * tilbage. loadBookings() beholder bevidst de rå id'er, fordi annonce-
 * statistikken skal kunne se at det var *pakken* der blev booket.
 */
export function expandBookings(
  bookings: LoadedBooking[],
  bundleParts: Record<string, string[]>,
): LoadedBooking[] {
  return bookings.map((b) => ({ ...b, productIds: expandProductIds(b.productIds, bundleParts) }));
}

/**
 * Validér et lager-patch fra admin. null rydder tallet (produktet bliver
 * ubegrænset igen). Grænsen på 999 findes for at fange tastefejl som 1000000,
 * der ville få alt til at se ledigt ud for evigt.
 */
export function validateStockPatch(
  input: unknown,
): { ok: true; patch: Record<string, number | null> } | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "inventory skal være et objekt med productId → antal" };
  }
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length === 0) return { ok: false, error: "Ingen lagertal at gemme" };
  if (entries.length > 300) return { ok: false, error: "For mange produkter i én skrivning" };

  const patch: Record<string, number | null> = {};
  for (const [id, value] of entries) {
    if (!id || id.length > 60) return { ok: false, error: `Ugyldigt produkt-id: "${id}"` };
    if (value === null) {
      patch[id] = null;
      continue;
    }
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || n > 999 || !Number.isInteger(n)) {
      return { ok: false, error: `Lagertallet for "${id}" skal være et helt tal mellem 0 og 999` };
    }
    patch[id] = n;
  }
  return { ok: true, patch };
}
