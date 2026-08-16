/** Produktkataloget fladt: id, navn og pris.
 *
 * Kataloget gemmes i KV som {gruppe: [produkter]} af /admin/produkter. Både
 * ads-oversigten og fredagsudsalget skal slå priser op i det, og to kopier
 * ville drive fra hinanden — så det ligger her.
 */

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
}

/** Fallback når intet katalog er gemt i admin. Matcher src/lib/products.ts. */
export const FALLBACK_PRODUCTS: CatalogProduct[] = [
  { id: "thumpgo", name: "Mackie Thump GO", price: 345 },
  { id: "party", name: "Lille højtalerpakke", price: 395 },
  { id: "soundboks", name: "Soundboks 4", price: 595 },
  { id: "festival", name: "Stor højtalerpakke", price: 695 },
  { id: "lys", name: "Lys-pakke", price: 495 },
  { id: "rog", name: "Røgmaskine", price: 245 },
  { id: "subwoofer", name: 'Subwoofer 12"', price: 295 },
  { id: "stativer", name: "Stativer", price: 95 },
  { id: "taske", name: "Bæretaske", price: 95 },
];

/** Fladt katalog fra den gemte KV-struktur. Falder tilbage når intet er gemt. */
export function productCatalog(saved: unknown): CatalogProduct[] {
  const groups = saved as Record<string, Array<{ id?: string; name?: string; price?: number }> | null> | null;
  if (!groups) return FALLBACK_PRODUCTS;
  const out: CatalogProduct[] = [];
  const seen = new Set<string>();
  for (const list of Object.values(groups)) {
    for (const p of list ?? []) {
      if (!p?.id || seen.has(p.id)) continue;
      seen.add(p.id);
      out.push({ id: p.id, name: p.name || p.id, price: Number(p.price) || 0 });
    }
  }
  return out.length ? out : FALLBACK_PRODUCTS;
}
