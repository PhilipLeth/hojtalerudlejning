// @vitest-environment node
import { describe, it, expect } from "vitest";
import { anledningPakker, ANLEDNING_PAKKE_IDS } from "@/lib/anledningPakker";
import {
  AFVENTER_FOTO,
  addons,
  bundleListPrice,
  bundlePrice,
  isBundleProduct,
  rentalProducts,
  speakers,
} from "@/lib/products";
import { loadPriceTable, buildLineItems } from "../../functions/api/_lib/pricing";

/**
 * Prisarkets afsnit 5 og 6 — anledninger og årstider.
 *
 * De 46 pakker er data, ikke sider: de har ingen egen side og ingen egne
 * fotos endnu. Testen holder de to ting, der skal være i orden, før nogen
 * tænder dem:
 *
 *  1. De er skjulte, og de står i AFVENTER_FOTO, så det ikke sker ved et uheld.
 *  2. Alt andet er rigtigt allerede — dele der findes, begge sprog, og en pris
 *     der er udregnet af delene, også på serveren.
 */

const katalog = new Map([...speakers, ...addons, ...rentalProducts].map((p) => [p.id, p]));

describe("Anledningspakkerne fra prisarket", () => {
  it("der er de 46 pakker fra arkets afsnit 5 og 6", () => {
    expect(anledningPakker.length).toBe(46);
    expect(new Set(ANLEDNING_PAKKE_IDS).size).toBe(46);
  });

  it("alle er skjulte og står i AFVENTER_FOTO", () => {
    const synlige = anledningPakker.filter((p) => !p.hidden).map((p) => p.id);
    expect(synlige, `pakker uden foto som er synlige:\n${synlige.join("\n")}`).toEqual([]);
    const glemte = ANLEDNING_PAKKE_IDS.filter((id) => !AFVENTER_FOTO.includes(id));
    expect(glemte, `pakker der mangler i AFVENTER_FOTO:\n${glemte.join("\n")}`).toEqual([]);
  });

  it("ingen af dem har en side — de er data indtil de har et foto", () => {
    const medSide = anledningPakker.filter((p) => p.page).map((p) => p.id);
    expect(medSide).toEqual([]);
  });

  it("hver pakke har tekst på begge sprog", () => {
    for (const p of anledningPakker) {
      for (const felt of ["name_da", "name_en", "desc_da", "desc_en"] as const) {
        expect(p[felt], `${p.id}.${felt}`).toBeTruthy();
      }
      expect(p.bundle?.usecase_da, `${p.id}.usecase_da`).toBeTruthy();
      expect(p.bundle?.usecase_en, `${p.id}.usecase_en`).toBeTruthy();
      // Et dansk ord i den engelske tekst betyder at oversættelsen mangler
      expect(`${p.name_en} ${p.desc_en} ${p.bundle?.usecase_en}`, `${p.id} er ikke oversat`).not.toMatch(
        /\b(og|til|med|fest|hvor|der|skal)\b/,
      );
    }
  });

  it("hver del findes i kataloget, og ingen pakke består af én ting", () => {
    for (const p of anledningPakker) {
      const dele = p.bundle!.parts;
      const antal = dele.reduce((n, d) => n + (d.qty ?? 1), 0);
      expect(antal, `${p.id} er ikke en pakke, men et enkeltprodukt`).toBeGreaterThan(1);
      for (const d of dele) {
        expect(katalog.has(d.productId), `${p.id}: ukendt del ${d.productId}`).toBe(true);
        expect(d.label_da, `${p.id}: ${d.productId} mangler dansk etiket`).toBeTruthy();
        expect(d.label_en, `${p.id}: ${d.productId} mangler engelsk etiket`).toBeTruthy();
      }
    }
  });

  it("prisen er udregnet af delene, ikke skrevet i filen", () => {
    // Delenes priser står som fallback, men pakkens egen pris må ikke stå
    // nogen steder: den er delenes sum minus rabatten.
    const medPris = anledningPakker.filter((p) => p.price !== undefined).map((p) => p.id);
    expect(medPris, `pakker med en pris skrevet i data:\n${medPris.join("\n")}`).toEqual([]);
    for (const id of ANLEDNING_PAKKE_IDS) {
      const p = rentalProducts.find((r) => r.id === id)!;
      expect(p, `${id} mangler i kataloget`).toBeTruthy();
      expect(isBundleProduct(p), `${id} er ikke en pakke i kataloget`).toBe(true);
      expect(p.price, id).toBe(bundlePrice(bundleListPrice(p), p.bundle!));
      expect(p.price, `${id} sparer ingenting`).toBeLessThan(bundleListPrice(p));
    }
  });

  it("serveren kender dem ikke, så længe de er skjulte", async () => {
    const table = await loadPriceTable({ get: async () => null } as never);
    for (const id of ANLEDNING_PAKKE_IDS) {
      expect(() => buildLineItems(table, [{ id }]), `${id} kan bookes selvom den er skjult`).toThrow();
    }
  });
});
