/**
 * `price`-prop'en på en produktside skal være katalogets pris.
 *
 * Baggrund: /filmaften stod med `price={1.195}` — et JavaScript-tal med dansk
 * tusindtalsseparator, altså 1,195 kr. Siden viste tilfældigvis "1.195 kr"
 * alligevel, fordi den formaterer på dansk igen bagefter, så fejlen var
 * usynlig for et menneske. Men JSON-LD sendte `"price":"1.195"` til Google, og
 * llms.txt skrev "Filmaften-pakken — 1 kr/weekend". Bookingen var aldrig
 * berørt: serveren slår priser op i kataloget, aldrig i siden.
 *
 * priser-i-tekst.test.ts vogter beløb i SYNLIG tekst. Den her vogter prop'en,
 * som føder Product-markup, llms.txt og fallback-prisen inden kataloget er
 * hentet — tre steder hvor et forkert tal ikke kan ses på siden.
 *
 * Kravet er skarpere end "ingen decimaler": tallet skal være præcis
 * katalogets. Det fanger også en prisstigning, der ramte products.ts men
 * glemte siden — samme fejl som priser-i-tekst blev skrevet efter.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { addons, rentalProducts, speakers } from "@/lib/products";

const katalog = new Map<string, number>();
for (const s of speakers) katalog.set(s.id, s.price);
for (const a of addons) katalog.set(a.id, a.price);
for (const r of rentalProducts) katalog.set(r.id, r.price);

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

  it("hver side har både price og productId", () => {
    const mangler = produktsider
      .filter((s) => !/price=\{\d+\}/.test(s.kilde) || !/productId="[^"]+"/.test(s.kilde))
      .map((s) => s.sti);
    // Et decimaltal (price={1.195}) fanges her: \d+ matcher ikke "1.195"
    expect(mangler, `sider uden heltalspris eller productId:\n${mangler.join("\n")}`).toEqual([]);
  });

  it("prisen på siden er katalogets pris", () => {
    const afvig: string[] = [];
    for (const { sti, kilde } of produktsider) {
      const pris = kilde.match(/price=\{(\d+)\}/);
      const pid = kilde.match(/productId="([^"]+)"/);
      if (!pris || !pid) continue; // fanget af testen ovenfor
      const katalogpris = katalog.get(pid[1]);
      if (katalogpris === undefined) {
        afvig.push(`${sti}: productId "${pid[1]}" findes ikke i kataloget`);
      } else if (Number(pris[1]) !== katalogpris) {
        afvig.push(`${sti}: ${pid[1]} står til ${pris[1]} kr, kataloget siger ${katalogpris} kr`);
      }
    }
    expect(afvig, `pris på siden ≠ katalogets:\n${afvig.join("\n")}`).toEqual([]);
  });
});
