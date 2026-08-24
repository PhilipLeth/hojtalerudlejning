/**
 * Hvornår vil kunden hente?
 *
 * Før stod der "andre tidspunkter efter aftale — skriv i kommentarfeltet", og
 * så gik der telefoner frem og tilbage bagefter. Nu vælger kunden et tidsrum i
 * checkout, og ligger det uden for åbningstiden, lægges gebyret på ordren med
 * det samme.
 *
 * Reglerne der skal holde:
 *   · en åben dag har et gratis valg, og det er forvalgt — tidsvalget må ikke
 *     koste kunden et eneste klik
 *   · en lukket dag koster gebyr uanset hvilket tidsrum man vælger, også
 *     "ved jeg ikke endnu" — vi kører derned uanset hvad
 *   · beløbet slås ALTID op i åbningstiderne, aldrig i det klienten sendte
 *   · kører vi selv ud med anlægget, er der ingen tur at tage gebyr for
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingFlow from "@/components/BookingFlow";
import {
  DEFAULT_OPENING_HOURS,
  defaultTimeSlot,
  formatTimeSlot,
  resolveTimeSlot,
  timeSlotFee,
  timeSlots,
  type OpeningHours,
} from "@/lib/openingHours";
import { afterHoursLegs, afterHoursLineItems } from "../../functions/api/_lib/pricing";

/** Standardtiderne: mandag 15–17, fredag 14–18, gebyr 50 kr mellem 6.30 og 21 */
const hours = DEFAULT_OPENING_HOURS;

// 2026-08-28 er en fredag (åben), 2026-08-29 en lørdag (lukket)
const FREDAG = "2026-08-28";
const LØRDAG = "2026-08-29";

describe("tidsrum på en åben dag", () => {
  it("tilbyder åbningstiden gratis og de andre med gebyr", () => {
    const slots = timeSlots(hours, FREDAG);
    expect(slots.map((s) => s.id)).toEqual(["open", "early", "late", "unknown"]);
    expect(slots.find((s) => s.id === "open")!.fee).toBe(0);
    expect(slots.find((s) => s.id === "early")!.fee).toBe(50);
    expect(slots.find((s) => s.id === "late")!.fee).toBe(50);
    // "Ved jeg ikke endnu" er gratis: vi går ud fra åbningstiden
    expect(slots.find((s) => s.id === "unknown")!.fee).toBe(0);
  });

  it("skriver tiderne på knapperne, så gebyret ikke er en gåde", () => {
    const slots = timeSlots(hours, FREDAG);
    expect(slots.find((s) => s.id === "open")!.label).toBe("I åbningstiden 14–18");
    expect(slots.find((s) => s.id === "early")!.label).toBe("Før 14");
    expect(slots.find((s) => s.id === "late")!.label).toBe("Efter 18");
  });

  it("forvælger det gratis tidsrum", () => {
    expect(defaultTimeSlot(hours, FREDAG)).toBe("open");
    expect(timeSlotFee(hours, FREDAG, defaultTimeSlot(hours, FREDAG))).toBe(0);
  });
});

describe("tidsrum på en lukket dag", () => {
  it("koster gebyr uanset hvad man vælger — også »ved jeg ikke endnu«", () => {
    const slots = timeSlots(hours, LØRDAG);
    expect(slots.map((s) => s.id)).toEqual(["early", "late", "unknown"]);
    expect(slots.every((s) => s.fee === 50)).toBe(true);
  });

  it("deler dagen ved middag, som Frederik bad om", () => {
    const slots = timeSlots(hours, LØRDAG);
    expect(slots.find((s) => s.id === "early")!.label).toBe("Før 12");
    expect(slots.find((s) => s.id === "late")!.label).toBe("Efter 12");
  });

  it("vælger ikke et betalt tidsrum for kunden", () => {
    expect(defaultTimeSlot(hours, LØRDAG)).toBe("unknown");
  });
});

describe("når afhentning uden for åbningstid er slået fra", () => {
  const uden: OpeningHours = { ...hours, afterHours: { ...hours.afterHours, enabled: false } };

  it("er der intet tidsrum at vælge, og intet gebyr", () => {
    expect(timeSlots(uden, FREDAG)).toEqual([]);
    expect(timeSlots(uden, LØRDAG)).toEqual([]);
    expect(timeSlotFee(uden, LØRDAG, "early")).toBe(0);
    expect(formatTimeSlot(uden, LØRDAG, "early")).toBe("");
  });
});

