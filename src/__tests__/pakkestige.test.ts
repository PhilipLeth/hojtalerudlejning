import { describe, it, expect } from "vitest";
import fs from "node:fs";
import {
  LADDER_FEST,
  OCCASION_PACKAGES,
  LADDER_TALE,
  addons,
  bundleListPrice,
  isBundleProduct,
  rentalProducts,
  speakers,
  NAV_CATEGORIES,
  type LadderStep,
} from "@/lib/products";

/**
 * Pakkestigen er kontrakten mellem /lydanlaeg og kataloget. Siden viser priser
 * og gæstetal fra LADDER_*, mens booking og Stripe henter prisen fra produktet
 * — så de to skal være enige. Ellers står der ét beløb på siden og et andet i
 * kurven, og det opdager vi først når en kunde har betalt.
 */
const alleTrin: LadderStep[] = [...LADDER_FEST, ...LADDER_TALE];
const medProdukt = alleTrin.filter((t) => t.productId !== null);

function findProdukt(id: string) {
  return rentalProducts.find((p) => p.id === id);
}

function kendtDelId(id: string): boolean {
  return (
    !!speakers.find((s) => s.id === id) ||
    !!addons.find((a) => a.id === id) ||
    !!rentalProducts.find((p) => p.id === id)
  );
}

describe("Pakkestigen", () => {
  it("hvert trin peger på et produkt der findes i kataloget", () => {
    for (const trin of medProdukt) {
      expect(findProdukt(trin.productId!), `${trin.navn} mangler i kataloget`).toBeTruthy();
    }
  });

  it("prisen på stigen er den samme som produktets pris", () => {
    for (const trin of medProdukt) {
      expect(findProdukt(trin.productId!)!.price, `${trin.navn} har forskellig pris`).toBe(trin.pris);
    }
  });

  it("linket på stigen er produktets egen side", () => {
    for (const trin of medProdukt) {
      expect(findProdukt(trin.productId!)!.page, `${trin.navn} peger et andet sted hen`).toBe(trin.href);
    }
  });

  it("trin uden produkt går til tilbud, ikke til en bookingknap", () => {
    for (const trin of alleTrin.filter((t) => t.productId === null)) {
      expect(trin.pris).toBeNull();
      expect(trin.koersel).toBe("tilbud");
      expect(trin.href).toBe("/erhverv#tilbud");
    }
  });

  it("stigen stiger — gæstetallene går kun opad", () => {
    for (const stige of [LADDER_FEST, LADDER_TALE]) {
      const tal = stige.map((t) => t.maxGaester);
      expect(tal).toEqual([...tal].sort((a, b) => a - b));
    }
  });

  it("hver pakke er billigere end delene hver for sig", () => {
    for (const trin of medProdukt) {
      const p = findProdukt(trin.productId!)!;
      if (!isBundleProduct(p)) continue;
      expect(p.price, `${trin.navn} sparer ingenting`).toBeLessThan(bundleListPrice(p));
    }
  });

  it("alle dele i en pakke findes som rigtige produkter", () => {
    for (const trin of medProdukt) {
      const p = findProdukt(trin.productId!)!;
      for (const del of p.bundle?.parts ?? []) {
        expect(kendtDelId(del.productId), `${trin.navn}: ukendt del ${del.productId}`).toBe(true);
      }
    }
  });

  it("de nye pakker kan findes i menuen", () => {
    const links = NAV_CATEGORIES.flatMap((c) => c.links.map((l) => l.href));
    for (const href of ["/lydanlaeg", "/festpakke-150", "/festpakke-250", "/konferencepakke-150"]) {
      expect(links, `${href} mangler i menuen`).toContain(href);
    }
  });

  it("hver anledning har en pakke — ikke et enkeltprodukt", () => {
    for (const [anledning, id] of Object.entries(OCCASION_PACKAGES)) {
      const p = findProdukt(id);
      expect(p, `${anledning} peger på ${id}, som ikke findes`).toBeTruthy();
      expect(isBundleProduct(p!), `${anledning} anbefaler ${id}, som ikke er en pakke`).toBe(true);
    }
  });

  it("anledningssiden bruger den pakke den er tildelt", () => {
    for (const [anledning, id] of Object.entries(OCCASION_PACKAGES)) {
      const kilde = fs.readFileSync(`src/app/${anledning}/page.tsx`, "utf8");
      expect(kilde, `${anledning} anbefaler noget andet end ${id}`).toContain(`primaryProductId="${id}"`);
      const pris = findProdukt(id)!.price;
      expect(kilde, `${anledning} viser en anden pris end pakkens ${pris} kr`).toContain(`primaryPrice={${pris}}`);
    }
  });

  it("hver pakke med en side kan findes i menuen", () => {
    const links = NAV_CATEGORIES.flatMap((c) => c.links.map((l) => l.href));
    const pakkerMedSide = rentalProducts.filter((p) => isBundleProduct(p) && p.page);
    const savnet = pakkerMedSide.filter((p) => !links.includes(p.page!)).map((p) => p.name_da);
    expect(savnet, `pakker uden for menuen: ${savnet.join(", ")}`).toEqual([]);
  });

  it("de nye pakker ligger i sitemap", () => {
    const xml = fs.readFileSync("public/sitemap.xml", "utf8");
    for (const href of ["/lydanlaeg", "/festpakke-150", "/festpakke-250", "/konferencepakke-150"]) {
      expect(xml, `${href} mangler i sitemap`).toContain(`https://lejhojtaler.dk${href}<`);
    }
  });
});
