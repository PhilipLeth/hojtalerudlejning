/**
 * Det opfølgende opkald til kunden.
 *
 * Vi ringer ofte kunden op efter en booking. Det er et mærke på sagen — ikke et
 * trin i udstyrssporet — så en booking kan være både ringet til og pakket, og
 * bookinger vi bevidst ikke ringer til får ingen advarsel.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import AdminPage from "@/app/admin/page";

const booking = {
  id: "booking_1755000000000_abc123",
  speaker: "Partypakke",
  speakerId: "party",
  speakerSize: "12\"",
  period: "Fre 21. aug → Man 24. aug (3 dage)",
  pickup: new Date(Date.now() + 86400000).toISOString(),
  returnDate: new Date(Date.now() + 4 * 86400000).toISOString(),
  days: 3,
  addons: [],
  total: 995,
  name: "Julie Blegvad",
  email: "julie@example.com",
  phone: "22245880",
  comment: "",
  status: "bekraeftet",
  createdAt: new Date().toISOString(),
};

function mockStorage() {
  const store = new Map<string, string>([["admin_secret", "hemmelig"]]);
  const api = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
  Object.defineProperty(window, "localStorage", { value: api, configurable: true });
  Object.defineProperty(window, "sessionStorage", { value: { ...api }, configurable: true });
}

function mockMobile(mobile: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: mobile, media: q, addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false,
  })) as any;
}

/** Siden hentes med netop de bookinger testen har brug for */
function mockApi(bookings: unknown[]) {
  (global.fetch as any).mockImplementation((url: string) =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(
        String(url).startsWith("/api/products")
          ? { speakers: null, addons: null, rentalProducts: null }
          : { bookings },
      ),
    }),
  );
}

/** Kroppen af det sidste kald til bookings-update */
function sidsteOpdatering() {
  const kald = (global.fetch as any).mock.calls.filter((c: unknown[]) => String(c[0]).startsWith("/api/bookings-update"));
  return JSON.parse((kald[kald.length - 1][1] as { body: string }).body);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockStorage();
  mockMobile(true);
});

describe("Opkaldsmærket i overblikket", () => {
  it("viser 📞 med dato på den sammenklappede linje når der er ringet", async () => {
    mockApi([{ ...booking, called: true, calledAt: "2026-08-18T14:32:00.000Z", callNote: "Henter kl. 16" }]);
    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());

    const linje = within(screen.getByText("Julie Blegvad").closest('[role="button"]')!);
    expect(linje.getByText(/📞 ringet 18\. aug/)).toBeInTheDocument();
  });

  it("brummer ikke om manglende opkald — intet mærke, ingen advarsel", async () => {
    mockApi([booking]);
    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());

    expect(screen.queryByText(/📞/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ikke ringet/i)).not.toBeInTheDocument();
    // Opkaldet må ikke lande som en advarsel i sagens "mangler"-liste
    expect(screen.queryByText(/⚠/)).not.toBeInTheDocument();
  });

  it("står i kundekolonnen i tabellen på desktop", async () => {
    mockMobile(false);
    mockApi([{ ...booking, called: true, calledAt: "2026-08-18T14:32:00.000Z" }]);
    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());

    const kundecelle = screen.getByText("Julie Blegvad").closest("td")!;
    expect(kundecelle.textContent).toMatch(/📞 ringet 18\. aug/);
  });
});

describe("Sådan sættes opkaldet", () => {
  it("gemmer hakket som felt på bookingen — ikke som ny status", async () => {
    mockApi([booking]);
    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Julie Blegvad").closest('[role="button"]')!);

    const hak = screen.getByText("📞 Ringet til kunden").closest("label")!.querySelector("input")!;
    expect(hak.checked).toBe(false);
    fireEvent.click(hak);

    await waitFor(() => {
      const body = sidsteOpdatering();
      expect(body.action).toBe("set_fields");
      expect(body.fields).toEqual({ called: true });
      expect(body.status).toBeUndefined();
    });
  });

  it("gemmer aftalen fra telefonen når feltet forlades", async () => {
    mockApi([{ ...booking, called: true, calledAt: new Date().toISOString() }]);
    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Julie Blegvad").closest('[role="button"]')!);

    const note = screen.getByPlaceholderText(/Hvad aftalte I/);
    fireEvent.change(note, { target: { value: "Henter kl. 16, tager kun én højtaler" } });
    fireEvent.blur(note);

    await waitFor(() => {
      expect(sidsteOpdatering().fields).toEqual({ callNote: "Henter kl. 16, tager kun én højtaler" });
    });
  });

  it("rydder aftalen med, hvis opkaldet trækkes tilbage", async () => {
    mockApi([{ ...booking, called: true, calledAt: new Date().toISOString(), callNote: "Henter kl. 16" }]);
    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Julie Blegvad").closest('[role="button"]')!);

    fireEvent.click(screen.getByText("📞 Ringet til kunden").closest("label")!.querySelector("input")!);
    await waitFor(() => {
      expect(sidsteOpdatering().fields).toEqual({ called: false, callNote: null });
    });
  });
});

describe("API'et bag opkaldet", () => {
  const src = readFileSync(join(process.cwd(), "functions/api/bookings-update.ts"), "utf8");

  it("validerer felterne, så en tastefejl ikke skriver vrøvl i KV", () => {
    expect(src).toMatch(/called: \(v\) => typeof v === "boolean"/);
    expect(src).toMatch(/callNote: \(v\) => v === null \|\| \(typeof v === "string" && v\.length <= 300\)/);
  });

  it("gemmer hvem der ringede, så aftalen kan spores til en person", () => {
    expect(src).toMatch(/calledBy = fields\.called \? updatedBy : null/);
  });

  it("holder opkaldet ude af udstyrssporet", () => {
    // VALID_STATUSES er den lineære kæde; et opkald hører ikke til i den
    const linje = src.split("\n").find((l) => l.includes("const VALID_STATUSES"))!;
    expect(linje).not.toContain("ringet");
    expect(linje).not.toContain("called");
  });
});
