import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { EN_PAGES } from "@/lib/enPages";
import { rentalProducts } from "@/lib/products";
import { SEASONS, activeSeasons, isSeasonActive, seasonById } from "@/lib/seasons";

describe("Sæsonkampagner", () => {
  it("hver sæson har hub på begge sprog, hero og pakker i kataloget", () => {
    for (const s of SEASONS) {
      expect(existsSync(`src/app${s.href}/page.tsx`), s.href).toBe(true);
      expect(existsSync(`src/app/en${s.href}/page.tsx`), `/en${s.href}`).toBe(true);
      expect(EN_PAGES).toContain(s.href);
      expect(existsSync(`public${s.hero}`), s.hero).toBe(true);
      expect(s.productIds.length).toBeGreaterThanOrEqual(2);
      for (const id of s.productIds) {
        expect(rentalProducts.find((p) => p.id === id), id).toBeTruthy();
      }
    }
  });

  it("halloween og julefrokost er aktive midt i september", () => {
    const ids = activeSeasons(new Date(2026, 8, 16)).map((s) => s.id);
    expect(ids).toContain("halloween");
    expect(ids).toContain("julefrokost");
  });

  it("halloween slukker efter 2. november, julefrokost efter 23. december", () => {
    expect(isSeasonActive(seasonById("halloween")!, new Date(2026, 10, 3))).toBe(false);
    expect(isSeasonActive(seasonById("julefrokost")!, new Date(2026, 11, 24))).toBe(false);
    expect(isSeasonActive(seasonById("halloween")!, new Date(2026, 10, 2))).toBe(true);
  });

  it("sæson over nytår virker når from er efter to", () => {
    const fake = { ...seasonById("halloween")!, from: "12-20", to: "01-05" };
    expect(isSeasonActive(fake, new Date(2026, 11, 24))).toBe(true);
    expect(isSeasonActive(fake, new Date(2027, 0, 3))).toBe(true);
    expect(isSeasonActive(fake, new Date(2027, 0, 10))).toBe(false);
  });
});
