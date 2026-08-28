/**
 * Knappen "Generér galleri" i /admin/produkter.
 *
 * Tre ting skal holde: prompten skal bygges af de dele, produktet faktisk
 * består af (ellers digter modellen grejet), et forslag må aldrig kunne blive
 * synligt for kunder uden et tryk på "Brug det", og der skal være et loft, så
 * en løbsk klikker ikke bruger en måneds budget på en eftermiddag.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import {
  GALLERY_SCENER,
  byggPrompt,
  fladtKatalog,
  referencerFor,
  scenerFor,
} from "@/lib/galleryPrompt";
import { addons, rentalProducts, speakers } from "@/lib/products";

const KATALOG = { speakers, addons, rentalProducts };
const flad = fladtKatalog(KATALOG);

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Prompten", () => {
  it("kender alle tre produkttyper", () => {
    expect(flad.get("soundboks")?.navn).toBe("Soundboks 4");
    expect(flad.get("lys")?.navn).toBeTruthy();
    expect(flad.get("pakke_bryllup")?.dele?.length).toBeGreaterThan(0);
  });

  it("giver en pakke 'alle dele' og et enkeltprodukt 'det i kassen'", () => {
    const pakke = scenerFor(flad.get("pakke_bryllup")!).map((s) => s.id);
    const enkelt = scenerFor(flad.get("soundboks")!).map((s) => s.id);
    expect(pakke).toContain("komposition");
    expect(pakke).not.toContain("hvad_du_faar");
    expect(enkelt).toContain("hvad_du_faar");
    expect(enkelt).not.toContain("komposition");
    // Oplevelsen og nærbilledet hører til begge slags
    for (const liste of [pakke, enkelt]) {
      expect(liste).toContain("i_brug");
      expect(liste).toContain("opstilling");
    }
  });

  it("sender pakkens egne dele med som referencer", () => {
    const p = flad.get("pakke_bryllup")!;
    const scene = GALLERY_SCENER.find((s) => s.id === "komposition")!;
    const b = byggPrompt(p, scene, flad)!;
    expect(b.referencer.map((r) => r.id)).toEqual(p.dele!.filter((d, i, a) => a.indexOf(d) === i));
    // Navnene skal stå i prompten, ellers ved modellen ikke hvad den ser på
    for (const r of b.referencer) expect(b.prompt).toContain(r.navn_en);
  });

  it("slår dubletter sammen — to ens referencer lærer modellen ingenting", () => {
    // Festpakke 250 har den samme højtaler og den samme sub med to gange
    const p = flad.get("pakke_fest_250")!;
    expect(p.dele!.length).toBeGreaterThan(new Set(p.dele!).size);
    const ref = referencerFor(p, flad, "alle");
    expect(new Set(ref.billeder.map((r) => r.id)).size).toBe(ref.billeder.length);
  });

  it("holder sig inden for det antal referencer, modellen kan bære", () => {
    for (const p of flad.values()) {
      if (p.hidden || !p.page) continue;
      for (const scene of scenerFor(p)) {
        const b = byggPrompt(p, scene, flad);
        if (b) expect(b.referencer.length, `${p.id}/${scene.id}`).toBeLessThanOrEqual(6);
      }
    }
  });

  it("nægter at bygge en prompt uden et eneste produktfoto", () => {
    const uden = { ...flad.get("soundboks")!, id: "uden_foto", billede: null };
    const tom = new Map(flad);
    tom.set("uden_foto", uden);
    const scene = GALLERY_SCENER.find((s) => s.id === "i_brug")!;
    expect(byggPrompt(uden, scene, tom)).toBeNull();
  });

  it("skriver gæstetallet ind i billedteksten, hvor kataloget kender det", () => {
    const scene = GALLERY_SCENER.find((s) => s.id === "i_brug")!;
    const b = byggPrompt(flad.get("pakke_fest_150")!, scene, flad)!;
    expect(b.caption_da).toMatch(/100-150 gæster/);
    expect(b.caption_en).toMatch(/100-150 guests/);
  });
});

describe("/api/gallery", () => {
  const kilde = readFileSync(join(process.cwd(), "functions/api/gallery.ts"), "utf8");

  it("gemmer ikke et forslag — det lever kun i browseren", () => {
    const generering = kilde.slice(kilde.indexOf("lav et forslag"));
    expect(generering).not.toMatch(/MEDIA\.put|BOOKINGS\.put\(MANIFEST_KEY/);
  });

  it("kræver at billedet er uploadet, før det kan udgives", () => {
    expect(kilde).toMatch(/startsWith\("\/api\/image\/"\)/);
    expect(kilde).toMatch(/Billedet skal være uploadet først/);
  });

  it("har et månedsloft over forbruget", () => {
    expect(kilde).toMatch(/MAANEDSLOFT\s*=\s*\d+/);
    expect(kilde).toMatch(/brugt >= MAANEDSLOFT/);
  });

  it("tæller først op, når kaldet er lykkedes", () => {
    const optaelling = kilde.indexOf("gallery_forbrug_${maaned()}`, String(brugt + 1)");
    const udtraek = kilde.indexOf("const b64 = udtrækBillede(json)");
    expect(optaelling).toBeGreaterThan(udtraek);
  });

  it("kræver admin på alt andet end at læse manifestet", () => {
    expect(kilde).toMatch(/onRequestPost[\s\S]{0,200}requireAdmin/);
    const get = kilde.slice(kilde.indexOf("onRequestGet"), kilde.indexOf("hentKatalog"));
    expect(get).not.toMatch(/requireAdmin/);
  });
});

describe("useGallery", () => {
  it("lader admins billede vinde over det committede for samme scene", async () => {
    const admin = {
      src: "/api/image/nyt",
      thumb: "/api/image/nyt",
      scene: "i_brug",
      ratio: "16:9",
      titel_da: "Fra admin",
      titel_en: "From admin",
      alt_da: "Fra admin",
      alt_en: "From admin",
      caption_da: "-",
      caption_en: "-",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ thumpgo: [admin] }), { status: 200 })),
    );

    const { useGallery } = await import("@/lib/useGallery");
    function Prøve() {
      const b = useGallery("thumpgo");
      return <ul>{b.map((x) => <li key={x.scene}>{`${x.scene}:${x.src}`}</li>)}</ul>;
    }
    render(<Prøve />);

    await waitFor(() => {
      expect(screen.getByText("i_brug:/api/image/nyt")).toBeInTheDocument();
    });
  });

  it("står ved de committede billeder, hvis API'et ikke svarer", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { useGallery } = await import("@/lib/useGallery");
    const { galleryFor } = await import("@/lib/productGallery");

    function Prøve() {
      return <span data-testid="n">{useGallery("thumpgo").length}</span>;
    }
    render(<Prøve />);
    expect(screen.getByTestId("n").textContent).toBe(String(galleryFor("thumpgo").length));
  });
});

describe("Ingenting sker af sig selv", () => {
  /**
   * Den første udgave blev kørt i bulk fra en terminal, og 77 billeder gik
   * live uden at nogen havde set dem. Det er ikke meningen: hvert billede er
   * ét tryk. Testen læser kilden, fordi spørgsmålet er hvad der KAN ske uden
   * en hånd på musen.
   */
  const felt = readFileSync(join(process.cwd(), "src/components/admin/GalleryField.tsx"), "utf8");
  const side = readFileSync(join(process.cwd(), "src/app/admin/produkter/page.tsx"), "utf8");

  it("genererer ikke i en useEffect", () => {
    for (const [navn, kilde] of [["produktsiden", side], ["galleri-feltet", felt]] as const) {
      for (const m of kilde.matchAll(/useEffect\(\(\) => \{([\s\S]*?)\}, \[/g)) {
        expect(m[1], `${navn} genererer i en useEffect`).not.toMatch(/generer|genererKald/);
      }
    }
  });

  it("har ingen knap der laver mere end ét billede", () => {
    expect(felt).not.toMatch(/for \(const .* of scener\)[\s\S]{0,200}generer/);
    expect(felt).not.toMatch(/scener\.map[\s\S]{0,120}generer\(/);
  });

  it("skriver prisen på genereringsknappen", () => {
    expect(felt).toMatch(/Generér \(\$\{GALLERY_SPEC\.usd_per_image\.toFixed\(2\)\} \$\)/);
  });
});

describe("Flowet ligger på produktkortet", () => {
  const side = readFileSync(join(process.cwd(), "src/app/admin/produkter/page.tsx"), "utf8");
  const felt = readFileSync(join(process.cwd(), "src/components/admin/GalleryField.tsx"), "utf8");

  it("har ikke en side ved siden af", () => {
    // /admin/galleri kunne det samme. Arbejdet hører til dér, hvor produktet er.
    expect(existsSync(join(process.cwd(), "src/app/admin/galleri/page.tsx"))).toBe(false);
    const nav = readFileSync(join(process.cwd(), "src/components/AdminNav.tsx"), "utf8");
    expect(nav).not.toMatch(/\/admin\/galleri/);
  });

  it("viser i korthovedet hvor langt hvert produkt er", () => {
    expect(side.match(/\{galleriMærke\(/g) ?? []).toHaveLength(3);
    expect(side).toMatch(/Galleri \{klar\}\/\{ialt\}/);
  });

  it("har et overblik og et filter øverst på listen", () => {
    expect(side).toMatch(/galleriTal\.klar/);
    expect(side).toMatch(/Mangler billeder/);
    expect(side).toMatch(/Ikke gennemgået/);
  });

  it("skjuler kort i stedet for at filtrere listen — indeks bruges til at rette", () => {
    expect(side).toMatch(/skjulAfFilter\([\s\S]{0,60}\? "none" : undefined/);
    expect(side).not.toMatch(/speakers\.filter\([\s\S]{0,40}\)\.map\(\(sp, i\)/);
  });

  it("bygger først knapperne, når kortet er foldet ud", () => {
    expect(felt).toMatch(/if \(!aktiv\) return null/);
    expect(side).toMatch(/aktiv=\{aabne\.has\(/);
  });

  it("henter manifestet én gang for hele siden", () => {
    expect(side.match(/hentManifest\(\)/g) ?? []).toHaveLength(1);
    expect(felt).not.toMatch(/hentManifest/);
  });
});

describe("Status pr. scene", () => {
  it("skelner mellem manglende, ikke gennemgået, godkendt og fjernet", async () => {
    const { sceneStatus, galleriOpsummering, scenerTil } = await import(
      "@/components/admin/GalleryField"
    );
    const { PRODUCT_GALLERY } = await import("@/lib/productGallery");

    // thumpgo har billeder fra bulk-kørslen og intet i manifestet
    expect(PRODUCT_GALLERY["thumpgo"]?.length).toBeGreaterThan(0);
    expect(sceneStatus("thumpgo", "i_brug", {})).toBe("ikke_gennemgaaet");
    expect(sceneStatus("findes_ikke", "i_brug", {})).toBe("mangler");

    const godkendt = { thumpgo: [{ src: "/api/image/x", thumb: "/api/image/x", scene: "i_brug", ratio: "16:9", titel_da: "", alt_da: "", caption_da: "" }] };
    expect(sceneStatus("thumpgo", "i_brug", godkendt)).toBe("godkendt");

    const gravsten = { thumpgo: [{ src: "", thumb: "", scene: "i_brug", ratio: "1:1", titel_da: "", alt_da: "", caption_da: "", fjernet: true }] };
    expect(sceneStatus("thumpgo", "i_brug", gravsten)).toBe("fjernet");
  });

  it("tæller ikke-gennemgåede med som på plads, men markerer dem", async () => {
    const { galleriOpsummering } = await import("@/components/admin/GalleryField");
    const o = galleriOpsummering("thumpgo", false, {});
    expect(o.ialt).toBe(3);
    expect(o.klar).toBe(o.ikkeSet); // alt fra bulk-kørslen, intet godkendt endnu
    expect(o.ikkeSet).toBeGreaterThan(0);
  });

  it("giver pakker og enkeltprodukter hver sin 'alt det du får'", async () => {
    const { scenerTil } = await import("@/components/admin/GalleryField");
    expect(scenerTil(true).map((s) => s.id)).toContain("komposition");
    expect(scenerTil(false).map((s) => s.id)).toContain("hvad_du_faar");
  });
});

describe("Fjernelse af et billede fra bulk-kørslen", () => {
  const kilde = readFileSync(join(process.cwd(), "functions/api/gallery.ts"), "utf8");

  it("efterlader en gravsten, når billedet også ligger som fil", () => {
    // Uden den ville useGallery falde tilbage på den statiske fil, og
    // "Fjern" ville ikke gøre noget som helst for kunden
    expect(kilde).toMatch(/PRODUCT_GALLERY\[productId\]/);
    expect(kilde).toMatch(/fjernet: true/);
  });

  it("useGallery kaster scenen væk, når der er en gravsten", async () => {
    const gravsten = {
      src: "", thumb: "", scene: "i_brug", ratio: "1:1",
      titel_da: "", titel_en: "", alt_da: "", alt_en: "", caption_da: "", caption_en: "",
      fjernet: true,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ thumpgo: [gravsten] }), { status: 200 })),
    );
    const { useGallery } = await import("@/lib/useGallery");
    function Prøve() {
      return <span data-testid="scener">{useGallery("thumpgo").map((b) => b.scene).join(",")}</span>;
    }
    render(<Prøve />);
    await waitFor(() => {
      expect(screen.getByTestId("scener").textContent).not.toMatch(/i_brug/);
    });
  });
});
