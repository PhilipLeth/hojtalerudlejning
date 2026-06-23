import { describe, it, expect } from "vitest";
import { speakers, addons, dayMultiplier, startPrice } from "@/lib/products";

describe("Products data", () => {
  it("has two speaker packages", () => {
    expect(speakers).toHaveLength(2);
    expect(speakers.map((s) => s.id)).toEqual(["party", "festival"]);
  });

  it("party speaker is 399 kr", () => {
    expect(speakers.find((s) => s.id === "party")!.price).toBe(399);
  });

  it("festival speaker is 700 kr", () => {
    expect(speakers.find((s) => s.id === "festival")!.price).toBe(700);
  });

  it("startPrice matches cheapest speaker", () => {
    const cheapest = Math.min(...speakers.map((s) => s.price));
    expect(startPrice).toBe(cheapest);
    expect(startPrice).toBe(399);
  });

  it("all speakers have product and mood images", () => {
    for (const s of speakers) {
      expect(s.product).toMatch(/^\/images\/product-.+\.png$/);
      expect(s.mood).toMatch(/^\/images\/mood-.+\.png$/);
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
        expect(a.image).toMatch(/^\/images\/product-.+\.png$/);
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

  it("4 days = 120%", () => {
    expect(dayMultiplier[4]).toBe(1.2);
  });

  it("5 days = 140%", () => {
    expect(dayMultiplier[5]).toBe(1.4);
  });

  it("party speaker 1 day = 399 kr (same as base)", () => {
    expect(Math.round(399 * dayMultiplier[1])).toBe(399);
  });

  it("party speaker 5 days = 559 kr", () => {
    expect(Math.round(399 * dayMultiplier[5])).toBe(559);
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
