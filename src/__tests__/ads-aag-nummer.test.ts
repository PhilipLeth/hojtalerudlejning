import { describe, it, expect } from "vitest";
import { nextAagNumber } from "../../functions/api/ads-build";
describe("nextAagNumber", () => {
  it("finder næste ledige nummer", () => {
    expect(nextAagNumber(["AAG1: a", "AAG2: b", "AG 5 - c"])).toBe(3);
  });
  it("starter på 1 i en konto uden AAG-grupper", () => {
    expect(nextAagNumber(["AG 1 - Højtalere", "AAG: uden nummer"])).toBe(1);
  });
  it("tåler huller og stort/småt", () => {
    expect(nextAagNumber(["aag7: x", "AAG 3 : y"])).toBe(8);
  });
});
