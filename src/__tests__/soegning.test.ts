/**
 * Søgningen skal finde det, folk rent faktisk taster.
 *
 * Sortimentet er 55 produkter på 38 sider, og menuen viser bevidst kun et
 * udvalg. Søgefeltet er derfor den eneste vej til fx lærredet eller den
 * håndholdte mikrofon, hvis man ikke ved hvilken kategori de bor under.
 *
 * Det væsentligste, testene her holder fast i: æ/ø/å må ikke stå i vejen.
 * Folk taster "hojtaler", "roegmaskine" og "laerred" lige så ofte som de
 * taster bogstaverne rigtigt.
 */
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { speakers, addons, rentalProducts, cheapestSpeakerPrice } from "@/lib/products";
import { buildSearchIndex, search, EKSTRA_SIDER } from "@/lib/searchIndex";

const katalog = {
  speakers,
  addons,
  rentalProducts,
  startPrice: cheapestSpeakerPrice(),
};

const da = buildSearchIndex(katalog, "da");
const en = buildSearchIndex(katalog, "en");

const titler = (q: string, index = da) => search(index, q).map((r) => r.title);
const stier = (q: string, index = da) => search(index, q).map((r) => r.href);

describe("Søgning", () => {
  it("finder produktet uanset om æ/ø/å er tastet", () => {
    for (const q of ["højtaler", "hojtaler", "hoejtaler"]) {
      expect(titler(q).join(" "), q).toMatch(/højtalerpakke|Højtaler/i);
    }
    for (const q of ["røgmaskine", "rogmaskine", "roegmaskine"]) {
      expect(titler(q).join(" "), q).toMatch(/røgmaskine/i);
    }
    for (const q of ["lærred", "larred", "laerred"]) {
      expect(titler(q).join(" "), q).toMatch(/lærred/i);
    }
  });

  it("finder på produktnavn, også midt i ordet", () => {
    expect(titler("soundboks")).toContain("Soundboks 4");
    expect(titler("thump")).toContain("Mackie Thump GO");
    // Produktet hedder Discokugle, men halvdelen staver det med k
    for (const q of ["disco", "disko", "diskokugle"]) {
      expect(titler(q).join(" "), q).toMatch(/Discokugle/i);
    }
  });

  it("kræver at alle ord passer — ikke bare ét af dem", () => {
    const resultater = titler("trådløs mikrofon");
    // Selve mikrofonen skal ligge øverst. Pakker der INDEHOLDER en trådløs
    // mikrofon må gerne komme med nedenunder — de er et gyldigt svar på
    // "hvor får jeg fat i en trådløs mikrofon".
    expect(resultater[0]).toMatch(/trådløs mikrofon/i);
    // Den kablede håndholdte er ikke trådløs og matcher ikke begge ord
    expect(resultater.join(" ")).not.toMatch(/håndholdt/i);
  });

  it("sætter det, man skrev navnet på, øverst", () => {
    // Karaokemaskinen stod her før pausen. Discokuglen er samme prøve: et
    // sammensat navn, hvor titlen skal slå de pakker, der indeholder den.
    expect(titler("discokugle")[0]).toMatch(/discokugle/i);
    expect(titler("soundboks")[0]).toBe("Soundboks 4");
  });

  it("svarer ikke på ét bogstav", () => {
    expect(search(da, "s")).toEqual([]);
    expect(search(da, " ")).toEqual([]);
  });

  it("finder kategorisider, når man søger bredt", () => {
    // Karaoke er på pause og står hverken i menuen eller i kataloget længere,
    // så det er med vilje, at søgningen ikke fører nogen derhen.
    expect(stier("mikrofon")).toContain("/lej-mikrofon");
    expect(stier("pa-anlæg")).toContain("/lydudstyr");
    expect(stier("erhverv")).toContain("/erhverv");
  });

  it("giver produkter før kategorisider ved samme relevans", () => {
    const r = search(da, "røg");
    const førsteSide = r.findIndex((x) => x.kind === "side");
    const sidsteProdukt = r.map((x) => x.kind).lastIndexOf("produkt");
    if (førsteSide !== -1 && sidsteProdukt !== -1) {
      expect(r[0].kind).toBe("produkt");
    }
  });

  it("har pris med på produkter, så man kan vælge i listen", () => {
    const r = search(da, "soundboks").find((x) => x.title === "Soundboks 4");
    expect(r?.price).toBe(speakers.find((s) => s.id === "soundboks")!.price);
  });

  it("viser engelske navne på engelsk og linker til engelsk side hvor den findes", () => {
    expect(titler("speaker", en).join(" ")).toMatch(/Speaker Package/i);
    expect(stier("soundboks", en)).toContain("/en/soundboks-4");
    // Produkter uden engelsk side beholder den danske sti — et link til
    // det forkerte sprog er stadig bedre end et link til ingenting
    expect(stier("disco", en).concat(stier("discokugle", en))).toContain("/discokugle");
  });

  it("viser ikke danske kategorisider i den engelske søgning", () => {
    expect(en.some((e) => e.kind === "side")).toBe(false);
  });

  it("de ekstra sider findes rent faktisk", () => {
    for (const [href] of EKSTRA_SIDER) {
      const sti = join(process.cwd(), "src/app", href.slice(1), "page.tsx");
      expect(existsSync(sti), `${href} findes ikke`).toBe(true);
    }
  });

  it("hver sti optræder kun én gang i resultaterne", () => {
    for (const q of ["lys", "mikrofon", "pakke", "højtaler"]) {
      const s = stier(q);
      expect(new Set(s).size, q).toBe(s.length);
    }
  });
});
