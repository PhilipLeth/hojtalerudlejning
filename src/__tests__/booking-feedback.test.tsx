import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BookingFlow from "@/components/BookingFlow";
import { clearSiteSettingsCache } from "@/lib/useSiteSettings";
import { DEFAULT_OPENING_HOURS, formatBookingDateLine, kompaktAabningstid } from "@/lib/openingHours";

beforeEach(() => {
  clearSiteSettingsCache();
  vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
});

describe("Frederiks tilbagemelding efter testbooking", () => {
  it("skriver begge mødetider helt ud på begge sprog", () => {
    expect(kompaktAabningstid(DEFAULT_OPENING_HOURS)).toBe("Mandag kl. 17:00 og Torsdag kl. 17:00");
    expect(kompaktAabningstid(DEFAULT_OPENING_HOURS, "en")).toBe("Monday at 5 PM and Thursday at 5 PM");
  });

  it("skelner mellem en mulig aftale og en dato som admin har spærret", () => {
    expect(formatBookingDateLine(DEFAULT_OPENING_HOURS, "2026-10-30")).toBe("Fredag: efter aftale (+200 kr)");
    expect(formatBookingDateLine(DEFAULT_OPENING_HOURS, "2026-10-30", "en")).toBe("Friday: by arrangement (+DKK 200)");
    expect(formatBookingDateLine({ ...DEFAULT_OPENING_HOURS, onlyOpenDays: true }, "2026-10-30")).toBe("Fredag: lukket");
  });

  it.each(["da", "en"] as const)("viser pris og aftale før datovalget og fjerner returafhentning på %s", async (locale) => {
    const en = locale === "en";
    render(<BookingFlow locale={locale} />);
    fireEvent.click(screen.getByText(en ? "Small Speaker Package" : "Lille højtalerpakke").closest("button")!);
    await waitFor(() => expect(screen.getByText(en ? "Choose dates" : "Vælg datoer")).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText(en ? "Next month" : "Næste måned"));
    expect(screen.getByText(en ? "Green: scheduled time, no fee" : "Grøn: fast tidspunkt uden gebyr")).toBeInTheDocument();
    expect(screen.getByText(en ? "Yellow: by arrangement, DKK 200 per pickup or return" : "Gul: efter aftale, 200 kr pr. ind- eller udlevering")).toBeInTheDocument();
    const friday = screen.getAllByRole("button", { name: en ? /Friday: by arrangement/ : /Fredag: efter aftale/ })[0];
    expect(friday).toBeEnabled();
    const fridayNumber = Number(friday.textContent);
    fireEvent.click(friday);
    const saturday = screen.getByRole("button", { name: new RegExp(`^${fridayNumber + 1}\\. .*${en ? "Saturday: by arrangement" : "Lørdag: efter aftale"}`) });
    fireEvent.click(saturday);
    fireEvent.click(screen.getByRole("button", { name: en ? "Continue" : "Videre", exact: true }));
    await waitFor(() => expect(screen.getByText(en ? "I pick up and return it myself" : "Jeg henter og afleverer selv")).toBeInTheDocument());
    expect(screen.queryByText(en ? "Collection after the party" : "Afhentning efter festen")).not.toBeInTheDocument();
    expect(screen.queryByText(en ? /: closed/ : /: lukket/)).not.toBeInTheDocument();
    expect(screen.getAllByText("Njalsgade 40, 2300 København").length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByRole("radio", { name: en ? /Another time by arrangement/ : /Andet tidspunkt efter aftale/ })).toHaveLength(2);
    expect(screen.getAllByText(en ? /total fee is DKK 400/ : /gebyret i alt 400 kr/)).toHaveLength(2);
  });
});
