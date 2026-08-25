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
  NAV_CATEGORIES,
  PAUSEDE_PRODUKTER,
  PAUSEDE_SIDER,
  addons,
  erPaaPause,
  rentalProducts,
  speakers,
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
   * Sortimentet er skåret ned til højtalere, lys og røg. Skærme, projektor,
   * lærred og karaoke står på pause — se PAUSEDE_PRODUKTER i products.ts.
   *
   * Testen låser listen i begge retninger: et produkt der forsvinder for
   * kunderne uden en beslutning bliver fanget, og et produkt der bliver
   * genoptaget uden at komme ud af listen bliver det også.
   */
  it("præcis de besluttede produkter står på pause", () => {
    const pausede = [
      ...speakers.filter((s) => s.hidden).map((s) => s.id),
      ...addons.filter((a) => a.hidden).map((a) => a.id),
      ...rentalProducts.filter((r) => r.hidden).map((r) => r.id),
    ];
    expect(pausede.sort()).toEqual([...PAUSEDE_PRODUKTER].sort());
  });

  it("mikrofonerne er ikke på pause — de hører til lyden", () => {
    const mikrofoner = ["traadloes_mikrofon", "traadloes_mikrofon_pro", "headset", "headset_pro", "haandholdt_mikrofon", "haandholdt_mikrofon_pro"];
    for (const id of mikrofoner) {
      const p = rentalProducts.find((r) => r.id === id);
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

  it("menuen viser hverken karaoke eller AV-udstyr", () => {
    const ider = NAV_CATEGORIES.map((c) => c.id);
    expect(ider).not.toContain("karaoke");
    expect(ider).not.toContain("av");
    // Mikrofonerne flyttede med over i Lyd, så de ikke forsvandt sammen med AV
    const lyd = NAV_CATEGORIES.find((c) => c.id === "lyd")!;
    expect(lyd.links.map((l) => l.href)).toContain("/lej-mikrofon");
  });

  it("de pausede sider ligger der stadig og siger det selv", () => {
    for (const sti of PAUSEDE_SIDER) {
      const fil = join(process.cwd(), `src/app${sti}/page.tsx`);
      expect(existsSync(fil), `${sti} findes ikke længere`).toBe(true);
      const kilde = readFileSync(fil, "utf8");
      const siger =
        kilde.includes("PausetKategori") || kilde.includes("udlejes ikke lige nu");
      expect(siger, `${sti} står uden besked om pausen`).toBe(true);
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
