/**
 * Tilbud fra /admin/tilbud: en kurv med id'er og antal, ikke et dokument med
 * priser. Testene holder fast i det, der gør tilbuddet til en kurv — at
 * beløbet er katalogets, at kurven får de samme enheder, og at Stripe kan
 * tage et tilbud med mange ens varer.
 */
import { describe, it, expect } from "vitest";
import { speakers, addons, rentalProducts } from "@/lib/products";
import { DJ_ID } from "@/lib/dj";
import {
  FORBRUG_ID,
  TEKNIKER_ID,
  findVare,
  kanTilbydes,
  kurvFraTilbud,
  normaliserTilbud,
  offentligtTilbud,
  prissaet,
  tilbudBookSti,
  type Tilbud,
} from "@/lib/tilbud";
import { erTilbudSti } from "@/lib/tilbudSti";
import { loadPriceTable, buildLineItems } from "../../functions/api/_lib/pricing";
import { serverTotal } from "../../functions/api/tilbud";

const katalog = { speakers, addons, rentalProducts };
const pris = (id: string) => findVare(katalog, id)!.pris;

const eksempel = normaliserTilbud({
  kunde: { navn: "Mette Hansen", firma: "Firma A/S" },
  titel: "Julefrokost",
  linjer: [
    { id: "uplight", antal: 4 },
    { id: "festival", antal: 3 },
    { id: "stativer", antal: 3 },
    { id: TEKNIKER_ID, antal: 2 },
    { id: FORBRUG_ID, antal: 5 },
    { id: "levering_begge_opsaetning", antal: 1 },
  ],
});

describe("Tilbud", () => {
  it("forbrugsmaterialer koster 100 kr/stk. og er en intern vare", () => {
    const a = addons.find((x) => x.id === FORBRUG_ID)!;
    expect(a.price).toBe(100);
    expect(a.intern).toBe(true);
  });

  it("totalen er katalogets pris × antal — også teknikertimerne", () => {
    const sum = prissaet({ ...eksempel, locale: "da" }, katalog);
    const forventet =
      4 * pris("uplight") + 3 * pris("festival") + 3 * pris("stativer") + 2 * pris(TEKNIKER_ID) + 5 * 100 + pris("levering_begge_opsaetning");
    expect(sum.total).toBe(forventet);
    expect(sum.ukendte).toEqual([]);
  });

  it("serveren regner samme total som tilbuddet viser", async () => {
    const table = await loadPriceTable({ get: async () => null } as unknown as KVNamespace);
    expect(serverTotal(table, eksempel)).toBe(prissaet(eksempel, katalog).total);
    const medRabat = { ...eksempel, rabat: { code: "x", pct: 10 } };
    expect(serverTotal(table, medRabat)).toBe(prissaet(medRabat, katalog).total);
  });

  it("kurven får én linje pr. enhed, teknikeren som timer og kørslen som valg", () => {
    const kurv = kurvFraTilbud(eksempel, katalog);
    expect(kurv.enheder.filter((e) => e.productId === "uplight")).toHaveLength(4);
    expect(kurv.enheder.filter((e) => e.productId === FORBRUG_ID)).toHaveLength(5);
    expect(kurv.enheder.some((e) => e.productId === TEKNIKER_ID)).toBe(false);
    expect(kurv.teknikerTimer).toBe(2);
    expect(kurv.levering).toBe("levering_begge_opsaetning");
    expect(kurv.enheder.find((e) => e.productId === "festival")!.price).toBe(pris("festival"));
  });

  it("Stripe tager hele tilbuddet og samler ens varer til én linje med antal", async () => {
    const table = await loadPriceTable({ get: async () => null } as unknown as KVNamespace);
    const kurv = kurvFraTilbud(eksempel, katalog);
    const ids = [...kurv.enheder.map((e) => e.productId), ...Array(kurv.teknikerTimer).fill(TEKNIKER_ID), kurv.levering!];
    expect(ids.length).toBeGreaterThan(17);
    const { lineItems, totalOre } = buildLineItems(table, ids.map((id) => ({ id })));
    expect(totalOre).toBe(prissaet(eksempel, katalog).total * 100);
    expect(lineItems.find((l) => l.price_data.product_data.name === "Uplight")!.quantity).toBe(4);
    expect(lineItems.length).toBeLessThan(ids.length);
  });

  it("lægger ens linjer sammen og holder kun ét kørselsvalg", () => {
    const t = normaliserTilbud({
      kunde: { navn: "A" },
      linjer: [
        { id: "uplight", antal: 2 },
        { id: "uplight", antal: 1 },
        { id: "levering_ud", antal: 1 },
        { id: "levering_begge", antal: 1 },
        { id: "ukendt id med mellemrum", antal: 1 },
        { id: "festival", antal: 0 },
      ],
    });
    expect(t.linjer).toEqual([
      { id: "uplight", antal: 3 },
      { id: "levering_begge", antal: 1 },
    ]);
  });

  it("DJ og forespørgselsvarer kan ikke stå på et tilbud — de kan ikke betales i kurven", () => {
    expect(kanTilbydes(DJ_ID)).toBe(false);
    expect(kanTilbydes("projektor")).toBe(false);
    const t = normaliserTilbud({ kunde: { navn: "A" }, linjer: [{ id: DJ_ID, antal: 3 }, { id: "projektor", antal: 1 }] });
    expect(t.linjer).toEqual([]);
  });

  it("kunden ser aldrig vores interne note", () => {
    const t = { ...eksempel, id: "abc", nr: 1001, oprettet: "", opdateret: "", note: "ring tirsdag" } as Tilbud;
    expect("note" in offentligtTilbud(t)).toBe(false);
  });

  it("QR-koden peger på kurven med tilbuddet, på tilbuddets sprog", () => {
    expect(tilbudBookSti("abc123def", "da")).toBe("/book?tilbud=abc123def");
    expect(tilbudBookSti("abc123def", "en")).toBe("/en/book?tilbud=abc123def");
  });

  it("tilbuddet vises uden sitets menu og bånd", () => {
    expect(erTilbudSti("/tilbud")).toBe(true);
    expect(erTilbudSti("/en/tilbud")).toBe(true);
    expect(erTilbudSti("/tilbudspakke")).toBe(false);
  });
});

