/* ───── Efterspørgselskortet: klynger efter kunden, ikke kataloget ───── */
import { describe, it, expect } from "vitest";
import {
  KATEGORI_SIDER,
  demandClusters,
  demandKey,
  erEfterspoergsel,
  findSide,
  DEFAULT_DEMAND_SEEDS,
  type DemandKeyword,
} from "../../functions/api/ads-demand";
import { occasionWord } from "@/lib/adsIntent";

function kw(text: string, over: Partial<DemandKeyword> = {}): DemandKeyword {
  return {
    text, volume: 0, clicks: 0, impressions: 0, intent: "leje",
    sources: ["google"], coveredBy: null, outsideArea: null, ...over,
  };
}

describe("demandKey og occasionWord", () => {
  it("lader anledningen vinde over produktordet — samme kunde, samme behov", () => {
    expect(demandKey("lyd til konfirmation")).toBe("anledning:konfirmation");
    expect(demandKey("musikanlæg til konfirmation")).toBe("anledning:konfirmation");
    expect(occasionWord("lej højtaler")).toBeNull();
  });

  it("samler produktfraser på produktord som i byggeren", () => {
    expect(demandKey("lej højtaler")).toBe(demandKey("leje af højtalere"));
  });
});

describe("erEfterspoergsel", () => {
  it("tager lejefraser og anledningsfraser med produktord", () => {
    expect(erEfterspoergsel("lej højtaler")).toBe(true);
    expect(erEfterspoergsel("lyd til konfirmation")).toBe(true);
  });

  it("afviser anledningen alene — gaver og tøj er ikke vores marked", () => {
    expect(erEfterspoergsel("konfirmation")).toBe(false);
    expect(erEfterspoergsel("subwoofer")).toBe(false);
  });
});

describe("demandClusters", () => {
  it("klynger to anledningsfraser sammen og tæller kun inden for området med", () => {
    const clusters = demandClusters([
      kw("lyd til bryllup", { volume: 30 }),
      kw("musikanlæg til bryllup", { volume: 20 }),
      kw("lyd til bryllup fyn", { volume: 50, outsideArea: "fyn" }),
    ]);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].occasion).toBe("bryllup");
    expect(clusters[0].volume).toBe(50); // 30 + 20, ikke Fyns 50
    expect(clusters[0].keywords).toHaveLength(3); // men frasen VISES, mærket
  });

  it("sorterer klik øverst — kvitteringer slår estimater", () => {
    const clusters = demandClusters([
      kw("lej højtaler", { volume: 210 }),
      kw("lyd til julefrokost", { clicks: 3, volume: 10 }),
    ]);
    expect(clusters[0].occasion).toBe("julefrokost");
  });
});

describe("findSide", () => {
  const kandidater = [
    { id: "rog", name: "Røgmaskine", page: "/roegmaskine", terms: ["røgmaskine"] },
    { id: "soundboks", name: "Soundboks 4", page: "/soundboks-4", terms: ["soundboks", "soundbox"] },
  ];

  it("peger på siden hvis produkt klyngen handler om", () => {
    expect(findSide(["lej røgmaskine", "leje af røgmaskine"], kandidater)?.page).toBe("/roegmaskine");
  });

  it("svarer null når ingen side kan besvare søgningen — det ER svaret", () => {
    expect(findSide(["lyd til konfirmation"], kandidater)).toBeNull();
  });
});

describe("kategorisiderne", () => {
  const kandidater = [
    { id: "lys_pakke", name: "Lys-pakke", page: "/lys-pakke", terms: ["lys pakke", "lys"] },
    ...KATEGORI_SIDER,
  ];

  it("sender lydanlæg til stigesiden i stedet for 'mangler side'", () => {
    const side = findSide(["leje lydanlæg", "lydanlæg leje", "udlejning lydanlæg"], kandidater);
    expect(side?.page).toBe("/lydanlaeg");
    expect(side?.id).toBeNull(); // kategoriside — byggeren kan ikke bygge mod den
  });

  it("lader produktsiden vinde når begge matcher lige godt", () => {
    expect(findSide(["lej lys"], kandidater)?.page).toBe("/lys-pakke");
  });
});

describe("standardfrøene", () => {
  it("er behov og anledninger, holder sig inden for Googles loft, og er alle efterspørgsel", () => {
    expect(DEFAULT_DEMAND_SEEDS.length).toBeLessThanOrEqual(40);
    for (const s of DEFAULT_DEMAND_SEEDS) expect(erEfterspoergsel(s), s).toBe(true);
  });
});
