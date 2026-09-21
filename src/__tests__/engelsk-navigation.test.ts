/**
 * Den engelske udgave må ikke tabe navigationen og pakkelisten.
 *
 * Menuen, båndet øverst og pakkelisten på produktkortene kom alle fra
 * root-layoutet eller fra kataloget, og de var hårdkodet på dansk. Resultatet
 * var 26 danske links på hver eneste /en-side, et bånd der lovede "Levering i
 * hele København", og en engelsk FAQ der svarede "comes with Trådløs
 * håndholdt mic, Modtager og Kabelforbindelse til højtaler".
 *
 * Testen her fejler, hvis nogen af de tre falder tilbage til dansk igen.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { sprogskifteSti } from "@/lib/enPages";
import { join } from "node:path";
import { NAV_CATEGORIES } from "@/lib/products";
import { CONTENTS_EN, contentsFor } from "@/lib/contentsEn";
import { buildProductFaq } from "@/lib/productFaq";
import { danskSti, localizedHref } from "@/lib/enPages";

const SRC = join(process.cwd(), "src");
const læs = (p: string) => readFileSync(join(SRC, p), "utf8");

describe("Engelsk navigation", () => {
  it("hvert menupunkt har en engelsk label", () => {
    const uden: string[] = [];
    for (const c of NAV_CATEGORIES) {
      if (!c.title_en?.trim()) uden.push(`kategori ${c.id}`);
      for (const l of c.links) {
        if (!l.label_en?.trim()) uden.push(`${c.id} → ${l.href}`);
        // En engelsk label, der er identisk med den danske, er kun i orden når
        // ordet er det samme på begge sprog (produktnavne som "Soundboks 4").
        if (l.label_en === l.label && /[æøå]/i.test(l.label)) {
          uden.push(`${l.href} er ikke oversat: "${l.label}"`);
        }
      }
    }
    expect(uden, `menupunkter uden engelsk:\n${uden.join("\n")}`).toEqual([]);
  });

  it("menuen bruger localizedHref frem for katalogets danske stier", () => {
    const src = læs("components/BurgerMenu.tsx");
    expect(src).toContain("localizedHref");
    // Hvert link i panelet skal gå gennem nav(); står der href={link.href},
    // sender menuen engelske kunder ind i dansk tekst.
    expect(src).not.toMatch(/href=\{link\.href\}/);
    expect(src).not.toMatch(/href=\{section\.href\}/);
  });

  it("sprogskifteren bliver på samme side", () => {
    // /en/festlys → /festlys og retur. Før pegede den altid på forsiden.
    expect(danskSti("/en/festlys")).toBe("/festlys");
    expect(danskSti("/en")).toBe("/");
    expect(danskSti("/festlys")).toBe("/festlys");
    expect(localizedHref(danskSti("/en/festlys"), "en")).toBe("/en/festlys");
    // En side uden engelsk udgave falder tilbage til dansk, ikke til en 404.
    // /mixer og /karaoke-maskine stod her, indtil de fik engelske udgaver.
    expect(localizedHref(danskSti("/polterabend"), "en")).toBe("/polterabend");
  });

  /**
   * Sprogskifteren testes på opførsel, ikke på kildetekst.
   *
   * Før stod reglen skrevet ud i BurgerMenu, og testen læste efter ordet
   * "hasEnglish" i filen. Headeren havde sin EGEN sprogskifter, som bare
   * oversatte stien — og på /en/blog/garden-party-sound pegede "DA" derfor på
   * /blog/garden-party-sound, en side der ikke findes. Tolv engelske
   * blogindlæg havde hver sit døde link, og testen var grøn hele tiden.
   *
   * Nu er der én funktion, begge bruger, og den prøves på de stier, der gør ondt.
   */
  it("sprogskifteren lander altid på en side der findes", () => {
    // Blogindlæg: slug'en bærer sit eget sprogs søgeord og kan ikke oversættes
    expect(sprogskifteSti("/en/blog/garden-party-sound", "da")).toBe("/blog/lyd-til-havefest");
    expect(sprogskifteSti("/blog/lyd-til-havefest", "en")).toBe("/en/blog/garden-party-sound");
    // Et indlæg uden makker går til bloggens forside, ikke til en 404
    expect(sprogskifteSti("/en/blog/speaker-rental-copenhagen", "da")).toBe("/blog");
    // Almindelige sider oversættes
    expect(sprogskifteSti("/en/festlys", "da")).toBe("/festlys");
    expect(sprogskifteSti("/festlys", "en")).toBe("/en/festlys");
    // Findes siden ikke på engelsk, er forsiden bedre end den side man står på
    expect(sprogskifteSti("/polterabend", "en")).toBe("/en");
    expect(sprogskifteSti("/en", "da")).toBe("/");
    expect(sprogskifteSti("/", "en")).toBe("/en");
  });

  it("både headeren og menuen bruger den samme sprogskifter", () => {
    for (const fil of ["components/BurgerMenu.tsx", "components/SiteHeader.tsx"]) {
      const src = læs(fil);
      expect(src, `${fil} har sin egen sprogskifter`).toContain("sprogskifteSti");
      expect(src, `${fil} oversætter stien blindt`).not.toMatch(/localizedHref\(danskSti/);
    }
  });

  it("båndet øverst findes på begge sprog", () => {
    const src = læs("components/TopBar.tsx");
    expect(src).toMatch(/Event AV in Copenhagen/);
    expect(src).toMatch(/AV til events i København/);
    expect(src).toContain("Add delivery and setup when you book");
  });
});

describe("Pakkelisten på engelsk", () => {
  it("hver linje i products.ts findes i ordbogen", () => {
    const ts = readFileSync(join(SRC, "lib/products.ts"), "utf8");
    const mangler = new Set<string>();
    for (const m of ts.matchAll(/contents: \[([^\]]*)\]/g)) {
      for (const t of m[1].matchAll(/"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g)) {
        const linje = t[1] !== undefined ? t[1].replace(/\\"/g, '"') : t[2];
        if (!CONTENTS_EN[linje]) mangler.add(linje);
      }
    }
    expect(
      [...mangler],
      `pakkelinjer uden engelsk i contentsEn.ts:\n${[...mangler].join("\n")}`
    ).toEqual([]);
  });

  it("oversætter listen på engelsk og lader den stå på dansk", () => {
    const da = ["Trådløs håndholdt mic", "Modtager", "Strømkabel"];
    expect(contentsFor(da, "da")).toEqual(da);
    expect(contentsFor(da, "en")).toEqual([
      "Wireless handheld mic",
      "Receiver",
      "Power cable",
    ]);
    // Et ukendt ord må ikke blive til en tom linje
    expect(contentsFor(["Noget helt nyt"], "en")).toEqual(["Noget helt nyt"]);
  });

  it('"what is included" svarer på engelsk hele vejen', () => {
    const faq = buildProductFaq({
      locale: "en",
      name: "Wireless microphone",
      price: 445, // produktarket 17. sept 2026
      productId: "traadloes_mikrofon",
      phrase: "a wireless microphone",
    });
    const svar = faq.find((f) => f.q.startsWith("What is included"))!.a;
    // produktarket 17. sept 2026: den trådløse mikrofon er nu Shure BLX24/SM58
    expect(svar).toContain("Shure BLX24/SM58 wireless microphone");
    expect(svar).toContain("Shure receiver");
    expect(svar).not.toMatch(/Trådløs|trådløs|Modtager|Kabelforbindelse/);
    // Bindeordet skal være engelsk — funktionen var delt med den danske udgave
    expect(svar).toMatch(/ and /);
    expect(svar).not.toMatch(/ og /);
  });
});
