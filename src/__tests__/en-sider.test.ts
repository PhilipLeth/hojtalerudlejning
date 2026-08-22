/**
 * Den engelske udgave skal følge med den danske.
 *
 * /en linkede før til danske produktsider: SpeakerCompare og BundleGrid tager
 * `page` fra kataloget, som altid er den danske sti, så en engelsk kunde
 * klikkede "read more" og landede i dansk tekst. localizedHref løser det, men
 * kun hvis EN_PAGES rent faktisk svarer til de sider, der findes.
 *
 * Testen holder de to i sync, og den fejler også, hvis en dansk side får en
 * engelsk udgave uden hreflang begge veje — så peger kun det ene sprog på det
 * andet, og Google ser to konkurrerende sider i stedet for et par.
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { EN_PAGES, hasEnglish, localizedHref } from "@/lib/enPages";

const APP = join(process.cwd(), "src/app");

/** Mapper under src/app/en der faktisk har en side. */
function engelskeSider(): string[] {
  const fundet: string[] = ["/"];
  const walk = (dir: string, prefix: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const sti = join(dir, entry.name);
      if (existsSync(join(sti, "page.tsx"))) fundet.push(`${prefix}/${entry.name}`);
      walk(sti, `${prefix}/${entry.name}`);
    }
  };
  walk(join(APP, "en"), "");
  return fundet.sort();
}

describe("Engelsk udgave", () => {
  it("EN_PAGES svarer til de sider, der ligger i src/app/en", () => {
    // /book er forsiden med bookingen åben og har sin egen canonical — den er
    // ikke en selvstændig side, man skal kunne linke sprogrigtigt til.
    const påDisk = engelskeSider().filter((p) => p !== "/book");
    expect([...EN_PAGES].sort()).toEqual(påDisk);
  });

  it("hver engelsk side har en dansk side at være oversættelse af", () => {
    const uden = EN_PAGES.filter(
      (p) => p !== "/" && !existsSync(join(APP, p.slice(1), "page.tsx"))
    );
    expect(uden, `engelsk side uden dansk modstykke:\n${uden.join("\n")}`).toEqual([]);
  });

  it("begge sprog peger på hinanden med hreflang", () => {
    const mangler: string[] = [];
    for (const p of EN_PAGES) {
      if (p === "/") continue; // sættes i root-layoutet og /en/layout
      for (const fil of [join(APP, p.slice(1), "page.tsx"), join(APP, "en", p.slice(1), "page.tsx")]) {
        const src = readFileSync(fil, "utf8");
        if (!src.includes("localeAlternates")) mangler.push(fil.replace(APP, "src/app"));
      }
    }
    expect(mangler, `hreflang mangler i:\n${mangler.join("\n")}`).toEqual([]);
  });

  it("localizedHref sender kun videre til sider, der findes på engelsk", () => {
    expect(localizedHref("/soundboks-4", "en")).toBe("/en/soundboks-4");
    expect(localizedHref("/soundboks-4", "da")).toBe("/soundboks-4");
    expect(localizedHref("/", "en")).toBe("/en");
    // Uden engelsk udgave beholdes den danske sti — et link til et andet sprog
    // er stadig bedre end et link til en 404.
    expect(hasEnglish("/discokugle")).toBe(false);
    expect(localizedHref("/discokugle", "en")).toBe("/discokugle");
  });
});
