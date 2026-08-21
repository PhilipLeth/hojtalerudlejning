/**
 * FAQ-markup må ikke lyve, og der må kun være én FAQPage pr. side.
 *
 * Baggrund: forsidens FAQ påstod i lang tid 695 kr for den store højtalerpakke
 * (den koster 495), at bæretasken var inkluderet (den er et tilkøb til 95 kr),
 * og at levering til 495 kr både var ud og hjem (begge veje koster 795). De tre
 * fejl stod i FAQPage-markup og var altså det, Google og svarmaskinerne fik
 * serveret som facit. Ingen test fangede det, fordi ingen sammenlignede
 * teksterne med kataloget.
 *
 * Testen herunder gør netop det: hvert beløb i et FAQ-svar skal svare til et
 * tal, der findes i products.ts.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { addons, rentalProducts, speakers } from "@/lib/products";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import { buildProductFaq, DELIVERY_BOTH_WAYS, DELIVERY_ONE_WAY } from "@/lib/productFaq";

/** Alle beløb der findes i kataloget — priser, dele af pakker og rabatter. */
function catalogAmounts(): Set<number> {
  const amounts = new Set<number>();
  for (const s of speakers) amounts.add(s.price);
  for (const a of addons) amounts.add(a.price);
  for (const r of rentalProducts) {
    amounts.add(r.price);
    if (r.bundle) {
      amounts.add(r.bundle.discount);
      for (const p of r.bundle.parts) amounts.add(p.price);
    }
  }
  return amounts;
}

/** "1.495 kr" og "495 kr" → 1495 og 495 */
function amountsIn(text: string): number[] {
  return [...text.matchAll(/(\d{1,3}(?:\.\d{3})*) kr/g)].map((m) => Number(m[1].replace(/\./g, "")));
}

const SRC = join(process.cwd(), "src");

function readAll(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) readAll(full, acc);
    else if (/\.tsx?$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

describe("FAQ-markup", () => {
  it("hvert beløb i kategorisidernes FAQ findes i kataloget", () => {
    const known = catalogAmounts();
    const ukendte: string[] = [];

    for (const [slug, items] of Object.entries(CATEGORY_FAQ)) {
      for (const item of items) {
        for (const amount of amountsIn(`${item.q} ${item.a}`)) {
          if (!known.has(amount)) ukendte.push(`${slug}: ${amount} kr — "${item.q}"`);
        }
      }
    }
    expect(ukendte, `beløb uden dækning i products.ts:\n${ukendte.join("\n")}`).toEqual([]);
  });

  it("kørselspriserne holdes adskilt: 495 er én vej, 795 er begge veje", () => {
    // Fejlen der stod på fem sider: 495 kr beskrevet som "vi sætter op og
    // henter igen". Det er 795 kr — 495 er kun den ene vej.
    expect(DELIVERY_ONE_WAY).toBe(addons.find((a) => a.id === "levering_ud")?.price);
    expect(DELIVERY_BOTH_WAYS).toBe(addons.find((a) => a.id === "levering_begge")?.price);

    const sider = readAll(SRC).filter((f) => !f.includes("__tests__"));
    const paastande: string[] = [];
    for (const f of sider) {
      const tekst = readFileSync(f, "utf8");
      // "495 kr" efterfulgt af et løfte om også at hente igen, uden at 795 nævnes.
      // Vinduet skal være langt nok til at "…koster begge veje 795 kr" når at
      // komme med — ellers dømmer testen den rigtige sætning ude.
      for (const m of tekst.matchAll(/495 kr[^"]{0,220}/g)) {
        const s = m[0];
        if (/henter igen|begge veje|og hjem/.test(s) && !s.includes("795")) {
          paastande.push(`${f.replace(SRC, "src")}: ${s.trim()}`);
        }
      }
    }
    expect(paastande, `495 kr påstås at dække begge veje:\n${paastande.join("\n")}`).toEqual([]);
  });

  it("beløbet i llms.txt-generatoren findes stadig i kataloget", () => {
    // Generatoren henter alt andet fra markup'en, men prisen for begge veje
    // findes ingen steder i den — så den står som et tal i scriptet og skal
    // holdes i snor herfra.
    const script = readFileSync(join(process.cwd(), "scripts/generate-llms-txt.py"), "utf8");
    const m = script.match(/^DELIVERY_BOTH_WAYS = (\d+)$/m);
    expect(m, "DELIVERY_BOTH_WAYS mangler i generate-llms-txt.py").not.toBeNull();
    expect(Number(m![1])).toBe(DELIVERY_BOTH_WAYS);
    expect(catalogAmounts().has(Number(m![1]))).toBe(true);
  });

  it("produktsidernes FAQ bygges af kataloget og nævner ingen fremmede beløb", () => {
    const known = catalogAmounts();
    const ukendte: string[] = [];

    for (const s of speakers) {
      const items = buildProductFaq({ name: s.da.name, price: s.price, productId: s.id });
      for (const item of items) {
        for (const amount of amountsIn(item.a)) {
          if (!known.has(amount)) ukendte.push(`${s.id}: ${amount} kr`);
        }
      }
      // Hvert produkt skal have noget at blive citeret for
      expect(items.length, `${s.id} har for få spørgsmål`).toBeGreaterThanOrEqual(4);
    }
    expect(ukendte, `beløb uden dækning:\n${ukendte.join("\n")}`).toEqual([]);
  });

  it("ingen side har både forsidens FAQ og en FaqSection", () => {
    // To FAQPage-blokke på samme side er modstridende markup.
    const dubletter = readAll(join(SRC, "app"))
      .filter((f) => f.endsWith("page.tsx"))
      .filter((f) => {
        const c = readFileSync(f, "utf8");
        return /from "@\/components\/FAQ"/.test(c) && /FaqSection/.test(c);
      });
    expect(dubletter, `både FAQ og FaqSection i:\n${dubletter.join("\n")}`).toEqual([]);
  });
});
