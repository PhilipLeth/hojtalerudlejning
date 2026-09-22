import { describe, expect, it } from "vitest";
import { microphonePackages } from "../lib/microphonePackages";
import { catalogPrice, rentalProducts, addons, speakers } from "../lib/products";
import { bundlePartsFromCatalog, bundleSlots } from "../../functions/api/_lib/inventory";
import { buildOccupancy, expandProductIds } from "../../functions/api/_lib/occupancy";
import { loadPriceTable, buildLineItems } from "../../functions/api/_lib/pricing";

describe("Mikrofonpakker som kan bookes og reserverer de rigtige antal", () => {
  it("har eksisterende dele og en pris der følger delene", () => {
    const catalog = [...speakers, ...addons, ...rentalProducts];
    for (const raw of microphonePackages) {
      expect(raw.name_en).toBeTruthy();
      // microphonePackages er RÅ data uden pris — den udledes af delene, så
      // pakken slås op i kataloget for at få det tal, kunden ser.
      const p = rentalProducts.find((x) => x.id === raw.id)!;
      expect(p, `${raw.id} mangler i kataloget`).toBeTruthy();
      let sum = 0;
      for (const part of p.bundle!.parts) {
        const product = catalog.find((x) => x.id === part.productId)!;
        expect(product, `${raw.id}: ukendt del ${part.productId}`).toBeTruthy();
        expect(part.price).toBe(product.price * (part.qty ?? 1));
        sum += part.price;
      }
      expect(sum - p.bundle!.discount).toBe(p.price);
    }
  });
  it("trækker to mikrofoner pr. pakke, både fra defaults og et gemt katalog", () => {
    for (const catalog of [null, { rentalProducts: microphonePackages }]) {
      const parts = bundlePartsFromCatalog(catalog).pakke_mikrofon_duo;
      expect(parts.filter((id) => id === "mikrofon")).toHaveLength(2);
      expect(bundleSlots(parts, { party: 4, mikrofon: 3, mixer_stor: 4 }, { mikrofon: 2 })).toEqual({ total: 1, used: 1 });
    }
    expect(expandProductIds(["pakke_mikrofon_duo"]).filter((id) => id === "mikrofon")).toHaveLength(2);
    // En gammel ordre bærer stadig det id, mikrofonen hed før sammenlægningen.
    // Den skal tælle på den samme hylde, ellers ser to bookinger af samme
    // mikrofon ud som to forskellige ting.
    expect(expandProductIds(["traadloes_mikrofon"])).toEqual(["mikrofon"]);
    expect(expandProductIds(["haandholdt_mikrofon"])).toEqual(["mikrofon_kabel"]);
  });
  it("viser to samtidige mikrofoner i hver sin lagerbane for samme booking", () => {
    const rows = buildOccupancy([{ id: "duo", name: "Test", pickup: "2026-10-01", returnDate: "2026-10-03", productIds: ["pakke_mikrofon_duo"] }], { mikrofon: 2 }, "2026-10-01", "2026-10-04");
    const row = rows.find((x) => x.id === "mikrofon")!;
    expect(row.bookings.map((x) => x.lane).sort()).toEqual([0, 1]);
    expect(row.bookings.every((x) => x.bookingId === "duo")).toBe(true);
  });
  /**
   * Mikrofonpakkerne er udgået med prisarket 22. september 2026 — arket
   * sælger mikrofonerne som enkeltlinjer med en mixer ved siden af.
   *
   * Det vigtige er ikke at de er væk fra gitteret, men at de ikke kan betales:
   * en gammel annonce eller et bogmærke må ikke kunne føre en ordre igennem
   * på noget, vi ikke udlejer længere.
   */
  it("serveren afviser en udgået mikrofonpakke, så den ikke kan betales", async () => {
    const kv = { get: async () => JSON.stringify({ rentalProducts: microphonePackages }) } as unknown as KVNamespace;
    const table = await loadPriceTable(kv);
    expect(table.has("pakke_mikrofon_av")).toBe(false);
    // Serveren kaster frem for at prissætte til 0 — en ordre på noget ukendt
    // skal fejle højlydt, ikke gå igennem gratis
    expect(() => buildLineItems(table, [{ id: "pakke_mikrofon_av" }])).toThrow(/Unknown product/);
  });

  it("de er skjult i kataloget — kilden til hvad kunden kan booke", () => {
    for (const raw of microphonePackages) {
      expect(rentalProducts.find((p) => p.id === raw.id)!.hidden, `${raw.id} er stadig synlig`).toBe(true);
    }
  });
});
