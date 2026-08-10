/** Delt logik for hvad en booking optager på lageret.
 *
 * Lå tidligere kun i soldout.ts. Trukket ud fordi ads-oversigten skal regne på
 * præcis de samme tal — to kopier ville drive fra hinanden, og så ville
 * annoncer blive slukket på et andet grundlag end udsolgt-siden viser.
 */

/** Skal matche DEFAULT_INVENTORY i availability.ts */
export const DEFAULT_INVENTORY: Record<string, number> = {
  thumpgo: 1, party: 2, soundboks: 2, festival: 2,
  lys: 2, rog: 2, stativer: 2, taske: 1, subwoofer: 1,
};

export const SPEAKER_IDS = ["thumpgo", "party", "soundboks", "festival"];

export function speakerNameToId(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower === "party" || lower.includes("lille højtalerpakke") || lower.includes("small speaker")) return "party";
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

/** Produkt-ids en booking optager (speaker + tilvalg + kurv-varer) */
export function bookedProductIds(booking: Record<string, unknown>): string[] {
  const ids: string[] = [];

  const speakerId: string | null =
    typeof booking.speakerId === "string" && booking.speakerId
      ? booking.speakerId
      : speakerNameToId(String(booking.speaker || ""));

  if (speakerId === "lys-only") ids.push("lys");
  else if (speakerId && speakerId !== "effects-only" && SPEAKER_IDS.includes(speakerId)) ids.push(speakerId);

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
  pickup: string;
  returnDate: string;
  productIds: string[];
  total: number;
  cartItems: Array<{ name?: string; price?: number; productId?: string }>;
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
    out.push({
      pickup,
      returnDate: ret,
      productIds: bookedProductIds(booking),
      total: Number(booking.total) || 0,
      cartItems: (booking.cartItems as LoadedBooking["cartItems"]) || [],
    });
  }
  return out;
}

/**
 * Hvilke dage er hvert produkt udsolgt i vinduet?
 * Dag D er optaget når pickup <= D < returnDate — afleveringsdagen tæller ikke,
 * fordi udstyret er tilbage samme dag.
 */
export function soldOutDaysByProduct(
  bookings: LoadedBooking[],
  inventory: Record<string, number>,
  from: string,
  to: string,
): Record<string, string[]> {
  const perDay: Record<string, Record<string, number>> = {};
  for (const b of bookings) {
    for (let day = b.pickup; day < b.returnDate; day = addDays(day, 1)) {
      if (day < from || day > to) continue;
      const dayMap = (perDay[day] ??= {});
      for (const id of b.productIds) dayMap[id] = (dayMap[id] ?? 0) + 1;
    }
  }

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
