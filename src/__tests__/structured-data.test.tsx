/**
 * Structured data må ikke indeholde anmeldelser eller stjerner, som vi ikke har
 * ægte belæg for. Testimonials på sitet er ikke verificerede kundeanmeldelser,
 * så aggregateRating/review er bevidst fjernet fra Product- og LocalBusiness-
 * schema (Googles retningslinjer for spammy structured markup + markedsførings-
 * loven/Omnibus-direktivet om falske anmeldelser).
 *
 * Når der kommer ægte, verificerbare anmeldelser pr. produkt, må markup'en
 * tilføjes igen — men kun for de produkter anmeldelserne rent faktisk handler om.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function readAll(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) readAll(full, acc);
    else if (/\.tsx?$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const SRC = join(process.cwd(), "src");

describe("Structured data — ingen opdigtede anmeldelser", () => {
  const files = readAll(SRC).filter((f) => !f.includes("__tests__"));

  it("aggregateRating findes kun via ProductLandings kontrollerede opt-in", () => {
    const offenders = files.filter((f) => {
      if (f.endsWith("components/ProductLanding.tsx")) return false; // opt-in via reviewed-prop
      const c = readFileSync(f, "utf8");
      return /aggregateRating\s*:/.test(c);
    });
    expect(offenders, `aggregateRating hårdkodet i:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("ingen produktside sætter rating, så længe testimonials er opdigtede", () => {
    // Denne test krævede før at MINDST én produktside havde rating — og pegede
    // på hojtalerpakke-lille og -normal, fordi to af de opdigtede testimonials
    // nævner dem. Den håndhævede altså det stik modsatte af filens egen
    // overskrift, og koden fulgte testen: 5,0 stjerner lå live i markup'en.
    //
    // Kravet er vendt om. Kommer der ægte, verificerbare anmeldelser, sættes
    // reviewed-proppen på netop de produkter anmeldelserne handler om — og
    // denne test rettes i samme ombæring, som en bevidst beslutning.
    const landingPages = files.filter(
      (f) => f.includes("/app/") && f.endsWith("page.tsx") && readFileSync(f, "utf8").includes("<ProductLanding")
    );
    const withRating = landingPages.filter((f) => readFileSync(f, "utf8").includes("reviewed="));
    expect(withRating, `rating sat på:\n${withRating.join("\n")}`).toEqual([]);
  });

  it("ingen individuelle Review-objekter (vi har ikke anmeldelser pr. produkt)", () => {
    const offenders = files.filter((f) => {
      const c = readFileSync(f, "utf8");
      return /"@type":\s*"Review"/.test(c);
    });
    expect(offenders, `Review-schema fundet i:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("Product-schema har stadig pris og lagerstatus (rich results bevares)", () => {
    const landing = readFileSync(join(SRC, "components/ProductLanding.tsx"), "utf8");
    expect(landing).toContain('"@type": "Product"');
    expect(landing).toContain("priceCurrency");
    expect(landing).toContain("schema.org/InStock");
  });
});
