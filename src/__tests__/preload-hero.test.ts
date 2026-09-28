import { describe, expect, it } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Root-layoutet preloader ét billede med fetchPriority="high".
 *
 * Der stod events/reception-detail.webp — forsidens galleribillede på 533 kB —
 * og det blev hentet med høj prioritet på alle 250 sider. Kun forsiden viser
 * det; de 165 sider, der bruger hero.webp som CSS-baggrund, brugte altså
 * halvdelen af deres første megabyte på et billede, browseren smed væk igen.
 *
 * Et preload, der peger på noget siden ikke viser, er værre end intet preload:
 * det stjæler båndbredde fra det element, der faktisk er LCP. Testen holder
 * fast i, at filen både findes, er lille nok til at være forrest i køen, og
 * rent faktisk er den, siderne tegner.
 */
const ROD = join(__dirname, "..", "..");
const layout = readFileSync(join(ROD, "src/app/layout.tsx"), "utf8");

/** Kun preload med høj prioritet tæller — de øvrige ligger bag i køen. */
function preloadetBillede(): string {
  const blok = layout.match(/<link\s+rel="preload"[\s\S]*?fetchPriority="high"[\s\S]*?\/>/);
  expect(blok, "root-layoutet skal preloade præcis ét billede med høj prioritet").not.toBeNull();
  const href = blok![0].match(/href="([^"]+)"/);
  expect(href, "preloadet skal have en href").not.toBeNull();
  return href![1];
}

/** Alle .tsx-filer under src/, fladt udfoldet. */
function kildefiler(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const sti = join(dir, e.name);
    if (e.isDirectory()) return e.name === "__tests__" ? [] : kildefiler(sti);
    return e.name.endsWith(".tsx") ? [sti] : [];
  });
}

describe("root-layoutets hero-preload", () => {
  it("peger på en fil der findes i public/", () => {
    const href = preloadetBillede();
    expect(existsSync(join(ROD, "public", href)), `${href} findes ikke i public/`).toBe(true);
  });

  it("peger på det billede siderne faktisk tegner som hero", () => {
    const href = preloadetBillede();
    const brugt = kildefiler(join(ROD, "src")).filter((f) =>
      readFileSync(f, "utf8").includes(`url(${href})`),
    );
    expect(
      brugt.length,
      `ingen side tegner ${href} som baggrund — preloadet henter noget, browseren smider væk`,
    ).toBeGreaterThan(0);
  });

  it("er lille nok til at ligge forrest i køen", () => {
    const href = preloadetBillede();
    const kB = readFileSync(join(ROD, "public", href)).byteLength / 1024;
    // 533 kB var fejlen. Et preload forrest i køen skal kunne nå frem før
    // CSS'en er parset, ellers udskyder det netop det, det skulle fremskynde.
    expect(kB, `${href} fylder ${Math.round(kB)} kB`).toBeLessThan(120);
  });
});
