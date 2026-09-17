import { describe, expect, it } from "vitest";
import { microphonePackages } from "../lib/microphonePackages";
import { rentalProducts, addons, speakers } from "../lib/products";
import { bundlePartsFromCatalog, bundleSlots } from "../../functions/api/_lib/inventory";
import { buildOccupancy, expandProductIds } from "../../functions/api/_lib/occupancy";
import { loadPriceTable, buildLineItems } from "../../functions/api/_lib/pricing";

describe("Mikrofonpakker som kan bookes og reserverer de rigtige antal", () => {
  it("har eksisterende dele og en pris der stemmer med den oplyste rabat", () => {
    const catalog = [...speakers, ...addons, ...rentalProducts];
    for (const p of microphonePackages) {
      expect(p.name_en).toBeTruthy();
      let sum = 0;
      for (const part of p.bundle!.parts) {
        const product = catalog.find((x) => x.id === part.productId)!;
        expect(product).toBeTruthy();
        expect(part.price).toBe(product.price * (part.qty ?? 1));
        sum += part.price;
      }
      expect(sum - p.bundle!.discount).toBe(p.price);
    }
  });
  it("trækker to mikrofoner pr. pakke, både fra defaults og et gemt katalog", () => {
    for (const catalog of [null, { rentalProducts: microphonePackages }]) {
      const parts = bundlePartsFromCatalog(catalog).pakke_mikrofon_duo;
      expect(parts.filter((id) => id === "traadloes_mikrofon")).toHaveLength(2);
      expect(bundleSlots(parts, { party: 4, traadloes_mikrofon: 3, mixer_stor: 4 }, { traadloes_mikrofon: 2 })).toEqual({ total: 1, used: 1 });
    }
    expect(expandProductIds(["pakke_mikrofon_duo"]).filter((id) => id === "traadloes_mikrofon")).toHaveLength(2);
  });
  it("viser to samtidige mikrofoner i hver sin lagerbane for samme booking", () => {
    const rows = buildOccupancy([{ id: "duo", name: "Test", pickup: "2026-10-01", returnDate: "2026-10-03", productIds: ["pakke_mikrofon_duo"] }], { traadloes_mikrofon: 2 }, "2026-10-01", "2026-10-04");
    const row = rows.find((x) => x.id === "traadloes_mikrofon")!;
    expect(row.bookings.map((x) => x.lane).sort()).toEqual([0, 1]);
    expect(row.bookings.every((x) => x.bookingId === "duo")).toBe(true);
  });
  it("beregner betaling på serveren fra pakkeprisen", async () => {
    const kv = { get: async () => JSON.stringify({ rentalProducts: microphonePackages }) } as unknown as KVNamespace;
    const table = await loadPriceTable(kv);
    expect(buildLineItems(table, [{ id: "pakke_mikrofon_av" }]).totalOre).toBe(221500); // produktarket 17. sept 2026: AV-pakken 2215 kr (før 1995)
  });
});
