/**
 * Grammatikken skal genkende lejesøgninger, ikke opfinde dem.
 *
 * Den genererede tidligere keywords ud af produktnavnet. For Mackie Thump GO
 * gav det nitten fraser med nul søgninger hver, mens Google samtidig kunne
 * fortælle at "lej højtaler" søges 210 gange om måneden. Kunden søger på
 * kategorien, ikke på modellen — og det kan ingen permutation vide.
 *
 * Nu kommer fraserne udefra, og grammatikkens opgave er at samle de valgte i
 * stramme annoncegrupper.
 */
import { describe, it, expect } from "vitest";
import {
  adGroupName,
  classify,
  clusterKeywords,
  hasRentalWord,
  headTerm,
  phraseCovers,
  seedTerms,
} from "@/lib/adsIntent";

describe("classify", () => {
  it("kender de fem mønstre fra kontoens egne søgetermer", () => {
    expect(classify("lej soundboks")).toBe("lej");
    expect(classify("leje af soundboks")).toBe("leje");
    expect(classify("soundboks leje")).toBe("suffix");
    expect(classify("soundboks udlejning")).toBe("udlejning");
    expect(classify("lej soundboks københavn")).toBe("geo");
  });

  it("lader byen vinde over lejeordet — det er byen der ændrer annoncen", () => {
    expect(classify("lej højtaler københavn")).toBe("geo");
    expect(classify("højtaler leje kbh")).toBe("geo");
  });

  it("kender anledninger", () => {
    expect(classify("lej højtaler til fest")).toBe("anledning");
    expect(classify("leje af lys til bryllup")).toBe("anledning");
  });

  it("kender engelsk", () => {
    expect(classify("speaker rental")).toBe("en");
    expect(classify("rent a soundboks")).toBe("en");
  });

  it("mærker fraser uden lejeord som generiske", () => {
    // 58 af kontoens 120 mest viste søgetermer er sådanne her.
    // "diskokugle" gav 238 visninger og 3 klik — de skal kunne vælges fra.
    expect(classify("diskokugle")).toBe("generisk");
    expect(classify("transportabel højtaler")).toBe("generisk");
  });
});

describe("headTerm", () => {
  it("skræller intentionen af og efterlader produktet", () => {
    expect(headTerm("leje af højtaler københavn")).toBe("højtaler");
    expect(headTerm("lej en soundboks til fest")).toBe("soundboks");
    expect(headTerm("højtaler udlejning")).toBe("højtaler");
  });
});

describe("clusterKeywords", () => {
  it("samler Googles egne forslag for højtalersiden i stramme grupper", () => {
    // Præcis de idéer generateKeywordIdeas gav for /mackie-thump-go
    const grupper = clusterKeywords([
      { text: "lej højtaler", volume: 210 },
      { text: "leje højtaler", volume: 210 },
      { text: "leje af højtaler", volume: 210 },
      { text: "lej en højtaler", volume: 210 },
      { text: "leje højtalere", volume: 210 },
      { text: "højtaler leje", volume: 210 },
      { text: "højtaler til leje", volume: 210 },
      { text: "højtaler udlejning", volume: 50 },
      { text: "udlejning af højtaler", volume: 50 },
      { text: "udlejning højtalere", volume: 50 },
    ]);

    const nøgler = grupper.map((g) => g.key);
    expect(new Set(nøgler)).toEqual(new Set(["lej", "leje", "suffix", "udlejning"]));

    const udlejning = grupper.find((g) => g.key === "udlejning")!;
    // Ental og flertal hører i samme gruppe
    expect(udlejning.keywords).toContain("udlejning højtalere");
    expect(udlejning.keywords).toContain("højtaler udlejning");
    expect(udlejning.volume).toBe(150);
  });

  it("lader den mest søgte frase bære annoncen", () => {
    const [gruppe] = clusterKeywords([
      { text: "leje af røgmaskine", volume: 40 },
      { text: "leje røgmaskine", volume: 90 },
    ]);
    expect(gruppe.primary).toBe("leje røgmaskine");
  });

  it("blander ikke to produkter sammen", () => {
    const grupper = clusterKeywords(["lej højtaler", "lej røgmaskine"]);
    expect(grupper).toHaveLength(2);
  });

  it("sorterer de mest søgte grupper øverst", () => {
    const grupper = clusterKeywords([
      { text: "lej røgmaskine", volume: 50 },
      { text: "lej højtaler", volume: 210 },
    ]);
    expect(grupper[0].head).toBe("højtaler");
  });

  it("tåler dubletter og tom indtastning", () => {
    expect(clusterKeywords(["lej højtaler", "Lej Højtaler", " "])).toHaveLength(1);
    expect(clusterKeywords([])).toEqual([]);
  });

  it("regner volumen sammen, så en gruppe uden efterspørgsel kan ses", () => {
    const [gruppe] = clusterKeywords([{ text: "lej mackie thump go", volume: 0 }]);
    expect(gruppe.volume).toBe(0);
  });
});

describe("phraseCovers", () => {
  it("ved at en bred frase æder den lange af sig selv", () => {
    expect(phraseCovers("lej højtaler", "lej højtaler til bryllup")).toBe(true);
    expect(phraseCovers("lej soundboks", "lej soundboks københavn")).toBe(true);
  });

  it("dækker ikke, når der er skudt et ord ind i midten", () => {
    // Phrase match kræver ordene i rækkefølge UDEN fremmede ord imellem
    expect(phraseCovers("lej højtaler", "lej en højtaler")).toBe(false);
  });

  it("dækker ikke sig selv eller noget bredere", () => {
    expect(phraseCovers("lej højtaler", "lej højtaler")).toBe(false);
    expect(phraseCovers("lej højtaler til bryllup", "lej højtaler")).toBe(false);
  });

  it("kræver samme rækkefølge", () => {
    expect(phraseCovers("højtaler leje", "lej højtaler til fest")).toBe(false);
  });
});

describe("hasRentalWord", () => {
  it("kender lejeordene", () => {
    for (const s of ["lej højtaler", "leje af lys", "røgmaskine udlejning", "lån en soundboks", "speaker rental"]) {
      expect(hasRentalWord(s), s).toBe(true);
    }
  });

  it("lader sig ikke narre af ord der bare starter ens", () => {
    for (const s of ["diskokugle", "lejlighed til fest", "lejemål københavn", "fest udstyr"]) {
      expect(hasRentalWord(s), s).toBe(false);
    }
  });
});

describe("seedTerms", () => {
  it("giver frø til Google, ikke færdige keywords", () => {
    expect(seedTerms("Soundboks 4")).toEqual(["soundboks", "soundbox"]);
    expect(seedTerms("Mackie Thump GO")).toEqual(["mackie thump go"]);
  });
});

describe("adGroupName", () => {
  it("siger både produkt, mønster og produktord", () => {
    const [gruppe] = clusterKeywords([{ text: "lej højtaler", volume: 210 }]);
    expect(adGroupName("Mackie Thump GO", gruppe)).toBe("Mackie Thump GO — Lej: højtaler");
  });
});
