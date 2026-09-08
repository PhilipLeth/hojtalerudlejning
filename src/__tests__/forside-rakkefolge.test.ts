/**
 * Forsidens rækkefølge og pakkevalg.
 *
 * Toppen viser kun de to små pakker — de store fyldte skærmen, uden at nogen
 * valgte dem der. Prisen for det er, at de store skal linkes et andet sted fra:
 * på dansk findes de på /lej-hojtaler, men **den engelske forside er det eneste
 * indgående link til /en/festpakke-150 og /en/festpakke-250**. Ryger noten
 * under kortene, står de to sider som forældreløse.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { FEST_LADDER_IDS, FEST_LADDER_FORSIDE_IDS } from "@/lib/products";

const forside = fs.readFileSync("src/app/page.tsx", "utf8");
const enForside = fs.readFileSync("src/app/en/page.tsx", "utf8");

describe("Feststigen på forsiden", () => {
  it("viser de to små trin — ikke hele stigen", () => {
    expect(FEST_LADDER_FORSIDE_IDS).toEqual(["pakke_fest_lille", "pakke_fest_stor"]);
    expect(FEST_LADDER_IDS.length).toBeGreaterThan(FEST_LADDER_FORSIDE_IDS.length);
  });

  it("bruger forside-listen på begge sprog", () => {
    for (const [navn, kilde] of [["/", forside], ["/en", enForside]] as const) {
      expect(kilde, `${navn} bruger stadig hele stigen`).toContain("FEST_LADDER_FORSIDE_IDS");
      expect(kilde, `${navn} bruger stadig hele stigen`).not.toMatch(/ids=\{FEST_LADDER_IDS\}/);
    }
  });

  it("linker videre til de store pakker, så de ikke bliver forældreløse", () => {
    expect(forside).toContain('href="/festpakke-150"');
    expect(forside).toContain('href="/festpakke-250"');
    expect(enForside).toContain('href="/en/festpakke-150"');
    expect(enForside).toContain('href="/en/festpakke-250"');
  });
});

describe("Anmeldelserne står under pakkerne", () => {
  it("kommer før produktgitteret på dansk", () => {
    expect(forside.indexOf("<GoogleReviews")).toBeGreaterThan(forside.indexOf("<BundleGrid"));
    expect(forside.indexOf("<GoogleReviews")).toBeLessThan(forside.indexOf("<ProductGrid"));
  });

  it("kommer før sammenligningen på engelsk", () => {
    expect(enForside.indexOf("<GoogleReviews")).toBeGreaterThan(enForside.indexOf("<BundleGrid"));
    expect(enForside.indexOf("<GoogleReviews")).toBeLessThan(enForside.indexOf("<SpeakerCompare"));
  });
});
