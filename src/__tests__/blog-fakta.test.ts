/**
 * Blogindlæggene må ikke modsige kataloget eller adressen.
 *
 * Indlæggene var over et år gamle, og de var drevet fra virkeligheden uden at
 * nogen opdagede det: prislister med pakkenavne, der ikke findes længere
 * ("Party 395 kr", "Festival 1.200 kr"), en påstand om at prisen ganges med
 * antal dage — den er flad for 1-5 dage — og seks indlæg, der sendte kunden
 * til Vesterbro efter udstyret. Adressen er Vermlandsgade 66 på Amager.
 *
 * En blogtekst er ikke et produktkatalog og skal ikke tvinges til at citere
 * hver pris. Men de tal og den adresse, den FAKTISK nævner, skal passe.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { addons, rentalProducts, speakers, startPrice } from "@/lib/products";
import { DEFAULT_PICKUP_ADDRESS } from "@/lib/pickup";

const DOCS = join(process.cwd(), "docs");
const filer = readdirSync(DOCS).filter((f) => f.endsWith(".md"));

/** Begge sprog — de engelske indlæg bærer de samme løfter. */
function alleIndlaeg(): string[] {
  const en = join(DOCS, "en");
  return [
    ...filer.map((f) => join(DOCS, f)),
    ...readdirSync(en).filter((f) => f.endsWith(".md")).map((f) => join(en, f)),
  ];
}

function katalogBeloeb(): Set<number> {
  const b = new Set<number>();
  for (const s of speakers) b.add(s.price);
  for (const a of addons) b.add(a.price);
  for (const r of rentalProducts) {
    b.add(r.price);
    if (r.bundle) {
      b.add(r.bundle.discount);
      for (const p of r.bundle.parts) b.add(p.price);
    }
  }
  return b;
}

/** Beløb der ikke er vores egne priser, men markedspriser vi sammenligner med. */
const SAMMENLIGNING = new Set([1200, 2000, 5000, 6000, 10000, 15000]);

/**
 * "Fra X kr" om en højtaler må ikke være billigere end den billigste højtaler.
 *
 * Fem indlæg lovede "fra 395 kr" længe efter at Mackie Thump GO var steget, og
 * testen ovenfor så intet galt: 395 kr er lysbarens pris, så beløbet fandtes jo
 * i kataloget. Men et "fra"-tal, der er lavere end noget, vi har, er et tilbud,
 * vi ikke kan indfri — kunden klikker og finder en anden pris.
 *
 * Reglen gælder kun sætninger, der faktisk handler om lyd: "festlys fra 395 kr"
 * er rigtigt, fordi lysbaren koster det.
 */
describe("Fra-priser i blogindlæg", () => {
  it("lover aldrig en højtaler billigere end den billigste vi har", () => {
    const FRA = /\b(?:fra|from|starter (?:ved|fra)|start(?:s)? at)\b[^.\n]{0,24}?\*{0,2}(\d{1,3}(?:[.,]\d{3})*)\s*(?:kr|DKK)/gi;
    const LYD = /(højtaler|hojtaler|speaker|anlæg|pa[- ]system|soundboks)/i;
    const afvigelser: string[] = [];
    for (const sti of alleIndlaeg()) {
      const txt = readFileSync(sti, "utf8");
      for (const m of txt.matchAll(FRA)) {
        const beloeb = Number(m[1].replace(/[.,]/g, ""));
        // Sætningen omkring fundet — er den om lyd?
        const fra = Math.max(0, m.index! - 140);
        const omkring = txt.slice(fra, m.index! + m[0].length + 60);
        if (!LYD.test(omkring)) continue;
        if (beloeb < startPrice) {
          afvigelser.push(
            `${sti.split("/docs/")[1]}: "${m[0].trim()}" — billigste højtaler er ${startPrice} kr`,
          );
        }
      }
    }
    expect(afvigelser, `fra-priser vi ikke kan indfri:\n${afvigelser.join("\n")}`).toEqual([]);
  });
});

describe("Blogindlæg", () => {
  it("nævner ingen priser, der ikke findes i kataloget", () => {
    const kendte = katalogBeloeb();
    const afvigelser: string[] = [];

    for (const f of filer) {
      const txt = readFileSync(join(DOCS, f), "utf8");
      for (const m of txt.matchAll(/(\d{1,3}(?:[.,]\d{3})*)\s*(?:kr|DKK)/gi)) {
        const n = Number(m[1].replace(/[.,]/g, ""));
        if (n < 50 || SAMMENLIGNING.has(n) || kendte.has(n)) continue;
        afvigelser.push(`${f}: ${m[0]}`);
      }
    }
    expect(afvigelser, `priser uden dækning i products.ts:\n${afvigelser.join("\n")}`).toEqual([]);
  });

  it("placerer os ikke i en bydel, vi ikke ligger i", () => {
    const bydel = /(?:på|from|on|in)\s+(Vesterbro|Nørrebro|Østerbro|Holmen|Valby|Frederiksberg)\b/gi;
    const forkerte: string[] = [];
    for (const f of filer) {
      const txt = readFileSync(join(DOCS, f), "utf8");
      for (const m of txt.matchAll(bydel)) forkerte.push(`${f}: "${m[0]}"`);
    }
    expect(forkerte, `vi ligger på ${DEFAULT_PICKUP_ADDRESS}:\n${forkerte.join("\n")}`).toEqual([]);
  });

  it("påstår ikke dagstillæg — prisen er flad for 1-5 dage", () => {
    const forkerte = filer.filter((f) =>
      /ganges med antal dage|pris per dag|pris pr\. dag/i.test(readFileSync(join(DOCS, f), "utf8"))
    );
    expect(forkerte, `dagstillæg påstået i:\n${forkerte.join("\n")}`).toEqual([]);
  });

  it("har en updated-dato, der ikke ligger før udgivelsen", () => {
    const bagud: string[] = [];
    for (const f of filer) {
      const txt = readFileSync(join(DOCS, f), "utf8");
      const date = txt.match(/^date: "([^"]+)"/m)?.[1];
      const updated = txt.match(/^updated: "([^"]+)"/m)?.[1];
      if (date && updated && updated < date) bagud.push(`${f}: ${updated} < ${date}`);
    }
    expect(bagud, `updated ligger før date:\n${bagud.join("\n")}`).toEqual([]);
  });
});