describe("et ukendt tidsrum fra klienten", () => {
  it("koster ingenting frem for at gætte et beløb", () => {
    expect(timeSlotFee(hours, FREDAG, "kl-3-om-natten")).toBe(0);
    expect(timeSlotFee(hours, FREDAG, undefined)).toBe(0);
  });

  it("falder tilbage på standardvalget for dagen", () => {
    expect(resolveTimeSlot(hours, FREDAG, "kl-3-om-natten")).toBe("open");
    expect(resolveTimeSlot(hours, LØRDAG, undefined)).toBe("unknown");
    // "open" findes ikke på en lukket dag — så tæller den ikke som gratis smutvej
    expect(resolveTimeSlot(hours, LØRDAG, "open")).toBe("unknown");
    expect(timeSlotFee(hours, LØRDAG, resolveTimeSlot(hours, LØRDAG, "open"))).toBe(50);
  });
});

describe("gebyret på ordren", () => {
  const ordre = { productIds: ["thumpgo"] };

  it("tager ét gebyr pr. tur uden for åbningstid", () => {
    const legs = afterHoursLegs(hours, {
      ...ordre,
      pickup: LØRDAG,
      returnDate: LØRDAG,
      pickupSlot: "early",
      returnSlot: "late",
    });
    expect(legs.map((l) => l.leg)).toEqual(["pickup", "return"]);
    expect(legs.reduce((n, l) => n + l.fee, 0)).toBe(100);
  });

  it("tager intet, når begge ture ligger i åbningstiden", () => {
    expect(
      afterHoursLegs(hours, { ...ordre, pickup: FREDAG, returnDate: FREDAG, pickupSlot: "open", returnSlot: "open" }),
    ).toEqual([]);
  });

  it("dropper turen vi selv kører", () => {
    // levering ud: der er ingen afhentning at tage gebyr for
    const ud = afterHoursLegs(hours, {
      productIds: ["thumpgo", "levering_ud"],
      pickup: LØRDAG,
      returnDate: LØRDAG,
      pickupSlot: "early",
      returnSlot: "late",
    });
    expect(ud.map((l) => l.leg)).toEqual(["return"]);

    // levering begge veje: intet gebyr overhovedet
    const begge = afterHoursLegs(hours, {
      productIds: ["thumpgo", "levering_begge"],
      pickup: LØRDAG,
      returnDate: LØRDAG,
      pickupSlot: "early",
      returnSlot: "late",
    });
    expect(begge).toEqual([]);
  });

  it("bruger admins gebyr, ikke et tal fra klienten", () => {
    const dyrere: OpeningHours = { ...hours, afterHours: { ...hours.afterHours, fee: 150 } };
    const legs = afterHoursLegs(dyrere, { ...ordre, pickup: LØRDAG, pickupSlot: "early" });
    expect(legs[0].fee).toBe(150);
  });

  it("bliver til Stripe-linjer i øre", () => {
    const legs = afterHoursLegs(hours, { ...ordre, pickup: LØRDAG, pickupSlot: "early" });
    const { lineItems, totalOre } = afterHoursLineItems(legs);
    expect(totalOre).toBe(5000);
    expect(lineItems[0].price_data).toMatchObject({
      currency: "dkk",
      unit_amount: 5000,
      product_data: { name: "Afhentning uden for åbningstid" },
    });
  });

  it("skriver linjen på engelsk til engelske kunder", () => {
    const legs = afterHoursLegs(hours, { ...ordre, pickup: LØRDAG, pickupSlot: "early" }, "en");
    expect(legs[0].name).toBe("Pickup outside opening hours");
  });
});

describe("tidsrummet som tekst til mails og lejeseddel", () => {
  it("nævner gebyret, så Frederik ved hvad der er opkrævet", () => {
    expect(formatTimeSlot(hours, LØRDAG, "early")).toBe("Før 12 (6.30–12) — uden for åbningstid 50 kr");
  });

  it("holder åbningstiden kort", () => {
    expect(formatTimeSlot(hours, FREDAG, "open")).toBe("I åbningstiden 14–18");
  });

  it("er tom når der intet er valgt — en gammel booking får ingen tom række", () => {
    expect(formatTimeSlot(hours, FREDAG, undefined)).toBe("");
  });
});

