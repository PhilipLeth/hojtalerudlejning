/**
 * Annoncetekst der ville blive afvist — eller sælge det forkerte.
 *
 * De to fejl vi allerede har lavet i kontoen: overskrifter uden lejeord (så
 * en lejesøgning møder "Lyspakke fra 495 kr." og læser den som et køb), og
 * annoncer der peger på sider for produkter, vi har taget af sortimentet.
 */
import { describe, it, expect } from "vitest";
import {
  DESCRIPTION_MAX,
  HEADLINE_MAX,
  HEADLINE_MAX_COUNT,
  buildAdCopy,
  validateAdCopy,
  validateFinalUrl,
  type AdCopyProduct,
} from "@/lib/adsCopy";
import { intentThemes } from "@/lib/adsIntent";
import { PAUSEDE_SIDER, addons, rentalProducts, speakers } from "@/lib/products";

const SIDER = [
  ...speakers.map((s) => s.page),
  ...addons.map((a) => a.page),
  ...rentalProducts.map((r) => r.page),
].filter((p): p is string => !!p);

const ROEG: AdCopyProduct = {
  name: "Røgmaskine",
  price: 595,
  page: "/roegmaskine",
  contents: ["Røgmaskine", "1 liter røgvæske", "Fjernbetjening"],
};

const temaer = intentThemes(["røgmaskine"]);

describe("buildAdCopy", () => {
  it("holder sig under Googles tegngrænser i alle temaer", () => {
    for (const t of temaer) {
      const copy = buildAdCopy(ROEG, t);
      for (const h of copy.headlines) expect(h.length, h).toBeLessThanOrEqual(HEADLINE_MAX);
      for (const d of copy.descriptions) expect(d.length, d).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(copy.headlines.length).toBeLessThanOrEqual(HEADLINE_MAX_COUNT);
      expect(copy.descriptions.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("sætter temaets frase i både en overskrift og en beskrivelse", () => {
    for (const t of temaer) {
      const copy = buildAdCopy(ROEG, t);
      expect(validateAdCopy(copy, t.primary, SIDER), `${t.key}: ${t.primary}`).toEqual([]);
    }
  });

  it("skriver ingen priser den ikke har fra kataloget", () => {
    const copy = buildAdCopy(ROEG, temaer[0]);
    const beloeb = [...copy.headlines, ...copy.descriptions]
      .flatMap((l) => [...l.matchAll(/(\d[\d.]*)\s*kr/gi)].map((m) => Number(m[1].replace(/\./g, ""))));
    expect(beloeb.length).toBeGreaterThan(0);
    for (const b of beloeb) expect([ROEG.price, 495]).toContain(b);
  });

  it("peger på produktets egen side", () => {
    expect(buildAdCopy(ROEG, temaer[0]).finalUrl).toBe("https://lejhojtaler.dk/roegmaskine");
    expect(buildAdCopy(ROEG, temaer[0]).path1).toBe("roegmaskine");
  });

  it("skriver ikke 'i København' bag en frase der allerede siger København", () => {
    const geo = temaer.find((t) => t.key === "geo")!;
    const copy = buildAdCopy(ROEG, geo);
    const dobbelt = [...copy.headlines, ...copy.descriptions].filter(
      (l) => (l.toLowerCase().match(/københavn/g) ?? []).length > 1,
    );
    expect(dobbelt).toEqual([]);
    expect(validateAdCopy(copy, geo.primary, SIDER)).toEqual([]);
  });

  it("bevarer produktnavnets egen skrivemåde i overskriften", () => {
    // Keywordet er skrevet med småt; produktet hedder Mackie Thump GO
    const mackie = { name: "Mackie Thump GO", price: 395, page: "/mackie-thump-go" };
    const copy = buildAdCopy(mackie, intentThemes(["mackie thump go"])[0]);
    expect(copy.headlines[0]).toBe("Lej Mackie Thump GO");
  });

  it("virker også for et produkt uden contents", () => {
    const copy = buildAdCopy({ name: "Subwoofer", price: 395, page: "/subwoofer" }, temaer[0]);
    expect(validateAdCopy(copy, temaer[0].primary, SIDER)).toEqual([]);
  });
});

describe("validateAdCopy", () => {
  const gyldig = buildAdCopy(ROEG, temaer[0]);

  it("fanger en overskrift over grænsen", () => {
    const fejl = validateAdCopy(
      { ...gyldig, headlines: [...gyldig.headlines.slice(0, 2), "En overskrift der er alt for lang til Google"] },
      temaer[0].primary,
      SIDER,
    );
    expect(fejl.join(" ")).toMatch(/over 30 tegn/);
  });

  it("fanger at frasen mangler i overskrifterne", () => {
    const fejl = validateAdCopy(
      { ...gyldig, headlines: ["Ingen Depositum", "Alt Udstyr Inkluderet", "Lejhøjtaler.dk"] },
      temaer[0].primary,
      SIDER,
    );
    expect(fejl.join(" ")).toMatch(/står ikke i nogen overskrift/);
  });

  it("fanger for få overskrifter", () => {
    const fejl = validateAdCopy({ ...gyldig, headlines: [gyldig.headlines[0]] }, temaer[0].primary, SIDER);
    expect(fejl.join(" ")).toMatch(/Mindst 3 overskrifter/);
  });
});

describe("validateFinalUrl", () => {
  it("godtager en rigtig produktside", () => {
    expect(validateFinalUrl("https://lejhojtaler.dk/roegmaskine", SIDER)).toEqual([]);
  });

  it("afviser en side vi har taget af sortimentet", () => {
    const pauset = PAUSEDE_SIDER.find((p) => SIDER.includes(p));
    expect(pauset, "der skal findes mindst én pauset produktside").toBeTruthy();
    expect(validateFinalUrl(`https://lejhojtaler.dk${pauset}`, SIDER).join(" ")).toMatch(/på pause/);
  });

  it("afviser en side der ikke findes", () => {
    expect(validateFinalUrl("https://lejhojtaler.dk/findes-ikke", SIDER).join(" ")).toMatch(/findes ikke/);
  });

  it("afviser et fremmed domæne", () => {
    expect(validateFinalUrl("https://example.com/roeg", SIDER).join(" ")).toMatch(/uden for lejhojtaler\.dk/);
  });
});
