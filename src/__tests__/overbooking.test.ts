/**
 * Overbooking: bookinger vi tager imod uden at eje udstyret endnu.
 *
 * Vi tillader det med vilje, produkt for produkt, fordi enhederne kan købes
 * eller lejes ind til dagen (JIT). Prisen for at tillade det er at nogen SKAL
 * vide det med det samme — ellers står vi fredag med en kunde og ingen maskine.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  bookableInventory,
  bundleSlots,
  effectiveOverbook,
  validateStockPatch,
} from "../../functions/api/_lib/inventory";
import { findOverbooking, overbookingPush } from "../../functions/api/_lib/overbooking";
import type { LoadedBooking } from "../../functions/api/_lib/bookings";

function booking(id: string, pickup: string, returnDate: string, productIds: string[]): LoadedBooking {
  return { id, pickup, returnDate, productIds, total: 0, cartItems: [] };
}

const labels = { karaoke: "Karaokemaskine", rog: "Røgmaskine", party: "Lille højtalerpakke" };

describe("Overbooking pr. produkt", () => {
  it("lægges oven i lageret som det vi tager imod", () => {
    const bookable = bookableInventory({ rog: 2, party: 5 }, { rog: 2 });
    expect(bookable).toEqual({ rog: 4, party: 5 });
  });

  it("betyder intet uden et lagertal — uden loft er der ikke noget at overskride", () => {
    expect(effectiveOverbook({ karaoke: 3 }, { party: 2 })).toEqual({});
    expect(bookableInventory({ party: 2 }, { karaoke: 3 })).toEqual({ party: 2 });
  });

  it("ignorerer nul og vrøvl", () => {
    expect(effectiveOverbook({ rog: 0, party: -1, lys: "to", taske: 2 }, { rog: 1, party: 1, lys: 1, taske: 1 }))
      .toEqual({ taske: 2 });
  });

  it("læses både som rå KV-streng og som parset objekt", () => {
    const owned = { rog: 1 };
    expect(effectiveOverbook(JSON.stringify({ rog: 2 }), owned)).toEqual({ rog: 2 });
    expect(effectiveOverbook({ rog: 2 }, owned)).toEqual({ rog: 2 });
  });

  it("valideres som lagertal — ingen halve eller vilde antal", () => {
    expect(validateStockPatch({ rog: 2 }).ok).toBe(true);
    expect(validateStockPatch({ rog: 2.5 }).ok).toBe(false);
    expect(validateStockPatch({ rog: 1000 }).ok).toBe(false);
  });

  it("giver pakken flere pladser, når delene kan skaffes", () => {
    // 1 festival + 1 lys ejet, men vi kan skaffe én mere af hver
    const bookable = bookableInventory({ festival: 1, lys: 1 }, { festival: 1, lys: 1 });
    expect(bundleSlots(["festival", "lys"], bookable, { festival: 1, lys: 1 })).toEqual({ total: 2, used: 1 });
  });
});

describe("Hvad skal skaffes", () => {
  const owned = { karaoke: 1, rog: 2, party: 2 };

  it("finder produkter hvor der er booket flere end vi ejer", () => {
    const hits = findOverbooking(
      [
        booking("a", "2026-08-21", "2026-08-24", ["karaoke"]),
        booking("b", "2026-08-21", "2026-08-24", ["karaoke"]),
      ],
      owned, labels, "2026-08-01", "2026-09-01",
    );
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ id: "karaoke", name: "Karaokemaskine", booked: 2, owned: 1, missing: 1 });
    expect(hits[0].day).toBe("2026-08-21");
  });

  it("siger intet når vi har nok", () => {
    expect(findOverbooking([booking("a", "2026-08-21", "2026-08-24", ["karaoke"])], owned, labels, "2026-08-01", "2026-09-01"))
      .toEqual([]);
  });

  it("tæller ikke afleveringsdagen — udstyret er tilbage", () => {
    const hits = findOverbooking(
      [
        booking("a", "2026-08-21", "2026-08-23", ["karaoke"]),
        booking("b", "2026-08-23", "2026-08-25", ["karaoke"]),
      ],
      owned, labels, "2026-08-01", "2026-09-01",
    );
    expect(hits).toEqual([]);
  });

  it("melder den værste dag, for det er antallet vi skal skaffe", () => {
    const hits = findOverbooking(
      [
        booking("a", "2026-08-21", "2026-08-24", ["rog"]),
        booking("b", "2026-08-21", "2026-08-24", ["rog"]),
        booking("c", "2026-08-22", "2026-08-24", ["rog"]),
        booking("d", "2026-08-22", "2026-08-24", ["rog"]),
      ],
      owned, labels, "2026-08-01", "2026-09-01",
    );
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ id: "rog", day: "2026-08-22", booked: 4, owned: 2, missing: 2 });
  });

  it("springer produkter uden lagertal over — de har intet loft", () => {
    const hits = findOverbooking(
      [
        booking("a", "2026-08-21", "2026-08-24", ["projektor"]),
        booking("b", "2026-08-21", "2026-08-24", ["projektor"]),
      ],
      owned, labels, "2026-08-01", "2026-09-01",
    );
    expect(hits).toEqual([]);
  });

  it("kan begrænses til én bookings egne produkter", () => {
    const bookings = [
      booking("a", "2026-08-21", "2026-08-24", ["karaoke"]),
      booking("b", "2026-08-21", "2026-08-24", ["karaoke"]),
      booking("c", "2026-08-21", "2026-08-24", ["rog", "rog", "rog"]),
    ];
    const alle = findOverbooking(bookings, owned, labels, "2026-08-01", "2026-09-01");
    expect(alle.map((h) => h.id).sort()).toEqual(["karaoke", "rog"]);

    const kunRog = findOverbooking(bookings, owned, labels, "2026-08-01", "2026-09-01", new Set(["rog"]));
    expect(kunRog.map((h) => h.id)).toEqual(["rog"]);
  });

  it("ser kun i det vindue man spørger om", () => {
    const bookings = [
      booking("a", "2026-12-21", "2026-12-24", ["karaoke"]),
      booking("b", "2026-12-21", "2026-12-24", ["karaoke"]),
    ];
    expect(findOverbooking(bookings, owned, labels, "2026-08-01", "2026-09-01")).toEqual([]);
    expect(findOverbooking(bookings, owned, labels, "2026-12-01", "2027-01-01")).toHaveLength(1);
  });
});

describe("Push-beskeden", () => {
  const hit = { id: "karaoke", name: "Karaokemaskine", day: "2026-08-21", booked: 2, owned: 1, missing: 1 };

  it("siger 'Overbooking registreret' og hvad der mangler", () => {
    const { title, body } = overbookingPush([hit]);
    expect(title).toBe("Overbooking registreret");
    expect(body).toContain("Karaokemaskine: 2 booket, vi har 1");
    expect(body).toMatch(/fre\.? 21\. aug/);
    expect(body).toContain("Skal skaffes");
  });

  it("tæller produkterne når det er flere", () => {
    const { title } = overbookingPush([hit, { ...hit, id: "rog", name: "Røgmaskine" }]);
    expect(title).toBe("Overbooking registreret — 2 produkter");
  });
});

describe("Hvor overbooking må tælle med", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("kunden må booke op til lager + overbooking", () => {
    const src = read("functions/api/availability.ts");
    expect(src).toContain("pair.bookable");
  });

  it("annoncer slukkes først når heller ikke JIT er tilbage", () => {
    expect(read("functions/api/soldout.ts")).toContain("pair.bookable");
    expect(read("functions/api/ads.ts")).toContain("pair.bookable");
    expect(read("functions/api/ads-rules.ts")).toContain("pair.bookable");
  });

  it("weekendudsalget giver kun rabat på det vi ejer", () => {
    // Ellers ville vi sætte udstyr på udsalg, som vi mangler at købe ind
    for (const f of ["functions/api/udsalg.ts", "functions/api/udsalg-aktiv.ts", "functions/api/_lib/discounts.ts"]) {
      const src = read(f);
      expect(src, f).toContain("effectiveInventory");
      expect(src, f).not.toContain("bookable");
    }
  });

  it("belægningskalenderen måler på det ejede, så JIT-baner markeres", () => {
    const src = read("functions/api/occupancy.ts");
    expect(src).toContain("effectiveInventory");
    expect(src).not.toContain("bookable");
  });

  it("booking-endpointet varsler når det sker", () => {
    const src = read("functions/api/book.ts");
    expect(src).toContain("notifyOverbooking");
  });
});
