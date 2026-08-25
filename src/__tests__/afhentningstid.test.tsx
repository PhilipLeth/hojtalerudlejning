/**
 * Hvornår på dagen vil kunden hente?
 *
 * Første udgave lod kunden vælge tidspunkter UDEN for åbningstiden mod et
 * gebyr på 50 kr. Frederik 25. august 2026: der er ikke mulighed for at komme
 * uden for åbningstiden — heller ikke mod ekstra betaling. Så nu ligger alle
 * valg inden for tiderne, og ingen af dem koster noget.
 *
 * Reglerne der skal holde:
 *   · intet valg ligger uden for åbningstiden, og intet valg koster penge
 *   · "ved jeg ikke endnu" er valgt på forhånd — tidsvalget må ikke koste
 *     kunden et klik, og vi lægger ham ikke et svar i munden
 *   · er der intet at spørge om (lukket dag, eller en åbningstid der er for
 *     kort til to halvdele), er der ingen knapper
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingFlow from "@/components/BookingFlow";
import {
  DEFAULT_OPENING_HOURS,
  defaultTimeSlot,
  formatTimeSlot,
  resolveTimeSlot,
  timeSlots,
  type OpeningHours,
} from "@/lib/openingHours";

/** Standardtiderne i koden: mandag 15–17, fredag 14–18 */
const hours = DEFAULT_OPENING_HOURS;

/** Som i produktion: man–fre 9.30–18, lørdag 10–14, søndag lukket */
const rigtigeTider: OpeningHours = {
  ...hours,
  days: {
    ...hours.days,
    mon: { closed: false, open: "09:30", close: "18:00", purpose: "" },
    tue: { closed: false, open: "09:30", close: "18:00", purpose: "" },
    wed: { closed: false, open: "09:30", close: "18:00", purpose: "" },
    thu: { closed: false, open: "09:30", close: "18:00", purpose: "" },
    fri: { closed: false, open: "09:30", close: "18:00", purpose: "" },
    sat: { closed: false, open: "10:00", close: "14:00", purpose: "" },
  },
};

// 2026-08-28 er en fredag, 2026-08-29 en lørdag, 2026-08-30 en søndag
const FREDAG = "2026-08-28";
const LØRDAG = "2026-08-29";
const SØNDAG = "2026-08-30";

describe("En åbningstid der strækker sig hen over middag", () => {
  it("deler dagen der hvor kunden selv ville dele den", () => {
    const slots = timeSlots(rigtigeTider, FREDAG);
    expect(slots.map((s) => s.id)).toEqual(["early", "late", "unknown"]);
    expect(slots[0]).toMatchObject({ label: "Før 12", window: "9.30–12" });
    expect(slots[1]).toMatchObject({ label: "Efter 12", window: "12–18" });
    expect(slots[2]).toMatchObject({ label: "Ved jeg ikke endnu", window: "" });
  });

  it("gør det samme på en kort lørdag", () => {
    const slots = timeSlots(rigtigeTider, LØRDAG);
    expect(slots[0].window).toBe("10–12");
    expect(slots[1].window).toBe("12–14");
  });

  it("taler engelsk til engelske kunder", () => {
    const slots = timeSlots(rigtigeTider, FREDAG, "en");
    expect(slots.map((s) => s.label)).toEqual(["Before 12 PM", "After 12 PM", "I don't know yet"]);
  });
});

describe("En åbningstid der ligger på én side af middag", () => {
  it("deler på midten og taler om først og sidst på dagen", () => {
    // Fredag 14–18 i standardtiderne — middag ligger uden for
    const slots = timeSlots(hours, FREDAG);
    expect(slots[0]).toMatchObject({ label: "Først på dagen", window: "14–16" });
    expect(slots[1]).toMatchObject({ label: "Sidst på dagen", window: "16–18" });
  });
});

