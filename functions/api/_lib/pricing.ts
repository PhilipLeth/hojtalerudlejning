import { DJ_ID, requireDjGear, priceDj, djLabel, dateFromDay, type DjHours } from "../../../src/lib/dj";
/** Server-side prisopslag til Stripe — beløb beregnes ALTID her, aldrig fra klienten. */
import {
  speakers as defaultSpeakers,
  addons as defaultAddons,
  rentalProducts as defaultRentals,
  erForespoergsel,
  isDeliveryAddon,
  nuvaerendeId,
  SAMMENLAGTE_IDER,
  solveBundlePrices,
  type BundlePart,
} from "../../../src/lib/products";
import { CATALOG_KEY } from "./channels";

export interface PricedItem {
  id: string;
  name: string;
  /** Pris i øre (DKK) */
  unitAmount: number;
  /** Hvilken slags vare — afgør om den lander som produkt eller tilvalg på en ordre */
  kind: "speaker" | "rental" | "addon";
  /** Højtalerens størrelse, fx "12 tommer" */
  size?: string;
}

interface CatalogShape {
  speakers?: Array<{ id: string; price: number; hidden?: boolean; da?: { name?: string; size?: string } }>;
  addons?: Array<{ id: string; price: number; hidden?: boolean; da?: { label?: string } }>;
  rentalProducts?: Array<{
    id: string;
    price: number;
    hidden?: boolean;
    name_da?: string;
    bundle?: { parts?: BundlePart[]; rabat?: number };
  }>;
}

/** Fuldt pristabel: KV-katalog (admin-redigeret) med kode-defaults som fallback. */
export async function loadPriceTable(kv: KVNamespace): Promise<Map<string, PricedItem>> {
  const table = new Map<string, PricedItem>();

  const add = (
    id: string,
    name: string,
    priceKr: number,
    hidden: boolean | undefined,
    kind: PricedItem["kind"],
    size?: string,
  ) => {
    // En forespørgselsvare (skærm, projektor, slush ice …) har ingen fast
    // weekendpris i Frederiks ark, og må derfor aldrig kunne betales online —
    // heller ikke hvis et gammelt link eller et gemt KV-katalog stadig bærer
    // den. Se ER_FORESPOERGSEL i products.ts.
    if (!id || hidden || erForespoergsel(id) || !Number.isFinite(priceKr) || priceKr <= 0) return;
    table.set(id, { id, name, unitAmount: Math.round(priceKr * 100), kind, size });
  };

  for (const s of defaultSpeakers) add(s.id, s.da.name, s.price, s.hidden, "speaker", s.da.size);
  for (const a of defaultAddons) add(a.id, a.da.label, a.price, a.hidden, "addon");
  for (const r of defaultRentals) add(r.id, r.name_da, r.price, r.hidden, "rental");

  // KV-katalog overskriver defaults (samme kilde som frontend/useProducts)
  let kvRentals: CatalogShape["rentalProducts"] = [];
  try {
    const raw = await kv.get(CATALOG_KEY);
    if (raw) {
      const cat = JSON.parse(raw) as CatalogShape;
      kvRentals = cat.rentalProducts ?? [];
      for (const s of cat.speakers ?? []) {
        if (s.id === "festival_bas") continue; // opfundet combo-SKU
        add(s.id, s.da?.name ?? s.id, s.price, s.hidden, "speaker", s.da?.size);
      }
      for (const a of cat.addons ?? []) add(a.id, a.da?.label ?? a.id, a.price, a.hidden, "addon");
      for (const r of cat.rentalProducts ?? []) add(r.id, r.name_da ?? r.id, r.price, r.hidden, "rental");
    }
  } catch {
    // defaults gælder
  }

  deriveBundlePrices(table, kvRentals);

  /*
   * Sammenlagte varer: den trådløse mikrofon lå både som `mikrofon` og
   * `traadloes_mikrofon`. Den sidste er væk, men gamle ordrer, gemte kataloger
   * og bogmærkede /?product=-links bærer den stadig. Uden det her ville en
   * genberegning af en gammel ordre kaste "Unknown product".
   */
  for (const [gammelt, nyt] of Object.entries(SAMMENLAGTE_IDER)) {
    const priced = table.get(nyt);
    if (priced && !table.has(gammelt)) table.set(gammelt, { ...priced, id: gammelt });
  }

  return table;
}

