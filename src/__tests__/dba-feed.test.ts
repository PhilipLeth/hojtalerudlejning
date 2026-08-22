/**
 * XML-feedet er DBA's — CSV og Facebook er de andres.
 *
 * Boost Connect opretter én annonce pr. item i feedet og fjerner dem der
 * forsvinder. Derfor er det her ikke kosmetik: ændrer udvalget sig, ændrer
 * DBA-kontoen sig ved næste synk.
 */
import { describe, it, expect } from "vitest";
import {
  DBA_FEED_IDS,
  dbaSelection,
  toXml,
  toCsv,
  type FeedItem,
} from "../../functions/api/_lib/channels";

function item(id: string): FeedItem {
  return {
    id,
    title: id,
    description: "",
    price: 100,
    image: "https://lejhojtaler.dk/x.webp",
    link: "https://lejhojtaler.dk/",
    availability: "in stock",
    category: "Lyd",
    brand: "Lejhøjtaler.dk",
  };
}

const HELE_KATALOGET = [
  ...DBA_FEED_IDS,
  "taske",
  "stativer",
  "batteri",
  "lyseffekt",
  "haandholdt_mikrofon",
].map(item);

describe("DBA-udvalget", () => {
  it("er ti produkter", () => {
    expect(DBA_FEED_IDS).toHaveLength(10);
  });

  it("indeholder ingen dubletter", () => {
    expect(new Set(DBA_FEED_IDS).size).toBe(DBA_FEED_IDS.length);
  });

  it("skærer kataloget ned til de ti", () => {
    const valgt = dbaSelection(HELE_KATALOGET);
    expect(valgt.map((i) => i.id)).toEqual([...DBA_FEED_IDS]);
  });

  it("lader tilbehør blive hjemme", () => {
    const ids = dbaSelection(HELE_KATALOGET).map((i) => i.id);
    for (const tilbehør of ["taske", "stativer", "batteri"]) {
      expect(ids).not.toContain(tilbehør);
    }
  });

  it("beholder rækkefølgen fra DBA_FEED_IDS uanset kataloget", () => {
    const bagvendt = [...HELE_KATALOGET].reverse();
    expect(dbaSelection(bagvendt).map((i) => i.id)).toEqual([...DBA_FEED_IDS]);
  });

  /**
   * Den vigtigste. Et tomt feed betyder ikke "ingen ændring" for Boost
   * Connect — det betyder "fjern alle annoncer". Omdøbes et produkt-id i
   * kataloget, skal DBA hellere stå med for mange annoncer end med nul.
   */
  it("falder tilbage på hele kataloget frem for at tømme feedet", () => {
    const omdøbt = ["noget_helt_andet", "og_et_til"].map(item);
    expect(dbaSelection(omdøbt).map((i) => i.id)).toEqual(omdøbt.map((i) => i.id));
    expect(dbaSelection([])).toEqual([]);
  });

  it("sender aldrig et tomt XML når kataloget har varer", () => {
    const xml = toXml(dbaSelection(HELE_KATALOGET));
    expect(xml.match(/<item>/g)).toHaveLength(10);
  });

  it("rører ikke CSV — Meta-kataloget må gerne være bredt", () => {
    const linjer = toCsv(HELE_KATALOGET).trim().split("\n");
    expect(linjer).toHaveLength(HELE_KATALOGET.length + 1); // + header
  });
});
