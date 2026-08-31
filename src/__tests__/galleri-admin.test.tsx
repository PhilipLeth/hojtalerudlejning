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
import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react";
import {
  GALLERY_SCENER,
  byggPrompt,
  fladtKatalog,
  referencerFor,
  scenerFor,
} from "@/lib/galleryPrompt";
import { addons, rentalProducts, speakers } from "@/lib/products";

vi.mock("@/lib/galleryAdmin", async (orig) => ({
  ...(await orig<typeof import("@/lib/galleryAdmin")>()),
  gemTekst: vi.fn().mockResolvedValue([]),
  saetAktiv: vi.fn().mockResolvedValue([]),
  generer: vi.fn(),
  udgivForslag: vi.fn(),
}));

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
  const post = (scene: string, ekstra: Record<string, unknown> = {}) => ({
    src: `/api/image/${scene}`, thumb: `/api/image/${scene}`, scene, ratio: "16:9",
    titel_da: scene, titel_en: scene, alt_da: scene, alt_en: scene, caption_da: "-", caption_en: "-",
    ...ekstra,
  });

  it("viser kun manifestets aktive poster — bulk-billederne er kandidater, ikke galleri", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ thumpgo: [post("i_brug", { aktiv: true }), post("opstilling", { aktiv: false })] }), { status: 200 }),
      ),
    );
    const { useGallery } = await import("@/lib/useGallery");
    function Prøve() {
      return <span data-testid="scener">{useGallery("thumpgo").map((b) => b.scene).join(",")}</span>;
    }
    render(<Prøve />);
    await waitFor(() => {
      expect(screen.getByTestId("scener").textContent).toBe("i_brug");
    });
  });

  it("viser ingenting, hvis API'et ikke svarer — heller ikke de committede filer", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { useGallery } = await import("@/lib/useGallery");
    const { galleryFor } = await import("@/lib/productGallery");
    expect(galleryFor("thumpgo").length).toBeGreaterThan(0); // filerne findes, men er ikke set efter
    function Prøve() {
      return <span data-testid="n">{useGallery("thumpgo").length}</span>;
    }
    render(<Prøve />);
    expect(screen.getByTestId("n").textContent).toBe("0");
  });

  it("læser den gamle gravsten som inaktiv, og en post uden felt som aktiv", async () => {
    const { erAktiv } = await import("@/lib/galleryStatus");
    expect(erAktiv({ fjernet: true })).toBe(false);
    expect(erAktiv({})).toBe(true);
    expect(erAktiv({ aktiv: false, fjernet: false })).toBe(false);
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
  const post = (ekstra: Record<string, unknown>) => ({
    src: "/api/image/x", thumb: "/api/image/x", scene: "i_brug", ratio: "16:9", titel_da: "", alt_da: "", caption_da: "", ...ekstra,
  });

  it("skelner mellem manglende, ikke gennemgået, aktiv og inaktiv", async () => {
    const { sceneStatus } = await import("@/components/admin/GalleryField");
    const { PRODUCT_GALLERY } = await import("@/lib/productGallery");

    // thumpgo har billeder fra bulk-kørslen og intet i manifestet
    expect(PRODUCT_GALLERY["thumpgo"]?.length).toBeGreaterThan(0);
    expect(sceneStatus("thumpgo", "i_brug", {})).toBe("ikke_gennemgaaet");
    expect(sceneStatus("findes_ikke", "i_brug", {})).toBe("mangler");
    expect(sceneStatus("thumpgo", "i_brug", { thumpgo: [post({ aktiv: true })] })).toBe("aktiv");
    expect(sceneStatus("thumpgo", "i_brug", { thumpgo: [post({ aktiv: false })] })).toBe("inaktiv");
    // Gravstenen fra før toggle'n
    expect(sceneStatus("thumpgo", "i_brug", { thumpgo: [post({ src: "", fjernet: true })] })).toBe("inaktiv");
  });

  it("tæller kun det, kunden ser — bulk-billederne er ikke på plads, før de er slået til", async () => {
    const { galleriOpsummering } = await import("@/components/admin/GalleryField");
    const o = galleriOpsummering("thumpgo", false, {});
    expect(o.ialt).toBe(3);
    expect(o.klar).toBe(0);
    expect(o.ikkeSet).toBe(3);
    const et = galleriOpsummering("thumpgo", false, { thumpgo: [post({ aktiv: true })] });
    expect(et.klar).toBe(1);
    expect(et.ikkeSet).toBe(2);
  });

  it("giver pakker og enkeltprodukter hver sin 'alt det du får'", async () => {
    const { scenerTil } = await import("@/components/admin/GalleryField");
    expect(scenerTil(true).map((s) => s.id)).toContain("komposition");
    expect(scenerTil(false).map((s) => s.id)).toContain("hvad_du_faar");
  });
});

