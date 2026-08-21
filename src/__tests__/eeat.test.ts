/**
 * Forfatteroplysninger skal have dækning på sitet.
 *
 * Blogindlæggene stod før med `author: Organization "Scharling Studio"` — et
 * firmanavn, ingen person, ingen erfaring, ingen dato for hvornår teksten sidst
 * blev set efter. Nu står Frederik Scharling som forfatter med en erfaringslinje.
 *
 * Den linje må ikke blive til en påstand, ingen kan efterprøve: navnet og
 * erfaringen skal kunne findes på /om, som er den side, markup'en henviser til.
 * Ændrer nogen den ene uden den anden, fejler testen her.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AUTHOR, authorLd } from "@/lib/author";

/** /om skriver æ/ø/å som HTML-entiteter — de foldes ud, så teksten kan sammenlignes. */
function afkod(html: string): string {
  return html
    .replaceAll("&aelig;", "æ")
    .replaceAll("&oslash;", "ø")
    .replaceAll("&aring;", "å")
    .replaceAll("&Aelig;", "Æ")
    .replaceAll("&Oslash;", "Ø")
    .replaceAll("&Aring;", "Å")
    // Linjeskift midt i en sætning må ikke gøre "15 år" usammenligneligt
    .replace(/\s+/g, " ");
}

const omSiden = afkod(readFileSync(join(process.cwd(), "src/app/om/page.tsx"), "utf8"));
const blogSiden = readFileSync(join(process.cwd(), "src/app/blog/[slug]/page.tsx"), "utf8");

describe("E-E-A-T", () => {
  it("forfatteren er en navngiven person, ikke et firma", () => {
    const ld = authorLd();
    expect(ld["@type"]).toBe("Person");
    expect(ld.name).toBe(AUTHOR.name);
    expect(ld.url).toBe("https://lejhojtaler.dk/om");
    expect(ld.description).toContain(AUTHOR.name);
  });

  it("forfatterens navn står på /om", () => {
    expect(omSiden).toContain(AUTHOR.name);
  });

  it("erfaringen i bio'en har dækning på /om", () => {
    // Bio'en påstår "mere end 15 år" — det tal skal stå på siden, der
    // dokumenterer det. Æ/ø/å er HTML-entiteter i /om, så der sammenlignes
    // kun på årstallet og fagområderne.
    const aar = AUTHOR.bio.match(/(\d+) år/);
    expect(aar, "bio'en nævner ikke et antal år").not.toBeNull();
    expect(omSiden).toContain(`${aar![1]} år`);
    for (const emne of ["lyd", "events", "musikproduktion"]) {
      expect(omSiden.toLowerCase(), `/om nævner ikke ${emne}`).toContain(emne);
    }
  });

  it("blogindlæg oplyser både udgivelses- og ændringsdato", () => {
    expect(blogSiden).toContain("datePublished");
    expect(blogSiden).toContain("dateModified");
  });

  it("blogindlæg viser forfatteren for læseren, ikke kun for crawlere", () => {
    // Markup uden synlig afsender er præcis det, Googles retningslinjer kalder
    // vildledende — det skal stå på siden.
    expect(blogSiden).toContain("Skrevet af");
    expect(blogSiden).toContain("{AUTHOR.name}");
  });
});
