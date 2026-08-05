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

  it("ingen aggregateRating i nogen JSON-LD", () => {
    const offenders = files.filter((f) => {
      const c = readFileSync(f, "utf8");
      // Tillad ordet i kommentarer (fx forklaringen i ProductLanding)
      return /aggregateRating\s*:/.test(c);
    });
    expect(offenders, `aggregateRating fundet i:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("ingen Review/AggregateRating schema-typer", () => {
    const offenders = files.filter((f) => {
      const c = readFileSync(f, "utf8");
      return /"@type":\s*"(Review|AggregateRating)"/.test(c);
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
