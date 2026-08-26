/**
 * Produktsiderne indlejrer ikke video.
 *
 * Producentens YouTube-video lå på 42 produkter — én tredjeparts-iframe pr.
 * produktside. Det er præcis den slags indlejring, hastighedsarbejdet i august
 * handlede om at komme af med, og den sendte kunden videre til YouTube midt i
 * et køb, med producentens branding og forslag til andre videoer.
 *
 * Slået fra 26. august 2026. Komponenterne og deres tests står urørte, og
 * youtubeUrl bliver liggende i kataloget — det er importen og én linje, der
 * skal tilbage. Testen her er for at det ikke sker ved et uheld.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const KOMPONENTER = join(process.cwd(), "src/components");
const landing = readFileSync(join(KOMPONENTER, "ProductLanding.tsx"), "utf8");

/** Fjerner blokkommentarer, så en deaktiveret linje ikke tæller som brug. */
function udenKommentarer(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("Produktsider uden video", () => {
  const kode = udenKommentarer(landing);

  it("ProductLanding renderer hverken YouTube eller produktvideo", () => {
    expect(kode).not.toMatch(/<ProductYouTube/);
    expect(kode).not.toMatch(/<ProductVideo/);
  });

  it("importerer dem heller ikke — så en ubrugt import ikke inviterer til at bruge den", () => {
    expect(kode).not.toMatch(/import ProductYouTube/);
    expect(kode).not.toMatch(/import ProductVideo/);
  });

  it("ingen anden komponent har taget dem i brug i stedet", () => {
    const brugt: string[] = [];
    for (const fil of readdirSync(KOMPONENTER)) {
      if (!fil.endsWith(".tsx") || fil.startsWith("ProductYouTube") || fil.startsWith("ProductVideo")) continue;
      const src = udenKommentarer(readFileSync(join(KOMPONENTER, fil), "utf8"));
      if (/<ProductYouTube|<ProductVideo/.test(src)) brugt.push(fil);
    }
    expect(brugt, `videokomponenter er i brug i: ${brugt.join(", ")}`).toEqual([]);
  });

  it("komponenterne er ikke slettet — de skal kunne tændes igen", () => {
    expect(readFileSync(join(KOMPONENTER, "ProductYouTube.tsx"), "utf8")).toContain("iframe");
    expect(readFileSync(join(KOMPONENTER, "ProductVideo.tsx"), "utf8")).toContain("export default");
  });
});
