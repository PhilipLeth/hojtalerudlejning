/**
 * Produktgalleriet.
 *
 * Billederne er AI-genererede med vores egne produktfotos som reference. To
 * ting må aldrig skride: de skal være mærket som illustrationer, og manifestet
 * skal pege på filer, der faktisk findes. Et galleri der lover et billede, som
 * ikke blev genereret, er 404'ere på en produktside.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { PRODUCT_GALLERY, galleryFor, ratioTal, type GalleryImage } from "@/lib/productGallery";
import { erPaaPause, rentalProducts, speakers, addons } from "@/lib/products";

const ROD = process.cwd();
const scener = JSON.parse(readFileSync(join(ROD, "gallery", "scenes.json"), "utf8"));

afterEach(() => cleanup());

describe("Manifestet", () => {
  it("peger kun på billeder der findes", () => {
    const mangler: string[] = [];
    for (const [id, billeder] of Object.entries(PRODUCT_GALLERY)) {
      for (const b of billeder) {
        for (const sti of [b.src, b.thumb]) {
          if (!existsSync(join(ROD, "public", sti.replace(/^\//, "")))) mangler.push(`${id}: ${sti}`);
        }
      }
    }
    expect(mangler, `galleribilleder uden fil:\n${mangler.join("\n")}`).toEqual([]);
  });

  it("har tekst på begge sprog til hvert billede", () => {
    for (const [id, billeder] of Object.entries(PRODUCT_GALLERY)) {
      for (const b of billeder) {
        for (const felt of ["alt_da", "alt_en", "caption_da", "caption_en", "titel_da", "titel_en"] as const) {
          expect(b[felt]?.trim(), `${id}/${b.scene} mangler ${felt}`).toBeTruthy();
        }
        // En uudfyldt skabelon ryger igennem som "{navn}" og ville stå sådan på siden
        expect(JSON.stringify(b), `${id}/${b.scene} har en uudfyldt skabelon`).not.toMatch(/\{[a-zæøå_]+\}/i);
      }
    }
  });

  it("giver ikke pausede produkter et galleri", () => {
    // Billeder af noget, vi ikke udlejer, er spildte penge og et falsk løfte
    const pausede = Object.keys(PRODUCT_GALLERY).filter((id) => erPaaPause(id));
    expect(pausede, `pausede produkter med galleri: ${pausede.join(", ")}`).toEqual([]);
  });

  it("kender kun produkter der findes i kataloget", () => {
    const kendte = new Set([...speakers, ...addons, ...rentalProducts].map((p) => p.id));
    for (const id of Object.keys(PRODUCT_GALLERY)) {
      expect(kendte.has(id), `${id} findes ikke i kataloget`).toBe(true);
    }
  });

  it("galleryFor svarer med en tom liste for et ukendt produkt", () => {
    expect(galleryFor("findes-ikke")).toEqual([]);
  });

  it("ratioTal oversætter billedforholdet", () => {
    expect(ratioTal("16:9")).toBeCloseTo(16 / 9);
    expect(ratioTal("1:1")).toBe(1);
    expect(ratioTal("noget-vrøvl")).toBe(1);
  });
});

describe("gallery/scenes.json", () => {
  it("hver scene har det, prompt-byggeren slår op", () => {
    for (const s of scener.scener) {
      for (const felt of ["id", "ratio", "referencer", "prompt", "titel_da", "titel_en", "alt_da", "alt_en", "caption_da", "caption_en"]) {
        expect(s[felt], `scene ${s.id} mangler ${felt}`).toBeTruthy();
      }
      expect(["alle", "hoved"]).toContain(s.referencer);
    }
  });

  it("produkt-overskrivningerne peger på produkter og steder der findes", () => {
    const kendte = new Set([...speakers, ...addons, ...rentalProducts].map((p) => p.id));
    for (const [id, o] of Object.entries<Record<string, string>>(scener.produkter)) {
      expect(kendte.has(id), `scenes.json nævner ${id}, som ikke findes i kataloget`).toBe(true);
      if (o.sted) expect(Object.keys(scener.steder), `${id} peger på stedet ${o.sted}`).toContain(o.sted);
    }
  });

  it("hver kategori i kataloget har et standardsted", () => {
    const kategorier = new Set(rentalProducts.map((p) => p.category));
    for (const k of kategorier) {
      expect(Object.keys(scener.standard_sted), `kategori ${k} har intet standardsted`).toContain(k);
    }
  });

  it("prompten forbyder opdigtet udstyr", () => {
    // Hele grunden til at vi sender produktfotos med som reference
    expect(scener.stil.forbudt).toMatch(/must be one of the referenced products/i);
    expect(scener.stil.forbudt).toMatch(/no made-up brand names|no added logos/i);
  });

  it("men tillader produktets eget mærke", () => {
    // Første kørsel viste hvorfor: et blankt logoforbud fjernede Mackie-mærket
    // fra en Mackie-højtaler. Det er den højtaler, vi udlejer — mærket skal med.
    expect(scener.stil.forbudt).toMatch(/its own markings/i);
  });
});

/* ───── komponenten ───── */

