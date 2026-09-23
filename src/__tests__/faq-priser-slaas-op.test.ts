import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Ingen pris må stå i hånden i categoryFaq.ts.
 *
 * Filens egen indledning lovede, at hver pris var slået op i products.ts. Det
 * var den ikke. category-faq.test.ts tjekker kun, at tallet findes ET eller
 * andet sted i kataloget, og det gør 495 jo — som Thump GO's gamle pris. Så
 * da pakkepriserne blev genberegnet ud fra delene, drev svarene lydløst fra
 * produkterne, de handlede om:
 *
 *   Mackie Thump GO      495 kr  →  445 kr   (fire svar, dansk og engelsk)
 *   Mellem højtalerpakke 995 kr  →  795 kr
 *   Lysbaren             495 kr  →  395 kr   (heroen ti linjer højere oppe sagde 395)
 *   Discokugle       495/595 kr  →  545/645 kr
 *   Lysshow            1.140 kr  →  1.180 kr
 *   Stort lysshow      1.910 kr  →  2.010 kr
 *   Low fog (engelsk)    795 DKK →  545 DKK
 *   Trådløs mikrofon     295 kr  →  445 kr
 *   Shure med kabel      395 kr  →  345 kr
 *
 * En annonce, der lover én pris, og en landingsside, der siger noget andet,
 * er det Google måler som dårlig landingssideoplevelse — og kunden, der har
 * regnet med 995, finder 795 i kurven og tror, hun har misforstået noget.
 *
 * Reglen er derfor absolut: et beløb i et svar skal komme fra prisKr(),
 * prisDkk(), rabatKr(), rabatDkk() eller startPrisKr(). Ikke fra tastaturet.
 */
const kilde = readFileSync(join(__dirname, "..", "lib", "categoryFaq.ts"), "utf8");

/** Kommentarer må gerne nævne gamle tal — det er netop dér historikken står. */
function udenKommentarer(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("priser i categoryFaq", () => {
  it("står ikke i hånden", () => {
    const fundne = [...udenKommentarer(kilde).matchAll(/[\d.]*\d\s*(kr|DKK)\b/g)].map((m) => ({
      tekst: m[0],
      linje: kilde.slice(0, m.index).split("\n").length,
    }));
    expect(
      fundne,
      `skriv ${fundne.map((f) => `${f.tekst} (linje ${f.linje})`).join(", ")} som prisKr("…") / prisDkk("…")`,
    ).toEqual([]);
  });

  it("bruger stadig katalogets opslagsfunktioner", () => {
    // Værn mod at reglen overholdes ved at fjerne priserne helt.
    expect(kilde.match(/pris(Kr|Dkk)\("/g)?.length ?? 0).toBeGreaterThan(40);
  });
});
