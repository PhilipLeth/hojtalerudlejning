/**
 * Kataloglæsningen bag /api/ads-build.
 *
 * _lib/catalog.ts giver kun id, navn og pris. Annoncerne skal også bruge
 * landingssiden og hvad der er med i pakken, og et produkt uden side må ikke
 * kunne vælges — så ville annoncen pege ingen steder hen.
 */
import { describe, it, expect } from "vitest";
import { adsCatalog } from "../../functions/api/ads-build";

const KV = {
  speakers: [
    { id: "sb4", page: "/soundboks-4", price: 895, contents: ["Soundboks 4", "Oplader"], da: { name: "Soundboks 4" } },
    { id: "party", page: "/hojtalerpakke-lille", price: 595, da: { name: "Lille højtalerpakke" } },
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

describe("adsCatalog", () => {
  it("tager side og indhold med, ikke kun navn og pris", () => {
    const sb = adsCatalog(KV).find((p) => p.id === "sb4");
    expect(sb).toMatchObject({ name: "Soundboks 4", price: 895, page: "/soundboks-4", hidden: false });
    expect(sb?.contents).toEqual(["Soundboks 4", "Oplader"]);
  });

  it("kender navnet uanset hvilket felt kataloget bruger", () => {
    const navne = adsCatalog(KV).map((p) => p.name);
    expect(navne).toContain("Lille højtalerpakke"); // da.name
    expect(navne).toContain("Bæretaske"); // da.label
    expect(navne).toContain("Karaokemaskine"); // name_da
  });

  it("bærer skjult-flaget videre, så en pauset side kan fanges", () => {
    expect(adsCatalog(KV).find((p) => p.id === "karaoke")?.hidden).toBe(true);
  });

  it("lader et tilvalg uden side stå uden side i stedet for at gætte", () => {
    expect(adsCatalog(KV).find((p) => p.id === "taske")?.page).toBeNull();
  });

  it("smider produkter med ugyldig pris væk", () => {
    expect(adsCatalog(KV).map((p) => p.id)).not.toContain("ugyldig");
  });

  it("er tom, ikke i stykker, når der intet katalog er", () => {
    expect(adsCatalog(null)).toEqual([]);
    expect(adsCatalog("ikke et katalog")).toEqual([]);
  });
});
