import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { addons, rentalProducts } from "@/lib/products";
import { LYS_AI_IDS, LYS_AI_ANBEFALING, rensLysIds } from "@/lib/lysAi";
import { bookSetupHref } from "@/lib/bookUrl";
import { EN_PAGES } from "@/lib/enPages";

describe("AI-lysopsætning", () => {
  it("alle lys-id'er findes i kataloget", () => {
    const katalog = [...rentalProducts, ...addons];
    for (const id of LYS_AI_IDS) {
      expect(katalog.find((p) => p.id === id), id).toBeTruthy();
    }
    expect(LYS_AI_ANBEFALING).toEqual(["lyskaeder", "uplight_4", "lyseffekt"]);
  });

  it("rensLysIds falder tilbage til anbefalingen", () => {
    expect(rensLysIds(["lyskaeder", "ukendt", "uplight"])).toEqual(["lyskaeder", "uplight"]);
    expect(rensLysIds([])).toEqual([...LYS_AI_ANBEFALING]);
    expect(rensLysIds("nej")).toEqual([...LYS_AI_ANBEFALING]);
  });

  it("hele setuppet går i kurven via extras", () => {
    expect(bookSetupHref(["lyskaeder", "uplight_4", "lyseffekt"])).toBe(
      "/book?product=lyskaeder&extras=uplight_4%2Clyseffekt",
    );
    expect(bookSetupHref(["lys"], "en")).toBe("/en/book?product=lys");
  });

  it("sider og API findes på begge sprog", () => {
    expect(existsSync("src/app/lys-ai/page.tsx")).toBe(true);
    expect(existsSync("src/app/en/lys-ai/page.tsx")).toBe(true);
    expect(EN_PAGES).toContain("/lys-ai");
    const api = readFileSync("functions/api/lys-visualiser.ts", "utf8");
    expect(api).toContain("demo");
    expect(api).toContain("GEMINI_API_KEY");
  });
});
