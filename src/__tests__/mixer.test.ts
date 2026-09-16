/** Korrekte modelbilleder og tydelig forskel på lagerført mixer og forespørgsler. */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { addons } from "@/lib/products";

const mixere = addons.filter((a) => a.id.startsWith("mixer_"));

describe("Mixerne", () => {
  it("har tre klasser, men kun den bekræftede model kan bookes direkte", () => {
    expect(mixere.map((m) => m.price)).toEqual([295, 395, 495]);
    expect(mixere.filter((m) => !m.hidden).map((m) => m.id)).toEqual(["mixer_stor"]);
    expect(mixere.find((m) => m.id === "mixer_stor")!.contents).toContain("the t.mix xmix 1202 FX USB");
  });
  it("bruger et eksisterende, forskelligt produktfoto til hver model", () => {
    for (const m of mixere) {
      expect(m.page).toBe("/mixer");
      expect(m.image).toMatch(/^\/images\/product-mixer-.*\.jpg$/);
      expect(readFileSync(join(process.cwd(), "public", m.image!)).length).toBeGreaterThan(1000);
    }
    expect(new Set(mixere.map((m) => m.image)).size).toBe(3);
  });
});

describe("Produkt uden foto", () => {
  const src = readFileSync(join(process.cwd(), "src/components/CategoryProductGrid.tsx"), "utf8");

  it("låner ikke et andet produkts billede", () => {
    // Den gamle fallback. Kommer den igen, viser mixeren en lyseffekt.
    expect(src).not.toContain('ad.image ?? "/images/product-lys.webp"');
    expect(src).not.toMatch(/image:\s*\w+\.image\s*\?\?\s*"/);
  });

  it("viser navnet i stedet, når der ikke er noget billede", () => {
    expect(src).toMatch(/p\.image \?[\s\S]{0,600}\{p\.name\}/);
  });
});
