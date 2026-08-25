/**
 * Priser i sidetekst må ikke sige noget andet end kataloget.
 *
 * Frederiks prisstigning ramte products.ts, men hver side bar sine egne tal:
 * /soundboks-4 sendte kunden videre til Mackie Thump GO "– 345 kr", mens
 * bookingen tog 395. Røgmaskinen stod 245 kr fem steder efter at være steget
 * til 595, og forsidens FAQ svarede med hele den gamle prisliste.
 *
 * Testen kan tre ting:
 *
 *  1. Ingen knap eller "se også"-link ved siden af et produktlink må skrive
 *     prisen som tekst — den skal komme fra kataloget (LivePrice/priceId).
 *  2. Ethvert beløb, der står som tal i en side, skal findes i kataloget:
 *     som pris, som rabat eller som summen af en pakkes dele.
 *  3. Nævner et blogindlæg et produkt med en pris, skal det være produktets
 *     egen pris.
 *
 * Undtagelserne står i MARKEDSPRISER — beløb, vi sammenligner os MED og
 * derfor ikke selv tager.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { addons, rentalProducts, speakers } from "@/lib/products";

const ROOT = process.cwd();

function walk(dir: string, ext: RegExp, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, ext, out);
    else if (ext.test(e)) out.push(p);
  }
  return out;
}

/** Kundevendte sider og komponenter — admin er et internt værktøj, ikke en salgstekst. */
function sidefiler(): string[] {
  return [
    ...walk(join(ROOT, "src/app"), /\.tsx?$/),
    ...walk(join(ROOT, "src/components"), /\.tsx?$/),
    ...walk(join(ROOT, "src/lib"), /\.ts$/),
  ].filter((f) => !f.includes("/admin/") && !/\/(useAdmin|admin)[A-Z]/.test(f));
}

const rel = (f: string) => f.replace(ROOT + "/", "");

/** Beløb vi sammenligner os med — andres priser og købspriser, ikke vores egne. */
const MARKEDSPRISER = new Set([500, 800, 1200, 2000, 5000, 6000, 10000, 15000]);

const PRIS = /(\d{1,3}(?:[.,]\d{3})*)\s*(?:kr|DKK)/gi;
const tal = (s: string) => Number(s.replace(/[.,]/g, ""));

function katalogBeloeb(): Set<number> {
  const b = new Set<number>();
  const add = (n: number) => b.add(n);
  for (const s of speakers) add(s.price);
  for (const a of addons) add(a.price);
  for (const r of rentalProducts) {
    add(r.price);
    if (r.bundle) {
      add(r.bundle.discount);
      let sum = 0;
      for (const p of r.bundle.parts) {
        add(p.price);
        sum += p.price;
      }
      // "1.300 kr i stedet for 1.685 kr" — delene hver for sig.
      add(sum);
    }
  }
  // Uplight-4-pakken er ikke et bundle i katalogets forstand, men beskrivelsen
  // lover "spar X kr" i forhold til fire enkelte uplights.
  const uplight = rentalProducts.find((r) => r.id === "uplight")?.price;
  const firepak = rentalProducts.find((r) => r.id === "uplight_4")?.price;
  if (uplight && firepak) b.add(4 * uplight - firepak);
  return b;
}

/** Produktside → priserne på den side (fx /discokugle har både 30 og 40 cm). */
function sidePriser(): Map<string, { priser: Set<number>; navne: string[] }> {
  const m = new Map<string, { priser: Set<number>; navne: string[] }>();
  const add = (page: string | undefined, price: number, navn: string) => {
    if (!page) return;
    const e = m.get(page) ?? { priser: new Set<number>(), navne: [] };
    e.priser.add(price);
    e.navne.push(navn);
    m.set(page, e);
  };
  for (const s of speakers) add(s.page, s.price, s.da.name);
  for (const a of addons) add(a.page, a.price, a.da.label);
  for (const r of rentalProducts) add(r.page, r.price, r.name_da);
  return m;
}