/**
 * Pakkeprisen regnes ud af delene, også her på serveren.
 *
 * Uden dette trin læste Stripe den pris, der stod gemt på pakken — og en
 * prisrettelse på en lysbar ville flytte tallet på siden, men ikke beløbet i
 * kurven. Kunden så én pris og betalte en anden. Nu er kilden den samme begge
 * steder: solveBundlePrices().
 *
 * Pakkens dele og rabat tages fra KV-kataloget, hvis admin har gemt dem, ellers
 * fra koden.
 */
function deriveBundlePrices(table: Map<string, PricedItem>, kvRentals: CatalogShape["rentalProducts"]): void {
  const fraKv = new Map<string, { parts: BundlePart[]; rabat?: number }>();
  for (const r of kvRentals ?? []) {
    if (r?.id && Array.isArray(r.bundle?.parts) && r.bundle!.parts!.length) {
      fraKv.set(r.id, { parts: r.bundle!.parts!, rabat: r.bundle!.rabat });
    }
  }

  const bundles: Array<{ id: string; parts: BundlePart[]; rabat?: number }> = [];
  const set = new Set<string>();
  for (const r of defaultRentals) {
    if (!r.bundle?.parts?.length) continue;
    const kv = fraKv.get(r.id);
    bundles.push({ id: r.id, parts: kv?.parts ?? r.bundle.parts, rabat: kv ? kv.rabat : r.bundle.rabat });
    set.add(r.id);
  }
  // Pakker admin har opfundet i KV, som koden ikke kender
  for (const [id, b] of fraKv) if (!set.has(id)) bundles.push({ id, ...b });
  if (!bundles.length) return;

  const prices = new Map<string, number>();
  for (const [id, item] of table) prices.set(id, item.unitAmount / 100);
  solveBundlePrices(bundles, prices);

  for (const b of bundles) {
    const kr = prices.get(b.id);
    const kendt = table.get(b.id);
    // En skjult eller ukendt pakke skal blive ved at være ukendt — den må ikke
    // kunne bookes, bare fordi delene findes.
    if (!kendt || !Number.isFinite(kr) || (kr as number) <= 0) continue;
    table.set(b.id, { ...kendt, unitAmount: Math.round((kr as number) * 100) });
  }
}

export interface LineItemInput {
  id: string;
  dj?: DjHours;
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
  items: LineItemInput[],
  date?: Date | null,
): { lineItems: BuiltLineItem[]; totalOre: number } {
  if (!Array.isArray(items) || items.length === 0 || items.length > 25) {
    throw new Error("Invalid items");
  }
  requireDjGear(items.map(item=>String(item?.id ?? "")));
  const hasDj = items.some((item) => item?.id === DJ_ID);
  const lineItems: BuiltLineItem[] = [];
  let totalOre = 0;
  for (const item of items) {
    const id = String(item?.id ?? "");
    // DJ-prisen rummer allerede levering/opsætning/nedtagning.
    if (hasDj && isDeliveryAddon(id)) continue;
    const priced = table.get(id);
    if (!priced) throw new Error(`Unknown product: ${item?.id}`);
    const dj = id === DJ_ID ? priceDj(item.dj, date) : null;
    const unitAmount = dj ? dj.total * 100 : priced.unitAmount;
    lineItems.push({
      price_data: {
        currency: "dkk",
        unit_amount: unitAmount,
        product_data: { name: dj ? djLabel(item.dj as DjHours, "da", date) : priced.name },
      },
      quantity: 1,
    });
    totalOre += unitAmount;
  }
  return { lineItems, totalOre };
}