describe("Aktiv og inaktiv", () => {
  const kilde = readFileSync(join(process.cwd(), "functions/api/gallery.ts"), "utf8");

  it("er én handling i API'et, og publish slår til med det samme", () => {
    expect(kilde).toMatch(/body\.action === "aktiv"/);
    expect(kilde).not.toMatch(/body\.action === "remove"/);
    // "Brug det" er beslutningen
    expect(kilde).toMatch(/src: url,\s*\/\/[^\n]*\n\s*aktiv: true/);
    // Gravstenen skrives ikke længere
    expect(kilde).not.toMatch(/fjernet: true/);
  });

  it("at rette en billedtekst slår ikke billedet til", () => {
    expect(kilde).toMatch(/\{ \.\.\.statisk!, aktiv: false \}/);
  });

  it("feltet har en toggle pr. billede og ingen 'Fjern'-knap", () => {
    const felt = readFileSync(join(process.cwd(), "src/components/admin/GalleryField.tsx"), "utf8");
    expect(felt).toMatch(/role="switch"/);
    expect(felt).toMatch(/saetAktivKald\(productId, scene\.id, til\)/);
    expect(felt).not.toMatch(/>\s*Fjern\s*</);
    expect(felt).not.toMatch(/godkendEksisterende|fjernKald/);
  });

  it("toggle'n på et bulk-billede slår det til", async () => {
    const { saetAktiv } = await import("@/lib/galleryAdmin");
    const { default: GalleryField } = await import("@/components/admin/GalleryField");
    const onManifest = vi.fn();
    render(
      <GalleryField productId="thumpgo" productName="Thump Go" erPakke={false} aktiv manifest={{}} onManifest={onManifest} />,
    );
    const toggle = screen.getByRole("switch", { name: "Vis Sådan ser det ud til festen på produktsiden" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    await waitFor(() => {
      expect(saetAktiv).toHaveBeenCalledWith("thumpgo", "i_brug", true);
      expect(onManifest).toHaveBeenCalled();
    });
  });
});

describe("Scriptet", () => {
  const kilde = readFileSync(join(process.cwd(), "scripts/product-images/generate.mjs"), "utf8");

  it("skriver manifestet ud fra hele planen, ikke ud fra --only/--scene", () => {
    /**
     * Det gjorde det ikke. En kørsel med --only traadloes_mikrofon skrev et
     * manifest med ét billede i og slettede de 77 andre poster — filerne lå
     * der stadig, men galleriet var væk fra alle produktsider indtil næste
     * fulde kørsel. Filtrene hører til på det, der skal genereres.
     */
    expect(kilde).toMatch(/helePlanen = flag\.only \|\| flag\.scene \? byggeplan\(cfg, pm, flad, \{\}\) : opgaver/);
    expect(kilde.match(/skrivManifest\(helePlanen, cfg\)/g) ?? []).toHaveLength(2);
    // Definitionen hedder stadig (opgaver, cfg) — det er KALDET der ikke må gøre det
    expect(kilde).not.toMatch(/= skrivManifest\(opgaver/);
  });

  it("springer over det, der allerede findes — en genkørsel koster ikke noget", () => {
    expect(kilde).toMatch(/flag\.force \|\| !existsSync\(o\.udSti\)/);
  });

  it("gør ingenting uden --apply", () => {
    expect(kilde).toMatch(/if \(!flag\.apply\) \{/);
    const foerApply = kilde.slice(0, kilde.indexOf("if (!flag.apply)"));
    expect(foerApply).not.toMatch(/await generer\(/);
  });
});

describe("Kommentar til AI'en", () => {
  it("kommer med i prompten", async () => {
    const { byggPrompt, GALLERY_SCENER } = await import("@/lib/galleryPrompt");
    const scene = GALLERY_SCENER.find((s) => s.id === "i_brug")!;
    const b = byggPrompt(flad.get("pakke_bryllup")!, scene, flad, "uden stativer")!;
    expect(b.prompt).toContain("uden stativer");
    expect(b.note).toBe("uden stativer");
  });

  it("står efter scenen, så den kan vinde over den", async () => {
    const { byggPrompt, GALLERY_SCENER } = await import("@/lib/galleryPrompt");
    const scene = GALLERY_SCENER.find((s) => s.id === "i_brug")!;
    const b = byggPrompt(flad.get("pakke_bryllup")!, scene, flad, "uden stativer")!;
    const iScenen = b.prompt.indexOf("The referenced equipment is set up");
    const iNoten = b.prompt.indexOf("uden stativer");
    expect(iNoten).toBeGreaterThan(iScenen);
  });

  it("men aldrig efter reglen om, at grejet skal være vores eget", async () => {
    const { byggPrompt, GALLERY_SCENER } = await import("@/lib/galleryPrompt");
    const scene = GALLERY_SCENER.find((s) => s.id === "i_brug")!;
    const b = byggPrompt(flad.get("pakke_bryllup")!, scene, flad, "en helt anden højtaler")!;
    expect(b.prompt.indexOf("Do not invent")).toBeGreaterThan(b.prompt.indexOf("en helt anden højtaler"));
  });

  it("katalogfotoets ramme står EFTER kommentaren", async () => {
    /**
     * Uden det blev "vis kun én højtaler forfra" til et studiebillede med
     * softbokse og et stativ, produktet ikke ejer. Det der står sidst, vejer
     * tungest — så rammen skal stå sidst.
     */
    const { byggPrompt, KATALOG_SCENE } = await import("@/lib/galleryPrompt");
    const b = byggPrompt(flad.get("festival")!, KATALOG_SCENE, flad, "kun én højtaler")!;
    expect(KATALOG_SCENE.efter_note).toBeTruthy();
    expect(b.prompt.indexOf("Regardless of the instruction above")).toBeGreaterThan(
      b.prompt.indexOf("kun én højtaler"),
    );
    expect(KATALOG_SCENE.efter_note).toMatch(/no speaker stands|no tripods/i);
  });

  it("klipper en meget lang kommentar af og folder mellemrum sammen", async () => {
    const { byggPrompt, GALLERY_SCENER } = await import("@/lib/galleryPrompt");
    const scene = GALLERY_SCENER.find((s) => s.id === "i_brug")!;
    const b = byggPrompt(flad.get("soundboks")!, scene, flad, "  meget   langt  " + "a".repeat(400))!;
    expect(b.note!.length).toBeLessThanOrEqual(300);
    expect(b.note).not.toMatch(/ {2}/);
  });

  it("uden kommentar ser prompten ud som før", async () => {
    const { byggPrompt, GALLERY_SCENER } = await import("@/lib/galleryPrompt");
    const scene = GALLERY_SCENER.find((s) => s.id === "i_brug")!;
    const b = byggPrompt(flad.get("soundboks")!, scene, flad)!;
    expect(b.note).toBeUndefined();
    expect(b.prompt).not.toMatch(/takes priority/);
  });
});

describe("Produktfotoet", () => {
  it("er en scene for sig — ikke en del af galleriet", async () => {
    const { KATALOG_SCENE, scenerFor } = await import("@/lib/galleryPrompt");
    expect(KATALOG_SCENE.katalogfoto).toBe(true);
    for (const p of flad.values()) {
      expect(scenerFor(p).map((s) => s.id)).not.toContain(KATALOG_SCENE.id);
    }
  });

  it("kommer ikke med i scriptets plan", () => {
    const kilde = readFileSync(join(process.cwd(), "scripts/product-images/generate.mjs"), "utf8");
    // Planen bygges af pm.scenerFor, som netop sorterer katalogfotoet fra
    expect(kilde).toMatch(/pm\.scenerFor\(p\)/);
    expect(kilde).not.toMatch(/KATALOG_SCENE/);
  });

  it("kan ikke skrives i galleri-manifestet", () => {
    const api = readFileSync(join(process.cwd(), "functions/api/gallery.ts"), "utf8");
    expect(api).toMatch(/if \(scene\.katalogfoto\)/);
    expect(api).toMatch(/Produktfotoet gemmes på produktet, ikke i galleriet/);
  });

  it("bruger produktets eget foto som reference", async () => {
    const { byggPrompt, KATALOG_SCENE } = await import("@/lib/galleryPrompt");
    const b = byggPrompt(flad.get("soundboks")!, KATALOG_SCENE, flad)!;
    expect(b.referencer.map((r) => r.id)).toEqual(["soundboks"]);
    expect(b.ratio).toBe("1:1");
  });

  it("sidder på produktbilledet i admin, ikke på stemningsbilledet", () => {
    const side = readFileSync(join(process.cwd(), "src/app/admin/produkter/page.tsx"), "utf8");
    expect(side.match(/aiProductId=/g) ?? []).toHaveLength(3);
    expect(side).not.toMatch(/label="Stemningsbillede"[^>]*aiProductId/);
  });

  it("siger fra, hvis produktet ikke har et foto at holde modellen fast på", () => {
    const felt = readFileSync(join(process.cwd(), "src/components/admin/AiProductImage.tsx"), "utf8");
    expect(felt).toMatch(/harBillede/);
    expect(felt).toMatch(/disabled=\{travl \|\| !harBillede\}/);
  });
});

describe("Galleriet på kortet viser ikke produktfotoet", () => {
  it("scenerTil sorterer katalogfotoet fra", async () => {
    const { scenerTil } = await import("@/components/admin/GalleryField");
    for (const erPakke of [true, false]) {
      expect(scenerTil(erPakke).map((s) => s.id)).not.toContain("produktfoto");
      expect(scenerTil(erPakke)).toHaveLength(3);
    }
  });

  it("har et kommentarfelt pr. scene", () => {
    const felt = readFileSync(join(process.cwd(), "src/components/admin/GalleryField.tsx"), "utf8");
    expect(felt).toMatch(/Skriv til AI'en/);
    expect(felt).toMatch(/genererKald\(productId, scene\.id, noter\[scene\.id\], forrige\)/);
  });
});

describe("Billedteksterne", () => {
  /**
   * Soundboks 4 stod med "Rækker til Op til 50 pers. indendørs" og "når du
   * henter soundboks 4" — skabelonen satte ord foran kataloget, der allerede
   * var en sætning, og skrev et mærkenavn i småt. Teksterne er ikke AI'ens;
   * de er skabeloner, og de skal læses som en kunde læser dem.
   */
  it("begynder med kapaciteten som en hel sætning", () => {
    const scene = GALLERY_SCENER.find((s) => s.id === "i_brug")!;
    const b = byggPrompt(flad.get("soundboks")!, scene, flad)!;
    expect(b.caption_da).toMatch(/^Op til 50 personer indendørs/);
    expect(b.caption_da).not.toMatch(/Rækker til Op|pers\./);
    expect(b.caption_en).toMatch(/^Up to 50 people indoors/);
  });

  it("skriver produktnavnet, som det hedder", () => {
    const scene = GALLERY_SCENER.find((s) => s.id === "hvad_du_faar")!;
    const b = byggPrompt(flad.get("soundboks")!, scene, flad)!;
    expect(b.caption_da).toContain("Soundboks 4");
    expect(b.caption_da).not.toContain("soundboks 4");
    expect(b.caption_da).not.toMatch(/kassen/);
    expect(b.caption_en).toContain("Soundboks 4");
  });

  it("kan rettes på produktkortet og gemmes i manifestet", async () => {
    const { gemTekst } = await import("@/lib/galleryAdmin");
    const { default: GalleryField } = await import("@/components/admin/GalleryField");
    const onManifest = vi.fn();
    render(
      <GalleryField productId="soundboks" productName="Soundboks 4" erPakke={false} aktiv manifest={{}} onManifest={onManifest} />,
    );
    const felt = screen.getByLabelText("Billedtekst (dansk) til Alt det du får") as HTMLInputElement;
    expect(felt.value).toBeTruthy(); // skabelonens tekst står der som udgangspunkt
    fireEvent.change(felt, { target: { value: "Soundboks 4 med oplader og rem." } });
    fireEvent.click(screen.getByText("Gem tekst"));
    await waitFor(() => {
      expect(gemTekst).toHaveBeenCalledWith("soundboks", "hvad_du_faar", "Soundboks 4 med oplader og rem.", expect.any(String));
      expect(onManifest).toHaveBeenCalled();
    });
  });

  it("API'et lader en håndskrevet tekst overleve 'Lav om'", () => {
    const api = readFileSync(join(process.cwd(), "functions/api/gallery.ts"), "utf8");
    expect(api).toMatch(/body\.action === "tekst"/);
    expect(api).toMatch(/caption_da: forrige\?\.egenTekst \? forrige\.caption_da : bygget\.caption_da/);
    // Tomt felt sætter skabelonen tilbage — ellers kunne en fejl ikke fortrydes
    expect(api).toMatch(/caption_da: da \|\| bygget\.caption_da/);
  });

  it("skabelonen sætter ikke selv 'Rækker til' foran kapaciteten", () => {
    const s = readFileSync(join(process.cwd(), "gallery/scenes.json"), "utf8");
    expect(s).not.toMatch(/Rækker til \{kapacitet\}/);
    expect(s).not.toMatch(/navn_lav/);
  });
});

describe("Lav om ser det billede, der rettes", () => {
  /**
   * "Det samme uden stativer" var et helt nyt billede fra bunden: modellen
   * fik kun produktfotoene og havde aldrig set det, man kiggede på. Nu sendes
   * det forrige billede med som SIDSTE reference, og prompten beder om at
   * holde kompositionen.
   */
  const scene = GALLERY_SCENER.find((s) => s.id === "i_brug")!;

  it("beder om at holde kompositionen — efter noten, før reglerne", () => {
    const b = byggPrompt(flad.get("soundboks")!, scene, flad, "uden stativer", true)!;
    expect(b.forrige).toBe(true);
    const iNoten = b.prompt.indexOf("uden stativer");
    const iForrige = b.prompt.indexOf("previous version of this exact picture");
    expect(iForrige).toBeGreaterThan(iNoten);
    expect(b.prompt.indexOf("Do not invent")).toBeGreaterThan(iForrige);
  });

  it("uden tekst er det en ny tagning af det samme billede", () => {
    const b = byggPrompt(flad.get("soundboks")!, scene, flad, "", true)!;
    expect(b.forrige).toBe(true);
    expect(b.prompt).toMatch(/fresh take/);
    expect(b.prompt).not.toMatch(/instruction above/);
    // Og uden forrige er prompten som før
    const uden = byggPrompt(flad.get("soundboks")!, scene, flad, "")!;
    expect(uden.forrige).toBe(false);
    expect(uden.prompt).not.toMatch(/previous version/);
  });

  it("lader det forrige billede tage en referenceplads, så loftet holder", () => {
    const p = flad.get("pakke_bryllup")!;
    const komposition = GALLERY_SCENER.find((s) => s.id === "komposition")!;
    const uden = byggPrompt(p, komposition, flad)!;
    const med = byggPrompt(p, komposition, flad, "tættere på", true)!;
    expect(uden.referencer.length).toBe(6);
    expect(med.referencer.length).toBe(5);
    expect(med.skaaret).toHaveLength(1);
  });

  it("API'et sætter det forrige billede sidst i input", () => {
    const api = readFileSync(join(process.cwd(), "functions/api/gallery.ts"), "utf8");
    const loekke = api.indexOf("for (const r of bygget.referencer)");
    const forrige = api.indexOf("if (bygget.forrige)");
    const kald = api.indexOf("fetch(GALLERY_SPEC.endpoint");
    expect(loekke).toBeGreaterThan(-1);
    expect(forrige).toBeGreaterThan(loekke);
    expect(kald).toBeGreaterThan(forrige);
    // Kun stier på sitet eller base64 — ikke en vilkårlig URL
    expect(api).toMatch(/forrigeUrl\.startsWith\("\/api\/image\/"\) \|\| forrigeUrl\.startsWith\("\/images\/"\)/);
  });

  it("feltet sender det, man kigger på: forslaget først, ellers det der er live", () => {
    const felt = readFileSync(join(process.cwd(), "src/components/admin/GalleryField.tsx"), "utf8");
    expect(felt).toMatch(/usendt \? \{ billede: usendt\.billede, mime: usendt\.mime \} : live \? \{ url: live \}/);
    expect(felt).toMatch(/genererKald\(productId, scene\.id, noter\[scene\.id\], forrige\)/);
    // To knapper: den ene sender billedet med, den anden gør ikke
    expect(felt).toMatch(/Ret dette billede/);
    expect(felt).toMatch(/Ny optagelse/);
    expect(felt).toMatch(/generer\(scene, true\)/);
    expect(felt).toMatch(/generer\(scene, false\)/);
    const produktfoto = readFileSync(join(process.cwd(), "src/components/admin/AiProductImage.tsx"), "utf8");
    expect(produktfoto).toMatch(/retForslaget && forslag \? \{ billede: forslag\.billede, mime: forslag\.mime \} : undefined/);
  });

  it("klienten sender det forrige med, når knappen siger det — også uden tekst", () => {
    const klient = readFileSync(join(process.cwd(), "src/lib/galleryAdmin.ts"), "utf8");
    expect(klient).toMatch(/note: ren, forrige \}/);
  });
});

describe("To billeder på samme tid", () => {
  /**
   * "Lav om" på to scener lige efter hinanden: da den travle scene var én
   * streng, overtog det andet tryk den. Første knap låste op midt i arbejdet
   * (og kunne trykkes igen — endnu et billede for pengene), og da det første
   * blev færdigt, låste det andet op, selvom det stadig kørte.
   */
  function udsat<T>() {
    let løs!: (v: T) => void;
    const p = new Promise<T>((r) => (løs = r));
    return { p, løs };
  }
  const forslag = (id: string) => ({
    billede: "AAAA", mime: "image/jpeg", titel_da: id, alt_da: id, caption_da: id, skaaret: [], mangler: [],
  });

  it("holder hver scene låst, til dens eget billede er færdigt", async () => {
    const { generer } = await import("@/lib/galleryAdmin");
    const { default: GalleryField } = await import("@/components/admin/GalleryField");
    const første = udsat<ReturnType<typeof forslag>>();
    const andet = udsat<ReturnType<typeof forslag>>();
    vi.mocked(generer).mockReturnValueOnce(første.p).mockReturnValueOnce(andet.p);

    render(
      <GalleryField productId="soundboks" productName="Soundboks 4" erPakke={false} aktiv manifest={{}} onManifest={vi.fn()} />,
    );
    // soundboks har billeder fra bulk-kørslen — hver scene har "Ret dette billede" og "Ny optagelse"
    const nyOptagelse = () => screen.getAllByRole("button", { name: /^Ny optagelse/ });
    expect(nyOptagelse()).toHaveLength(3);

    fireEvent.click(nyOptagelse()[0]);
    fireEvent.click(nyOptagelse()[1]);
    expect(generer).toHaveBeenCalledTimes(2);

    // Begge arbejder, og den tredje kan stadig trykkes
    const travle = screen.getAllByRole("button", { name: "Genererer…" });
    expect(travle).toHaveLength(2);
    for (const k of travle) expect(k).toBeDisabled();
    expect(nyOptagelse()[0]).toBeDisabled();
    expect(nyOptagelse()[1]).toBeDisabled();
    expect(nyOptagelse()[2]).not.toBeDisabled();

    // Det første bliver færdigt — det andet må ikke låse op af den grund
    første.løs(forslag("a"));
    await waitFor(() => expect(screen.getByText("Brug det")).toBeInTheDocument());
    expect(screen.getAllByRole("button", { name: "Genererer…" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Genererer…" })).toBeDisabled();

    andet.løs(forslag("b"));
    await waitFor(() => expect(screen.getAllByText("Brug det")).toHaveLength(2));
    expect(screen.queryByRole("button", { name: "Genererer…" })).toBeNull();
  });

  it("gemmer to forslag efter hinanden, ikke oven i hinanden", async () => {
    /**
     * API'et læser manifestet, retter én post og skriver det hele tilbage.
     * To "Brug det" på samme tid ville læse det samme udgangspunkt, og den
     * sidste ville skrive den førstes billede væk igen.
     */
    const { generer, udgivForslag } = await import("@/lib/galleryAdmin");
    const { default: GalleryField } = await import("@/components/admin/GalleryField");
    vi.mocked(generer).mockImplementation(async (_p, scene) => forslag(scene));
    const første = udsat<{ billeder: never[]; bytes: number }>();
    let igang = 0;
    let flestSamtidig = 0;
    vi.mocked(udgivForslag).mockImplementation(async () => {
      igang++;
      flestSamtidig = Math.max(flestSamtidig, igang);
      try {
        return igang === 1 && flestSamtidig === 1 ? await første.p : { billeder: [], bytes: 1 };
      } finally {
        igang--;
      }
    });

    render(
      <GalleryField productId="soundboks" productName="Soundboks 4" erPakke={false} aktiv manifest={{}} onManifest={vi.fn()} />,
    );
    const nyOptagelse = screen.getAllByRole("button", { name: /^Ny optagelse/ });
    fireEvent.click(nyOptagelse[0]);
    fireEvent.click(nyOptagelse[1]);
    await waitFor(() => expect(screen.getAllByText("Brug det")).toHaveLength(2));

    const brug = screen.getAllByRole("button", { name: "Brug det" });
    fireEvent.click(brug[0]);
    fireEvent.click(brug[1]);
    await waitFor(() => expect(udgivForslag).toHaveBeenCalledTimes(1));
    expect(screen.getAllByRole("button", { name: "Gemmer…" })).toHaveLength(2);

    første.løs({ billeder: [], bytes: 1 });
    await waitFor(() => expect(udgivForslag).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Gemmer…" })).toBeNull());
    expect(flestSamtidig).toBe(1);
  });
});
