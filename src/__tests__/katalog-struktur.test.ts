import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  KATALOG_AFSNIT,
  afsnitFor,
  deleAfsnit,
  strukturensIder,
  type KatalogKategori,
} from "@/lib/katalogStruktur";
import {
  BATTERIHOJTALERE,
  LADDER_LYD,
  LYD_LADDER_IDS,
  SPEAKERPAKKER,
  addons,
  erForespoergsel,
  isBundleProduct,
  rentalProducts,
  speakers,
} from "@/lib/products";

/**
 * En side må kun vise det, den lover.
 *
 * /lydanlaeg hed "vælg anlæg efter antal gæster" og viste Festpakker, hvor en
 * lysbar og en røgmaskine er en del af prisen. Kunden kom for at finde ud af,
 * hvor store højtalere der skal til 60 gæster, og fik et lysshow med.
 *
 * Prisarket skiller de to: afsnit 1 er LYD, afsnit 3 er LYD OG LYS PAKKER.
 * Strukturen står i katalogStruktur.ts, og testen her holder skellet, så rodet
 * ikke kan komme tilbage ved næste pakke, nogen skal have vist et sted.
 */

const alle = [
  ...speakers.map((s) => ({ id: s.id, hidden: s.hidden, navn: s.da.name })),
  ...addons.map((a) => ({ id: a.id, hidden: a.hidden, navn: a.da.label })),
  ...rentalProducts.map((r) => ({ id: r.id, hidden: r.hidden, navn: r.name_da })),
];

/** Pakkens dele, eller undefined for et enkeltprodukt. */
const dele = (id: string): string[] | undefined => {
  const p = rentalProducts.find((r) => r.id === id);
  return p && isBundleProduct(p) ? p.bundle!.parts.map((d) => d.productId) : undefined;
};

/** Hvilke afsnit et produkt trækker ind — for en pakke: alle delenes. */
const afsnitAf = (id: string): Set<string> => deleAfsnit(id, dele);

describe("Katalogets struktur følger prisarket", () => {
  it("hvert afsnit og hver gruppe har et nummer og begge sprog", () => {
    for (const a of KATALOG_AFSNIT) {
      expect(a.nr, a.titel).toBeTruthy();
      expect(a.titel_en, a.titel).toBeTruthy();
      expect(a.grupper.length, a.titel).toBeGreaterThan(0);
      for (const g of a.grupper) {
        expect(g.nr, `${a.titel}/${g.titel}`).toBeTruthy();
        expect(g.titel_en, `${a.titel}/${g.titel}`).toBeTruthy();
        expect(g.ids.length, `${a.titel}/${g.titel}`).toBeGreaterThan(0);
      }
    }
  });

  it("hvert id i strukturen findes i kataloget", () => {
    const kendte = new Set(alle.map((p) => p.id));
    const ukendte = strukturensIder().filter((id) => !kendte.has(id));
    expect(ukendte, `id'er i strukturen som ikke findes i kataloget:\n${ukendte.join("\n")}`).toEqual([]);
  });

  it("intet produkt står i to grupper", () => {
    const set = new Map<string, string>();
    const dubletter: string[] = [];
    for (const a of KATALOG_AFSNIT) {
      for (const g of a.grupper) {
        for (const id of g.ids) {
          const før = set.get(id);
          if (før) dubletter.push(`${id}: ${før} og ${a.nr}.${g.nr}`);
          else set.set(id, `${a.nr}.${g.nr}`);
        }
      }
    }
    expect(dubletter, `produkter i mere end én gruppe:\n${dubletter.join("\n")}`).toEqual([]);
  });

  /**
   * Pakker står ikke i strukturen som enkeltdele — de hører til det afsnit,
   * delene trækker dem ind i. Men et ENKELTprodukt, der ikke er i arket, er
   * gæld: så er der ingen der ved, hvor det hører hjemme på sitet.
   *
   * Undtagelsen er forespørgselsvarerne. De er PR. DEFINITION uden for arket
   * — skærm, projektor, lærred, karaoke, slush ice og fadøl har ingen fast
   * weekendpris — og det er netop derfor, de ikke kan bookes online. At kræve
   * dem skrevet ind i strukturen ville være at kræve arket lavet om.
   */
  it("hvert synligt enkeltprodukt hører til et afsnit i arket", () => {
    const udenfor = alle
      .filter((p) => !p.hidden && !dele(p.id) && !afsnitFor(p.id) && !erForespoergsel(p.id))
      .map((p) => `${p.id} (${p.navn})`);
    expect(
      udenfor,
      `enkeltprodukter uden plads i strukturen — skriv dem ind i katalogStruktur.ts:\n${udenfor.join("\n")}`,
    ).toEqual([]);
  });

  it("hver pakkes dele kan slås op i strukturen", () => {
    const uden: string[] = [];
    for (const p of rentalProducts.filter(isBundleProduct)) {
      // En pakke der KUN består af forespørgselsvarer (Mødeskærm er en skærm
      // og ikke andet) hører heller ikke til i arket — den arver forespørgslen
      // fra sine dele og kan ikke bookes online.
      if (erForespoergsel(p.id)) continue;
      if (!afsnitAf(p.id).size) uden.push(`${p.id} (${p.name_da})`);
    }
    expect(uden, `pakker hvis dele ingen af dem findes i strukturen:\n${uden.join("\n")}`).toEqual([]);
  });
});

