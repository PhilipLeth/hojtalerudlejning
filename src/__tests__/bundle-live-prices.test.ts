// @vitest-environment node
import { describe, it, expect } from "vitest";
import { speakers, addons, rentalProducts, refreshBundlePrices, bundleListPrice } from "@/lib/products";
import { loadPriceTable, buildLineItems } from "../../functions/api/_lib/pricing";
import { bundlePartsFromCatalog } from "../../functions/api/_lib/inventory";

const expected = { halloween_lys: 895, pakke_fest_lille: 690, pakke_diskolys: 645, pakke_teenagefest: 745, pakke_diskotek: 1095, pakke_ungdomsfest: 1295 };

describe("Pakkepriser efter gennemgangen", () => {
  it("serveren opkræver de godkendte priser, og ingen pakker koster mere end delene", async () => {
    const table = await loadPriceTable({ get: async () => null } as any);
    for (const [id, price] of Object.entries(expected)) expect(buildLineItems(table, [{ id }]).totalOre).toBe(price * 100);
    for (const p of rentalProducts.filter(p => p.bundle)) {
      expect(bundleListPrice(p) - p.price, p.id).toBe(p.bundle!.discount);
      expect(p.price, p.id).toBeLessThanOrEqual(bundleListPrice(p));
    }
  });
  it("Heksetimens højtaler tæller med i lagerreservationen", () => {
    expect(bundlePartsFromCatalog(null).halloween_lys).toEqual(["thumpgo", "lyseffekt", "rog"]);
  });
  it("adminændringer opdaterer delpriser og rabat uden at ændre pakkeprisen", () => {
    const p = rentalProducts.find(p => p.id === "pakke_fest_lille")!;
    const items = [...speakers, ...addons, ...rentalProducts].map(item => item.id === "lyseffekt" ? { ...item, price: 95 } : item);
    const [next] = refreshBundlePrices([p], items);
    expect(next.price).toBe(690);
    expect(next.bundle!.parts.find(part => part.productId === "lyseffekt")!.price).toBe(95);
    expect(next.bundle!.discount).toBe(0);
    expect(p.bundle!.discount).toBe(100);
  });
  it("rabatten tager højde for antal, fx fire timer lydmand", () => {
    const p = rentalProducts.find(p => p.id === "pakke_lydmand_fest")!;
    const [next] = refreshBundlePrices([p], [...speakers, ...addons, ...rentalProducts].map(item => item.id === "lydmand" ? { ...item, price: 1100 } : item));
    expect(next.bundle!.parts.find(part => part.productId === "lydmand")!.price).toBe(4400);
    expect(next.bundle!.discount).toBe(p.bundle!.discount + 400);
  });
});
