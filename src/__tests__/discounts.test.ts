/**
 * Rabatkoder. Procenterne er forretningsaftaler (genkoeb 10, venner 20,
 * tatven 30) — ændrer nogen dem ved et uheld, skal en test knække.
 */
import { describe, it, expect } from "vitest";
import {
  DEFAULT_CODES,
  normalizeCode,
  resolveDiscount,
  discountOre,
} from "../../functions/api/_lib/discounts";

/** Minimal KV-attrap — kun get() bruges af resolveDiscount. */
function kvWith(value: string | null): KVNamespace {
  return { get: async () => value } as unknown as KVNamespace;
}

describe("aftalte koder", () => {
  it("genkoeb er 10 %, venner 20 %, tatven 30 %", () => {
    expect(DEFAULT_CODES).toEqual({ genkoeb: 10, venner: 20, tatven: 30 });
  });
});

describe("normalizeCode", () => {
  it("er ligeglad med store bogstaver og mellemrum", () => {
    expect(normalizeCode("  VENNER ")).toBe("venner");
  });

  it("oversætter æ/ø/å, så 'genkøb' rammer 'genkoeb'", () => {
    expect(normalizeCode("GENKØB")).toBe("genkoeb");
    expect(normalizeCode("tætven")).toBe("taetven"); // rammer intet — se nedenfor
  });
});

describe("resolveDiscount", () => {
  it("slår de tre koder op uden KV-data", async () => {
    const kv = kvWith(null);
    expect(await resolveDiscount(kv, "genkoeb")).toEqual({ code: "genkoeb", pct: 10 });
    expect(await resolveDiscount(kv, "VENNER")).toEqual({ code: "venner", pct: 20 });
    expect(await resolveDiscount(kv, "tatven")).toEqual({ code: "tatven", pct: 30 });
  });

  it("afviser ukendte koder og tom streng", async () => {
    const kv = kvWith(null);
    expect(await resolveDiscount(kv, "hackerman")).toBeNull();
    expect(await resolveDiscount(kv, "")).toBeNull();
    expect(await resolveDiscount(kv, undefined)).toBeNull();
  });

  it("'tætven' er IKKE en kode — koden hedder tatven", async () => {
    // æ→ae giver "taetven", som ikke findes. Dokumenteret adfærd, ikke en fejl.
    expect(await resolveDiscount(kvWith(null), "tætven")).toBeNull();
  });

  it("KV kan tilføje nye koder uden deploy", async () => {
    const kv = kvWith(JSON.stringify({ sommerfest: 15 }));
    expect(await resolveDiscount(kv, "sommerfest")).toEqual({ code: "sommerfest", pct: 15 });
    // defaults gælder stadig
    expect(await resolveDiscount(kv, "venner")).toEqual({ code: "venner", pct: 20 });
  });

  it("KV kan slå en kode fra med 0", async () => {
    const kv = kvWith(JSON.stringify({ venner: 0 }));
    expect(await resolveDiscount(kv, "venner")).toBeNull();
  });

  it("afviser vanvittige procenter fra KV", async () => {
    const kv = kvWith(JSON.stringify({ fejl: 150, negativ: -5 }));
    expect(await resolveDiscount(kv, "fejl")).toBeNull();
    expect(await resolveDiscount(kv, "negativ")).toBeNull();
  });

  it("ugyldig JSON i KV vælter ikke opslaget", async () => {
    const kv = kvWith("{ikke json");
    expect(await resolveDiscount(kv, "venner")).toEqual({ code: "venner", pct: 20 });
  });
});

describe("discountOre", () => {
  it("regner rabat i øre med afrunding", () => {
    expect(discountOre(59500, 10)).toBe(5950); // 595 kr − 10 % = 59,50 kr rabat
    expect(discountOre(34500, 20)).toBe(6900);
    expect(discountOre(9500, 30)).toBe(2850);
  });

  it("afrunder som frontend (Math.round)", () => {
    // 333 kr − 30 % → 99,90 kr rabat → 9990 øre
    expect(discountOre(33300, 30)).toBe(9990);
  });
});
