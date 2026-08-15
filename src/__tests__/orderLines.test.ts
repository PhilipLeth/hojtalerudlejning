/**
 * Ordrelinjer og kørsel.
 *
 * Baggrund (15. aug 2026): lejesedlen skrev "Højttaler (Lyskæde varm hvid — —)"
 * fordi hovedproduktet altid blev kaldt en højttaler, og kurv-varerne stod slet
 * ikke på listen. Admin viste det samme. Nu bygger alle visninger listen her.
 */
import { describe, it, expect } from "vitest";
import { orderLines, deliveryInfo, deliverySummary } from "@/lib/orderLines";

const lyskaedeOrdre = {
  speaker: "Lyskæde varm hvid",
  speakerId: "lyskaeder",
  speakerSize: "—",
  addons: ["Røgmaskine", "Levering + afhentning (begge veje)"],
  addonIds: ["rog", "levering_begge"],
  cartItems: [{ name: "Uplight", price: 125, productId: "uplight" }],
  deliveryAddress: "Vestergade 5, 1456 København K",
  total: 1480,
};

describe("orderLines", () => {
  it("kalder ikke et lys-produkt for en højttaler", () => {
    const labels = orderLines(lyskaedeOrdre).map((l) => l.label);
    expect(labels[0]).toBe("Lyskæde varm hvid");
    expect(labels.join(" ")).not.toContain("Højttaler");
    expect(labels.join(" ")).not.toContain("—");
  });

  it("har kurv-varer og tilvalg med", () => {
    const labels = orderLines(lyskaedeOrdre).map((l) => l.label);
    expect(labels).toContain("Uplight");
    expect(labels).toContain("Røgmaskine");
  });

  it("holder kørsel ude af udstyrslisten", () => {
    const labels = orderLines(lyskaedeOrdre).map((l) => l.label);
    expect(labels.some((l) => /levering|afhentning/i.test(l))).toBe(false);
  });

  it("tager højtalerstørrelsen med når den findes", () => {
    const lines = orderLines({
      speaker: "Stor højtalerpakke",
      speakerId: "festival",
      speakerSize: '2× 12" EV',
      addons: [],
    });
    expect(lines[0].label).toBe('Stor højtalerpakke (2× 12" EV)');
  });

  it("springer hovedproduktet over ved 'kun effekter'", () => {
    const lines = orderLines({
      speaker: "Kun effekter",
      speakerId: "effects-only",
      speakerSize: "—",
      addons: ["Lys-pakke"],
      addonIds: ["lys"],
    });
    expect(lines.map((l) => l.label)).toEqual(["Lys-pakke"]);
  });
});

describe("deliveryInfo", () => {
  it("levering er én vej ud", () => {
    const d = deliveryInfo({ addons: ["Levering + opsætning"], addonIds: ["levering_ud"], deliveryAddress: "Nørrebrogade 1" });
    expect(d).toMatchObject({ out: true, back: false, address: "Nørrebrogade 1" });
  });

  it("afhentning er én vej retur", () => {
    const d = deliveryInfo({ addons: ["Afhentning efter festen"], addonIds: ["afhentning_retur"] });
    expect(d).toMatchObject({ out: false, back: true });
  });

  it("begge veje er begge veje", () => {
    expect(deliveryInfo(lyskaedeOrdre)).toMatchObject({ out: true, back: true });
  });

  it("er null når kunden selv henter og afleverer", () => {
    expect(deliveryInfo({ addons: ["Røgmaskine"], addonIds: ["rog"] })).toBeNull();
    expect(deliverySummary({ addons: [], addonIds: [] })).toContain("selv");
  });

  it("gamle bookinger med levering_opsaetning kører stadig begge veje", () => {
    const d = deliveryInfo({
      addons: ["Levering + opsætning i København"],
      addonIds: ["levering_opsaetning"],
      deliveryAddress: "Amagerbrogade 22",
    });
    expect(d).toMatchObject({ out: true, back: true, address: "Amagerbrogade 22" });
  });
});
