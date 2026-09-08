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
    expect(localizedHref(danskSti("/mixer"), "en")).toBe("/mixer");
  });

  it("sprogskifteren peger aldrig på den side, man allerede står på", () => {
    // localizedHref falder tilbage til dansk, når siden ikke findes på engelsk.
    // Brugt råt gav det href="/mixer">English på /mixer — et link til intet.
    const src = læs("components/BurgerMenu.tsx");
    expect(src).toContain("hasEnglish");
    expect(src).toMatch(/hasEnglish\(daSti\)[\s\S]{0,80}"\/en"/);
  });

  it("båndet øverst findes på begge sprog", () => {
    const src = læs("components/TopBar.tsx");
    expect(src).toMatch(/Delivery across Copenhagen/);
    expect(src).toMatch(/Levering i hele København/);
    // Leveringsprisen slås op, så båndet ikke kan love noget andet end bookingen
    expect(src).toContain("DELIVERY_ONE_WAY");
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
      price: 295,
      productId: "traadloes_mikrofon",
      phrase: "a wireless microphone",
    });
    const svar = faq.find((f) => f.q.startsWith("What is included"))!.a;
    expect(svar).toContain("Wireless handheld mic");
    expect(svar).not.toMatch(/Trådløs|Modtager|Kabelforbindelse/);
    // Bindeordet skal være engelsk — funktionen var delt med den danske udgave
    expect(svar).toMatch(/ and /);
    expect(svar).not.toMatch(/ og /);
  });
});