describe("En lydside viser lyd, ikke lys", () => {
  const kunLyd = (ids: string[], hvor: string) => {
    for (const id of ids) {
      const fundet = [...afsnitAf(id)].sort() as KatalogKategori[];
      const forkerte = fundet.filter((a) => a !== "lyd" && a !== "service");
      expect(
        forkerte,
        `${hvor}: ${id} trækker ${forkerte.join(", ")} ind — den hører ikke på en ren lydside`,
      ).toEqual([]);
    }
  };

  it("lydstigen er højtalere alene, uden lys og røg", () => {
    expect(LYD_LADDER_IDS.length).toBeGreaterThanOrEqual(3);
    kunLyd(LYD_LADDER_IDS, "LADDER_LYD");
  });

  it("speakerpakkerne er anlæg og mikrofon, uden lys og røg", () => {
    expect(SPEAKERPAKKER.length).toBeGreaterThanOrEqual(3);
    kunLyd(SPEAKERPAKKER, "SPEAKERPAKKER");
  });

  it("stigen stiger, og gæstetallene siger hvad anlægget kan", () => {
    const tal = LADDER_LYD.map((t) => t.maxGaester);
    expect(tal).toEqual([...tal].sort((a, b) => a - b));
    for (const trin of LADDER_LYD) {
      expect(trin.hvad, trin.navn).toBeTruthy();
      expect(trin.hvad_en, trin.navn).toBeTruthy();
      // Et trin på lydstigen må ikke sælge lys i sin egen tekst
      expect(`${trin.hvad} ${trin.hvad_en}`.toLowerCase(), trin.navn).not.toMatch(/lysbar|light bar|røg|fog/);
    }
  });

  /**
   * Arket deler lyd i 1.1 stigen, 1.2 speakerpakker, 1.3 batterihøjtalere,
   * 1.4 DJ-udstyr og 1.5 mikrofoner. /lydanlaeg byggede 1.1 og 1.2 og sprang
   * 1.3 over: siden spurgte "hvor mange gæster kommer der?" og svarede med
   * kabelanlæg hele vejen. Kunden til en havefest uden stikkontakt fik
   * anbefalet et anlæg, der ikke kan tændes — og Soundboks 4 og Thump GO, de
   * to mest klikkede produkter i annoncerne, fandtes slet ikke på lydsiden.
   *
   * DJ-udstyr og mikrofoner har deres egne sider; 1.1 til 1.3 er dem,
   * /lydanlaeg lover ved at hedde "anlæg efter antal gæster".
   */
  it("/lydanlaeg viser arkets tre anlægsafsnit, ikke kun to", () => {
    const lyd = KATALOG_AFSNIT.find((a) => a.id === "lyd")!;
    const batteri = lyd.grupper.find((g) => g.nr === "1.3")!;
    expect(batteri.ids.sort()).toEqual([...BATTERIHOJTALERE].sort());

    for (const sti of ["src/app/lydanlaeg/page.tsx", "src/app/en/lydanlaeg/page.tsx"]) {
      const kilde = readFileSync(sti, "utf8");
      for (const [konstant, afsnit] of [
        ["LADDER_LYD", "1.1 stigen"],
        ["SPEAKERPAKKER", "1.2 speakerpakkerne"],
        ["BATTERIHOJTALERE", "1.3 batterihøjtalerne"],
      ]) {
        expect(kilde, `${sti} mangler arkets afsnit ${afsnit}`).toContain(konstant);
      }
    }
  });

  it("/lydanlaeg viser ikke feststigen, som har lys og røg med", () => {
    for (const sti of ["src/app/lydanlaeg/page.tsx", "src/app/en/lydanlaeg/page.tsx"]) {
      const kilde = readFileSync(sti, "utf8");
      expect(kilde, `${sti} viser stadig LADDER_FEST`).not.toMatch(/LADDER_FEST|FEST_LADDER_IDS/);
      expect(kilde, `${sti} mangler lydstigen`).toContain("LADDER_LYD");
    }
  });

  it("lyd og lys-pakkerne findes, og de har begge slags dele", () => {
    const afsnit = KATALOG_AFSNIT.find((a) => a.id === "lydlys")!;
    const ids = afsnit.grupper.flatMap((g) => g.ids);
    expect(ids.length).toBeGreaterThanOrEqual(5);
    for (const id of ids) {
      const p = rentalProducts.find((r) => r.id === id);
      if (!p) continue;
      const fundet = afsnitAf(id);
      expect(fundet.has("lyd"), `${id} mangler lyd`).toBe(true);
      expect(
        fundet.has("lys") || fundet.has("roeg"),
        `${id} står i lyd og lys, men har hverken lys eller røg med`,
      ).toBe(true);
    }
  });
});
