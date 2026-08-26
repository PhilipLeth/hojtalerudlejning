/**
 * Grammatikken skal ramme virkeligheden, ikke være smuk.
 *
 * Prøven er kontoens egen søgetermerapport: de fraser folk faktisk har søgt på
 * og klikket i, skal generatoren kunne producere. Kan den ikke det, laver den
 * grupper der aldrig viser noget — og dem har kontoen 35 af i forvejen.
 */
import { describe, it, expect } from "vitest";
import {
  adGroupName,
  hasRentalWord,
  intentThemes,
  seedTerms,
} from "@/lib/adsIntent";

/**
 * Målt på 441-020-7627, søgetermer med mindst 8 visninger de seneste 180 dage.
 * Tallet i kommentaren er visninger.
 */
const FAKTISKE_SOUNDBOKS_SOEGNINGER = [
  "lej soundboks",            // 167
  "lej en soundboks",         // 118
  "soundboks leje",           // 100
  "leje soundboks",           //  74
  "leje af soundboks",        //  50
  "soundboks udlejning",      //  40
  "lej soundboks københavn",  //  18
  "soundboks lej",            //  17
  "udlejning af soundboks",   //  17
  "soundbox leje",            //  16
  "leje soundbox",            //  15
  "lej soundbox",             //  13
  "leje af soundbox",         //  12
  "soundboks til leje",       //  12
  "soundboks leje københavn", //  10
  "lej en soundbox",          //   9
];

function alleKeywords(terms: string[]) {
  return intentThemes(terms).flatMap((t) => t.keywords.map((k) => k.text));
}

describe("intentThemes", () => {
  it("genskaber alle de soundboks-søgninger kontoen rent faktisk har fået", () => {
    const genereret = new Set(alleKeywords(["soundboks", "soundbox"]));
    const mangler = FAKTISKE_SOUNDBOKS_SOEGNINGER.filter((s) => !genereret.has(s));
    expect(mangler).toEqual([]);
  });

  it("giver fem temaer som standardsæt", () => {
    const keys = intentThemes(["røgmaskine"]).map((t) => t.key);
    expect(keys.slice(0, 5)).toEqual(["lej", "leje", "suffix", "udlejning", "geo"]);
  });

  it("tager kun det engelske tema med når man beder om det", () => {
    expect(intentThemes(["speaker"]).map((t) => t.key)).not.toContain("en");
    expect(intentThemes(["speaker"], { english: true }).map((t) => t.key)).toContain("en");
  });

  it("lader ikke samme frase optræde i to temaer", () => {
    // Ellers byder vi mod os selv i auktionen — det er dét AG 1 gør mod AG 4 i dag
    const alle = alleKeywords(["højtaler", "højttaler"]);
    expect(new Set(alle).size).toBe(alle.length);
  });

  it("sætter bofu på alle fraser i de fire lejetemaer", () => {
    const temaer = intentThemes(["røgmaskine"]);
    for (const t of temaer.filter((x) => ["lej", "leje", "suffix", "udlejning"].includes(x.key))) {
      for (const k of t.keywords) {
        expect(k.bofu, `${t.key}: ${k.text}`).toBe(true);
      }
    }
  });

  it("er tom uden søgetermer", () => {
    expect(intentThemes([])).toEqual([]);
    expect(intentThemes(["   "])).toEqual([]);
  });

  it("bruger phrase match hele vejen igennem", () => {
    const typer = intentThemes(["subwoofer"]).flatMap((t) => t.keywords.map((k) => k.matchType));
    expect(new Set(typer)).toEqual(new Set(["PHRASE"]));
  });
});

describe("hasRentalWord", () => {
  it("kender lejeordene", () => {
    for (const s of ["lej højtaler", "leje af lys", "røgmaskine udlejning", "lån en soundboks", "speaker rental"]) {
      expect(hasRentalWord(s), s).toBe(true);
    }
  });

  it("lader sig ikke narre af ord der bare starter ens", () => {
    // "lejlighed" og "lejemål" er ikke lejeord i vores forstand
    for (const s of ["diskokugle", "lejlighed til fest", "lejemål københavn", "fest udstyr"]) {
      expect(hasRentalWord(s), s).toBe(false);
    }
  });
});

describe("seedTerms", () => {
  it("klipper modelnummeret af — ingen søger på 'soundboks 4'", () => {
    expect(seedTerms("Soundboks 4")).toContain("soundboks");
  });

  it("tager stavemåden folk faktisk bruger med", () => {
    expect(seedTerms("Soundboks 4")).toContain("soundbox");
    // "højtaler" er forkert dansk og slår "højttaler" 13:1 i kontoens søgetermer
    expect(seedTerms("Højtaler")).toEqual(["højtaler", "højttaler"]);
  });

  it("lader flerordsnavne stå", () => {
    expect(seedTerms("Mackie Thump GO")).toEqual(["mackie thump go"]);
  });

  it("laver ikke flertalsformer — de gav 'lej en røgmaskiner'", () => {
    // Phrase match dækker selv ental/flertal; en flertalsterm gav bare
    // mønstre ingen skriver
    expect(seedTerms("Røgmaskine")).toEqual(["røgmaskine"]);
    const alle = intentThemes(seedTerms("Røgmaskine")).flatMap((t) => t.keywords.map((k) => k.text));
    expect(alle).not.toContain("lej en røgmaskiner");
  });
});

describe("adGroupName", () => {
  it("følger en fast konvention der kan læses i Google Ads", () => {
    const tema = intentThemes(["røgmaskine"])[0];
    expect(adGroupName("Røgmaskine", tema)).toBe("Røgmaskine — Lej");
  });
});
