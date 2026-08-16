/** Belægningskalender: ekspandér pakker, pack lanes, byg rækker.
 *
 * Lager er kun antal (inventory.soundboks=2) — ikke navngivne enheder.
 * Bookinger pakkes greedily i baner 0..stock-1 så man visuelt ser
 * belægning. Overbookinger får ekstra baner (markeret).
 */

import { addDays, bookedProductIds } from "./bookings";

/** Pakker → fysiske dele (matcher src/lib/products.ts bundles). */
export const BUNDLE_PARTS: Record<string, string[]> = {
  pakke_fest_lille: ["party", "lyseffekt"],
  pakke_fest_stor: ["festival", "lys"],
  pakke_karaoke: ["karaoke", "skaerm_32", "party"],
  pakke_karaoke_fest: ["karaoke", "skaerm_55", "festival"],
  pakke_praesentation: ["projektor", "laerred_160", "haandholdt_mikrofon"],
  pakke_konference: ["skaerm_55", "headset", "party"],
  pakke_tale_musik: ["festival", "traadloes_mikrofon"],
};

export const PRODUCT_LABELS: Record<string, string> = {
  thumpgo: "Mackie Thump GO",
  party: "Lille højtalerpakke",
  soundboks: "Soundboks 4",
  festival: "Stor højtalerpakke",
  festival_bas: "Stor højtalerpakke + bas",
  lys: "Lys-pakke",
  lyseffekt: "Enkelt lyseffekt",
  rog: "Røgmaskine",
  stativer: "Højtalerstativer",
  taske: "Bæretaske",
  subwoofer: 'Subwoofer 12"',
  discokugle: "Discokugle",
  lyskaeder: "Lyskæde varm hvid",
  lyskaeder_farvet: "Lyskæde farvet",
  uplight: "Uplight",
  uplight_4: "Uplight 4-pak",
  karaoke: "Karaokemaskine",
  skaerm_32: '32" Skærm',
  skaerm_55: '55" Storskærm',
  projektor: "Projektor",
  projektor_pro: "Projektor Pro",
  laerred_160: "Lærred 160 cm",
  traadloes_mikrofon: "Trådløs mikrofon",
  traadloes_mikrofon_pro: "Trådløs mikrofon PRO",
  haandholdt_mikrofon: "Håndholdt mikrofon",
  haandholdt_mikrofon_pro: "Håndholdt mikrofon PRO",
  headset: "Trådløst headset",
  headset_pro: "Trådløst headset PRO",
  mikrofon: "Trådløs mikrofon",
  batteri: "Ekstra batteri",
  low_fog: "Low fog-maskine",
};

export const PRODUCT_CATEGORY: Record<string, string> = {
  thumpgo: "lyd",
  party: "lyd",
  soundboks: "lyd",
  festival: "lyd",
  festival_bas: "lyd",
  subwoofer: "lyd",
  stativer: "lyd",
  taske: "lyd",
  batteri: "lyd",
  lys: "lys",
  lyseffekt: "lys",
  discokugle: "lys",
  lyskaeder: "lys",
  lyskaeder_farvet: "lys",
  uplight: "lys",
  uplight_4: "lys",
  rog: "roeg",
  low_fog: "roeg",
  karaoke: "av",
  skaerm_32: "av",
  skaerm_55: "av",
  projektor: "av",
  projektor_pro: "av",
  laerred_160: "av",
  traadloes_mikrofon: "av",
  traadloes_mikrofon_pro: "av",
  haandholdt_mikrofon: "av",
  haandholdt_mikrofon_pro: "av",
  headset: "av",
  headset_pro: "av",
  mikrofon: "av",
};

/** Skip levering m.m. — optager ikke fysisk lager. */
const SKIP_IDS = new Set([
  "levering",
  "levering_opsaetning",
  "levering_ud",
  "afhentning_retur",
  "levering_begge",
  "effects-only",
]);

/** Erstat pakke-id'er med deres dele. Ukendte id'er beholdes. */
export function expandProductIds(ids: string[]): string[] {
  const out: string[] = [];
  for (const id of ids) {
    if (SKIP_IDS.has(id)) continue;
    const parts = BUNDLE_PARTS[id];
    if (parts) out.push(...parts);
    else out.push(id);
  }
  return out;
}

export interface OccupancyBooking {
  bookingId: string;
  customerName: string;
  phone?: string;
  pickup: string;
  returnDate: string;
  /** Første optagne dag i kalender-vinduet */
  start: string;
  /** Sidste optagne dag i kalender-vinduet (inkl.) — afleveringsdag tæller ikke */
  end: string;
  lane: number;
  /** true hvis lane >= stock (overbooking) */
  overflow: boolean;
}

export interface OccupancyProduct {
  id: string;
  name: string;
  category: string;
  stock: number;
  bookings: OccupancyBooking[];
  /** Max samtidige bookinger i vinduet */
  peak: number;
}

export interface RawOccupancyBooking {
  id: string;
  name: string;
  phone?: string;
  status?: string;
  pickup: string;
  returnDate: string;
  productIds: string[];
}

/** Overlap: pickup <= day < returnDate */
export function occupiesDay(pickup: string, returnDate: string, day: string): boolean {
  return pickup <= day && day < returnDate;
}