describe("Priser i sidetekst", () => {
  it("skriver ikke prisen som tekst ved siden af et link til produktsiden", () => {
    const sider = sidePriser();
    const fund: string[] = [];

    for (const f of sidefiler()) {
      const txt = readFileSync(f, "utf8");
      for (const m of txt.matchAll(/href"?[:=]\s*[{"']*\s*"(\/[a-z0-9-]+)"/gi)) {
        if (!sider.has(m[1])) continue;
        const vindue = txt.slice(m.index!, m.index! + 260);
        const naeste = vindue.slice(10).search(/href"?[:=]/i);
        const stykke = naeste >= 0 ? vindue.slice(0, naeste + 10) : vindue;
        for (const pm of stykke.matchAll(PRIS)) {
          const linje = txt.slice(0, m.index!).split("\n").length;
          fund.push(`${rel(f)}:${linje} → ${m[1]} "${pm[0]}"`);
        }
      }
    }

    expect(
      fund,
      `brug LivePrice/priceId i stedet for at skrive prisen:\n${fund.join("\n")}`
    ).toEqual([]);
  });

  it("nævner ingen beløb, der ikke findes i kataloget", () => {
    const kendte = katalogBeloeb();
    const fund: string[] = [];

    for (const f of sidefiler()) {
      const txt = readFileSync(f, "utf8");
      txt.split("\n").forEach((linje, i) => {
        // Kommentarer forklarer tit gamle, forkerte tal — de er ikke sidetekst.
        if (/^\s*(\/\*|\*|\/\/)/.test(linje)) return;
        for (const m of linje.matchAll(PRIS)) {
          const n = tal(m[1]);
          if (n < 50 || kendte.has(n) || MARKEDSPRISER.has(n)) continue;
          fund.push(`${rel(f)}:${i + 1}: ${m[0]} — ${linje.trim().slice(0, 120)}`);
        }
      });
    }

    expect(fund, `beløb uden dækning i products.ts:\n${fund.join("\n")}`).toEqual([]);
  });

  it("skriver kun produktets egen pris i produktsidens titel og meta", () => {
    // Sidetitlen er dét, Google viser. Stod der "Fra 895 kr" på en side, hvis
    // pakke koster 1.290, er det prisen i søgeresultatet, kunden husker.
    const egne = new Map<string, Set<number>>();
    const add = (page: string | undefined, price: number, rabat?: number) => {
      if (!page) return;
      const e = egne.get(page) ?? new Set<number>();
      e.add(price);
      if (rabat) e.add(rabat); // "spar 200 kr" hører til pakken
      egne.set(page, e);
    };
    for (const s of speakers) add(s.page, s.price);
    for (const a of addons) add(a.page, a.price);
    for (const r of rentalProducts) add(r.page, r.price, r.bundle?.discount);

    const fund: string[] = [];
    for (const [page, priser] of egne) {
      for (const mappe of ["src/app", "src/app/en"]) {
        const f = join(ROOT, `${mappe}${page}/page.tsx`);
        let txt: string;
        try {
          txt = readFileSync(f, "utf8");
        } catch {
          continue;
        }
        const start = txt.indexOf("export const metadata");
        if (start < 0) continue;
        const blok = txt.slice(start, txt.indexOf("\n};", start));
        for (const m of blok.matchAll(PRIS)) {
          const n = tal(m[1]);
          if (priser.has(n)) continue;
          fund.push(`${rel(f)}: ${m[0]} — siden koster ${[...priser].join("/")} kr`);
        }
      }
    }

    expect(fund, `produktsider med en anden pris i metadata:\n${fund.join("\n")}`).toEqual([]);
  });

  it("giver hvert produkt sin egen pris i blogindlæggene", () => {
    const navne: Array<{ navn: string; priser: Set<number> }> = [];
    const put = (navn: string, pris: number) => {
      const fundet = navne.find((n) => n.navn === navn.toLowerCase());
      if (fundet) fundet.priser.add(pris);
      else navne.push({ navn: navn.toLowerCase(), priser: new Set([pris]) });
    };
    for (const s of speakers) put(s.da.name, s.price);
    for (const a of addons) put(a.da.label, a.price);
    for (const r of rentalProducts) {
      put(r.name_da, r.price);
      put(r.name_en, r.price);
    }

    const fund: string[] = [];
    for (const f of walk(join(ROOT, "docs"), /\.md$/)) {
      const txt = readFileSync(f, "utf8");
      const lower = txt.toLowerCase();
      for (const { navn, priser } of navne) {
        if (navn.length < 6) continue;
        let fra = lower.indexOf(navn);
        while (fra !== -1) {
          const efter = lower.slice(fra + navn.length, fra + navn.length + 45);
          const pm = [...efter.matchAll(PRIS)][0];
          // Kun når prisen hænger direkte på navnet: "Soundboks 4 til 795 kr",
          // "| Soundboks 4 | 795 kr |". Står der andet imellem — "… og 595 kr
          // for den lille pakke", "spar 100 kr" — hører beløbet til noget andet.
          const mellem = pm ? efter.slice(0, pm.index!) : "";
          const haenger =
            !!pm && /^[\s|:*()—–-]*((til|koster|starter fra|fra|for|is|costs|price|to)\b[\s*|:—–-]*)?$/i.test(mellem);
          if (haenger) {
            const n = tal(pm![1]);
            if (!priser.has(n) && !MARKEDSPRISER.has(n)) {
              fund.push(
                `${rel(f)}: "${navn}" → ${pm![0]} (katalog ${[...priser].join("/")})`
              );
            }
          }
          fra = lower.indexOf(navn, fra + navn.length);
        }
      }
    }

    expect(fund, `blogpriser der ikke passer på produktet:\n${fund.join("\n")}`).toEqual([]);
  });
});
