import { describe, it, expect } from "vitest";
import { speakers, addons, rentalProducts, dayMultiplier, startPrice, cheapestSpeakerPrice } from "@/lib/products";

describe("Products data", () => {
  it("has four speaker packages", () => {
    expect(speakers).toHaveLength(4);
    expect(speakers.map((s) => s.id)).toEqual(["thumpgo", "party", "soundboks", "festival"]);
  });

  it("thump go is 345 kr", () => {
    expect(speakers.find((s) => s.id === "thumpgo")!.price).toBe(345);
  });

  it("party speaker is 395 kr", () => {
    expect(speakers.find((s) => s.id === "party")!.price).toBe(395);
  });

  it("soundboks mix is 595 kr", () => {
    expect(speakers.find((s) => s.id === "soundboks")!.price).toBe(595);
  });

  it("festival speaker is 695 kr", () => {
    expect(speakers.find((s) => s.id === "festival")!.price).toBe(695);
  });

  it("startPrice matches cheapest speaker", () => {
    const cheapest = Math.min(...speakers.map((s) => s.price));
    expect(startPrice).toBe(cheapest);
    expect(startPrice).toBe(345);
  });

  it("cheapestSpeakerPrice ignores hidden speakers", () => {
    const list = speakers.map((s) => (s.id === "thumpgo" ? { ...s, hidden: true } : s));
    expect(cheapestSpeakerPrice(list)).toBe(395);
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
  it("has lys, rog, stativer, taske, levering_opsaetning — ikke levering uden opsætning", () => {
    const ids = addons.map((a) => a.id);
    expect(ids).toContain("lys");
    expect(ids).toContain("rog");
    expect(ids).toContain("stativer");
    expect(ids).toContain("taske");
    expect(ids).toContain("levering_opsaetning");
    expect(ids).not.toContain("levering");
  });

  it("lys is 495 kr", () => {
    expect(addons.find((a) => a.id === "lys")!.price).toBe(495);
  });

  it("rog is 245 kr", () => {
    expect(addons.find((a) => a.id === "rog")!.price).toBe(245);
  });

  it("levering_opsaetning is 495 kr (ingen levering-uden-opsætning)", () => {
    expect(addons.find((a) => a.id === "levering_opsaetning")!.price).toBe(495);
    expect(addons.find((a) => a.id === "levering")).toBeUndefined();
  });

  it("festpakker har runde mentale priser: 500 og 1.000 kr (uden opsætning)", () => {
    const lille = rentalProducts.find((p) => p.id === "pakke_fest_lille")!;
    const stor = rentalProducts.find((p) => p.id === "pakke_fest_stor")!;
    expect(lille.bundle?.parts.map((x) => x.productId)).toEqual(["party", "lyseffekt"]);
    expect(lille.price).toBe(500); // 395 + 195 - 90
    expect(lille.bundle?.discount).toBe(90);
    expect(stor.bundle?.parts.map((x) => x.productId)).toEqual(["festival", "lys"]);
    expect(stor.price).toBe(1000); // 695 + 495 - 190
    expect(stor.bundle?.discount).toBe(190);
    // Levering/opsætning er tilvalg — ikke en del af pakken
    for (const p of [lille, stor]) {
      expect(p.bundle!.parts.map((x) => x.productId)).not.toContain("levering_opsaetning");
      expect(p.allowedAddons).not.toContain("levering");
      expect(p.allowedAddons).toContain("levering_opsaetning");
    }
  });

  it("lyskæder findes i to varianter med hver sit billede", () => {
    const hvid = rentalProducts.find((p) => p.id === "lyskaeder")!;
    const farvet = rentalProducts.find((p) => p.id === "lyskaeder_farvet")!;
    expect(hvid.image).toBe("/images/product-lyskaeder.png");
    expect(farvet.image).toBe("/images/product-lyskaeder-farvet.png");
    expect(hvid.price).toBe(195);
    expect(farvet.price).toBe(195);
  });

  it("PRO-mikrofoner findes med egne billeder (Shure)", () => {
    const traadloesPro = rentalProducts.find((p) => p.id === "traadloes_mikrofon_pro")!;
    const haandholdtPro = rentalProducts.find((p) => p.id === "haandholdt_mikrofon_pro")!;
    expect(traadloesPro.image).toBe("/images/product-mikrofon-pro.png");
    expect(traadloesPro.price).toBe(495);
    expect(haandholdtPro.image).toBe("/images/product-mikrofon-kabel-pro.png");
    expect(haandholdtPro.price).toBe(195);
  });

  it("subwoofer findes som tilvalg med Behringer 12\" og egen produktside", () => {
    const sub = addons.find((a) => a.id === "subwoofer")!;
    expect(sub).toBeDefined();
    expect(sub.price).toBe(295);
    expect(sub.page).toBe("/subwoofer");
    expect(sub.image).toBe("/images/product-subwoofer.png");
    expect(sub.da.label).toContain("Subwoofer");
    expect(sub.contents?.join(" ")).toContain("Behringer");
  });

  it("subwoofer kan tilvælges på begge festpakker (whitelistede tilvalg)", () => {
    for (const id of ["pakke_fest_lille", "pakke_fest_stor"]) {
      const pakke = rentalProducts.find((p) => p.id === id)!;
      expect(pakke.allowedAddons).toContain("subwoofer");
    }
  });

  it("all addons except levering_opsaetning have an image", () => {
    for (const a of addons) {
      if (a.id === "levering_opsaetning") {
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

  it("festival speaker weekend = 695 kr", () => {
    expect(Math.round(695 * dayMultiplier[3])).toBe(695);
  });

  it("festival speaker + lys + rog weekend = 1435 kr", () => {
    const speaker = 695 * dayMultiplier[3];
    const lys = 495;
    const rog = 245;
    expect(Math.round(speaker + lys + rog)).toBe(1435);
  });
});