export function rangesOverlap(
  aPickup: string,
  aReturn: string,
  bPickup: string,
  bReturn: string,
): boolean {
  return aPickup < bReturn && bPickup < aReturn;
}

/**
 * Pack bookinger i baner 0..stock-1. Sorteret efter pickup, så tidlige
 * bookinger får lavest mulige bane. Overbookinger får lane >= stock.
 */
export function packLanes(
  bookings: Array<{ bookingId: string; pickup: string; returnDate: string }>,
  stock: number,
): Array<{ bookingId: string; lane: number; overflow: boolean }> {
  const safeStock = Math.max(1, stock || 1);
  const sorted = [...bookings].sort((a, b) =>
    a.pickup === b.pickup
      ? a.returnDate.localeCompare(b.returnDate)
      : a.pickup.localeCompare(b.pickup),
  );

  const laneEnds: string[] = []; // returnDate for last booking in each lane
  const result: Array<{ bookingId: string; lane: number; overflow: boolean }> = [];

  for (const b of sorted) {
    let assigned = -1;
    for (let lane = 0; lane < laneEnds.length; lane++) {
      // Ledig hvis forrige i banen er tilbage på/før denne pickup
      if (laneEnds[lane] <= b.pickup) {
        assigned = lane;
        break;
      }
    }
    if (assigned < 0) {
      assigned = laneEnds.length;
      laneEnds.push(b.returnDate);
    } else {
      laneEnds[assigned] = b.returnDate;
    }
    result.push({
      bookingId: b.bookingId,
      lane: assigned,
      overflow: assigned >= safeStock,
    });
  }
  return result;
}

function clampRange(
  pickup: string,
  returnDate: string,
  from: string,
  to: string,
): { start: string; end: string } | null {
  // Optagne dage: pickup .. returnDate-1
  if (returnDate <= from || pickup > to) return null;
  const lastOcc = addDays(returnDate, -1);
  const start = pickup < from ? from : pickup;
  const end = lastOcc > to ? to : lastOcc;
  if (start > end) return null;
  return { start, end };
}

function peakConcurrent(
  bookings: Array<{ pickup: string; returnDate: string }>,
  from: string,
  to: string,
): number {
  let peak = 0;
  for (let day = from; day <= to; day = addDays(day, 1)) {
    let n = 0;
    for (const b of bookings) {
      if (occupiesDay(b.pickup, b.returnDate, day)) n++;
    }
    if (n > peak) peak = n;
  }
  return peak;
}

export function buildOccupancy(
  rawBookings: RawOccupancyBooking[],
  inventory: Record<string, number>,
  from: string,
  to: string,
  labels: Record<string, string> = PRODUCT_LABELS,
): OccupancyProduct[] {
  // productId → bookings that use it
  const byProduct = new Map<string, RawOccupancyBooking[]>();

  for (const b of rawBookings) {
    const status = String(b.status || "");
    if (status === "afleveret" || status.startsWith("annulleret")) continue;
    if (!b.pickup || !b.returnDate) continue;
    if (b.returnDate <= from || b.pickup > to) continue;

    const ids = expandProductIds(b.productIds.length ? b.productIds : bookedProductIds(b as unknown as Record<string, unknown>));
    const unique = [...new Set(ids)];
    for (const id of unique) {
      if (SKIP_IDS.has(id)) continue;
      const list = byProduct.get(id) ?? [];
      list.push(b);
      byProduct.set(id, list);
    }
  }

  const productIds = new Set<string>([
    ...Object.keys(inventory),
    ...byProduct.keys(),
  ]);

  const rows: OccupancyProduct[] = [];
  for (const id of productIds) {
    if (SKIP_IDS.has(id)) continue;
    const stock = typeof inventory[id] === "number" ? inventory[id] : 0;
    const list = byProduct.get(id) ?? [];
    const laneAssign = packLanes(
      list.map((b) => ({ bookingId: b.id, pickup: b.pickup, returnDate: b.returnDate })),
      Math.max(stock, 1),
    );
    const laneById = new Map(laneAssign.map((x) => [x.bookingId, x]));

    const bookings: OccupancyBooking[] = [];
    for (const b of list) {
      const clamped = clampRange(b.pickup, b.returnDate, from, to);
      if (!clamped) continue;
      const lane = laneById.get(b.id)!;
      bookings.push({
        bookingId: b.id,
        customerName: b.name || "Ukendt",
        phone: b.phone,
        pickup: b.pickup,
        returnDate: b.returnDate,
        start: clamped.start,
        end: clamped.end,
        lane: lane.lane,
        overflow: lane.overflow,
      });
    }

    rows.push({
      id,
      name: labels[id] || id,
      category: PRODUCT_CATEGORY[id] || "øvrigt",
      stock,
      bookings,
      peak: peakConcurrent(list, from, to),
    });
  }

  // Sort: kategori, så navn
  const catOrder = ["lyd", "lys", "roeg", "av", "øvrigt"];
  rows.sort((a, b) => {
    const ca = catOrder.indexOf(a.category);
    const cb = catOrder.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return a.name.localeCompare(b.name, "da");
  });

  return rows;
}

export interface BlockedDay {
  date: string;
  reason: string;
  products: string[];
}
