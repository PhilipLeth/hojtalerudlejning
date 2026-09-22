import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { bundleListPrice, bundlePrice, catalogPrice, speakers, addons, rentalProducts, dayMultiplier, startPrice, cheapestSpeakerPrice, bundleIncludesDelivery, LYDMAND_PAKKER, KATEGORI_PAKKER, DELIVERY_ADDON_IDS, STROEM_ADDON_IDS } from "@/lib/products";
import { stockItems } from "@/lib/stock";
import { mergeAddonsForTest } from "@/lib/useProducts";

describe("Products data", () => {
  it("har fem højtalerpakker i stigen 0-30, 30-50, 50-100", () => {
    expect(speakers).toHaveLength(5);
    expect(speakers.filter((s) => s.hidden)).toHaveLength(0);
    // Trinnet til 50-100 kom til 25. august 2026 og har sin egen side
    const stor = speakers.find((s) => s.id === "hojtaler_100")!;
    expect(stor.price).toBe(1295); // produktarket 17. sept 2026 (før 1495)
    expect(stor.da.capacity).toBe("50-100 pers.");
    expect(stor.page).toBe("/hojtalerpakke-bas");
  });

  it("thump go is 445 kr (prisarket 21. sept 2026, arkets lille batterihøjtaler)", () => {
    expect(speakers.find((s) => s.id === "thumpgo")!.price).toBe(445);
  });

  it("party speaker is 595 kr", () => {
    expect(speakers.find((s) => s.id === "party")!.price).toBe(595);
  });

  it("soundboks koster 695 kr (produktarket 17. sept 2026)", () => {
    expect(speakers.find((s) => s.id === "soundboks")!.price).toBe(695);
  });

  it("festival speaker is 795 kr (højtaler 30-50, produktarket 17. sept 2026)", () => {
    expect(speakers.find((s) => s.id === "festival")!.price).toBe(795);
  });

  it("startPrice matches cheapest speaker", () => {
    const cheapest = Math.min(...speakers.map((s) => s.price));
    expect(startPrice).toBe(cheapest);
    expect(startPrice).toBe(445); // prisarket 21. sept 2026: Thump GO er billigst
  });

  it("cheapestSpeakerPrice ignores hidden speakers", () => {
    const list = speakers.map((s) => (s.id === "thumpgo" ? { ...s, hidden: true } : s));
    expect(cheapestSpeakerPrice(list)).toBe(595);
  });

  it("all speakers have product and mood images", () => {
    for (const s of speakers) {
      expect(s.product).toMatch(/^\/images\/product-.+\.(webp|svg)$/);
      expect(s.mood).toMatch(/^\/images\/mood-.+\.webp$/);
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

  it("lys is 395 kr (produktarket 17. sept 2026)", () => {
    expect(addons.find((a) => a.id === "lys")!.price).toBe(395);
  });

  it("rog is 245 kr (produktarket 17. sept 2026)", () => {
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

  it("festpakkerne er højtalerpakke + lysbar, og prisen kommer fra delene", () => {
    const lille = rentalProducts.find((p) => p.id === "pakke_fest_lille")!;
    const stor = rentalProducts.find((p) => p.id === "pakke_fest_stor")!;
    expect(lille.bundle?.parts.map((x) => x.productId)).toEqual(["party", "lys"]);
    // Prisen står ikke i data: den er delenes sum minus pakkerabatten.
    // bundle-live-prices.test.ts vogter selve udregningen.
    expect(lille.price).toBe(bundlePrice(bundleListPrice(lille), lille.bundle!));
    expect(stor.bundle?.parts.map((x) => x.productId)).toEqual(["festival", "lys"]);
    expect(stor.price).toBe(bundlePrice(bundleListPrice(stor), stor.bundle!));
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
    expect(hvid.image).toBe("/images/product-lyskaeder-v2-white.webp");
    expect(farvet.image).toBe("/images/product-lyskaeder-farvet-v2-white.webp");
    expect(hvid.price).toBe(195);
    expect(farvet.price).toBe(195);
  });

  it("uplights: enkelt 195 kr og 4-pak 595 kr (produktarket 17. sept 2026)", () => {
    const single = rentalProducts.find((p) => p.id === "uplight")!;
    const pack = rentalProducts.find((p) => p.id === "uplight_4")!;
    expect(single.price).toBe(195);
    expect(pack.price).toBe(595);
    expect(single.page).toBe("/uplights");
    expect(pack.page).toBe("/uplights");
    expect(pack.contents?.join(" ")).toContain("4×");
  });

  it("PRO-mikrofoner findes med egne billeder (Shure)", () => {
    const traadloesPro = rentalProducts.find((p) => p.id === "traadloes_mikrofon_pro")!;
    const haandholdtPro = rentalProducts.find((p) => p.id === "haandholdt_mikrofon_pro")!;
    expect(traadloesPro.image).toBe("/images/product-mikrofon-pro-v2-white.webp");
    expect(traadloesPro.price).toBe(595);
    expect(haandholdtPro.image).toBe("/images/product-mikrofon-kabel-pro-v2-white.webp");
    expect(haandholdtPro.price).toBe(345); // produktarket 17. sept 2026
  });

  it("subwoofer findes som tilvalg med Behringer 12\" og egen produktside", () => {
    const sub = addons.find((a) => a.id === "subwoofer")!;
    expect(sub).toBeDefined();
    expect(sub.price).toBe(495); // produktarket 17. sept 2026
    expect(sub.page).toBe("/subwoofer");
    expect(sub.image).toBe("/images/product-subwoofer-v2-white.webp");
    expect(sub.da.label).toContain("Subwoofer");
    expect(sub.contents?.join(" ")).toContain("Behringer");
  });

  it("festpakkerne tilbyder røgmaskine og stativer som tilvalg (produktarket 19. sept 2026)", () => {
    for (const id of ["pakke_fest_lille", "pakke_fest_stor", "pakke_fest_100"]) {
      const pakke = rentalProducts.find((p) => p.id === id)!;
      expect(pakke.allowedAddons).toContain("rog");
      expect(pakke.allowedAddons).toContain("stativer");
      expect(pakke.allowedAddons).not.toContain("subwoofer");
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
    expect(s32.image).toBe("/images/product-skaerm-32-white.webp");
    expect(s32.contents).toContain("3-fod stativ");
    expect(s55.contents).toContain("3-fod stativ");
    expect(s55.contents).not.toContain("Gulvstativ");
    expect(s55.desc_da).toContain("3-fod");
    expect(s55.image).toBe("/images/product-skaerm-white.webp");
    expect(existsSync("public/images/product-skaerm-white.webp")).toBe(true);
  });

  it("karaokepakkerne består af maskine, skærm og højtalere", () => {
    const lille = rentalProducts.find((p) => p.id === "pakke_karaoke")!;
    const fest = rentalProducts.find((p) => p.id === "pakke_karaoke_fest")!;

    // Karaokepakken: maskine + 32" skærm + højtalerpakke 0-30
    expect(lille.bundle!.parts.map((x) => x.productId)).toEqual(["karaoke", "skaerm_32", "party"]);
    const lilleSum = bundleListPrice(lille);
    expect(lille.price).toBe(bundlePrice(lilleSum, lille.bundle!));
    expect(lilleSum - lille.price).toBe(lille.bundle!.discount);

    // Festpakken: maskine + 55" skærm + højtalerpakke 30-50
    expect(fest.bundle!.parts.map((x) => x.productId)).toEqual(["karaoke", "skaerm_55", "festival"]);
    const festSum = bundleListPrice(fest);
    expect(fest.price).toBe(bundlePrice(festSum, fest.bundle!));
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
        // En del kan være flere af samme produkt — lydmand i 4 timer er 4 × timeprisen
        const actual = (priceOf(part.productId) ?? NaN) * (part.qty ?? 1);
        expect(
          actual,
          `${p.id} → ${part.productId} står til ${part.price} men koster ${actual}`
        ).toBe(part.price);
      }
    }
  });

  it("Julehyggen er Thump GO, lyskæde og lyseffekt", () => {
    const p = rentalProducts.find((x) => x.id === "jul_hygge")!;
    expect(p.price).toBe(bundlePrice(bundleListPrice(p), p.bundle!));
    expect(p.page).toBe("/julehyggen");
    expect(p.bundle!.parts.map((x) => x.productId)).toEqual(["thumpgo", "lyskaeder", "lyseffekt"]);
  });

  it("DJ-hovedtelefonerne er på pause: arkets pult er en AlphaTheta XDJ uden hovedtelefoner (19. sept 2026)", () => {
    const hp = rentalProducts.find((p) => p.id === "dj_headphones")!;
    expect(hp.hidden).toBe(true);
    const pult = rentalProducts.find((p) => p.id === "dj_pult")!;
    expect(pult.price).toBe(1695);
    expect(pult.name_da).toBe("DJ-pult · AlphaTheta XDJ");
    expect(pult.contents.join(" ")).not.toMatch(/hovedtelefoner|iPad|FLX4/);
  });

  it("visible equipment addons have an image", () => {
    // Kun ydelser behøver ikke et produktfoto.
    // Kørsel er en ydelse, ikke et stykke grej — den har intet produktfoto.
    // Strømvarerne heller ikke: en stikdåse til 25 kr sælger ikke sig selv på
    // et foto, og de vises som afkrydsninger i checkout, ikke som kort.
    const udenFoto = [...DELIVERY_ADDON_IDS, ...STROEM_ADDON_IDS];
    for (const a of addons) {
      if (a.hidden) continue; // skjulte kladder kan afvente model og foto
      if (a.ydelse) continue; // en ydelse må have et foto (lydmand har), men skal ikke
      if (udenFoto.includes(a.id) || a.intern) {
        expect(a.image).toBeNull();
      } else {
        expect(a.image).toMatch(/^\/images\/product-.+\.(webp|svg|jpg)$/);
      }
    }
  });

  it("lydmanden er en kundevendt ydelse pr. time, faktureringsgebyr 100 kr en intern vare (11. sept 2026)", () => {
    const lydmand = addons.find((a) => a.id === "lydmand");
    const gebyr = addons.find((a) => a.id === "faktureringsgebyr");
    // Arkets "Teknikertime", 1.195 kr pr. time (prisarket 21. sept 2026)
    expect(lydmand).toMatchObject({ price: 1195, ydelse: true, page: "/lydmand", image: "/images/product-lydmand-white.webp", priceUnit: { da: "kr/time", en: "DKK/hour" } });
    // 13. sept 2026: "Lydmand, 4 timer" som egen vare er væk — timerne er antallet på den ene lydmand
    expect(addons.find((a) => a.id === "lydmand_4t")).toBeUndefined();
    expect(lydmand?.da.desc).not.toMatch(/kommentar/);
    expect(lydmand?.intern).toBeFalsy();
    expect(lydmand?.da.desc).toMatch(/pr\. time/);
    expect(gebyr).toMatchObject({ price: 100, intern: true, image: null });
    // De skal kunne lægges på en ordre fra admin — altså ikke skjult
    expect(lydmand?.hidden).toBeFalsy();
    expect(gebyr?.hidden).toBeFalsy();
  });

  it("interne varer holdes ude af lageret, men beholder flaget fra et gammelt KV-katalog", () => {
    const lager = stockItems({ speakers, addons, rentalProducts }).map((i) => i.id);
    expect(lager).not.toContain("lydmand"); // ydelse — står ikke på en hylde
    expect(lager).not.toContain("faktureringsgebyr");
    // Et KV-katalog gemt før flaget fandtes må ikke sende gebyret ud til kunden
    const gammelt = addons.map((a) => (a.intern ? { ...a, intern: undefined } : a));
    const flettet = mergeAddonsForTest(gammelt);
    expect(flettet.find((a) => a.id === "faktureringsgebyr")?.intern).toBe(true);
  });

  it("pakkerne med lydmand har kørslen og de 4 timer med — og bookingen kan se det", () => {
    for (const id of LYDMAND_PAKKER) {
      const p = rentalProducts.find((r) => r.id === id)!;
      const dele = p.bundle!.parts.map((x) => x.productId);
      expect(dele, `${id} mangler levering`).toContain("levering_begge");
      expect(dele, `${id} mangler lydmand`).toContain("lydmand");
      // Delprisen er fire timer af katalogets timepris, ikke et tal skrevet her
      expect(p.bundle!.parts.find((x) => x.productId === "lydmand")).toMatchObject({
        qty: 4,
        price: catalogPrice("lydmand") * 4,
      });
      expect(bundleIncludesDelivery(p)).toBe("levering_begge");
      // Kørslen må ikke også kunne vælges som tilvalg — så betales den to gange
      for (const d of DELIVERY_ADDON_IDS) expect(p.allowedAddons, `${id} tilbyder ${d} oveni`).not.toContain(d);
      expect(KATEGORI_PAKKER["/lej-hojtaler"]).toContain(id);
    }
    expect(bundleIncludesDelivery(rentalProducts.find((r) => r.id === "pakke_fest_lille"))).toBeNull();
    expect(bundleIncludesDelivery(undefined)).toBeNull();
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

  it("festival speaker + lys + rog weekend = 1785 kr", () => {
    const speaker = 695 * dayMultiplier[3];
    const lys = 495;
    const rog = 595;
    expect(Math.round(speaker + lys + rog)).toBe(1785);
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
    expect(merged.find((a) => a.id === "subwoofer")!.price).toBe(495); // produktarket 17. sept 2026
  });
});
