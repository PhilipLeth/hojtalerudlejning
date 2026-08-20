import { describe, it, expect } from "vitest";
import fs from "node:fs";
import {
  AV_PAKKER,
  FEST_LADDER_IDS,
  KATEGORI_PAKKER,
  LADDER_FEST,
  LYD_LEJLIGHEDSPAKKER,
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

  /**
   * Menuen skal være en vej ind, ikke et katalog. Den nåede op på 44 links —
   * fjorten under Lyd alene — og det gør det sværere at vælge, ikke nemmere.
   * Produkterne bor på kategorisiderne; menuen viser vejen dertil.
   */
  it("ingen kategori i menuen bliver til en liste man skal læse", () => {
    for (const c of NAV_CATEGORIES) {
      expect(c.links.length, `${c.title} har ${c.links.length} links`).toBeLessThanOrEqual(6);
    }
    const ialt = NAV_CATEGORIES.reduce((n, c) => n + c.links.length, 0);
    expect(ialt, `menuen har ${ialt} links i alt`).toBeLessThanOrEqual(30);
  });

  it("hver menupunkt fører til en side der findes", () => {
    for (const c of NAV_CATEGORIES) {
      for (const l of c.links) {
        const slug = l.href.replace(/^\//, "").split("#")[0];
        expect(fs.existsSync(`src/app/${slug}/page.tsx`), `${l.href} findes ikke`).toBe(true);
      }
    }
  });

  it("hver pakke med en side står på præcis én kategoriside", () => {
    const pakkerMedSide = rentalProducts.filter((p) => isBundleProduct(p) && p.page).map((p) => p.id);
    for (const id of pakkerMedSide) {
      const sider = Object.entries(KATEGORI_PAKKER).filter(([, ids]) => ids.includes(id));
      expect(sider.length, `${id} står på ${sider.length} kategorisider`).toBe(1);
    }
  });

  it("kategorisiden viser rent faktisk de pakker den er ansvarlig for", () => {
    for (const [side, ids] of Object.entries(KATEGORI_PAKKER)) {
      const kilde = fs.readFileSync(`src/app${side}/page.tsx`, "utf8");
      for (const id of ids) {
        const nævnt =
          kilde.includes(`"${id}"`) ||
          (kilde.includes("FEST_LADDER_IDS") && FEST_LADDER_IDS.includes(id)) ||
          (kilde.includes("LYD_LEJLIGHEDSPAKKER") && LYD_LEJLIGHEDSPAKKER.includes(id)) ||
          (kilde.includes("AV_PAKKER") && AV_PAKKER.includes(id));
        expect(nævnt, `${id} nævnes ikke på ${side}`).toBe(true);
      }
    }
  });

  it("de nye pakker ligger i sitemap", () => {
    const xml = fs.readFileSync("public/sitemap.xml", "utf8");
    const sider = rentalProducts.filter((p) => isBundleProduct(p) && p.page).map((p) => p.page!);
    for (const href of ["/lydanlaeg", ...sider]) {
      expect(xml, `${href} mangler i sitemap`).toContain(`https://lejhojtaler.dk${href}<`);
    }
  });
});
