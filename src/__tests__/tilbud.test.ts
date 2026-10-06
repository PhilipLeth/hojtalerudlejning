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
