import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DEFAULT_OPENING_HOURS as hours } from "@/lib/openingHours";
import { editedHandoverFee, handoverFee, minimumOrderError, orderDelivery } from "@/lib/bookingPolicy";
import { rebuildOrder, orderItemsFromBooking } from "@/lib/orderEdit";
import { migrateOperatingSettings, OPERATING_REVISION } from "@/lib/operatingSettings";
import { bookingItems, validateBookingPolicy } from "../../functions/api/_lib/bookingPolicy";
import { DJ_ID } from "@/lib/dj";
import HandoverPicker from "@/components/HandoverPicker";

describe("Frederiks bookingregler 26. oktober", () => {
  it("bevarer aftalegebyret efter varerabat ved en adminrettelse", () => {
    const lookup = (id: string) => ({ id, name: "Testprodukt", price: 595, kind: "speaker" as const });
    expect(rebuildOrder([{ id: "festival", qty: 1 }], lookup, { discountPct: 10, outsideHoursFee: 200 }).order.total).toBe(735.5);
    expect(rebuildOrder([{ id: "festival", qty: 1 }], lookup, { outsideHoursFee: 200, manualTotal: 700 }).order.total).toBe(700);
    expect(orderItemsFromBooking({ cartItems: [{ productId: "lydmand", quantity: 4 }] }, lookup).items[0].qty).toBe(4);
  });
  it("genberegner gebyr ved ændret kørsel og efteropkræver ikke gamle bookinger", () => {
    const booking = { outsideHoursFee: 200, pickupDay: "2026-10-30", returnDay: "2026-11-01" };
    expect(editedHandoverFee(booking, hours, ["festival"])).toBe(400);
    expect(editedHandoverFee(booking, hours, ["festival", "levering_begge"])).toBe(0);
    expect(editedHandoverFee({ ...booking, outsideHoursFee: undefined }, hours, ["festival"])).toBe(0);
  });
  it.each([0, 395, 499.99])("afviser afhentning for %s kr", amount => expect(minimumOrderError(amount, false)).toContain("500 kr"));
  it.each([500, 595])("accepterer afhentning for %s kr", amount => expect(minimumOrderError(amount, false)).toBeNull());
  it("undtager levering fra minimum", () => expect(minimumOrderError(245, true)).toBeNull());
  it("har præcis mandag og torsdag kl. 17", () => {
    expect(Object.entries(hours.days).filter(([, d]) => !d.closed).map(([day, d]) => [day, d.open, d.close])).toEqual([["mon", "17:00", "17:00"], ["thu", "17:00", "17:00"]]);
  });
  it("almindelig torsdag til mandag har intet gebyr", () => expect(handoverFee(hours, "2026-10-29", "2026-11-02", ["festival"])).toBe(0));
  it("en lukkedag kan ikke skjule gebyret ved at undlade tidsvalg", () => expect(handoverFee(hours, "2026-10-30", "2026-11-02", ["festival"])).toBe(200));
  it("opkræver 400 når begge møder kræver andre tider", () => expect(handoverFee(hours, "2026-10-30", "2026-11-01", ["festival"])).toBe(400));
  it("et aftalt møde på en åbningsdag giver gebyr", () => expect(handoverFee(hours, "2026-10-29", "2026-11-02", ["festival"], "outside")).toBe(200));
  it("levering begge veje fjerner hele gebyret", () => expect(handoverFee(hours, "2026-10-30", "2026-11-01", ["rog", "levering_begge"], "outside", "outside")).toBe(0));
  it("envejslevering fjerner kun det relevante møde", () => {
    expect(handoverFee(hours, "2026-10-30", "2026-11-02", ["rog", "levering_ud"])).toBe(0);
    expect(handoverFee(hours, "2026-10-29", "2026-11-01", ["rog", "levering_ud"])).toBe(200);
    expect(handoverFee(hours, "2026-10-30", "2026-11-02", ["rog", "afhentning_retur"])).toBe(200);
  });
  it("DJ har kørsel inkluderet", () => expect(orderDelivery([DJ_ID])).toEqual({ out: true, back: true, any: true }));
  it("respekterer en særlig åbningsdato", () => {
    const special = { ...hours, exceptions: [{ date: "2026-10-30", closed: false, open: "17:00", close: "18:00", purpose: "" as const, note: "" }] };
    expect(handoverFee(special, "2026-10-30", "2026-11-02", ["festival"])).toBe(0);
  });
  it.each(["", "2026-02-31", "not-a-date"])("afviser ugyldig dato %s på serveren", pickupDay => {
    expect(() => validateBookingPolicy({ hours, pickupDay, returnDay: "2026-11-02", ids: ["festival"], amountKr: 595 })).toThrow();
  });
  it("gebyret tæller ikke med i minimumsordren", () => {
    expect(() => validateBookingPolicy({ hours, pickupDay: "2026-10-30", returnDay: "2026-11-02", ids: ["party"], amountKr: 395 })).toThrow(/500 kr/);
  });
  it("tæller teknikertimer og flere varer korrekt", () => {
    expect(bookingItems({ speakerId: "festival", cartItems: [{ productId: "lydmand", quantity: 4 }] }).map(i => i.id)).toEqual(["festival", "lydmand", "lydmand", "lydmand", "lydmand"]);
  });
  it.each([0, -1, 0.5, 201])("afviser manipuleret antal %s", quantity => expect(() => bookingItems({ cartItems: [{ productId: "party", quantity }] })).toThrow());
});

describe("Flytning og gemte indstillinger", () => {
  it("flytter gamle KV-indstillinger uden at ændre CVR-adresse eller telefon", () => {
    const legacy = { phone: "12345678", pickupAddress: "Vermlandsgade 66", company: { street: "Firmaadresse" }, hours: { ...hours, onlyOpenDays: true } };
    const migrated = migrateOperatingSettings(legacy);
    expect(migrated.pickupAddress).toBe("Njalsgade 40, 2300 København");
    expect(migrated.hours.onlyOpenDays).toBe(false);
    expect(migrated.company).toEqual(legacy.company);
    expect(migrated.phone).toBe(legacy.phone);
  });
  it("bevarer efterfølgende adminændringer og er idempotent", () => {
    const saved = { operatingRevision: OPERATING_REVISION, pickupAddress: "Ny adresse", hours };
    expect(migrateOperatingSettings(saved)).toEqual(saved);
    expect(migrateOperatingSettings(migrateOperatingSettings({}))).toEqual(migrateOperatingSettings({}));
  });
});

describe("Tidsvalg i kundens booking", () => {
  it("viser gratis åbningstid og et udtrykkeligt tilvalg", () => {
    const change = vi.fn();
    render(<HandoverPicker hours={hours} date="2026-10-29" value="unknown" onChange={change} label="Afhentning" locale="da" />);
    expect(screen.getByLabelText(/Fast aftaletid/)).toBeChecked();
    fireEvent.click(screen.getByLabelText(/Andet tidspunkt efter aftale/));
    expect(change).toHaveBeenCalledWith("outside");
  });
  it("viser aftale og gebyr på engelsk på en lukkedag", () => {
    render(<HandoverPicker hours={hours} date="2026-10-30" value="unknown" onChange={() => {}} label="Pickup" locale="en" />);
    expect(screen.getByLabelText(/Another time by arrangement/)).toBeChecked();
    expect(screen.getByText(/DKK 200 for this pickup or return/)).toBeInTheDocument();
    expect(screen.queryByText(/Scheduled appointment/)).not.toBeInTheDocument();
  });
});
