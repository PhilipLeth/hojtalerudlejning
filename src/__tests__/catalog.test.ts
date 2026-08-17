import { describe, it, expect } from "vitest";
import { CatalogMissingError, productCatalog } from "../../functions/api/_lib/catalog";

describe("productCatalog", () => {
  it("kaster når KV mangler", () => {
    expect(() => productCatalog(null)).toThrow(CatalogMissingError);
    expect(() => productCatalog(undefined)).toThrow(CatalogMissingError);
  });

  it("kaster når KV er tom", () => {
    expect(() => productCatalog({ speakers: [], addons: [] })).toThrow(CatalogMissingError);
  });

  it("læser navn fra da.name / name_da", () => {
    const cat = productCatalog({
      speakers: [{ id: "festival", price: 495, da: { name: "Stor højtalerpakke" } }],
      rentalProducts: [{ id: "lyskaeder", price: 195, name_da: "Lyskæde varm hvid" }],
    });
    expect(cat.find((p) => p.id === "festival")).toEqual({
      id: "festival",
      name: "Stor højtalerpakke",
      price: 495,
    });
    expect(cat.find((p) => p.id === "lyskaeder")?.price).toBe(195);
  });

  it("springer produkter uden gyldig pris over", () => {
    const cat = productCatalog({
      speakers: [
        { id: "ok", price: 100, da: { name: "OK" } },
        { id: "bad", price: NaN, da: { name: "Bad" } },
      ],
    });
    expect(cat.map((p) => p.id)).toEqual(["ok"]);
  });
});
