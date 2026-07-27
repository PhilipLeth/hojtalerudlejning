import { describe, it, expect } from "vitest";
import { speakers, addons, dayMultiplier, startPrice, cheapestSpeakerPrice } from "@/lib/products";

describe("Products data", () => {
  it("has four speaker packages", () => {
    expect(speakers).toHaveLength(4);
    expect(speakers.map((s) => s.id)).toEqual(["thumpgo", "party", "soundboks", "festival"]);
  });

  it("thump go is 350 kr", () => {
    expect(speakers.find((s) => s.id === "thumpgo")!.price).toBe(350);
  });

  it("party speaker is 399 kr", () => {
    expect(speakers.find((s) => s.id === "party")!.price).toBe(399);
  });

  it("soundboks mix is 600 kr", () => {
    expect(speakers.find((s) => s.id === "soundboks")!.price).toBe(600);
  });

  it("festival speaker is 700 kr", () => {
    expect(speakers.find((s) => s.id === "festival")!.price).toBe(700);
  });

  it("startPrice matches cheapest speaker", () => {
    const cheapest = Math.min(...speakers.map((s) => s.price));
    expect(startPrice).toBe(cheapest);
    expect(startPrice).toBe(350);
  });

  it("cheapestSpeakerPrice ignores hidden speakers", () => {
    const list = speakers.map((s) => (s.id === "thumpgo" ? { ...s, hidden: true } : s));
    expect(cheapestSpeakerPrice(list)).toBe(399);
  });

  it("all speakers have product and mood images", () => {
    for (const s of speakers) {
      expect(s.product).toMatch(/^\/images\/product-.+\.(png|svg)$/);
      expect(s.mood).toMatch(/^\/images\/mood-.+\.png$/);
    }
  });

  it("all speakers have power, size class and weight", () => {
    for (const s of speakers) {
      expect(["batteri", "kabel"]).toContain(s.power);
      expect(["lille", "stor"]).toContain(s.sizeClass);
      expect(s.weight).toBeTruthy();
    }
  });

  it("has small and large in both battery and cable groups", () => {
    for (const power of ["batteri", "kabel"] as const) {
      const group = speakers.filter((s) => s.power === power);
      expect(group.map((s) => s.sizeClass)).toContain("lille");
      expect(group.map((s) => s.sizeClass)).toContain("stor");
    }
  });

  it("all speakers have da and en text", () => {
    for (const s of speakers) {
      for (const loc of ["da", "en"] as const) {
        expect(s[loc].name).toBeTruthy();
        expect(s[loc].size).toBeTruthy();
        expect(s[loc].capacity).toBeTruthy();
        expect(s[loc].desc.length).toBeGreaterThan(20);
        expect(s[loc].extra).toBeTruthy();
      }
    }
  });
});

describe("Addons data", () => {
  it("has lys, rog, stativer, taske, levering", () => {
    const ids = addons.map((a) => a.id);
    expect(ids).toContain("lys");
    expect(ids).toContain("rog");
    expect(ids).toContain("stativer");
    expect(ids).toContain("taske");
    expect(ids).toContain("levering");
  });

  it("lys is 500 kr", () => {
    expect(addons.find((a) => a.id === "lys")!.price).toBe(500);
  });

  it("rog is 250 kr", () => {
    expect(addons.find((a) => a.id === "rog")!.price).toBe(250);
  });

  it("levering is 500 kr", () => {
    expect(addons.find((a) => a.id === "levering")!.price).toBe(500);
  });

  it("all addons except levering have an image", () => {
    for (const a of addons) {
      if (a.id === "levering") {
        expect(a.image).toBeNull();
      } else {
        expect(a.image).toMatch(/^\/images\/product-.+\.(png|svg)$/);
      }
    }
  });

  it("all addons have da and en text", () => {
    for (const a of addons) {
      for (const loc of ["da", "en"] as const) {
        expect(a[loc].label).toBeTruthy();
        expect(a[loc].desc).toBeTruthy();
      }
    }
  });
});

describe("Day multiplier pricing", () => {
  it("1 day = 100% of base (no short-rental discount)", () => {
    expect(dayMultiplier[1]).toBe(1.0);
  });

  it("2 days = 100% of base (no short-rental discount)", () => {
    expect(dayMultiplier[2]).toBe(1.0);
  });

  it("3 days (weekend) = 100%", () => {
    expect(dayMultiplier[3]).toBe(1.0);
  });

  it("4 days = 100% (flat price)", () => {
    expect(dayMultiplier[4]).toBe(1.0);
  });

  it("5 days = 100% (flat price)", () => {
    expect(dayMultiplier[5]).toBe(1.0);
  });

  it("party speaker 1 day = 399 kr (same as base)", () => {
    expect(Math.round(399 * dayMultiplier[1])).toBe(399);
  });

  it("party speaker 5 days = 399 kr (same as base)", () => {
    expect(Math.round(399 * dayMultiplier[5])).toBe(399);
  });

  it("festival speaker weekend = 700 kr", () => {
    expect(Math.round(700 * dayMultiplier[3])).toBe(700);
  });

  it("festival speaker + lys + rog weekend = 1450 kr", () => {
    const speaker = 700 * dayMultiplier[3];
    const lys = 500;
    const rog = 250;
    expect(Math.round(speaker + lys + rog)).toBe(1450);
  });
});
