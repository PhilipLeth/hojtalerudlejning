/**
 * Stemningsbilleder i hero (28. sept 2026). Philip: "Skal vi rulle det ud på
 * alle kategorier og produkt-siderne? Sørg for at bygge løsning til at editere
 * dem på backend efterfølgende." Testen holder de tre dele sammen: siderne,
 * admin-listen og middlewaren, der skriver det godkendte billede ind.
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { globSync } from "node:fs";
import { heroSider, heroSti, heroStandard, HERO_FALLBACK, HERO_STANDARD, heroReferencer } from "@/lib/heroBilleder";
import { TOPMENU } from "@/lib/products";

const læs = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("Stemningsbilleder", () => {
  it("stien er den danske, uanset sprog", () => {
    expect(heroSti("/en/festpakke-stor")).toBe("/festpakke-stor");
    expect(heroSti("/festpakke-stor/")).toBe("/festpakke-stor");
    expect(heroSti("/en")).toBe("/");
  });

  it("alle topmenuens kategorier kan få et stemningsbillede", () => {
    const stier = heroSider().map((s) => s.sti);
    for (const k of TOPMENU) expect(stier, `${k.href} mangler i admin`).toContain(k.href);
  });

  it("hver side med et stemningsbillede kan redigeres i admin", () => {
    // Projektor og karaoke er på pause (ikke i prisarket) — de viser bare standardbilledet
    const stier = new Set([...heroSider().map((s) => s.sti), "/lej-projektor", "/karaoke"]);
    const filer = globSync("src/app/**/page.tsx", { cwd: process.cwd() });
    for (const f of filer) {
      const kilde = læs(f);
      for (const m of kilde.matchAll(/<StemningsBaggrund sti="([^"]+)"/g)) {
        expect(stier.has(m[1]), `${f}: ${m[1]} står ikke i heroSider()`).toBe(true);
      }
    }
  });

  it("hver side i admin viser rent faktisk et stemningsbillede", () => {
    for (const s of heroSider()) {
      const f = `src/app${s.sti}/page.tsx`;
      expect(existsSync(join(process.cwd(), f)), `${s.sti} har ingen side`).toBe(true);
      expect(læs(f), `${s.sti} viser ikke StemningsBaggrund`).toMatch(/StemningsBaggrund|ProductLanding|OccasionLanding|LydOgLysPakkerSide|TilbehoerSide/);
    }
  });

  it("hver side i admin har produktfotos at bygge billedet af", () => {
    for (const s of heroSider()) expect(heroReferencer(s).length, s.sti).toBeGreaterThan(0);
  });

  it("kodens standardbilleder findes, og ellers bruges det fælles", () => {
    for (const src of [HERO_FALLBACK, ...Object.values(HERO_STANDARD)]) {
      expect(existsSync(join(process.cwd(), "public", src)), src).toBe(true);
    }
    expect(heroStandard("/findes-ikke")).toBe(HERO_FALLBACK);
  });

  it("den gamle faste hero-baggrund er væk fra siderne", () => {
    const filer = [...globSync("src/app/**/page.tsx", { cwd: process.cwd() }), "src/components/ProductLanding.tsx", "src/components/OccasionLanding.tsx"];
    for (const f of filer) expect(læs(f), f).not.toContain('backgroundImage: "url(/images/hero.webp)"');
  });

  it("middlewaren og komponenten taler om samme markør og nøgle", () => {
    const mw = læs("functions/_middleware.ts");
    expect(mw).toContain('img[data-hero-sti]');
    expect(mw).toContain('"hero_manifest"');
    expect(mw).toContain("window.__HERO__");
    expect(læs("src/components/StemningsBaggrund.tsx")).toContain("data-hero-sti={sti}");
    expect(læs("src/lib/heroStandard.ts")).toContain('HERO_MANIFEST_KEY = "hero_manifest"');
  });

  it("intet går live uden et tryk, og der er et loft", () => {
    const api = læs("functions/api/hero.ts");
    expect(api).toContain("requireAdmin");
    expect(api).toMatch(/HERO_MAANEDSLOFT = \d+/);
    // Forslaget gemmes ingen steder — kun "publish" skriver i manifestet
    const generate = api.slice(api.indexOf('body.action !== "generate"'));
    expect(generate).not.toContain("HERO_MANIFEST_KEY");
    // Og admin-siden har ingen "kør alle"-knap (bulk er Philips beslutning)
    expect(læs("src/app/admin/stemningsbilleder/page.tsx")).not.toMatch(/alle sider på én gang|Generér alle|Lav alle/i);
  });
});
