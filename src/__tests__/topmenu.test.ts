/**
 * Topmenuen er en produktshop (Philip, 28. sept 2026): "Lyd, Lys & effekter,
 * Lyd- og lyspakker, Tilbehør skal op i topmenuen", mens eventløsninger, cases,
 * julefrokost og halloween "pakkes lidt ind under fold ud menu".
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { TOPMENU, TOPMENU_MERE } from "@/lib/products";
import { EN_PAGES } from "@/lib/enPages";

const header = readFileSync(join(process.cwd(), "src/components/SiteHeader.tsx"), "utf8");

describe("Topmenuen", () => {
  it("har de fire produktkategorier i den rækkefølge", () => {
    expect(TOPMENU.map((l) => l.label)).toEqual(["Lyd", "Lys & effekter", "Lyd- og lyspakker", "Tilbehør"]);
  });

  it("hver kategori har en side på begge sprog", () => {
    for (const { href } of TOPMENU) {
      expect(existsSync(join(process.cwd(), `src/app${href}/page.tsx`)), `${href} mangler`).toBe(true);
      expect(EN_PAGES, `${href} mangler på engelsk`).toContain(href);
    }
  });

  it("hver dropdown fører til sider, der findes på begge sprog", () => {
    for (const k of TOPMENU) {
      expect(k.links.length, `${k.label} har ingen dropdown`).toBeGreaterThan(0);
      for (const { href } of k.links.flatMap((l) => [l, ...(l.under ?? [])])) {
        const sti = href.split("#")[0];
        expect(existsSync(join(process.cwd(), `src/app${sti}/page.tsx`)), `${href} mangler`).toBe(true);
        expect(EN_PAGES, `${href} mangler på engelsk`).toContain(sti);
      }
    }
  });

  it("tilbehør har ikke egne menupunkter under Lyd", () => {
    // Philip 28. sept 2026: "Højtalerstativer, sub osv. skal ikke have sit eget menupunkt"
    const lyd = TOPMENU.find((k) => k.href === "/lydanlaeg")!;
    const alle = lyd.links.flatMap((l) => [l.href, ...(l.under ?? []).map((u) => u.href)]);
    for (const sti of ["/hojtalerstativer", "/subwoofer", "/mixer"]) expect(alle).not.toContain(sti);
    const batteri = lyd.links.find((l) => l.label === "Batterihøjtalere");
    expect(batteri?.under?.map((u) => u.href)).toEqual(["/soundboks-4", "/mackie-thump-go"]);
  });

  it("topmenuen har ingen 'Mest udlejede'-knap", () => {
    // Philip 28. sept 2026: "Fjern 'mest udlejede' fra top menu"
    expect(header).not.toMatch(/>\{en \? "Most rented" : "Mest udlejede"\}</);
    expect(header).not.toContain("pro-quote");
  });

  it("events og sæsoner står i burgermenuen, ikke i topmenuen", () => {
    expect(TOPMENU_MERE.links.map((l) => l.href)).toEqual(["/eventloesninger", "/cases"]);
    for (const sti of ["/eventloesninger", "/cases", "/julefrokost", "/halloween"]) {
      expect(TOPMENU.map((l) => l.href)).not.toContain(sti);
    }
    // Sæsonerne står i burgermenuen, ikke i topmenuen (28. sept 2026: de stod to steder)
    expect(header).not.toContain("activeSeasons");
    const burger = readFileSync(join(process.cwd(), "src/components/BurgerMenu.tsx"), "utf8");
    expect(burger).toContain("activeSeasons()");
    expect(burger).toContain("TOPMENU_MERE");
  });
});