import { STANDARD_INSPIRATION, MAX_TILBUD_BILLEDER } from "@/lib/tilbud";
import { standardOenske, tilbudBilledPrompt } from "@/lib/tilbudBillede";
import { parseKundeBilleder } from "../../functions/api/contact";
import { existsSync } from "node:fs";

describe("Tilbuddets billeder", () => {
  it("tager kun billeder fra sitet selv, højst otte, uden dubletter", () => {
    const t = normaliserTilbud({
      kunde: { navn: "A" },
      billeder: [
        { src: "/api/image/img_1_abc", kilde: "upload" },
        { src: "/api/image/img_1_abc", kilde: "upload" },
        { src: "https://evil.example/x.jpg", kilde: "upload" },
        { src: "/api/image/kunde_2_x", kilde: "kunde" },
        { src: "/api/image/img_3_y", kilde: "ai", prompt: "lilla uplights" },
        ...Array.from({ length: 12 }, (_, i) => ({ src: `/api/image/img_${i}_z`, kilde: "upload" })),
      ],
      forside: "/api/image/kunde_2_x",
    });
    expect(t.billeder!.length).toBe(MAX_TILBUD_BILLEDER);
    expect(t.billeder!.some((b) => b.src.startsWith("https"))).toBe(false);
    expect(t.billeder![2]).toEqual({ src: "/api/image/img_3_y", kilde: "ai", prompt: "lilla uplights" });
    // Et uploadet billede kan være forsiden
    expect(t.forside).toBe("/api/image/kunde_2_x");
  });

  it("standardbillederne er forsidens fotos, og de findes", () => {
    for (const src of STANDARD_INSPIRATION) expect(existsSync(`public${src}`), src).toBe(true);
  });

  it("prompten bærer kollegaens ønske ordret og galleriets regler", () => {
    const p = tilbudBilledPrompt({ oenske: "Uplights i lilla langs væggene", varer: ["4 × Uplight"], format: "16:9" });
    expect(p).toContain('"Uplights i lilla langs væggene"');
    expect(p).toContain("4 × Uplight");
    expect(p).toMatch(/Do not invent or substitute equipment/);
    expect(tilbudBilledPrompt({ oenske: "", varer: [], format: "3:4", basis: "lokale" })).toMatch(/customer's actual venue/);
    expect(tilbudBilledPrompt({ oenske: "flyt dem", varer: [], format: "4:3", basis: "rettelse" })).toMatch(/earlier version/);
  });

  it("forslaget til ønsket bygger på tilbuddet", () => {
    const o = standardOenske({ titel: "Julefrokost", sted: "kantinen", gaester: 120, fra: "2026-12-04" }, ["4 × Uplight"]);
    expect(o).toContain("Julefrokost");
    expect(o).toContain("120");
    expect(o).toMatch(/Vinteraften/);
  });
});

describe("Kundens billeder i kontaktformularen", () => {
  const b64 = (bytes: number[]) => btoa(String.fromCharCode(...bytes));
  it("tager rigtige billeder og afviser filer, der kun påstår at være det", () => {
    const jpeg = b64([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
    const falsk = b64([0x3c, 0x73, 0x76, 0x67]); // "<svg"
    const ud = parseKundeBilleder([
      { navn: "lokale.jpg", data: jpeg },
      { navn: "x.jpg", data: falsk },
      { navn: "ikke-base64", data: "%%%" },
    ]);
    expect(ud).toHaveLength(1);
    expect(ud[0].type).toBe("image/jpeg");
  });
  it("højst fem billeder", () => {
    const jpeg = b64([0xff, 0xd8, 0xff, 0xe0]);
    expect(parseKundeBilleder(Array(9).fill({ navn: "a", data: jpeg }))).toHaveLength(5);
  });
});
