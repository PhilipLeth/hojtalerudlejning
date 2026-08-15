import { describe, it, expect } from "vitest";
import { speakers, addons, rentalProducts, dayMultiplier, startPrice, cheapestSpeakerPrice } from "@/lib/products";

describe("Products data", () => {
  it("has five speaker packages (incl. + bas fra 12. aug 2026)", () => {
    expect(speakers).toHaveLength(5);
    expect(speakers.map((s) => s.id)).toEqual(["thumpgo", "party", "soundboks", "festival", "festival_bas"]);
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

  it("festival speaker is 495 kr (mellempakken, 12. aug 2026)", () => {
    expect(speakers.find((s) => s.id === "festival")!.price).toBe(495);
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
  it("has lys, rog, stativer, taske og de tre kørsels-tilvalg", () => {
    const ids = addons.map((a) => a.id);
    expect(ids).toContain("lys");
    expect(ids).toContain("rog");
    expect(ids).toContain("stativer");
    expect(ids).toContain("taske");
    expect(ids).toContain("levering_ud");
    expect(ids).toContain("afhentning_retur");
    expect(ids).toContain("levering_begge");
    // De gamle kørsels-ids findes ikke længere i kataloget
    expect(ids).not.toContain("levering");
    expect(ids).not.toContain("levering_opsaetning");
  });

  it("lys is 495 kr", () => {
    expect(addons.find((a) => a.id === "lys")!.price).toBe(495);
  });

  it("rog is 245 kr", () => {
    expect(addons.find((a) => a.id === "rog")!.price).toBe(245);
  });

  it("kørsel: én vej 495 kr, begge veje 795 kr", () => {
    expect(addons.find((a) => a.id === "levering_ud")!.price).toBe(495);
    expect(addons.find((a) => a.id === "afhentning_retur")!.price).toBe(495);
    expect(addons.find((a) => a.id === "levering_begge")!.price).toBe(795);
    // Begge veje skal være billigere end to enkeltture — ellers er der ingen grund
    // til at vælge den
    expect(addons.find((a) => a.id === "levering_begge")!.price).toBeLessThan(495 * 2);
  });

  it("levering og afhentning er to selvstændige veje", async () => {
    const { deliveryDirections } = await import("@/lib/products");
    expect(deliveryDirections("levering_ud")).toEqual({ out: true, back: false });
    expect(deliveryDirections("afhentning_retur")).toEqual({ out: false, back: true });
    expect(deliveryDirections("levering_begge")).toEqual({ out: true, back: true });
    // Gamle bookinger kørte altid begge veje
    expect(deliveryDirections("levering_opsaetning")).toEqual({ out: true, back: true });
  });

  it("festpakker ender på 95: 495 og 995 kr (uden opsætning)", () => {
    const lille = rentalProducts.find((p) => p.id === "pakke_fest_lille")!;
    const stor = rentalProducts.find((p) => p.id === "pakke_fest_stor")!;
    expect(lille.bundle?.parts.map((x) => x.productId)).toEqual(["party", "lyseffekt"]);
    expect(lille.price).toBe(495); // 395 + 195 - 95
    expect(lille.bundle?.discount).toBe(95);
    expect(stor.bundle?.parts.map((x) => x.productId)).toEqual(["festival", "lys"]);
    expect(stor.price).toBe(895); // 495 + 495 - 95
    expect(stor.bundle?.discount).toBe(95);
    // Levering/opsætning er tilvalg — ikke en del af pakken
    for (const p of [lille, stor]) {
      expect(p.bundle!.parts.map((x) => x.productId)).not.toContain("levering_begge");
      expect(p.allowedAddons).not.toContain("levering");
      expect(p.allowedAddons).toContain("levering_ud");
      expect(p.allowedAddons).toContain("afhentning_retur");
      expect(p.allowedAddons).toContain("levering_begge");
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

  it("uplights: enkelt 125 kr og 4-pak 395 kr", () => {
    const single = rentalProducts.find((p) => p.id === "uplight")!;
    const pack = rentalProducts.find((p) => p.id === "uplight_4")!;
    expect(single.price).toBe(125);
    expect(pack.price).toBe(395);
    expect(single.page).toBe("/uplights");
    expect(pack.page).toBe("/uplights");
    expect(pack.contents?.join(" ")).toContain("4×");
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
    expect(sub.image).toBe("/images/product-subwoofer-v2.png");
    expect(sub.da.label).toContain("Subwoofer");
    expect(sub.contents?.join(" ")).toContain("Behringer");
  });

  it("subwoofer kan tilvælges på begge festpakker (whitelistede tilvalg)", () => {
    for (const id of ["pakke_fest_lille", "pakke_fest_stor"]) {
      const pakke = rentalProducts.find((p) => p.id === id)!;
      expect(pakke.allowedAddons).toContain("subwoofer");
    }
  });

  it("karaokemaskinen koster 695 kr (2 mics + skærm)", () => {
    const k = rentalProducts.find((p) => p.id === "karaoke")!;
    expect(k.price).toBe(695);
    expect(k.contents?.join(" ")).toContain("2 trådløse mikrofoner");
  });

  it("32\" skærm findes med 3-fod stativ, og 55\" er også 3-fod", () => {
    const s32 = rentalProducts.find((p) => p.id === "skaerm_32")!;
    const s55 = rentalProducts.find((p) => p.id === "skaerm_55")!;
    expect(s32.price).toBe(395);
    expect(s32.image).toBe("/images/product-skaerm-32.png");
    expect(s32.contents).toContain("3-fod stativ");
    expect(s55.contents).toContain("3-fod stativ");
    expect(s55.contents).not.toContain("Gulvstativ");
    expect(s55.desc_da).toContain("3-fod");
  });

  it("karaokepakkerne har stærke rabatter og korrekt sum af dele", () => {
    const lille = rentalProducts.find((p) => p.id === "pakke_karaoke")!;
    const fest = rentalProducts.find((p) => p.id === "pakke_karaoke_fest")!;

    // Karaokepakken: maskine 695 + 32" skærm 395 + lille højtalerpakke 395 = 1485 → 1100 (spar 385)
    expect(lille.bundle!.parts.map((x) => x.productId)).toEqual(["karaoke", "skaerm_32", "party"]);
    const lilleSum = lille.bundle!.parts.reduce((s, x) => s + x.price, 0);
    expect(lilleSum).toBe(1485);
    expect(lille.price).toBe(1100);
    expect(lille.bundle!.discount).toBe(385);
    expect(lilleSum - lille.price).toBe(lille.bundle!.discount);

    // Festpakken: 695 + 595 + 495 = 1785 → 1500 (spar 285) — festival = 495 fra 12. aug
    expect(fest.bundle!.parts.map((x) => x.productId)).toEqual(["karaoke", "skaerm_55", "festival"]);
    const festSum = fest.bundle!.parts.reduce((s, x) => s + x.price, 0);
    expect(festSum).toBe(1785);
    expect(fest.price).toBe(1500);
    expect(fest.bundle!.discount).toBe(285);
    expect(festSum - fest.price).toBe(fest.bundle!.discount);
  });

  it("karaokepakkerne indeholder højtalere — lille sæt i den lille, stort i den store", () => {
    const lille = rentalProducts.find((p) => p.id === "pakke_karaoke")!;
    const fest = rentalProducts.find((p) => p.id === "pakke_karaoke_fest")!;
    expect(lille.bundle!.parts.map((x) => x.productId)).toContain("party");
    expect(fest.bundle!.parts.map((x) => x.productId)).toContain("festival");
    expect(lille.contents?.join(" ")).toContain("Alto");
  });

  it("bundle-dele matcher de faktiske produktpriser (ingen forældede tal)", () => {
    const priceOf = (id: string) =>
      rentalProducts.find((p) => p.id === id)?.price ??
      speakers.find((p) => p.id === id)?.price ??
      addons.find((p) => p.id === id)?.price;
    for (const p of rentalProducts) {
      for (const part of p.bundle?.parts ?? []) {
        const actual = priceOf(part.productId);
        expect(
          actual,
          `${p.id} → ${part.productId} står til ${part.price} men koster ${actual}`
        ).toBe(part.price);
      }
    }
  });

  it("all addons except kørsel have an image", () => {
    for (const a of addons) {
      if (["levering_ud", "afhentning_retur", "levering_begge"].includes(a.id)) {
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

describe("Katalog-merge: nye tilvalg overlever et gammelt KV-katalog", () => {
  it("mergeAddons tilføjer tilvalg der mangler i KV (fx subwoofer)", async () => {
    const { addons: defaults } = await import("@/lib/products");
    // Simulér et KV-katalog gemt før subwooferen fandtes
    const kvCatalog = defaults.filter((a) => a.id !== "subwoofer");
    expect(kvCatalog.some((a) => a.id === "subwoofer")).toBe(false);

    const { mergeAddonsForTest } = await import("@/lib/useProducts");
    const merged = mergeAddonsForTest(kvCatalog);
    expect(merged.some((a) => a.id === "subwoofer")).toBe(true);
    expect(merged.find((a) => a.id === "subwoofer")!.price).toBe(295);
  });
});
