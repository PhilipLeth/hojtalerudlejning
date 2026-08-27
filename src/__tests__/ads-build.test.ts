/**
 * Hvilke af kontoens egne søgetermer hører til hvilket produkt?
 *
 * Søgetermerapporten dækker hele kontoen. Uden et filter arver hver
 * produktside alle andres søgninger — og i et tørløb mod den rigtige konto
 * blev "lej højtaler" (ti klik) anbefalet som keyword for en annonce mod
 * /discokugle, fordi discokuglesiden også nævner højtalere og derfor gav
 * højtalerfraser i Googles idéliste. Målestokken skal være produktets egne
 * frø, ikke idélisten.
 */
import { describe, it, expect } from "vitest";
import { relevant } from "../../functions/api/ads-build";

describe("relevant", () => {
  it("tager egne søgetermer om produktet med", () => {
    expect(relevant("leje af røgmaskine", ["røgmaskine"])).toBe(true);
    expect(relevant("røgmaskine leje københavn", ["røgmaskine"])).toBe(true);
  });

  it("lader ikke discokuglen arve højtalersøgninger", () => {
    expect(relevant("lej højtaler", ["diskokugle", "discokugle"])).toBe(false);
    expect(relevant("leje af mikrofon og højtaler", ["diskokugle", "discokugle"])).toBe(false);
  });

  it("kender begge stavemåder, når begge er frø", () => {
    expect(relevant("lej discokugle", ["diskokugle", "discokugle"])).toBe(true);
    expect(relevant("diskokugle leje", ["diskokugle", "discokugle"])).toBe(true);
  });

  it("lader korte ord være — de matcher alt", () => {
    // "go" fra "mackie thump go" må ikke gøre enhver frase med "go" relevant
    expect(relevant("gode fester", ["mackie thump go"])).toBe(false);
    expect(relevant("lej mackie", ["mackie thump go"])).toBe(true);
  });

  it("uden frø er intet relevant", () => {
    expect(relevant("lej højtaler", [])).toBe(false);
  });
});
