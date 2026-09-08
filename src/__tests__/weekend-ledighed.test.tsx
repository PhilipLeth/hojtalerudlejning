import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import WeekendLedighed from "@/components/WeekendLedighed";

/**
 * "Ledig den kommende weekend"-linjen på produktsiden. Tre ting skal holde:
 * ledig vises grønt, optaget vises som optaget, og uden lagertal (eller uden
 * svar) vises INGENTING — et gæt er værre end ingen linje.
 */

function mockAvailability(body: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(body),
  }) as any;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("WeekendLedighed", () => {
  it("viser ledig når der er enheder tilbage", async () => {
    mockAvailability({ inventory: { soundboks: 2 }, booked: { soundboks: 1 }, blocked_dates: [] });
    render(<WeekendLedighed productId="soundboks" />);
    await waitFor(() => {
      expect(screen.getByText(/Ledig den kommende weekend/)).toBeInTheDocument();
    });
  });

  it("viser optaget når alt er booket", async () => {
    mockAvailability({ inventory: { soundboks: 2 }, booked: { soundboks: 2 }, blocked_dates: [] });
    render(<WeekendLedighed productId="soundboks" />);
    await waitFor(() => {
      expect(screen.getByText(/Optaget den kommende weekend/)).toBeInTheDocument();
    });
  });

  it("viser optaget når datoen er blokeret for produktet", async () => {
    // Blokeringen dækker alle datoer frem — den rammer altid den kommende fredag
    const dage = [...Array(10)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        products: [],
      };
    });
    mockAvailability({ inventory: { soundboks: 2 }, booked: {}, blocked_dates: dage });
    render(<WeekendLedighed productId="soundboks" />);
    await waitFor(() => {
      expect(screen.getByText(/Optaget den kommende weekend/)).toBeInTheDocument();
    });
  });

  it("viser ingenting uden lagertal for produktet", async () => {
    mockAvailability({ inventory: { party: 1 }, booked: {}, blocked_dates: [] });
    const { container } = render(<WeekendLedighed productId="soundboks" />);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.textContent).toBe("");
  });

  it("viser ingenting når opslaget fejler", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("net down")) as any;
    const { container } = render(<WeekendLedighed productId="soundboks" />);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.textContent).toBe("");
  });

  it("engelsk udgave taler engelsk", async () => {
    mockAvailability({ inventory: { soundboks: 1 }, booked: {}, blocked_dates: [] });
    render(<WeekendLedighed productId="soundboks" locale="en" />);
    await waitFor(() => {
      expect(screen.getByText(/Available this coming weekend/)).toBeInTheDocument();
    });
  });
});
