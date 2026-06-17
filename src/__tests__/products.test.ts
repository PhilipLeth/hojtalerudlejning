import { describe, it, expect } from "vitest";
import { speakers, addons, dayMultiplier, startPrice } from "@/lib/products";

describe("Products data", () => {
  it("has two speaker packages", () => {
    expect(speakers).toHaveLength(2);
    expect(speakers.map((s) => s.id)).toEqual(["party", "festival"]);
  });

  it("party speaker is 400 kr", () => {
    expect(speakers.find((s) => s.id === "party")!.price).toBe(400);
  });

  it("festival speaker is 700 kr", () => {
    expect(speakers.find((s) => s.id === "festival")!.price).toBe(700);
  });

  it("startPrice matches cheapest speaker", () => {
    const cheapest = Math.min(...speakers.map((s) => s.price));
    expect(startPrice).toBe(cheapest);
    expect(startPrice).toBe(400);
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
  it("1 day = 80% of base", () => {
    expect(dayMultiplier[1]).toBe(0.8);
  });

  it("2 days = 90% of base", () => {
    expect(dayMultiplier[2]).toBe(0.9);
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

  it("party speaker 1 day = 320 kr", () => {
    expect(Math.round(400 * dayMultiplier[1])).toBe(320);
  });

  it("party speaker 5 days = 560 kr", () => {
    expect(Math.round(400 * dayMultiplier[5])).toBe(560);
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
