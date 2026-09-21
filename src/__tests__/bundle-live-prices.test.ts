// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  PAKKE_RABAT,
  bundleListPrice,
  bundlePrice,
  bundleRabat,
  refreshBundlePrices,
  roundPackagePrice,
  addons,
  rentalProducts,
  speakers,
} from "@/lib/products";
import { loadPriceTable, buildLineItems } from "../../functions/api/_lib/pricing";
import { bundlePartsFromCatalog } from "../../functions/api/_lib/inventory";

/**
 * Pakkeprisen er udledt af delene — ikke et tal nogen har skrevet.
 *
 * Før var det omvendt: pakken havde en pris, og rabatten var forskellen. Retter
 * man så prisen på en lysbar, flyttede rabatten sig, og pakken kostede det
 * samme. Prisarket (LejHøjtaler Katalog.xlsx) regner den anden vej: delenes sum
 * minus 8 %, afrundet til nærmeste tier.
 *
 * Testen vogter de tre ting, der skal holde:
 *
 *  1. Hver pakkes pris ER delenes sum minus rabatten.
 *  2. Serveren opkræver det samme — ellers ser kunden én pris og betaler en anden.
 *  3. Retter man en del, flytter pakken sig med.
 */

const pakker = rentalProducts.filter((p) => p.bundle?.parts?.length);
const katalog = [...speakers, ...addons, ...rentalProducts];

describe("Pakkeprisen følger delene", () => {
  it("der er pakker at vogte", () => {
    expect(pakker.length).toBeGreaterThan(50);
  });

  it("hver pakkes pris er delenes sum minus rabatten, afrundet som i arket", () => {
    for (const p of pakker) {
      const sum = bundleListPrice(p);
      expect(p.price, `${p.id}`).toBe(roundPackagePrice(sum * (1 - bundleRabat(p.bundle!))));
      expect(p.bundle!.discount, `${p.id} rabat i kr`).toBe(sum - p.price);
      expect(p.price, `${p.id} sparer ingenting`).toBeLessThan(sum);
    }
  });

  it("delenes priser i pakken er katalogets, ikke et gammelt tal", () => {
    const pris = new Map(katalog.map((i) => [i.id, i.price]));
    for (const p of pakker) {
      for (const del of p.bundle!.parts) {
        const stk = pris.get(del.productId);
        expect(stk, `${p.id}: delen ${del.productId} findes ikke i kataloget`).toBeDefined();
        expect(del.price, `${p.id}: ${del.productId}`).toBe(stk! * (del.qty ?? 1));
      }
    }
  });

  it("arkets standardrabat er 8 %, og ingen pakke har en urimelig rabat", () => {
    expect(PAKKE_RABAT).toBe(0.08);
    for (const p of pakker) {
      const r = bundleRabat(p.bundle!);
      expect(r, `${p.id}`).toBeGreaterThan(0);
      expect(r, `${p.id}`).toBeLessThan(0.5);
    }
  });

  it("serveren opkræver præcis katalogets pakkepris", async () => {
    const table = await loadPriceTable({ get: async () => null } as never);
    for (const p of pakker) {
      if (p.hidden) continue;
      expect(buildLineItems(table, [{ id: p.id }]).totalOre, p.id).toBe(p.price * 100);
    }
  });

  it("retter man prisen på en lysbar, flytter hver pakke med lysbar sig", () => {
    const med = pakker.filter((p) => p.bundle!.parts.some((d) => d.productId === "lys"));
    expect(med.length).toBeGreaterThan(5);
    const dyrere = katalog.map((i) => (i.id === "lys" ? { ...i, price: 495 } : i));
    const efter = refreshBundlePrices(rentalProducts, dyrere);
    for (const før of med) {
      const nu = efter.find((p) => p.id === før.id)!;
      const antalLysbarer = før
        .bundle!.parts.filter((d) => d.productId === "lys")
        .reduce((n, d) => n + (d.qty ?? 1), 0);
      const forventet = roundPackagePrice(
        (bundleListPrice(før) + 100 * antalLysbarer) * (1 - bundleRabat(før.bundle!)),
      );
      expect(nu.price, før.id).toBe(forventet);
      expect(nu.price, `${før.id} blev ikke dyrere`).toBeGreaterThan(før.price);
    }
  });

  it("rabatten kan sættes pr. pakke, og den styrer prisen", () => {
    const p = rentalProducts.find((x) => x.id === "pakke_fest_lille")!;
    const sum = bundleListPrice(p);
    expect(bundlePrice(sum, { rabat: 0 })).toBe(roundPackagePrice(sum));
    expect(bundlePrice(sum, { rabat: 0.2 })).toBe(roundPackagePrice(sum * 0.8));
    // Ugyldig rabat falder tilbage på arkets standard, aldrig på gratis
    expect(bundlePrice(sum, { rabat: 1.5 })).toBe(bundlePrice(sum, {}));
    expect(bundlePrice(sum, { rabat: Number.NaN })).toBe(bundlePrice(sum, {}));
  });

  it("antal tæller med, fx fire timer lydmand", () => {
    const p = rentalProducts.find((x) => x.id === "pakke_lydmand_fest")!;
    const del = p.bundle!.parts.find((x) => x.productId === "lydmand")!;
    expect(del.qty).toBe(4);
    const timepris = del.price / 4 + 100;
    const [efter] = refreshBundlePrices(
      [p],
      katalog.map((i) => (i.id === "lydmand" ? { ...i, price: timepris } : i)),
    );
    expect(efter.bundle!.parts.find((x) => x.productId === "lydmand")!.price).toBe(timepris * 4);
    expect(efter.price).toBeGreaterThan(p.price);
  });

  it("en pakke i en pakke regnes ud i rigtig rækkefølge", () => {
    // DJ-pakkerne rummer en højtalerpakke, som selv er et produkt i kataloget
    const dj = rentalProducts.find((p) => p.id === "dj_pakke_lille")!;
    const indre = dj.bundle!.parts.map((d) => d.productId);
    const pakkeDele = indre.filter((id) => pakker.some((p) => p.id === id));
    for (const id of pakkeDele) {
      const del = rentalProducts.find((p) => p.id === id)!;
      expect(dj.bundle!.parts.find((d) => d.productId === id)!.price).toBe(del.price);
    }
  });

  it("Heksetimens højtaler tæller med i lagerreservationen", () => {
    expect(bundlePartsFromCatalog(null).halloween_lys).toEqual(["thumpgo", "lyseffekt", "rog"]);
  });
});
