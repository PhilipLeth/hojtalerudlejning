// @vitest-environment node
/**
 * Periodepriser: røgmaskine 395 kr og low fog 695 kr i Halloween-weekenden
 * 2026 (30. okt.–1. nov.), normalpris alle andre dage. Frederik, 22. okt 2026:
 * "Bare halloween næste weekend".
 */
import { describe, it, expect, vi } from "vitest";
import { catalogPrice } from "@/lib/products";
import { periodePris, lejeRammerPeriode, kommendePeriodePriser, periodeTekst, PERIODE_PRISER } from "@/lib/periodePriser";
import { loadPriceTable, buildLineItems, medPeriodePriser } from "../../functions/api/_lib/pricing";
import { CATALOG_KEY } from "../../functions/api/_lib/channels";

function fakeKv(store: Record<string, string> = {}) {
  const map = new Map(Object.entries(store));
  return { get: vi.fn(async (k: string) => map.get(k) ?? null), put: vi.fn() } as any;
}

const HALLOWEEN = PERIODE_PRISER.find((p) => p.id === "halloween-2026")!;

describe("periodePris: Halloween-weekenden 2026", () => {
  it("fredag til mandag omkring Halloween: røg 395, low fog 695", () => {
    expect(periodePris("rog", "2026-10-30", "2026-11-02")?.pris).toBe(395);
    expect(periodePris("low_fog", "2026-10-30", "2026-11-02")?.pris).toBe(695);
  });

  it("torsdag til mandag rammer også, og afhentning på selve dagen uden returdag", () => {
    expect(periodePris("rog", "2026-10-29", "2026-11-02")?.pris).toBe(395);
    expect(periodePris("rog", "2026-10-31")?.pris).toBe(395);
  });

  it("weekenden før og efter er normalpris", () => {
    expect(periodePris("rog", "2026-10-23", "2026-10-26")).toBeNull();
    expect(periodePris("rog", "2026-11-06", "2026-11-09")).toBeNull();
    expect(periodePris("rog", "2026-11-02", "2026-11-04")).toBeNull();
  });

  it("andre varer og manglende datoer giver normalpris", () => {
    expect(periodePris("lys", "2026-10-30", "2026-11-02")).toBeNull();
    expect(periodePris("rog")).toBeNull();
    expect(periodePris("rog", "ikke-en-dato")).toBeNull();
    expect(lejeRammerPeriode(HALLOWEEN, "2026-10-30", "2026-10-20")).toBe(true); // returdag før afhentning ignoreres
  });

  it("noten på produktsiden vises til og med sidste dag, og forsvinder dagen efter", () => {
    expect(kommendePeriodePriser("rog", "2026-10-22").map((k) => k.pris)).toEqual([395]);
    expect(kommendePeriodePriser("rog", "2026-11-01")).toHaveLength(1);
    expect(kommendePeriodePriser("rog", "2026-11-02")).toHaveLength(0);
    expect(kommendePeriodePriser("lys", "2026-10-22")).toHaveLength(0);
    expect(periodeTekst(HALLOWEEN, "da")).toBe("30. okt.–1. nov.");
    expect(periodeTekst(HALLOWEEN, "en")).toBe("30 Oct–1 Nov");
  });
});

describe("Serverens pristabel med periodepriser", () => {
  it("Stripe tager 395 for røg og 695 for low fog i Halloween-weekenden", async () => {
    const table = medPeriodePriser(await loadPriceTable(fakeKv()), "2026-10-30", "2026-11-02");
    const { lineItems, totalOre } = buildLineItems(table, [{ id: "rog" }, { id: "low_fog" }]);
    expect(totalOre).toBe(39500 + 69500);
    expect(lineItems.map((l) => l.price_data.product_data.name)).toEqual([
      "Røgmaskine (Halloween-pris)",
      "Low fog-maskine (røggulv) (Halloween-pris)",
    ]);
  });

  it("uden datoer, og uden for weekenden, er det katalogets pris", async () => {
    const basis = await loadPriceTable(fakeKv());
    expect(medPeriodePriser(basis).get("rog")?.unitAmount).toBe(catalogPrice("rog") * 100);
    expect(medPeriodePriser(basis, "2026-11-06", "2026-11-09").get("rog")?.unitAmount).toBe(catalogPrice("rog") * 100);
    expect(medPeriodePriser(basis, "2026-11-06", "2026-11-09").get("rog")?.name).toBe("Røgmaskine");
  });

  it("pakkerne med røg i (Heksetimen) koster det samme i Halloween-weekenden", async () => {
    const basis = await loadPriceTable(fakeKv());
    const halloween = medPeriodePriser(basis, "2026-10-30", "2026-11-02");
    for (const id of ["halloween_lille", "halloween_stor", "pakke_lys_roeg"]) {
      if (!basis.has(id)) continue;
      expect(halloween.get(id)?.unitAmount, id).toBe(basis.get(id)?.unitAmount);
    }
    expect(halloween.size).toBe(basis.size);
  });

  it("et KV-katalog med anden normalpris på røg ændrer ikke Halloween-prisen", async () => {
    const kv = fakeKv({ [CATALOG_KEY]: JSON.stringify({ addons: [{ id: "rog", price: 199, da: { label: "Røgmaskine" } }] }) });
    const basis = await loadPriceTable(kv);
    expect(basis.get("rog")?.unitAmount).toBe(19900);
    expect(medPeriodePriser(basis, "2026-10-31").get("rog")?.unitAmount).toBe(39500);
  });
});
