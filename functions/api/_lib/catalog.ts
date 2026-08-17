/** Produktkataloget fladt: id, navn og pris.
 *
 * Kilde: KV `products_catalog` (gemt fra /admin/produkter). Ingen hardcodet
 * fallback — mangler kataloget, skal kaldet fejle så admin opdager det.
 */

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
}

export class CatalogMissingError extends Error {
  constructor(message = "Intet produktkatalog i KV. Gem kataloget under /admin/produkter.") {
    super(message);
    this.name = "CatalogMissingError";
  }
}

type RawProduct = {
  id?: string;
  name?: string;
  name_da?: string;
  price?: number;
  da?: { name?: string; label?: string };
};

function productName(p: RawProduct): string {
  return p.name || p.name_da || p.da?.name || p.da?.label || p.id || "";
}

/**
 * Fladt katalog fra den gemte KV-struktur.
 * Kaster CatalogMissingError hvis intet gyldigt katalog er gemt.
 */
export function productCatalog(saved: unknown): CatalogProduct[] {
  if (!saved || typeof saved !== "object") {
    throw new CatalogMissingError();
  }

  const groups = saved as Record<string, RawProduct[] | null>;
  const out: CatalogProduct[] = [];
  const seen = new Set<string>();

  for (const list of Object.values(groups)) {
    for (const p of list ?? []) {
      if (!p?.id || seen.has(p.id)) continue;
      // Opfundet combo-SKU — ikke et fysisk produkt
      if (p.id === "festival_bas") continue;
      const price = Number(p.price);
      if (!Number.isFinite(price) || price < 0) continue;
      seen.add(p.id);
      out.push({
        id: p.id,
        name: productName(p) || p.id,
        price,
      });
    }
  }

  if (out.length === 0) {
    throw new CatalogMissingError("Produktkataloget i KV er tomt. Gem kataloget under /admin/produkter.");
  }

  console.log("[catalog] loaded", out.length, "produkter fra KV");
  return out;
}
