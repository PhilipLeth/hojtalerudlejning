/** Produktkataloget fladt: id, navn, pris, side og indhold.
 *
 * Kilde: KV `products_catalog` (gemt fra /admin/produkter), med koden i
 * `src/lib/products.ts` som fallback — samme regel som `pricing.ts`,
 * `bundlePartsFromCatalog()` og klientens `useProducts()` allerede følger.
 *
 * Filen krævede tidligere KV og kastede uden. Det var forkert af én grund:
 * at nulstille KV-kataloget er den *tilsigtede* måde at lade products.ts
 * slå igennem på. Gjorde man det, kørte forsiden, bookingen og priserne
 * videre på kodens katalog, mens /api/ads, /api/udsalg og kampagnerabatten
 * svarede "Intet produktkatalog i KV" — serveren var uenig med det, kunden
 * rent faktisk så. Nu er der kun én kilde, og den findes altid.
 */

import {
  speakers as defaultSpeakers,
  addons as defaultAddons,
  rentalProducts as defaultRentals,
} from "../../../src/lib/products";

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  /** Produktside, fx "/roeg". Null når produktet ikke har en. */
  page: string | null;
  /** Hvad der er med — bruges bl.a. i annoncetekst. */
  contents?: string[];
  /** Skjult i butikken. Beholdes i listen, så kaldere selv kan vælge. */
  hidden: boolean;
}

/**
 * Kastes kun hvis hverken KV eller koden har et katalog — altså aldrig i
 * drift, men den fanger et byggeri hvor products.ts er tømt ved et uheld.
 * Beholdt fordi kaldere fanger den.
 */
export class CatalogMissingError extends Error {
  constructor(message = "Intet produktkatalog — hverken i KV eller i koden.") {
    super(message);
    this.name = "CatalogMissingError";
  }
}

type RawProduct = {
  id?: string;
  name?: string;
  name_da?: string;
  price?: number;
  page?: string;
  hidden?: boolean;
  contents?: string[];
  da?: { name?: string; label?: string };
};

function productName(p: RawProduct): string {
  return p.name || p.name_da || p.da?.name || p.da?.label || p.id || "";
}

function flatten(groups: Record<string, RawProduct[] | null | undefined>): CatalogProduct[] {
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
        page: typeof p.page === "string" && p.page.startsWith("/") ? p.page : null,
        contents: Array.isArray(p.contents)
          ? p.contents.filter((c): c is string => typeof c === "string")
          : undefined,
        hidden: p.hidden === true,
      });
    }
  }
  return out;
}

/** Kodens katalog i samme form som det gemte. */
function fromCode(): CatalogProduct[] {
  return flatten({
    speakers: defaultSpeakers as unknown as RawProduct[],
    addons: defaultAddons as unknown as RawProduct[],
    rentalProducts: defaultRentals as unknown as RawProduct[],
  });
}

/**
 * Fladt katalog. Er der gemt et brugbart katalog i KV, gælder det; ellers
 * koden.
 *
 * Bevidst *ikke* en fletning: gemmer admin et katalog, er det fuldstændigt
 * (/api/products skriver alle tre lister), og et produkt admin har slettet
 * må ikke komme igen nedefra.
 */
export function productCatalog(saved: unknown): CatalogProduct[] {
  if (saved && typeof saved === "object") {
    const fromKv = flatten(saved as Record<string, RawProduct[] | null>);
    if (fromKv.length) {
      console.log("[catalog] loaded", fromKv.length, "produkter fra KV");
      return fromKv;
    }
  }

  const koden = fromCode();
  if (!koden.length) throw new CatalogMissingError();
  console.log("[catalog] intet katalog i KV — bruger kodens", koden.length, "produkter");
  return koden;
}