/* ─────────────── i selve checkout ─────────────── */

/** Vælg produkt, bladr til dagen og vælg den + dagen efter */
async function vælgDatoer(fra: Date, til: Date) {
  window.history.pushState({}, "", "/?product=festival#book");
  render(<BookingFlow />);
  await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());

  const iDag = new Date();
  const klik = (day: number) => {
    const btn = screen
      .getAllByRole("button")
      .find((x) => x.textContent === String(day) && !(x as HTMLButtonElement).disabled);
    if (btn) fireEvent.click(btn);
  };
  const næsteMåned = () => fireEvent.click(screen.getByLabelText("Næste måned"));

  if (fra.getMonth() !== iDag.getMonth()) næsteMåned();
  klik(fra.getDate());
  if (til.getMonth() !== fra.getMonth()) næsteMåned();
  klik(til.getDate());
}

/** Næste forekomst af en ugedag (0 = søndag) */
function næste(ugedag: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((ugedag - d.getDay() + 7) % 7 || 7));
  return d;
}

describe("tidsvalget i checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ inventory: {}, booked: {}, blocked_dates: [] }),
    });
  });
  afterEach(() => window.history.pushState({}, "", "/"));

  it("koster ingenting på åbne dage — tidsvalget må ikke koste et klik", async () => {
    const fredag = næste(5);
    const mandag = new Date(fredag);
    mandag.setDate(mandag.getDate() + 3);
    await vælgDatoer(fredag, mandag);

    await waitFor(() => expect(screen.getByText("Hvornår henter du?")).toBeInTheDocument());
    // Åbningstiden er valgt på forhånd, og der er ingen gebyrlinje
    const åben = screen.getAllByText("I åbningstiden 14–18");
    expect(åben.length).toBeGreaterThan(0);
    expect(åben[0].closest("button")).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("Afhentning uden for åbningstid")).not.toBeInTheDocument();
    expect(screen.queryByText("Uden for åbningstid (begge veje)")).not.toBeInTheDocument();
  });

  it("lægger gebyret på, når begge dage er lukkede", async () => {
    const lørdag = næste(6);
    const søndag = new Date(lørdag);
    søndag.setDate(søndag.getDate() + 1);
    await vælgDatoer(lørdag, søndag);

    await waitFor(() => expect(screen.getByText("Hvornår henter du?")).toBeInTheDocument());
    expect(screen.getAllByText("Før 12").length).toBeGreaterThan(0);
    // To ture uden for åbningstid = 2 × 50 kr, og det står ved datoerne
    expect(screen.getByText("Uden for åbningstid (begge veje)")).toBeInTheDocument();
    expect(screen.getByText("+100 kr")).toBeInTheDocument();
  });

  it("sender tidsrummet med til serveren, ikke et beløb", async () => {
    const lørdag = næste(6);
    const søndag = new Date(lørdag);
    søndag.setDate(søndag.getDate() + 1);
    await vælgDatoer(lørdag, søndag);
    await waitFor(() => expect(screen.getByText("Hvornår henter du?")).toBeInTheDocument());
    fireEvent.click(screen.getAllByText("Efter 12")[0]);

    fireEvent.click(screen.getByText("Videre"));
    await waitFor(() => expect(screen.getByText("Levering og afhentning")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Videre"));
    await waitFor(() => expect(screen.getByText("Dine oplysninger")).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText("Navn"), { target: { value: "Test Testesen" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Telefon"), { target: { value: "31132852" } });
    fireEvent.click(screen.getByText("Betal ved afhentning"));
    fireEvent.click(screen.getByText("Send booking"));

    await waitFor(() => {
      const call = (global.fetch as unknown as { mock: { calls: unknown[][] } }).mock.calls.find(
        (c) => c[0] === "/api/book",
      );
      expect(call).toBeTruthy();
      const body = JSON.parse((call![1] as { body: string }).body);
      expect(body.pickupSlot).toBe("late");
      expect(body.returnSlot).toBe("unknown");
      // Kalenderdagen sendes med, så serveren ikke skal gætte ud fra et UTC-tidspunkt
      expect(body.pickupDay).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // Festpakke 495 + to ture uden for åbningstid
      expect(body.total).toBe(595);
    });
  });
});