describe("Når der ikke er noget at spørge om", () => {
  it("har en lukket dag ingen knapper", () => {
    expect(timeSlots(rigtigeTider, SØNDAG)).toEqual([]);
  });

  it("har en kort åbningstid heller ingen — mandag 15–17 er ikke et valg", () => {
    expect(timeSlots(hours, "2026-08-31")).toEqual([]);
  });
});

describe("Standardvalget", () => {
  it("er »ved jeg ikke endnu«, så tidsvalget ikke koster et klik", () => {
    expect(defaultTimeSlot()).toBe("unknown");
  });

  it("falder tilbage dertil, når klienten sender noget vi ikke kender", () => {
    expect(resolveTimeSlot(rigtigeTider, FREDAG, "kl-3-om-natten")).toBe("unknown");
    expect(resolveTimeSlot(rigtigeTider, FREDAG, undefined)).toBe("unknown");
    // Et tidsrum findes ikke på en lukket dag
    expect(resolveTimeSlot(rigtigeTider, SØNDAG, "early")).toBe("unknown");
    expect(resolveTimeSlot(rigtigeTider, FREDAG, "early")).toBe("early");
  });
});

describe("Tidsrummet som tekst til mails og lejeseddel", () => {
  it("tager tidsrummet med, så Frederik ved hvornår han skal være der", () => {
    expect(formatTimeSlot(rigtigeTider, FREDAG, "early")).toBe("Før 12 (9.30–12)");
    expect(formatTimeSlot(rigtigeTider, FREDAG, "late")).toBe("Efter 12 (12–18)");
  });

  it("nævner aldrig et gebyr — der er ikke noget at opkræve", () => {
    for (const slot of ["early", "late", "unknown"]) {
      expect(formatTimeSlot(rigtigeTider, FREDAG, slot)).not.toMatch(/kr/);
    }
  });

  it("er tom når der intet er valgt — en gammel booking får ingen tom række", () => {
    expect(formatTimeSlot(rigtigeTider, FREDAG, undefined)).toBe("");
    expect(formatTimeSlot(rigtigeTider, SØNDAG, "early")).toBe("");
  });
});

/* ─────────────── i selve checkout ─────────────── */

/** Vælg produkt, bladr frem til dagen og vælg den + dagen efter */
async function vælgDatoer(fra: Date, til: Date) {
  window.history.pushState({}, "", "/?product=festival#book");
  render(<BookingFlow />);
  await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());

  const iDag = new Date();
  const klik = (day: number) => {
    const btn = screen
      .getAllByRole("button")
      .find((x) => x.textContent?.trim().startsWith(String(day)) && x.textContent.trim().length <= 2 && !(x as HTMLButtonElement).disabled);
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

  it("koster ingenting, uanset hvad kunden vælger", async () => {
    const fredag = næste(5);
    const mandag = new Date(fredag);
    mandag.setDate(mandag.getDate() + 3);
    await vælgDatoer(fredag, mandag);

    await waitFor(() => expect(screen.getByText("Hvornår henter du?")).toBeInTheDocument());
    fireEvent.click(screen.getAllByText("Først på dagen")[0]);

    // Ingen gebyrlinje nogen steder — hverken ved datoerne eller i prisen
    expect(screen.queryByText(/uden for åbningstid/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\+\d+ kr/)).not.toBeInTheDocument();
  });

  it("sender tidsrummet med til serveren", async () => {
    const fredag = næste(5);
    const mandag = new Date(fredag);
    mandag.setDate(mandag.getDate() + 3);
    await vælgDatoer(fredag, mandag);
    await waitFor(() => expect(screen.getByText("Hvornår henter du?")).toBeInTheDocument());
    fireEvent.click(screen.getAllByText("Sidst på dagen")[0]);

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
      // Aflevering er ikke rørt — så står den på standardvalget
      expect(body.returnSlot).toBe("unknown");
      // Kalenderdagen sendes med, så serveren ikke skal gætte ud fra et UTC-tidspunkt
      expect(body.pickupDay).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // Festpakke 495 — og ikke en krone mere for tidspunktet
      expect(body.total).toBe(495);
    });
  });
});
