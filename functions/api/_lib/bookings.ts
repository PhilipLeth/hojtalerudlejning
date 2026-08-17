/** Delt logik for hvad en booking optager på lageret.
 *
 * Lå tidligere kun i soldout.ts. Trukket ud fordi ads-oversigten skal regne på
 * præcis de samme tal — to kopier ville drive fra hinanden, og så ville
 * annoncer blive slukket på et andet grundlag end udsolgt-siden viser.
 */

/** Skal matche DEFAULT_INVENTORY i availability.ts */
export const DEFAULT_INVENTORY: Record<string, number> = {
  thumpgo: 1, party: 2, soundboks: 2, festival: 2,
  lys: 2, rog: 2, stativer: 2, taske: 1, subwoofer: 4, lyskaeder: 6,
};

export const SPEAKER_IDS = ["thumpgo", "party", "soundboks", "festival"];

/** Legacy combo-SKU — ikke et fysisk produkt; ekspanderes til festival + subwoofer. */
const LEGACY_COMBO: Record<string, string[]> = {
  festival_bas: ["festival", "subwoofer"],
};

export function speakerNameToId(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower === "party" || lower.includes("lille højtalerpakke") || lower.includes("small speaker")) return "party";
  // Gammel "Stor højtalerpakke + bas"-booking: map til legacy-id, ekspanderes nedenfor
  if (lower.includes("+ bas") || lower.includes("+ bass") || lower.includes("med bas")) return "festival_bas";
  if (lower === "festival" || lower.includes("stor højtalerpakke") || lower.includes("large speaker")) return "festival";
  if (lower.includes("thump")) return "thumpgo";
  if (lower.includes("soundboks")) return "soundboks";
  if (lower === "kun lys") return "lys-only";
  return null;
}

export const ADDON_NAME_TO_ID: Record<string, string> = {
  lys: "lys", lysshow: "lys", "lys show": "lys",
  rog: "rog", "røg": "rog", roegmaskine: "rog", "røgmaskine": "rog", smoke: "rog",
  stativer: "stativer", stativ: "stativer",
  taske: "taske", baeretaske: "taske", "bæretaske": "taske",
  subwoofer: "subwoofer", sub: "subwoofer",
};

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface Weekend {
  /** Fredag */
  from: string;
  /** Mandag — udstyret er tilbage, så dagen er ikke en del af weekenden */
  to: string;
  /** Fre, lør, søn */
  days: string[];
}

/** Fredag→mandag i den førstkommende weekend. Fredag selv tæller som "kommende". */
export function upcomingWeekend(today: string): Weekend {
  const dow = new Date(`${today}T00:00:00Z`).getUTCDay(); // 0=søn
  const daysUntilFriday = (5 - dow + 7) % 7;
  const from = addDays(today, daysUntilFriday);
  const days = [from, addDays(from, 1), addDays(from, 2)]; // fre, lør, søn
  return { from, to: addDays(from, 3), days };
}

/** De næste `count` weekender, den førstkommende først. */
export function nextWeekends(today: string, count: number): Weekend[] {
  const first = upcomingWeekend(today);
  return Array.from({ length: Math.max(1, count) }, (_, i) => {
    const from = addDays(first.from, i * 7);
    return { from, to: addDays(from, 3), days: [from, addDays(from, 1), addDays(from, 2)] };
  });
}