const FAKE: GalleryImage[] = [
  {
    src: "/images/gallery/test/i_brug.webp",
    thumb: "/images/gallery/test/i_brug-400.webp",
    scene: "i_brug",
    ratio: "16:9",
    titel_da: "Sådan ser det ud til festen",
    titel_en: "How it looks at the party",
    alt_da: "Testpakken sat op og i brug",
    alt_en: "The test package set up and in use",
    caption_da: "Rækker til 100 gæster indendørs.",
    caption_en: "Covers 100 guests indoors.",
  },
  {
    src: "/images/gallery/test/opstilling.webp",
    thumb: "/images/gallery/test/opstilling-400.webp",
    scene: "opstilling",
    ratio: "4:3",
    titel_da: "Tæt på",
    titel_en: "Close up",
    alt_da: "Testpakken tæt på",
    alt_en: "The test package up close",
    caption_da: "Sådan ser det ud, når det står klar.",
    caption_en: "This is what it looks like standing ready.",
  },
];

// Komponenten henter galleriet gennem useGallery, som slår de committede
// billeder sammen med dem, admin har lavet. Her interesserer vi os for hvad
// komponenten GØR med billederne — sammenlægningen har sin egen test.
vi.mock("@/lib/useGallery", () => ({
  useGallery: (id: string) => (id === "test_produkt" ? FAKE : []),
}));

const { default: ProductGallery } = await import("@/components/ProductGallery");

describe("ProductGallery", () => {
  it("viser ingenting, når produktet ikke har billeder endnu", () => {
    const { container } = render(<ProductGallery productId="uden_billeder" name="Noget" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mærker hvert billede som illustration — både synligt og i alt-teksten", () => {
    render(<ProductGallery productId="test_produkt" name="Testpakken" />);
    expect(screen.getAllByText("Illustration")).toHaveLength(FAKE.length);
    for (const b of FAKE) {
      expect(screen.getByAltText(`${b.alt_da} (illustration)`)).toBeInTheDocument();
    }
  });

  it("siger på dansk hvad billederne er", () => {
    render(<ProductGallery productId="test_produkt" name="Testpakken" />);
    expect(screen.getByText(/Testpakken i brug/)).toBeInTheDocument();
    expect(screen.getByText(/illustrationer, lavet ud fra fotos af vores eget udstyr/)).toBeInTheDocument();
  });

  it("skifter sprog med locale", () => {
    render(<ProductGallery productId="test_produkt" name="The test package" locale="en" />);
    expect(screen.getByText(/The test package in use/)).toBeInTheDocument();
    expect(screen.getByAltText(`${FAKE[0].alt_en} (illustration)`)).toBeInTheDocument();
  });

  it("åbner billedet i stor størrelse og kan bladre", () => {
    render(<ProductGallery productId="test_produkt" name="Testpakken" />);
    fireEvent.click(screen.getByLabelText(`Vis ${FAKE[0].alt_da} i stor størrelse`));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    // Den lange forklaring hører til i det store billede, ikke på hvert kort
    expect(screen.getByText(/genereret ud fra fotos af vores eget udstyr/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Næste billede"));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("låser baggrunden mens det store billede er åbent", () => {
    render(<ProductGallery productId="test_produkt" name="Testpakken" />);
    fireEvent.click(screen.getByLabelText(`Vis ${FAKE[0].alt_da} i stor størrelse`));
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.body.style.overflow).toBe("");
  });
});

describe("Produktsiden", () => {
  it("har galleriet med", () => {
    const kilde = readFileSync(join(ROD, "src/components/ProductLanding.tsx"), "utf8");
    expect(kilde).toContain("<ProductGallery");
    expect(kilde).toMatch(/locale=\{locale\}/);
  });
});
