// @vitest-environment node
import { describe, it, expect } from "vitest";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { thumbSrcSet } from "@/lib/imageSrcSet";
import { addons, rentalProducts, speakers } from "@/lib/products";

/**
 * Hvert produktbillede skal have sin -400-udgave.
 *
 * thumbSrcSet() lover browseren en 400 px-fil ved siden af den store:
 * `<src>-400.webp 400w, <src> 1024w`. Findes filen ikke, vælger en telefon
 * netop den — og får 404. Billedet er væk på præcis den skærm, hvor gitteret
 * fylder mest.
 *
 * Det skete for syv nye produkter (slushice, fadøl, kabeltromler, stikdåser,
 * omformeren): billederne blev lagt i public/images uden at lave thumbnails.
 * Alle syv svarede 404 i produktion. scripts/optimize-images.py laver KUN
 * webp ud af png — den laver ikke -400-varianten, så det skal gøres separat.
 */

const BILLEDER = join(process.cwd(), "public/images");

/** Alle billeder kataloget peger på. */
function katalogetsBilleder(): string[] {
  const ud = new Set<string>();
  for (const s of speakers) if (s.product) ud.add(s.product);
  for (const a of addons) if (a.image) ud.add(a.image);
  for (const r of rentalProducts) if (r.image) ud.add(r.image);
  return [...ud].filter((s) => s.startsWith("/images/") && s.endsWith(".webp"));
}

describe("Produktbilleder har begge størrelser", () => {
  it("der er billeder at vogte", () => {
    expect(katalogetsBilleder().length).toBeGreaterThan(50);
  });

  it("hvert katalogbillede har en -400-udgave ved siden af sig", () => {
    const mangler: string[] = [];
    for (const src of katalogetsBilleder()) {
      const fuld = join(process.cwd(), "public", src.replace(/^\//, ""));
      if (!existsSync(fuld)) {
        mangler.push(`${src} findes ikke`);
        continue;
      }
      // Den sti, thumbSrcSet faktisk sender browseren efter
      const srcset = thumbSrcSet(src);
      expect(srcset, `${src} får ingen srcset`).toBeTruthy();
      const lille = srcset!.split(" ")[0];
      if (!existsSync(join(process.cwd(), "public", lille.replace(/^\//, "")))) {
        mangler.push(`${lille} mangler (lovet af thumbSrcSet for ${src})`);
      }
    }
    expect(mangler, `billeder uden 400 px-udgave:\n${mangler.join("\n")}`).toEqual([]);
  });

  /**
   * Også dem der ikke står i kataloget: et billede i public/images bliver før
   * eller siden brugt, og så gælder den samme regel.
   */
  it("intet webp i public/images står uden sin -400", () => {
    const filer = readdirSync(BILLEDER).filter((f) => f.endsWith(".webp") && !f.includes("-400"));
    const mangler = filer.filter((f) => !existsSync(join(BILLEDER, f.replace(".webp", "-400.webp"))));
    expect(mangler, `webp uden -400:\n${mangler.join("\n")}`).toEqual([]);
  });
});