/** Produkt-ids en booking optager (speaker + tilvalg + kurv-varer) */
export function bookedProductIds(booking: Record<string, unknown>): string[] {
  const ids: string[] = [];

  const speakerId: string | null =
    typeof booking.speakerId === "string" && booking.speakerId
      ? booking.speakerId
      : speakerNameToId(String(booking.speaker || ""));

  if (speakerId === "lys-only") ids.push("lys");
  else if (speakerId && LEGACY_COMBO[speakerId]) ids.push(...LEGACY_COMBO[speakerId]);
  // Hovedproduktet tæller uanset type. Whitelisten på SPEAKER_IDS betød at en
  // ordre på fx en lyskæde eller en projektor ikke optog noget som helst —
  // produktet stod ledigt i kalender og udsolgt-oversigt, selvom det var ude.
  // Produkter uden lagertal påvirker intet: både soldout og availability
  // regner kun på id'er der findes i inventory.
  else if (speakerId && speakerId !== "effects-only") ids.push(speakerId);

  if (Array.isArray(booking.addonIds) && booking.addonIds.length) {
    for (const pid of booking.addonIds) {
      if (typeof pid === "string") ids.push(pid);
    }
  } else {
    for (const label of (booking.addons as string[]) || []) {
      const lower = String(label).toLowerCase().replace(/[^a-zæøå]/g, "");
      const pid = ADDON_NAME_TO_ID[lower];
      if (pid) ids.push(pid);
    }
  }

  for (const item of (booking.cartItems as Array<{ productId?: string }>) || []) {
    if (item?.productId) ids.push(item.productId);
  }

  return ids;
}

export interface LoadedBooking {
  /** KV-nøglen ("booking_…"). Bruges til at holde en ordre ude af sin egen
   *  ledighedsberegning, når den allerede er gemt. */
  id: string;
  pickup: string;
  returnDate: string;
  productIds: string[];
  total: number;
  cartItems: Array<{ name?: string; price?: number; productId?: string }>;
  /** Server-valideret rabat, gemt af book.ts fra august 2026 */
  discount?: { code: string; pct: number } | null;
}

/** Alle bookinger fra KV, normaliseret. Ugyldige datoer springes over. */
export async function loadBookings(kv: KVNamespace): Promise<LoadedBooking[]> {
  const out: LoadedBooking[] = [];
  const list = await kv.list({ prefix: "booking_" });
  for (const key of list.keys) {
    const value = await kv.get(key.name);
    if (!value) continue;
    let booking: Record<string, unknown>;
    try {
      booking = JSON.parse(value);
    } catch {
      continue;
    }
    const pickup = String(booking.pickup || "").slice(0, 10);
    const ret = String(booking.returnDate || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pickup) || !/^\d{4}-\d{2}-\d{2}$/.test(ret)) continue;
    // Annullerede bookinger tæller ingen steder: hverken lager, omsætning
    // eller rabatkode-forbrug — de blev aldrig til noget
    if (String(booking.status || "").startsWith("annulleret")) continue;
    out.push({
      id: key.name,
      pickup,
      returnDate: ret,
      productIds: bookedProductIds(booking),
      total: Number(booking.total) || 0,
      cartItems: (booking.cartItems as LoadedBooking["cartItems"]) || [],
      discount: (booking.discount as LoadedBooking["discount"]) ?? null,
    });
  }
  return out;
}

/**
 * Hvor mange enheder af hvert produkt er optaget pr. dag i vinduet?
 * Dag D er optaget når pickup <= D < returnDate — afleveringsdagen tæller ikke,
 * fordi udstyret er tilbage samme dag.
 *
 * Grundlaget for både udsolgt-beregningen og udsalget: begge skal svare på
 * det samme spørgsmål fra samme tal, ellers kan et produkt være "udsolgt" ét
 * sted og "ledigt" et andet.
 */
export function bookedCountsByDay(
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

/** Hvilke dage er hvert produkt udsolgt i vinduet? */
export function soldOutDaysByProduct(
  bookings: LoadedBooking[],
  inventory: Record<string, number>,
  from: string,
  to: string,
): Record<string, string[]> {
  const perDay = bookedCountsByDay(bookings, from, to);

  const result: Record<string, string[]> = {};
  for (const [day, counts] of Object.entries(perDay)) {
    for (const [id, booked] of Object.entries(counts)) {
      const total = inventory[id];
      if (typeof total !== "number") continue; // ukendt lager => kan ikke være udsolgt
      if (booked >= total) (result[id] ??= []).push(day);
    }
  }
  for (const days of Object.values(result)) days.sort();
  return result;
}
