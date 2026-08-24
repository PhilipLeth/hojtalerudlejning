/** Server-side prisopslag til Stripe — beløb beregnes ALTID her, aldrig fra klienten. */
import {
  speakers as defaultSpeakers,
  addons as defaultAddons,
  rentalProducts as defaultRentals,
} from "../../../src/lib/products";
import { timeSlotFee, type OpeningHours } from "../../../src/lib/openingHours";
import { deliveryDirections, isDeliveryAddon } from "../../../src/lib/products";
import { CATALOG_KEY } from "./channels";

export interface PricedItem {
  id: string;
  name: string;
  /** Pris i øre (DKK) */
  unitAmount: number;
}

interface CatalogShape {
  speakers?: Array<{ id: string; price: number; hidden?: boolean; da?: { name?: string } }>;
  addons?: Array<{ id: string; price: number; hidden?: boolean; da?: { label?: string } }>;
  rentalProducts?: Array<{ id: string; price: number; hidden?: boolean; name_da?: string }>;
}

/** Fuldt pristabel: KV-katalog (admin-redigeret) med kode-defaults som fallback. */
export async function loadPriceTable(kv: KVNamespace): Promise<Map<string, PricedItem>> {
  const table = new Map<string, PricedItem>();

  const add = (id: string, name: string, priceKr: number, hidden?: boolean) => {
    if (!id || hidden || !Number.isFinite(priceKr) || priceKr <= 0) return;
    table.set(id, { id, name, unitAmount: Math.round(priceKr * 100) });
  };

  for (const s of defaultSpeakers) add(s.id, s.da.name, s.price, s.hidden);
  for (const a of defaultAddons) add(a.id, a.da.label, a.price, a.hidden);
  for (const r of defaultRentals) add(r.id, r.name_da, r.price, r.hidden);

  // KV-katalog overskriver defaults (samme kilde som frontend/useProducts)
  try {
    const raw = await kv.get(CATALOG_KEY);
    if (raw) {
      const cat = JSON.parse(raw) as CatalogShape;
      for (const s of cat.speakers ?? []) {
        if (s.id === "festival_bas") continue; // opfundet combo-SKU
        add(s.id, s.da?.name ?? s.id, s.price, s.hidden);
      }
      for (const a of cat.addons ?? []) add(a.id, a.da?.label ?? a.id, a.price, a.hidden);
      for (const r of cat.rentalProducts ?? []) add(r.id, r.name_da ?? r.id, r.price, r.hidden);
    }
  } catch {
    // defaults gælder
  }

  return table;
}

export interface LineItemInput {
  id: string;
}

export interface BuiltLineItem {
  price_data: {
    currency: "dkk";
    unit_amount: number;
    product_data: { name: string };
  };
  quantity: 1;
}

/**
 * Byg Stripe line_items ud fra produkt-id'er. Ukendte/skjulte id'er afvises
 * hårdt — der kan aldrig betales et andet beløb end katalogets.
 */
export function buildLineItems(
  table: Map<string, PricedItem>,
  items: LineItemInput[]
): { lineItems: BuiltLineItem[]; totalOre: number } {
  if (!Array.isArray(items) || items.length === 0 || items.length > 25) {
    throw new Error("Invalid items");
  }
  const lineItems: BuiltLineItem[] = [];
  let totalOre = 0;
  for (const item of items) {
    const priced = table.get(String(item?.id ?? ""));
    if (!priced) throw new Error(`Unknown product: ${item?.id}`);
    lineItems.push({
      price_data: {
        currency: "dkk",
        unit_amount: priced.unitAmount,
        product_data: { name: priced.name },
      },
      quantity: 1,
    });
    totalOre += priced.unitAmount;
  }
  return { lineItems, totalOre };
}

/* ─────────────── møder uden for åbningstid ─────────────── */


export interface MeetingTimes {
  /** Lejeperioden som ISO — datoen afgør om tidsrummet er inden for åbningstid */
  pickup?: string;
  returnDate?: string;
  /** open | early | late | unknown — kundens valg i checkout */
  pickupSlot?: string;
  returnSlot?: string;
  /** Ordrens produkt-id'er: kører vi selv, er der ingen tur at tage gebyr for */
  productIds: string[];
}

export interface AfterHoursLeg {
  leg: "pickup" | "return";
  /** Linjen på fakturaen — "Afhentning uden for åbningstid" */
  name: string;
  /** Gebyr i kr */
  fee: number;
}

/**
 * Hvilke ture koster gebyr, fordi kunden vil mødes uden for åbningstid.
 *
 * Beløbet slås ALTID op her ud fra åbningstiderne i KV — klienten sender kun
 * hvilket tidsrum kunden valgte. Ellers kunne en manipuleret ordre nulstille
 * gebyret ved at sende 0 kr.
 */
export function afterHoursLegs(
  hours: OpeningHours,
  times: MeetingTimes,
  locale: "da" | "en" = "da",
): AfterHoursLeg[] {
  const kørsel = deliveryDirections(times.productIds.find((id) => isDeliveryAddon(id)) ?? "");
  const legs: AfterHoursLeg[] = [];
  const iso = (v: string | undefined) => String(v ?? "").slice(0, 10);

  const pickupIso = iso(times.pickup);
  if (pickupIso && !kørsel.out) {
    const fee = timeSlotFee(hours, pickupIso, times.pickupSlot);
    if (fee > 0) {
      legs.push({
        leg: "pickup",
        name: locale === "en" ? "Pickup outside opening hours" : "Afhentning uden for åbningstid",
        fee,
      });
    }
  }

  const returnIso = iso(times.returnDate);
  if (returnIso && !kørsel.back) {
    const fee = timeSlotFee(hours, returnIso, times.returnSlot);
    if (fee > 0) {
      legs.push({
        leg: "return",
        name: locale === "en" ? "Return outside opening hours" : "Aflevering uden for åbningstid",
        fee,
      });
    }
  }

  return legs;
}

/** Gebyrerne som Stripe-linjer — samme form som katalogets varer */
export function afterHoursLineItems(legs: AfterHoursLeg[]): {
  lineItems: BuiltLineItem[];
  totalOre: number;
} {
  const lineItems = legs.map((l) => ({
    price_data: {
      currency: "dkk" as const,
      unit_amount: Math.round(l.fee * 100),
      product_data: { name: l.name },
    },
    quantity: 1 as const,
  }));
  return { lineItems, totalOre: legs.reduce((sum, l) => sum + Math.round(l.fee * 100), 0) };
}
