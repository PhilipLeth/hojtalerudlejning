/**
 * Leverandørens foto er en reference, ikke et billede vi udgiver.
 *
 * Arkets kolonne "Link til produkt indkøb" peger på varen hos Jem & Fix,
 * Thomann eller HiFi Klubben. Philip, 22. september 2026: "Du skal tage
 * billedet fra linket og lave et billede der minder om, men i samme stil som
 * vores."
 *
 * Det er præcis den vej rundt, og skellet er hele pointen:
 *
 *   refFoto   → dét modellen ser. Shoppens foto. Bliver aldrig vist.
 *   image     → dét vi udgiver. Modellens gengivelse i vores husstil.
 *
 * Bliver de to blandet sammen, står der et fremmed produktfoto på
 * lejhojtaler.dk — med en anden shops lys, beskæring og vandmærke, og uden at
 * nogen har spurgt dem om lov. Testen her holder dem adskilt.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { addons, rentalProducts, speakers } from "@/lib/products";
import { billedeUrlFraHtml, fladtKatalog, refFotoAldrigUdgivet, sceneMedId, byggPrompt } from "@/lib/galleryPrompt";

const alle = [
  ...speakers.map((s) => ({ id: s.id, image: s.product as string | null, refFoto: s.refFoto })),
  ...addons.map((a) => ({ id: a.id, image: a.image, refFoto: a.refFoto })),
  ...rentalProducts.map((r) => ({ id: r.id, image: r.image as string | null, refFoto: r.refFoto })),
];

describe("Leverandørfotos bruges som reference, aldrig som produktbillede", () => {
  it("intet produkt udgiver et billede fra en fremmed shop", () => {
    const fremmede = alle
      .filter((p) => p.image && /^https?:\/\//i.test(p.image))
      .map((p) => `${p.id}: ${p.image}`);
    expect(fremmede, `produktbilleder hentet fra en anden shop:\n${fremmede.join("\n")}`).toEqual([]);
  });

  it("refFoto er altid en absolut URL — en sti hører til i image", () => {
    for (const p of alle.filter((x) => x.refFoto)) {
      expect(refFotoAldrigUdgivet(p.refFoto), `${p.id}: ${p.refFoto}`).toBe(true);
    }
  });

  it("de fem strømvarer fra arkets afsnit 4 har deres link med", () => {
    // De har ingen egne fotos, og arket har leverandørlinket til hver af dem.
    // Uden linket kan billedknappen i admin ikke lave et billede af dem.
    for (const id of ["kabeltromle", "kabeltromle_jord", "stikdaase", "stikdaase_jord", "omformer_udendors"]) {
      const p = alle.find((x) => x.id === id);
      expect(p, `${id} findes ikke`).toBeTruthy();
      expect(p!.image, `${id} har fået et foto — så må refFoto gerne blive`).toBeFalsy();
      expect(p!.refFoto, `${id} mangler leverandørlinket fra arket`).toMatch(/^https:\/\/www\.jemogfix\.dk\//);
    }
  });

  it("et produkt med kun et leverandørlink kan nu genereres", () => {
    const flad = fladtKatalog({ speakers, addons, rentalProducts });
    const scene = sceneMedId("produktfoto")!;
    const bygget = byggPrompt(flad.get("kabeltromle")!, scene, flad);
    expect(bygget, "kabeltromle kan stadig ikke genereres").toBeTruthy();
    expect(bygget!.referencer).toHaveLength(1);
    expect(refFotoAldrigUdgivet(bygget!.referencer[0].billede)).toBe(true);
  });

  it("vores eget foto vinder over leverandørens, når vi har et", () => {
    const flad = fladtKatalog({ speakers, addons, rentalProducts });
    // Skærmen har et rigtigt husstilsfoto — så er det dét, modellen skal se
    expect(flad.get("skaerm_55")!.billede).toMatch(/^\/images\//);
  });
});

describe("Shopsiden følges ét skridt videre til billedet", () => {
  // Arkets link er produktSIDEN, ikke en .jpg. Frederik skal ikke først
  // højreklikke sig frem til billed-URL'en.
  const base = "https://www.jemogfix.dk/kabeltromle-m4-udtag-10-meter/7111/9010501/";

  it("finder og:image og gør den absolut", () => {
    expect(billedeUrlFraHtml('<meta property="og:image" content="/media/kabel.jpg">', base)).toBe(
      "https://www.jemogfix.dk/media/kabel.jpg",
    );
  });

  it("tager attributterne i begge rækkefølger", () => {
    expect(billedeUrlFraHtml('<meta content="https://a.dk/y.png" property="og:image">', base)).toBe(
      "https://a.dk/y.png",
    );
  });

  it("falder tilbage på twitter:image og image_src", () => {
    expect(billedeUrlFraHtml('<meta name="twitter:image" content="https://a.dk/t.jpg">', base)).toBe("https://a.dk/t.jpg");
    expect(billedeUrlFraHtml('<link rel="image_src" href="https://a.dk/i.jpg">', base)).toBe("https://a.dk/i.jpg");
  });

  it("afkoder &amp; i en URL med parametre", () => {
    expect(billedeUrlFraHtml('<meta property="og:image" content="https://a.dk/i.jpg?w=1&amp;h=2">', base)).toBe(
      "https://a.dk/i.jpg?w=1&h=2",
    );
  });

  it("siger nej frem for at gætte, når der intet billede er", () => {
    expect(billedeUrlFraHtml("<html><body>ingenting</body></html>", base)).toBeNull();
    expect(billedeUrlFraHtml('<meta property="og:image" content="::ugyldig::">', "ikke-en-base")).toBeNull();
  });

  it("begge veje ind følger siden — knappen i admin og scriptet", () => {
    const api = readFileSync(join(process.cwd(), "functions/api/gallery.ts"), "utf8");
    expect(api).toContain("billedeUrlFraHtml");
    expect(api).toContain('type.includes("text/html")');
    const script = readFileSync(join(process.cwd(), "scripts/product-images/generate.mjs"), "utf8");
    expect(script).toContain("hentRefFoto");
    expect(script).toContain("billedeUrlFraHtml");
  });

  it("de hentede leverandørfotos bliver ikke committet", () => {
    const ignore = readFileSync(join(process.cwd(), ".gitignore"), "utf8");
    expect(ignore).toContain("gallery/ref/");
  });
});
