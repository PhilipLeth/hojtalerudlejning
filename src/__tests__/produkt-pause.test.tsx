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
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { speakers, addons, rentalProducts } from "@/lib/products";

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
  it("de tre nye produkter ligger skjult indtil foto og indhold er bekræftet", () => {
    const skjulte = [
      ...speakers.filter((s) => s.hidden).map((s) => s.id),
      ...addons.filter((a) => a.hidden).map((a) => a.id),
      ...rentalProducts.filter((r) => r.hidden).map((r) => r.id),
    ];
    expect(skjulte.sort()).toEqual(["hojtaler_100", "mixer_lille", "mixer_stor"]);
  });

  it("useProducts filtrerer skjulte væk, så de ikke kan bookes", () => {
    const up = readFileSync(join(process.cwd(), "src/lib/useProducts.ts"), "utf8");
    expect(up).toMatch(/filter\(\(p\) => !p\.hidden\)/);
  });
});
