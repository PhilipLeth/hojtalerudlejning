/**
 * Klikbare åbningstider i headeren.
 *
 * Tiderne stod kun i footeren og på forsiden, så på alle andre sider skulle
 * man scrolle helt ned for at finde dem. Nu står der en knap i headeren, der
 * folder tiderne ud — samme levende tider fra /admin/indstillinger.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import OpeningHoursButton from "@/components/OpeningHoursButton";
import SiteHeader from "@/components/SiteHeader";
import {
  DEFAULT_OPENING_HOURS,
  formatRange,
  hoursForDate,
  normalizeOpeningHours,
  type OpeningHours,
} from "@/lib/openingHours";
import { clearSiteSettingsCache } from "@/lib/useSiteSettings";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

function mockSettings(hours: unknown = DEFAULT_OPENING_HOURS) {
  (global.fetch as any).mockImplementation((url: string) => {
    if (String(url).startsWith("/api/site-settings")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ hours }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

/** Alle dage lukket — bortset fra dem man nævner */
function hoursWith(days: Partial<Record<string, { open: string; close: string }>>): OpeningHours {
  const base = normalizeOpeningHours({
    days: Object.fromEntries(
      Object.keys(DEFAULT_OPENING_HOURS.days).map((d) => [d, { ...DEFAULT_OPENING_HOURS.days[d as never], closed: true }]),
    ),
  });
  for (const [day, v] of Object.entries(days)) {
    if (v) base.days[day as keyof typeof base.days] = { closed: false, open: v.open, close: v.close, purpose: "" };
  }
  return base;
}

beforeEach(() => {
  vi.clearAllMocks();
  clearSiteSettingsCache();
  pathname = "/";
});

describe("Åbningstider-knappen", () => {
  it("viser først tiderne når man klikker", async () => {
    mockSettings();
    render(<OpeningHoursButton locale="da" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Åbningstider" })).toBeInTheDocument());
    expect(screen.queryByText(/Mandag 15–17/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Åbningstider" }));
    expect(screen.getByText(/Mandag 15–17/)).toBeInTheDocument();
    expect(screen.getByText(/Fredag 14–18/)).toBeInTheDocument();
  });

  it("siger om der er åbent eller lukket i dag", async () => {
    mockSettings();
    render(<OpeningHoursButton locale="da" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Åbningstider" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Åbningstider" }));

    // Samme beregning som komponenten — testen kører på alle ugedage
    const iDag = hoursForDate(DEFAULT_OPENING_HOURS, new Date().toISOString().slice(0, 10));
    const ventet = iDag.closed ? "I dag: lukket" : `I dag: ${formatRange(iDag)}`;
    expect(screen.getByText(ventet)).toBeInTheDocument();
  });

  it("lukker igen ved Escape", async () => {
    mockSettings();
    render(<OpeningHoursButton locale="da" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Åbningstider" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Åbningstider" }));
    expect(screen.getByText(/Fredag 14–18/)).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText(/Fredag 14–18/)).not.toBeInTheDocument();
  });

  it("taler engelsk på den engelske side", async () => {
    mockSettings();
    render(<OpeningHoursButton locale="en" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Opening hours" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Opening hours" }));
    expect(screen.getByText(/Friday 2–6 PM/)).toBeInTheDocument();
  });

  it("viser de gemte tider fra indstillingerne, ikke standarden", async () => {
    mockSettings(hoursWith({ sat: { open: "10:00", close: "12:00" } }));
    render(<OpeningHoursButton locale="da" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Åbningstider" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Åbningstider" }));
    expect(screen.getByText(/Lørdag 10–12/)).toBeInTheDocument();
    expect(screen.queryByText(/Fredag/)).not.toBeInTheDocument();
  });

  it("forsvinder helt når alle dage er lukket", async () => {
    mockSettings(hoursWith({}));
    render(<OpeningHoursButton locale="da" />);
    // Fetch skal nå at lande, før vi kan konstatere at knappen ikke kom
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "Åbningstider" })).not.toBeInTheDocument();
  });
});

describe("Headeren", () => {
  it("har knappen med — på dansk og engelsk", async () => {
    mockSettings();
    render(<SiteHeader />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Åbningstider" })).toBeInTheDocument());
  });

  it("skifter sprog med stien", async () => {
    pathname = "/en";
    mockSettings();
    render(<SiteHeader />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Opening hours" })).toBeInTheDocument());
  });
});
