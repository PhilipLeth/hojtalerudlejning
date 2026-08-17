/** Lager hører til produktet.
 *
 * Før havde /admin/lager sin egen hardkodede liste på ti produkter med egne
 * navne, mens /admin/produkter redigerede hele kataloget på ~60 produkter. De
 * øvrige 50 havde derfor aldrig fået et lagertal — og et produkt uden lagertal
 * kan ikke blive udsolgt nogen steder (hverken i booking-flowet, udsolgt-
 * oversigten, kalenderen eller annoncereglerne). Det er ikke "ubegrænset lager"
 * som et valg; det er et hul.
 *
 * Derfor kommer listen nu fra kataloget, med samme navne og samme rækkefølge
 * som produktsiden. De to sider kan ikke længere være uenige om hvilke
 * produkter der findes.
 */

import {
  isBundleProduct,
  isDeliveryAddon,
  type Addon,
  type RentalProduct,
  type Speaker,
} from "./products";

/** Kataloget som admin ser det — inkl. skjulte produkter, de står stadig på lager */
export interface StockCatalog {
  speakers: Speaker[];
  addons: Addon[];
  rentalProducts: RentalProduct[];
}

/** Samme tre sektioner som /admin/produkter, i samme rækkefølge */
export type StockSection = "speakers" | "rentals" | "addons";

export const SECTION_LABELS: Record<StockSection, string> = {
  speakers: "Højtalere",
  rentals: "Lys, AV og øvrige produkter",
  addons: "Tilvalg / mersalg",
};

export interface StockItem {
  id: string;
  /** Dansk navn fra kataloget — ikke en kopi i en labels-tabel */
  name: string;
  section: StockSection;
  hidden?: boolean;
  /**
   * Pakke: lageret følger delene og kan ikke sættes selvstændigt. Vi ejer ikke
   * "en karaokepakke" — vi ejer en karaokemaskine, en skærm og to højtalere.
   */
  parts?: string[];
}

/**
 * Alle produkter der optager fysisk lager, i katalogets rækkefølge.
 * Kørsel er ikke en ting på en hylde og har derfor intet lager.
 */
export function stockItems(catalog: StockCatalog): StockItem[] {
  const out: StockItem[] = [];

  for (const s of catalog.speakers) {
    out.push({ id: s.id, name: s.da.name, section: "speakers", hidden: s.hidden });
  }
  for (const r of catalog.rentalProducts) {
    out.push({
      id: r.id,
      name: r.name_da,
      section: "rentals",
      hidden: r.hidden,
      ...(isBundleProduct(r) ? { parts: r.bundle!.parts.map((p) => p.productId) } : {}),
    });
  }
  for (const a of catalog.addons) {
    if (isDeliveryAddon(a.id)) continue;
    out.push({ id: a.id, name: a.da.label, section: "addons", hidden: a.hidden });
  }

  return out;
}

/**
 * Pakkens lager: det færreste af delenes. Mangler bare én del sit tal, kan vi
 * ikke sige noget — så returnerer vi null i stedet for at gætte på et tal der
 * ville blokere bookinger.
 */
export function derivedStock(parts: string[], stock: Record<string, number>): number | null {
  if (!parts.length) return null;
  let min = Infinity;
  for (const part of parts) {
    const n = stock[part];
    if (typeof n !== "number") return null;
    if (n < min) min = n;
  }
  return min === Infinity ? null : min;
}

/** Har produktet et lagertal, eller står det som ubegrænset? */
export function hasStock(item: StockItem, stock: Record<string, number>): boolean {
  if (item.parts) return derivedStock(item.parts, stock) !== null;
  return typeof stock[item.id] === "number";
}

/**
 * Produkter uden lagertal. De kan bookes ubegrænset uden en advarsel nogen
 * steder, så listen er værd at vise admin frem for at skjule.
 */
export function missingStock(items: StockItem[], stock: Record<string, number>): StockItem[] {
  return items.filter((item) => !item.parts && !hasStock(item, stock));
}

/** Hvad et produkt reelt har at gøre godt med — pakker via deres dele */
export function effectiveStock(item: StockItem, stock: Record<string, number>): number | null {
  if (item.parts) return derivedStock(item.parts, stock);
  const n = stock[item.id];
  return typeof n === "number" ? n : null;
}
