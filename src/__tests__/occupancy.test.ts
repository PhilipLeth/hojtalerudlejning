/**
 * Belægningskalender: lane-packing + pakke-ekspansion.
 */
import { describe, it, expect } from "vitest";
import {
  expandProductIds,
  packLanes,
  buildOccupancy,
  occupiesDay,
  rangesOverlap,
} from "../../functions/api/_lib/occupancy";

describe("expandProductIds", () => {
  it("ekspanderer festpakke til dele", () => {
    expect(expandProductIds(["pakke_fest_lille"])).toEqual(["party", "lyseffekt"]);
    expect(expandProductIds(["pakke_fest_stor"])).toEqual(["festival", "lys"]);
  });

  it("beholder almindelige produkter", () => {
    expect(expandProductIds(["soundboks", "rog"])).toEqual(["soundboks", "rog"]);
  });

  it("skipper levering", () => {
    expect(expandProductIds(["soundboks", "levering_opsaetning"])).toEqual(["soundboks"]);
  });
});

describe("occupiesDay / rangesOverlap", () => {
  it("afleveringsdag tæller ikke", () => {
    expect(occupiesDay("2026-08-14", "2026-08-17", "2026-08-16")).toBe(true);
    expect(occupiesDay("2026-08-14", "2026-08-17", "2026-08-17")).toBe(false);
  });

  it("detekterer overlap", () => {
    expect(rangesOverlap("2026-08-14", "2026-08-17", "2026-08-16", "2026-08-19")).toBe(true);
    expect(rangesOverlap("2026-08-14", "2026-08-17", "2026-08-17", "2026-08-20")).toBe(false);
  });
});

describe("packLanes", () => {
  it("lægger ikke-overlappende bookinger i samme bane", () => {
    const packed = packLanes(
      [
        { bookingId: "a", pickup: "2026-08-14", returnDate: "2026-08-17" },
        { bookingId: "b", pickup: "2026-08-17", returnDate: "2026-08-20" },
      ],
      2,
    );
    expect(packed.find((p) => p.bookingId === "a")!.lane).toBe(0);
    expect(packed.find((p) => p.bookingId === "b")!.lane).toBe(0);
  });

  it("bruger næste bane ved overlap (2 Soundboks)", () => {
    const packed = packLanes(
      [
        { bookingId: "a", pickup: "2026-08-14", returnDate: "2026-08-17" },
        { bookingId: "b", pickup: "2026-08-15", returnDate: "2026-08-18" },
      ],
      2,
    );
    const lanes = packed.map((p) => p.lane).sort();
    expect(lanes).toEqual([0, 1]);
    expect(packed.every((p) => !p.overflow)).toBe(true);
  });

  it("marker overbooking når stock er opbrugt", () => {
    const packed = packLanes(
      [
        { bookingId: "a", pickup: "2026-08-14", returnDate: "2026-08-17" },
        { bookingId: "b", pickup: "2026-08-14", returnDate: "2026-08-17" },
        { bookingId: "c", pickup: "2026-08-14", returnDate: "2026-08-17" },
      ],
      2,
    );
    const c = packed.find((p) => p.bookingId === "c")!;
    expect(c.lane).toBe(2);
    expect(c.overflow).toBe(true);
  });

  it("5 bookinger på 2 enheder på forskellige datoer bruger max 2 baner", () => {
    const packed = packLanes(
      [
        { bookingId: "1", pickup: "2026-08-01", returnDate: "2026-08-03" },
        { bookingId: "2", pickup: "2026-08-03", returnDate: "2026-08-05" },
        { bookingId: "3", pickup: "2026-08-05", returnDate: "2026-08-07" },
        { bookingId: "4", pickup: "2026-08-02", returnDate: "2026-08-04" },
        { bookingId: "5", pickup: "2026-08-06", returnDate: "2026-08-08" },
      ],
      2,
    );
    expect(Math.max(...packed.map((p) => p.lane))).toBeLessThanOrEqual(1);
    expect(packed.every((p) => !p.overflow)).toBe(true);
  });
});

describe("buildOccupancy", () => {
  it("viser peak og ekspanderer festpakke til party", () => {
    const rows = buildOccupancy(
      [
        {
          id: "booking_1",
          name: "Anna",
          pickup: "2026-08-14",
          returnDate: "2026-08-17",
          productIds: ["pakke_fest_lille"],
        },
        {
          id: "booking_2",
          name: "Bo",
          pickup: "2026-08-14",
          returnDate: "2026-08-17",
          productIds: ["party"],
        },
      ],
      { party: 2, lyseffekt: 1 },
      "2026-08-14",
      "2026-08-20",
    );
    const party = rows.find((r) => r.id === "party")!;
    expect(party.peak).toBe(2);
    expect(party.bookings).toHaveLength(2);
    expect(party.bookings.map((b) => b.customerName).sort()).toEqual(["Anna", "Bo"]);

    const lys = rows.find((r) => r.id === "lyseffekt")!;
    expect(lys.bookings).toHaveLength(1);
    expect(lys.bookings[0].customerName).toBe("Anna");
  });

  it("ignorerer annullerede og afleverede", () => {
    const rows = buildOccupancy(
      [
        {
          id: "booking_x",
          name: "X",
          status: "annulleret",
          pickup: "2026-08-14",
          returnDate: "2026-08-17",
          productIds: ["soundboks"],
        },
        {
          id: "booking_y",
          name: "Y",
          status: "afleveret",
          pickup: "2026-08-14",
          returnDate: "2026-08-17",
          productIds: ["soundboks"],
        },
      ],
      { soundboks: 2 },
      "2026-08-14",
      "2026-08-20",
    );
    const sb = rows.find((r) => r.id === "soundboks")!;
    expect(sb.bookings).toHaveLength(0);
  });
});
