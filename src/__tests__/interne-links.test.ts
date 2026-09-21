import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Links skal føre et sted hen, hvor kunden kan komme videre.
 *
 * To fejl, der havde stået længe, og som ingen test fangede:
 *
 *  1. "Book højtaler nu" pegede på /book. Kurven er tom, indtil kunden har
 *     valgt noget, så knappen landede på "Ingen produkter valgt". Det gjaldt
 *     forsiden af hver kategoriside, menuen og bloggen — og /blog's "tilbage
 *     til forsiden" pegede også på /book.
 *  2. /lej-hojtaler, /festlyd, /lydudstyr og /kobenhavn havde ikke ét eneste
 *     produkt på siden. De tre sidste er annoncelandingssider: et betalt klik
 *     landede et sted, hvor der ikke var noget at booke.
 *
 * Testen læser kilden, ikke det byggede site, så den kører uden et build.
 */

const ROOT = process.cwd();
const læs = (p: string) => readFileSync(join(ROOT, p), "utf8");

function alleSider(dir: string, ud: string[] = []): string[] {
  for (const navn of readdirSync(dir)) {
    const sti = join(dir, navn);
    if (statSync(sti).isDirectory()) alleSider(sti, ud);
    else if (navn === "page.tsx") ud.push(sti.replace(ROOT + "/", ""));
  }
  return ud;
}

const kundesider = alleSider("src/app").filter((p) => !p.includes("/admin/") && !p.includes("/accounting"));

/**
 * De eneste steder, et link til den tomme kurv giver mening.
 *
 * Kurv-knappen vises kun, når der ER noget i kurven, og "Tilbage til booking"
 * på lejevilkårene er vejen tilbage til en booking, kunden er midt i.
 */
const MÅ_LINKE_TIL_BOOK = [
  "src/components/BookingDrawer.tsx",
  "src/app/lejevilkaar/page.tsx",
  "src/app/en/lejevilkaar/page.tsx",
];

describe("Ingen CTA sender kunden til en tom kurv", () => {
  it("der er sider at vogte", () => {
    expect(kundesider.length).toBeGreaterThan(100);
  });

  it("ingen kundeside linker til /book uden et produkt", () => {
    const synder: string[] = [];
    for (const p of [...kundesider, ...alleSider("src/components").concat(["src/components/BurgerMenu.tsx"])]) {
      if (MÅ_LINKE_TIL_BOOK.includes(p)) continue;
      let src: string;
      try {
        src = læs(p);
      } catch {
        continue;
      }
      if (/href="\/(?:en\/)?book"/.test(src)) synder.push(p);
      if (/href=\{bookHref\(\s*(?:null|undefined)?\s*[,)]/.test(src)) synder.push(`${p} (bookHref uden produkt)`);
    }
    expect(
      [...new Set(synder)],
      `sider der sender kunden til en tom kurv:\n${[...new Set(synder)].join("\n")}`,
    ).toEqual([]);
  });

  it("komponenter med en Book-knap linker heller ikke til den tomme kurv", () => {
    for (const fil of ["src/components/BurgerMenu.tsx", "src/components/Hero.tsx", "src/components/About.tsx"]) {
      let src: string;
      try {
        src = læs(fil);
      } catch {
        continue;
      }
      if (MÅ_LINKE_TIL_BOOK.includes(fil)) continue;
      expect(/href="\/(?:en\/)?book"/.test(src), `${fil} linker til tom kurv`).toBe(false);
    }
  });
});

/**
 * Sider, der er en indgang til sortimentet, skal have sortimentet på sig.
 *
 * De tre sidste er landingssider for Google Ads. Klikket er betalt, og hvis
 * siden ikke har et produkt, er pengene brugt på et blindt gyde.
 */
const SKAL_HAVE_PRODUKTER = [
  "src/app/lej-hojtaler/page.tsx",
  "src/app/en/lej-hojtaler/page.tsx",
  "src/app/lydanlaeg/page.tsx",
  "src/app/en/lydanlaeg/page.tsx",
  "src/app/festlys/page.tsx",
  "src/app/festlyd/page.tsx",
  "src/app/lydudstyr/page.tsx",
  "src/app/kobenhavn/page.tsx",
];

describe("Kategori- og annoncesider har produkter", () => {
  it("hver af dem viser et produkt- eller pakkegitter", () => {
    const uden: string[] = [];
    for (const p of SKAL_HAVE_PRODUKTER) {
      const src = læs(p);
      if (!/<CategoryProductGrid|<BundleGrid|<SpeakerCompare/.test(src)) uden.push(p);
    }
    expect(uden, `sider uden ét eneste produkt:\n${uden.join("\n")}`).toEqual([]);
  });

  it("/lej-hojtaler viser højtalerne selv, ikke kun pakker", () => {
    for (const p of ["src/app/lej-hojtaler/page.tsx", "src/app/en/lej-hojtaler/page.tsx"]) {
      const src = læs(p);
      expect(src, `${p} mangler højtalergitteret`).toContain("<CategoryProductGrid");
      for (const id of ["thumpgo", "party", "soundboks", "festival", "hojtaler_100"]) {
        expect(src, `${p} mangler ${id}`).toContain(`"${id}"`);
      }
    }
  });
});
