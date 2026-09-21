/**
 * En produktside må ikke skrive prisen — den skal slå den op i kataloget.
 *
 * Baggrund: /filmaften stod med `price={1.195}` — et JavaScript-tal med dansk
 * tusindtalsseparator, altså 1,195 kr. Siden viste tilfældigvis "1.195 kr"
 * alligevel, fordi den formaterer på dansk igen bagefter, så fejlen var
 * usynlig for et menneske. Men JSON-LD sendte `"price":"1.195"` til Google, og
 * llms.txt skrev "Filmaften-pakken — 1 kr/weekend".
 *
 * Først blev det løst med en test, der krævede at `price`-prop'en var præcis
 * katalogets tal. Det holdt kun så længe nogen huskede at rette begge steder.
 * Da pakkepriserne blev udledt af delene (se refreshBundlePrices), flyttede 82
 * pakker sig på én gang, og fjorten sider stod tilbage med det gamle tal.
 *
 * Derfor er kravet nu skarpere: prop'en er væk. ProductLanding slår prisen op
 * med catalogPrice(productId), så der kun findes ét tal. Testen vogter at
 * ingen skriver det igen.
 *
 * priser-i-tekst.test.ts vogter beløb i SYNLIG tekst. Den her vogter prop'en,
 * som føder Product-markup, llms.txt og fallback-prisen inden kataloget er
 * hentet — tre steder hvor et forkert tal ikke kan ses på siden.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { addons, rentalProducts, speakers } from "@/lib/products";

const katalog = new Set<string>([
  ...speakers.map((s) => s.id),
  ...addons.map((a) => a.id),
  ...rentalProducts.map((r) => r.id),
]);

/** Alle page.tsx under src/app */
function alleSider(dir: string, ud: string[] = []): string[] {
  for (const navn of readdirSync(dir)) {
    const sti = join(dir, navn);
    if (statSync(sti).isDirectory()) alleSider(sti, ud);
    else if (navn === "page.tsx") ud.push(sti);
  }
  return ud;
}

const produktsider = alleSider("src/app")
  .map((sti) => ({ sti, kilde: readFileSync(sti, "utf8") }))
  .filter((s) => s.kilde.includes("<ProductLanding"));

describe("Produktsidernes pris", () => {
  it("der er produktsider at vogte", () => {
    // Uden det her ville testen blive grøn af at finde ingenting
    expect(produktsider.length).toBeGreaterThan(50);
  });

  it("hver side peger på et produkt der findes i kataloget", () => {
    const afvig: string[] = [];
    for (const { sti, kilde } of produktsider) {
      const pid = kilde.match(/productId="([^"]+)"/);
      if (!pid) afvig.push(`${sti}: mangler productId`);
      else if (!katalog.has(pid[1])) afvig.push(`${sti}: productId "${pid[1]}" findes ikke i kataloget`);
    }
    expect(afvig, `sider uden gyldigt productId:\n${afvig.join("\n")}`).toEqual([]);
  });

  it("ingen side skriver prisen selv", () => {
    const skriver = produktsider
      .filter((s) => /price=\{\s*\d/.test(s.kilde))
      .map((s) => s.sti);
    expect(
      skriver,
      `sider der skriver prisen i stedet for at lade ProductLanding slå den op:\n${skriver.join("\n")}`,
    ).toEqual([]);
  });
});
