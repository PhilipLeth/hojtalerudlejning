/**
 * Logikken bag fredagsudsalget. En fejl her betyder enten at man annoncerer
 * udstyr der ikke kan lejes, eller at man giver rabat på noget der ville være
 * blevet udlejet til fuld pris alligevel.
 */
import { describe, it, expect } from "vitest";
import { nextWeekends, upcomingWeekend, type LoadedBooking } from "../../functions/api/_lib/bookings";
import { DEFAULT_CAMPAIGN, parseCampaign, weekendSale } from "../../functions/api/_lib/weekendSale";
import type { CatalogProduct } from "../../functions/api/_lib/catalog";

// Weekenden 21.-23. august 2026 (fredag, lørdag, søndag)
const WEEKEND = upcomingWeekend("2026-08-21");

const CATALOG: CatalogProduct[] = [
  { id: "festival", name: "Stor højtalerpakke", price: 695 },
  { id: "party", name: "Lille højtalerpakke", price: 395 },
  { id: "lys", name: "Lys-pakke", price: 495 },
];

const INVENTORY = { festival: 2, party: 2, lys: 2 };

function booking(pickup: string, returnDate: string, productIds: string[]): LoadedBooking {
  return { pickup, returnDate, productIds, total: 0, cartItems: [] };
}

function offerFor(sale: ReturnType<typeof weekendSale>, id: string) {
  const offer = sale.offers.find((o) => o.productId === id);
  if (!offer) throw new Error(`Intet tilbud for ${id}`);
  return offer;
}

function run(bookings: LoadedBooking[], campaign = DEFAULT_CAMPAIGN) {
  return weekendSale(bookings, INVENTORY, CATALOG, campaign, WEEKEND);
}

describe("upcomingWeekend / nextWeekends", () => {
  it("peger på fredag i indeværende uge når det allerede er fredag", () => {
    expect(WEEKEND.days).toEqual(["2026-08-21", "2026-08-22", "2026-08-23"]);
    // Mandag: udstyret er tilbage, så dagen er ikke en del af weekenden
    expect(WEEKEND.to).toBe("2026-08-24");
  });

  it("peger frem til førstkommende fredag midt i ugen", () => {
    expect(upcomingWeekend("2026-08-18").from).toBe("2026-08-21");
  });

  it("giver på hinanden følgende weekender", () => {
    expect(nextWeekends("2026-08-18", 3).map((w) => w.from)).toEqual([
      "2026-08-21", "2026-08-28", "2026-09-04",
    ]);
  });
});

describe("weekendSale", () => {
  it("sætter alt ledigt på udsalg når kalenderen er tom", () => {
    const sale = run([]);
    expect(sale.offers.every((o) => o.onSale)).toBe(true);
    expect(sale.unitsOnSale).toBe(6);
    expect(sale.valueAtListPrice).toBe(2 * 695 + 2 * 395 + 2 * 495);
    expect(sale.discountCost).toBe(Math.round(sale.valueAtListPrice * 0.2));
  });

  it("trækker bookede enheder fra, men holder resten på udsalg", () => {
    const sale = run([booking("2026-08-21", "2026-08-24", ["festival"])]);
    const festival = offerFor(sale, "festival");
    expect(festival.freePerDay).toEqual([1, 1, 1]);
    expect(festival.freeAllWeekend).toBe(1);
    expect(festival.onSale).toBe(true);
  });

  it("holder udstyr ude når det kun er ledigt en del af weekenden", () => {
    // Booket lørdag→søndag: fredag er ledig, men weekenden kan ikke lejes
    const sale = run([
      booking("2026-08-22", "2026-08-23", ["festival"]),
      booking("2026-08-22", "2026-08-23", ["festival"]),
    ]);
    const festival = offerFor(sale, "festival");
    expect(festival.freePerDay).toEqual([2, 0, 2]);
    expect(festival.freeAllWeekend).toBe(0);
    expect(festival.onSale).toBe(false);
    expect(festival.because).toBe("Udsolgt lør");
  });

  it("regner ikke afleveringsdagen som optaget", () => {
    // Afleveres fredag — udstyret er tilbage samme dag og kan lejes ud igen
    const sale = run([
      booking("2026-08-18", "2026-08-21", ["festival"]),
      booking("2026-08-18", "2026-08-21", ["festival"]),
    ]);
    expect(offerFor(sale, "festival").freeAllWeekend).toBe(2);
  });

  it("holder undtagne produkter ude, uanset hvor meget der står tilbage", () => {
    const sale = run([], { pct: 20, excluded: ["festival"] });
    const festival = offerFor(sale, "festival");
    expect(festival.onSale).toBe(false);
    expect(festival.because).toBe("Undtaget fra udsalg");
    expect(festival.freeAllWeekend).toBe(2);
    // Værdien tæller ikke med, når produktet ikke er på udsalg
    expect(sale.valueAtListPrice).toBe(2 * 395 + 2 * 495);
  });

  it("regner rabatprisen ud pr. produkt", () => {
    const sale = run([], { pct: 20, excluded: [] });
    expect(offerFor(sale, "festival").salePrice).toBe(556);
    expect(offerFor(sale, "party").salePrice).toBe(316);
  });

  it("holder produkter uden lager og uden pris ude", () => {
    const sale = weekendSale([], { festival: 0, ukendt: 3 }, CATALOG, DEFAULT_CAMPAIGN, WEEKEND);
    expect(offerFor(sale, "festival").because).toBe("Ikke på lager");
    // Ikke i kataloget → ingen pris at give rabat på
    expect(offerFor(sale, "ukendt").because).toBe("Ingen pris i kataloget");
    expect(sale.unitsOnSale).toBe(0);
  });

  it("sætter det med størst værdi øverst", () => {
    const sale = run([]);
    expect(sale.offers.map((o) => o.productId)).toEqual(["festival", "lys", "party"]);
  });
});

describe("parseCampaign", () => {
  it("falder tilbage på standarden ved vrøvl", () => {
    expect(parseCampaign(null)).toEqual({ pct: 20, excluded: [] });
    expect(parseCampaign({ pct: 500 }).pct).toBe(20);
    expect(parseCampaign({ pct: 0 }).pct).toBe(20);
    expect(parseCampaign({ excluded: "festival" }).excluded).toEqual([]);
  });

  it("beholder gyldige værdier", () => {
    expect(parseCampaign({ pct: 15, excluded: ["soundboks"], note: "kun august" })).toEqual({
      pct: 15,
      excluded: ["soundboks"],
      note: "kun august",
    });
  });
});
