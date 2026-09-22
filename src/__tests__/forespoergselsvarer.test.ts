/**
 * Forespørgselsvarer: vises, men kan ikke bookes.
 *
 * Frederiks prisark er sortimentet, og arket har intet afsnit for skærm,
 * projektor, lærred og karaoke — og slet ingen for slush ice og fadøl. At
 * slette dem ville smide efterspørgslen væk (~350 visninger om måneden på
 * "lej storskærm" alene). At lade dem stå med en bookingknap ville love en
 * pris og en ledighed, arket ikke dækker.
 *
 * Tredje vej: siden bliver stående, knappen hedder "Send forespørgsel", og
 * serveren afviser varen i pristabellen. Testen her vogter netop det skel —
 * for skellet er ét felt i kataloget fra at blive utæt, og så kan en kunde
 * betale for noget, vi ikke har sat en pris på.
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ER_FORESPOERGSEL,
  addons,
  erForespoergsel,
  forespoergselHref,
  rentalProducts,
  speakers,
} from "@/lib/products";
import { afsnitFor } from "@/lib/katalogStruktur";
import { loadPriceTable, buildLineItems } from "../../functions/api/_lib/pricing";

const katalog = [
  ...speakers.map((s) => ({ id: s.id, hidden: s.hidden, navn: s.da.name, foresporg: s.forespoergsel })),
  ...addons.map((a) => ({ id: a.id, hidden: a.hidden, navn: a.da.label, foresporg: a.forespoergsel })),
  ...rentalProducts.map((r) => ({ id: r.id, hidden: r.hidden, navn: r.name_da, foresporg: r.forespoergsel })),
];

describe("Forespørgselsvarer", () => {
  it("listen og katalogets felt siger det samme", () => {
    for (const id of ER_FORESPOERGSEL) {
      const p = katalog.find((x) => x.id === id);
      expect(p, `${id} står i ER_FORESPOERGSEL, men findes ikke i kataloget`).toBeTruthy();
      expect(p!.foresporg, `${id} mangler forespoergsel: true`).toBe(true);
    }
    // Og den anden vej: ingen kan sætte feltet uden at komme på listen, for
    // så ville serverens pristabel stadig tage imod betaling for den
    for (const p of katalog.filter((x) => x.foresporg)) {
      expect(ER_FORESPOERGSEL, `${p.id} har feltet, men står ikke på listen`).toContain(p.id);
    }
  });

  it("en pakke arver forespørgslen fra sine dele", () => {
    // Præsentationspakken ER projektor + lærred + mikrofon. Kan projektoren
    // ikke bookes, kan pakken det heller ikke.
    expect(erForespoergsel("pakke_praesentation")).toBe(true);
    expect(erForespoergsel("pakke_konference")).toBe(true);
    // Og en festpakke uden en eneste forespørgselsdel er stadig en booking
    expect(erForespoergsel("pakke_fest_stor")).toBe(false);
    expect(erForespoergsel("party")).toBe(false);
  });

  it("serveren afviser dem, så de aldrig kan betales online", async () => {
    const table = await loadPriceTable({ get: async () => null } as never);
    const alle = katalog.filter((p) => !p.hidden && erForespoergsel(p.id));
    expect(alle.length).toBeGreaterThan(5);
    for (const p of alle) {
      expect(table.has(p.id), `${p.id} kan betales online`).toBe(false);
      expect(() => buildLineItems(table, [{ id: p.id }]), p.id).toThrow(/Unknown product/);
    }
  });

  it("de står uden for arket — det er hele pointen", () => {
    for (const id of ER_FORESPOERGSEL) {
      expect(afsnitFor(id), `${id} står både i arket og som forespørgsel`).toBeUndefined();
    }
  });

  it("hver af dem har en side på begge sprog", () => {
    for (const id of ER_FORESPOERGSEL) {
      const p = rentalProducts.find((r) => r.id === id);
      expect(p?.page, `${id} har ingen side`).toBeTruthy();
      for (const sti of [`src/app${p!.page}/page.tsx`, `src/app/en${p!.page}/page.tsx`]) {
        expect(existsSync(join(process.cwd(), sti)), `${sti} mangler`).toBe(true);
      }
    }
  });

  it("knappen fører til formularen med produktet på", () => {
    expect(forespoergselHref("slushice")).toBe("/erhverv?produkt=slushice#foresp");
    expect(forespoergselHref("slushice", "en")).toBe("/en/erhverv?produkt=slushice#foresp");
    // Formularen skal rent faktisk læse parameteren, ellers får Frederik en
    // mail der bare siger "hej, hvad koster det?"
    const form = readFileSync(join(process.cwd(), "src/components/EventInquiryForm.tsx"), "utf8");
    expect(form).toContain('params.get("produkt")');
  });

  /**
   * En vare vi ikke har på hylden, må ikke vises med et foto: vi reklamerer
   * ikke med udstyr, vi ikke har. Derfor er tom billedsti tilladt netop her,
   * og produktsiden tegner en tekstflade i stedet.
   */
  it("en skaffevare uden foto er tilladt, og prisen er ikke sat", () => {
    for (const id of ["slushice", "fadoel"]) {
      const p = rentalProducts.find((r) => r.id === id)!;
      expect(p.image, `${id} viser et foto af udstyr vi ikke har`).toBe("");
      expect(p.price, `${id} har en pris, men prisen aftales`).toBe(0);
      expect(p.hidden, `${id} er skjult`).toBeFalsy();
    }
  });

  it("produktsiden siger forespørgsel, ikke book", () => {
    const side = readFileSync(join(process.cwd(), "src/components/ProductLanding.tsx"), "utf8");
    expect(side).toContain("erForespoergsel(productId)");
    expect(side).toContain("foresporgCta");
    expect(side).toMatch(/foresporgCta: "Send forespørgsel"/);
    expect(side).toMatch(/foresporgCta: "Send an enquiry"/);
  });
});
