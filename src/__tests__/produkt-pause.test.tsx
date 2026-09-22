/**
 * Pause i produktoversigten.
 *
 * `hidden` fandtes i forvejen og filtrerer produktet væk hos kunden
 * (useProducts) og i DBA-feedet. Men kontakten lå nederst inde i det foldede
 * kort, så Frederik bad om "en mulighed for at pause produkter" — funktionen
 * var der, betjeningen var ikke.
 *
 * Testen læser kilden i stedet for at rendere siden. /admin/produkter trækker
 * admin-layoutet med sig, og det kræver matchMedia og localStorage, som jsdom
 * ikke har. Det er samme greb som order-completeness.test.tsx bruger på
 * book.ts: her er spørgsmålet hvor knappen SIDDER, og det kan kilden svare på.
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  AFVENTER_FOTO,
  NAV_CATEGORIES,
  PAUSEDE_PRODUKTER,
  PAUSEDE_SIDER,
  UDGAAEDE_IDER,
  UDGAAEDE_PAKKER,
  addons,
  erPaaPause,
  rentalProducts,
  speakers,
  udgaaetPakke,
} from "@/lib/products";

const src = readFileSync(join(process.cwd(), "src/app/admin/produkter/page.tsx"), "utf8");

describe("/admin/produkter — pause", () => {
  it("har en PauseKnap-komponent", () => {
    expect(src).toContain("function PauseKnap(");
    expect(src).toMatch(/Genoptag/);
  });

  it("knappen står i korthovedet for alle tre produkttyper", () => {
    // summary er kortets hoved — knappen skal kunne nås uden at folde ud
    const summaries = src.split("<summary").slice(1);
    const medPause = summaries.filter((s) => s.slice(0, s.indexOf("</summary>")).includes("<PauseKnap"));
    expect(medPause).toHaveLength(3); // højtalere, lejeprodukter, tilvalg
  });

  it("knappen skifter hidden — ikke noget andet felt", () => {
    for (const opdater of ["updateSpeaker", "updateAddon", "updateRental"]) {
      const m = new RegExp(`<PauseKnap[\\s\\S]*?${opdater}\\(i, \\{ hidden: !`);
      expect(src).toMatch(m);
    }
  });

  it("pause er noget andet end udsolgt — lager røres ikke", () => {
    const knap = src.slice(src.indexOf("function PauseKnap("), src.indexOf("function StockBadge("));
    expect(knap).not.toMatch(/stock|lager|inventory/i);
  });
});

describe("hidden virker hele vejen ud", () => {
  /**
   * Stroboskop afventer indkøb. Skærme, projektor, lærred og karaoke kom i udlejning
   * igen 8. september 2026 — se PAUSEDE_PRODUKTER i products.ts.
   *
   * Testen låser listen i begge retninger: et produkt der forsvinder for
   * kunderne uden en beslutning bliver fanget, og et produkt der bliver
   * genoptaget uden at komme ud af listen bliver det også. Mekanikken bliver
   * stående, så Frederik kan pause fra /admin/produkter.
   */
  it("præcis de besluttede produkter står på pause", () => {
    const pausede = [
      ...speakers.filter((s) => s.hidden).map((s) => s.id),
      ...addons.filter((a) => a.hidden).map((a) => a.id),
      ...rentalProducts.filter((r) => r.hidden).map((r) => r.id),
    ];
    // Tre grunde til at være skjult: reelt pauset (produktarket 17. sept 2026),
    // i kataloget med arkets pris men uden et ærligt produktfoto endnu, eller
    // udgået fordi pakken ikke står i det nye prisark (22. sept 2026).
    expect(pausede.sort()).toEqual([...PAUSEDE_PRODUKTER, ...AFVENTER_FOTO, ...UDGAAEDE_IDER].sort());
    for (const id of AFVENTER_FOTO) expect(PAUSEDE_PRODUKTER, `${id} står i begge lister`).not.toContain(id);
    for (const id of UDGAAEDE_IDER) {
      expect(PAUSEDE_PRODUKTER, `${id} står i begge lister`).not.toContain(id);
      expect(AFVENTER_FOTO, `${id} står i begge lister`).not.toContain(id);
    }
  });

  it("mikrofonerne er ikke på pause — de hører til lyden", () => {
    // PRO-varianterne gik på pause med produktarket 17. sept 2026: arkets trådløse mikrofon
    // og headset ER Shure-modellerne (445 kr), så der er ikke længere to af hver.
    const mikrofoner = ["mikrofon", "headset", "mikrofon_kabel", "haandholdt_mikrofon_pro"];
    // Efter sammenlægningen ligger de to almindelige mikrofoner som tilvalg og
    // de to PRO som udlejningsvarer — testen skal se hele kataloget, ikke én liste.
    const katalog = [...addons, ...rentalProducts];
    for (const id of mikrofoner) {
      const p = katalog.find((r) => r.id === id);
      expect(p, `${id} findes ikke i kataloget`).toBeTruthy();
      expect(p!.hidden, `${id} er sat på pause`).toBeFalsy();
    }
  });

  it("en pakke med en pauset del er selv på pause", () => {
    // Ellers sælger vi Konferencepakken uden den skærm, den lover
    for (const p of rentalProducts) {
      if (p.hidden) continue;
      for (const del of p.bundle?.parts ?? []) {
        expect(erPaaPause(del.productId), `${p.id} indeholder ${del.productId}, som er på pause`).toBe(false);
      }
    }
  });

  it("menuen har en vej ind til AV-udstyret igen", () => {
    // Under pausen var kategorien væk med vilje. Nu kan produkterne bookes, og
    // uden en vej ind lå siderne som blindgyder uden intern linkværdi.
    const av = NAV_CATEGORIES.find((c) => c.id === "av");
    expect(av, "AV-kategorien mangler i menuen").toBeTruthy();
    const href = av!.links.map((l) => l.href);
    expect(href).toContain("/skaerm");
    expect(href).toContain("/karaoke");
    // Mikrofonerne blev i Lyd, hvor de hører til: de lejes til talen, hvor
    // højtaleren alligevel er med
    const lyd = NAV_CATEGORIES.find((c) => c.id === "lyd")!;
    expect(lyd.links.map((l) => l.href)).toContain("/lej-mikrofon");
  });

  it("de pausede sider ligger der stadig og siger det selv", () => {
    for (const sti of PAUSEDE_SIDER) {
      const fil = join(process.cwd(), `src/app${sti}/page.tsx`);
      expect(existsSync(fil), `${sti} findes ikke længere`).toBe(true);
      const kilde = readFileSync(fil, "utf8");
      // En udgået pakkes side siger det gennem ProductLanding, som slår
      // productId op i UDGAAEDE_PAKKER og skriver "Denne pakke udgår" med et
      // link til afløseren. De andre pausede sider siger det i deres egen kilde.
      const siger =
        kilde.includes("ProductLanding") ||
        kilde.includes("PausetKategori") ||
        kilde.includes("udlejes ikke lige nu");
      expect(siger, `${sti} står uden besked om pausen`).toBe(true);
    }
  });

  /**
   * En udgået pakke må ikke være en blindgyde.
   *
   * Siderne bliver liggende, fordi de har deres plads i Google — men så SKAL
   * de sende kunden et sted hen, og afløseren skal findes. Ellers har vi
   * byttet en bookbar pakke ud med en side, der kun siger nej.
   */
  it("hver udgået pakke har en afløserside der findes", () => {
    for (const [id, maal] of Object.entries(UDGAAEDE_PAKKER)) {
      expect(udgaaetPakke(id)).toBe(maal);
      expect(existsSync(join(process.cwd(), `src/app${maal}/page.tsx`)), `${id} → ${maal} findes ikke`).toBe(true);
      const p = rentalProducts.find((r) => r.id === id);
      expect(p, `${id} findes ikke i kataloget`).toBeTruthy();
      expect(p!.hidden, `${id} er udgået, men stadig synlig`).toBe(true);
      // Afløseren må ikke selv være udgået — så var vi ikke kommet videre
      const afloeserPakke = rentalProducts.find((r) => r.page === maal);
      if (afloeserPakke) expect(afloeserPakke.hidden, `${maal} er selv udgået`).toBeFalsy();
    }
  });

  it("annoncerne for de udgåede pakker er slukket", () => {
    // PAUSEDE_SIDER er det, adsCopy.validateFinalUrl afviser landingssider på
    for (const [id, ] of Object.entries(UDGAAEDE_PAKKER)) {
      const side = rentalProducts.find((r) => r.id === id)!.page!;
      expect(PAUSEDE_SIDER, `${side} er ikke lukket for annoncer`).toContain(side);
    }
  });

  it("useProducts filtrerer skjulte væk, så de ikke kan bookes", () => {
    const up = readFileSync(join(process.cwd(), "src/lib/useProducts.ts"), "utf8");
    expect(up).toMatch(/filter\(\(p\) => !p\.hidden\)/);
  });

  it("serveren afviser et pauset produkt, så det aldrig kan betales", () => {
    const pricing = readFileSync(join(process.cwd(), "functions/api/_lib/pricing.ts"), "utf8");
    expect(pricing).toMatch(/if \(!id \|\| hidden/);
  });
});
