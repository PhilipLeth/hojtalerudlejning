/**
 * Logikken bag ads-oversigten. Den afgør om en annonce foreslås slukket, så
 * en fejl her betyder enten spildte klik på udsolgte produkter eller tabt
 * omsætning på ledige.
 */
import { describe, it, expect } from "vitest";
import {
  soldOutDaysByProduct,
  addDays,
  bookedProductIds,
  type LoadedBooking,
} from "../../functions/api/_lib/bookings";
import { upcomingWeekend } from "../../functions/api/ads";

function booking(pickup: string, returnDate: string, productIds: string[]): LoadedBooking {
  return { pickup, returnDate, productIds, total: 0, cartItems: [] };
}

describe("addDays", () => {
  it("krydser månedsskift", () => {
    expect(addDays("2026-08-30", 3)).toBe("2026-09-02");
  });

  it("går baglæns", () => {
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("upcomingWeekend", () => {
  it("finder den kommende fredag fra en mandag", () => {
    // 2026-08-10 er en mandag
    expect(upcomingWeekend("2026-08-10").days).toEqual(["2026-08-14", "2026-08-15", "2026-08-16"]);
  });

  it("regner fredag selv som den kommende weekend", () => {
    // 2026-08-14 er en fredag — man skal ikke vente en uge på sin egen weekend
    expect(upcomingWeekend("2026-08-14").from).toBe("2026-08-14");
  });

  it("springer til næste fredag fra en søndag", () => {
    // 2026-08-16 er en søndag
    expect(upcomingWeekend("2026-08-16").from).toBe("2026-08-21");
  });
});

describe("soldOutDaysByProduct", () => {
  const inventory = { soundboks: 2, thumpgo: 1 };

  it("markerer først udsolgt når lageret er brugt op", () => {
    const bookings = [booking("2026-08-14", "2026-08-17", ["soundboks"])];
    expect(soldOutDaysByProduct(bookings, inventory, "2026-08-01", "2026-08-31").soldboks).toBeUndefined();
    expect(soldOutDaysByProduct(bookings, inventory, "2026-08-01", "2026-08-31").soundboks).toBeUndefined();
  });

  it("markerer udsolgt når alle enheder er booket", () => {
    const bookings = [
      booking("2026-08-14", "2026-08-17", ["soundboks"]),
      booking("2026-08-14", "2026-08-17", ["soundboks"]),
    ];
    const out = soldOutDaysByProduct(bookings, inventory, "2026-08-01", "2026-08-31");
    expect(out.soundboks).toEqual(["2026-08-14", "2026-08-15", "2026-08-16"]);
  });

  it("tæller ikke afleveringsdagen som optaget", () => {
    // Udstyret er tilbage den 17., så den dag må sælges igen
    const bookings = [booking("2026-08-14", "2026-08-17", ["thumpgo"])];
    const out = soldOutDaysByProduct(bookings, inventory, "2026-08-01", "2026-08-31");
    expect(out.thumpgo).not.toContain("2026-08-17");
  });

  it("holder sig inden for vinduet", () => {
    const bookings = [booking("2026-08-01", "2026-08-31", ["thumpgo"])];
    const out = soldOutDaysByProduct(bookings, inventory, "2026-08-10", "2026-08-12");
    expect(out.thumpgo).toEqual(["2026-08-10", "2026-08-11", "2026-08-12"]);
  });

  it("kan ikke melde udsolgt for et produkt uden kendt lager", () => {
    const bookings = [booking("2026-08-14", "2026-08-17", ["ukendt_produkt"])];
    const out = soldOutDaysByProduct(bookings, inventory, "2026-08-01", "2026-08-31");
    expect(out.ukendt_produkt).toBeUndefined();
  });
});

describe("bookedProductIds", () => {
  it("finder højtaleren via navn når speakerId mangler", () => {
    expect(bookedProductIds({ speaker: "Soundboks 4" })).toContain("soundboks");
  });

  it("oversætter tilvalgsnavne med æ/ø til produkt-ids", () => {
    expect(bookedProductIds({ speaker: "", addons: ["Røgmaskine"] })).toContain("rog");
  });

  it("tager kurv-varer med", () => {
    const ids = bookedProductIds({ speaker: "", cartItems: [{ productId: "subwoofer" }] });
    expect(ids).toContain("subwoofer");
  });

  it("tæller 'kun lys' som lys-produktet, ikke som en højtaler", () => {
    const ids = bookedProductIds({ speaker: "kun lys" });
    expect(ids).toEqual(["lys"]);
  });
});
