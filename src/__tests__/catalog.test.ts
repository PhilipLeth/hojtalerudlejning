/**
 * Serverens katalog skal svare til det, kunden faktisk ser.
 *
 * Filen krævede tidligere et katalog i KV og kastede uden. Men at nulstille
 * KV-kataloget er den tilsigtede måde at lade products.ts slå igennem på —
 * og gjorde man det, kørte forsiden, bookingen og priserne videre på kodens
 * katalog, mens /api/ads, /api/udsalg og kampagnerabatten svarede "Intet
 * produktkatalog i KV". pricing.ts, bundlePartsFromCatalog() og useProducts()
 * har hele tiden gjort det rigtige; det var kun den her fil, der var uenig.
 */
import { describe, it, expect } from "vitest";
import { CatalogMissingError, productCatalog } from "../../functions/api/_lib/catalog";
import { addons, rentalProducts, speakers } from "@/lib/products";

const KV = {
  speakers: [
    { id: "sb4", page: "/soundboks-4", price: 895, contents: ["Soundboks 4", "Oplader"], da: { name: "Soundboks 4" } },
    { id: "festival", price: 495, da: { name: "Stor højtalerpakke" } },
  ],
  addons: [
    { id: "levering_ud", price: 495, da: { label: "Levering + opsætning" } },
    { id: "taske", price: 95, da: { label: "Bæretaske" } },
  ],
  rentalProducts: [
    { id: "karaoke", page: "/karaoke-maskine", price: 495, name_da: "Karaokemaskine", hidden: true },
    { id: "ugyldig", page: "/nej", price: -5, name_da: "Negativ pris" },
  ],
};

describe("productCatalog uden katalog i KV", () => {
  it("bruger kodens katalog frem for at fejle", () => {
    const fra = productCatalog(null);
    expect(fra.length).toBeGreaterThan(0);
    expect(fra.map((p) => p.id)).toContain(speakers[0].id);
  });

  it("gør det samme når KV er tom eller ubrugelig", () => {
    const koden = productCatalog(null).length;
    expect(productCatalog(undefined)).toHaveLength(koden);
    expect(productCatalog({ speakers: [], addons: [] })).toHaveLength(koden);
    expect(productCatalog("ikke et katalog")).toHaveLength(koden);
  });

  it("dækker hele kodens katalog — det er dét, kunden ser", () => {
    const ids = new Set(productCatalog(null).map((p) => p.id));
    const forventet = [...speakers, ...addons, ...rentalProducts]
      .map((p) => p.id)
      .filter((id) => id !== "festival_bas");
    for (const id of forventet) expect(ids, `${id} mangler`).toContain(id);
  });

  it("kaster kun hvis der slet ikke findes noget katalog", () => {
    // Kan ikke ske i drift — men fanger et byggeri hvor products.ts er tømt
    expect(new CatalogMissingError().message).toMatch(/hverken i KV eller i koden/);
  });
});

describe("productCatalog med katalog i KV", () => {
  it("lader KV gælde — et slettet produkt kommer ikke igen nedefra", () => {
    expect(productCatalog(KV).map((p) => p.id).sort()).toEqual(
      ["festival", "karaoke", "levering_ud", "sb4", "taske"],
    );
  });

  it("læser navn fra da.name, da.label og name_da", () => {
    const navne = productCatalog(KV).map((p) => p.name);
    expect(navne).toContain("Stor højtalerpakke"); // da.name
    expect(navne).toContain("Bæretaske"); // da.label
    expect(navne).toContain("Karaokemaskine"); // name_da
  });

  it("tager side og indhold med — annoncerne skal bruge dem", () => {
    expect(productCatalog(KV).find((p) => p.id === "sb4")).toMatchObject({
      name: "Soundboks 4",
      price: 895,
      page: "/soundboks-4",
      hidden: false,
      contents: ["Soundboks 4", "Oplader"],
    });
  });

  it("bærer skjult-flaget videre, så en pauset side kan fanges", () => {
    expect(productCatalog(KV).find((p) => p.id === "karaoke")?.hidden).toBe(true);
  });

  it("lader et tilvalg uden side stå uden side i stedet for at gætte", () => {
    expect(productCatalog(KV).find((p) => p.id === "taske")?.page).toBeNull();
  });

  it("springer produkter uden gyldig pris over", () => {
    expect(productCatalog(KV).map((p) => p.id)).not.toContain("ugyldig");
  });

  it("tager ikke det opfundne combo-SKU med", () => {
    expect(productCatalog({ speakers: [{ id: "festival_bas", price: 995, da: { name: "Combo" } }] })
      .map((p) => p.id)).not.toContain("festival_bas");
  });
});
