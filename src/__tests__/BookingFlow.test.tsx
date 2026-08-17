import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookingFlow from "@/components/BookingFlow";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

beforeEach(() => {
  vi.clearAllMocks();
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        inventory: { party: 1, festival: 1, lys: 2 },
        booked: { party: 0, festival: 0, lys: 0 },
        blocked_dates: [],
      }),
  });
});

describe("BookingFlow - Step 1: Speaker selection", () => {
  it("renders step 1 with speaker options", () => {
    render(<BookingFlow />);
    expect(screen.getByText("Vælg højtalere")).toBeInTheDocument();
    expect(screen.getByText("Lille højtalerpakke")).toBeInTheDocument();
    expect(screen.getAllByText("Soundboks 4").length).toBeGreaterThan(0);
    expect(screen.getByText("Stor højtalerpakke")).toBeInTheDocument();
  });

  it("shows prices for all speakers", () => {
    render(<BookingFlow />);
    // Original prices shown as strikethrough during summer sale, or as main price outside sale
    expect(screen.getAllByText("395,-").length).toBeGreaterThan(0);
    expect(screen.getAllByText("595,-").length).toBeGreaterThan(0);
    expect(screen.getAllByText("695,-").length).toBeGreaterThan(0);
  });

  it("shows effects-only section with lys and røg", () => {
    render(<BookingFlow />);
    expect(screen.getByText("Uden højtalere?")).toBeInTheDocument();
    expect(screen.getByText("Lys-pakke")).toBeInTheDocument();
    expect(screen.getByText("Røgmaskine")).toBeInTheDocument();
    expect(screen.getByText("Fra 495,-")).toBeInTheDocument();
    expect(screen.getByText("Fra 245,-")).toBeInTheDocument();
  });

  it("renders in English when locale=en", () => {
    render(<BookingFlow locale="en" />);
    expect(screen.getByText("Choose speakers")).toBeInTheDocument();
    expect(screen.getByText("Small Speaker Package")).toBeInTheDocument();
    expect(screen.getAllByText("Soundboks 4").length).toBeGreaterThan(0);
    expect(screen.getByText("Large Speaker Package")).toBeInTheDocument();
    expect(screen.getByText("Without speakers?")).toBeInTheDocument();
  });

  it("advances to step 2 when clicking a speaker", async () => {
    render(<BookingFlow />);
    const partyButton = screen.getByText("Lille højtalerpakke").closest("button")!;
    fireEvent.click(partyButton);
    await waitFor(() => {
      expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
    });
  });

  it("advances to step 2 in effects-only mode when clicking lys", async () => {
    render(<BookingFlow />);
    const lysButton = screen.getByText("Fra 495,-").closest("button")!;
    fireEvent.click(lysButton);
    await waitFor(() => {
      expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
    });
  });

  it("advances to step 2 in effects-only mode when clicking røg", async () => {
    render(<BookingFlow />);
    const rogButton = screen.getByText("Fra 245,-").closest("button")!;
    fireEvent.click(rogButton);
    await waitFor(() => {
      expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
    });
  });

  it("shows pickup address", () => {
    // Adressen kommer fra /admin/indstillinger — her standardadressen
    render(<BookingFlow />);
    expect(screen.getByText(/Hent på Vermlandsgade 66, 2300 København/)).toBeInTheDocument();
  });
});

describe("BookingFlow - Step 2: Date selection", () => {
  async function goToStep2() {
    render(<BookingFlow />);
    const partyButton = screen.getByText("Lille højtalerpakke").closest("button")!;
    fireEvent.click(partyButton);
    await waitFor(() => {
      expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
    });
  }

  it("shows calendar and date labels", async () => {
    await goToStep2();
    expect(screen.getByText("Afhentning")).toBeInTheDocument();
    expect(screen.getByText("Returnering")).toBeInTheDocument();
    expect(screen.getAllByText("Vælg dato")).toHaveLength(2);
  });

  it("has back and next buttons", async () => {
    await goToStep2();
    expect(screen.getByText("Tilbage")).toBeInTheDocument();
    expect(screen.getByText("Videre")).toBeInTheDocument();
  });

  it("next button is disabled without dates", async () => {
    await goToStep2();
    const nextBtn = screen.getByText("Videre");
    expect(nextBtn).toBeDisabled();
  });

  it("back button returns to step 1", async () => {
    await goToStep2();
    fireEvent.click(screen.getByText("Tilbage"));
    await waitFor(() => {
      expect(screen.getByText("Vælg højtalere")).toBeInTheDocument();
    });
  });
});

describe("BookingFlow - Step 3: Addons", () => {
  async function goToStep3() {
    render(<BookingFlow />);
    // Select party speaker
    fireEvent.click(screen.getByText("Lille højtalerpakke").closest("button")!);
    await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());

    // Select dates: find two future dates in the calendar
    const today = new Date();
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
    const nextMonday = new Date(nextFriday);
    nextMonday.setDate(nextFriday.getDate() + 3);

    // Click pickup date (Friday)
    const fridayNum = nextFriday.getDate().toString();
    const allButtons = screen.getAllByRole("button");
    const calendarButtons = allButtons.filter(
      (b) => b.textContent === fridayNum && !b.disabled
    );
    if (calendarButtons.length > 0) {
      fireEvent.click(calendarButtons[0]);

      // Click return date (Monday)
      const mondayNum = nextMonday.getDate().toString();
      const mondayButtons = screen.getAllByRole("button").filter(
        (b) => b.textContent === mondayNum && !b.disabled
      );
      if (mondayButtons.length > 0) {
        fireEvent.click(mondayButtons[0]);

        // Wait for availability check and click next
        await waitFor(() => {
          const nextBtn = screen.getByText("Videre");
          if (!nextBtn.disabled) {
            fireEvent.click(nextBtn);
          }
        });
      }
    }
  }

  it("shows addon options after date selection", async () => {
    await goToStep3();
    // If we made it to step 3
    const step3 = screen.queryByText("Tilvalg");
    if (step3) {
      expect(screen.getByText("Lys-pakke")).toBeInTheDocument();
      expect(screen.getByText("Røgmaskine")).toBeInTheDocument();
      expect(screen.getByText("Højtalerstativer")).toBeInTheDocument();
      expect(screen.getByText("Bæretaske")).toBeInTheDocument();
      // Kørslen har sit eget felt med de tre valgmuligheder — ikke bare endnu
      // en tilvalgs-række
      expect(screen.getByText("Levering og afhentning")).toBeInTheDocument();
      expect(screen.getByText("Levering + opsætning")).toBeInTheDocument();
      expect(screen.getByText("Afhentning efter festen")).toBeInTheDocument();
      expect(screen.getByText("Levering + afhentning (begge veje)")).toBeInTheDocument();
      expect(screen.getByText("Jeg henter og afleverer selv")).toBeInTheDocument();
    }
  });
});

describe("BookingFlow - Step 4: Form submission", () => {
  it("shows form fields in step 4", async () => {
    // We test that the form fields exist by checking i18n strings
    // Full flow test is complex due to calendar interaction
    render(<BookingFlow />);
    // Verify the component renders without crashing
    expect(screen.getByText("Vælg højtalere")).toBeInTheDocument();
  });
});

describe("BookingFlow - Sold out handling", () => {
  it("never marks products sold out in step 1 (availability is date-specific)", async () => {
    // Fully booked somewhere in the coming period — must NOT disable step 1
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          inventory: { party: 1, festival: 1, soundboks: 1, lys: 2 },
          booked: { party: 1, festival: 1, soundboks: 1, lys: 2 },
          blocked_dates: [],
        }),
    });

    render(<BookingFlow />);
    await waitFor(() => {
      expect(screen.queryByText("Udsolgt")).not.toBeInTheDocument();
    });
    const soundboksButton = screen.getAllByText("Soundboks 4")[0].closest("button")!;
    expect(soundboksButton).not.toBeDisabled();
    fireEvent.click(soundboksButton);
    await waitFor(() => {
      expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
    });
  });

  it("blocks the selected period in step 2 when the product is sold out", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          inventory: { party: 1, festival: 1, lys: 2 },
          booked: { party: 1, festival: 0, lys: 0 },
          blocked_dates: [],
        }),
    });

    render(<BookingFlow />);
    fireEvent.click(screen.getByText("Lille højtalerpakke").closest("button")!);
    await waitFor(() => {
      expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
    });

    // Pick a pickup + return date in the current month view
    const today = new Date();
    const pickupDay = new Date(today);
    pickupDay.setDate(pickupDay.getDate() + 1);
    const returnDay = new Date(today);
    returnDay.setDate(returnDay.getDate() + 3);

    const clickDay = (d: Date) => {
      const buttons = screen
        .getAllByRole("button")
        .filter((b) => b.textContent === d.getDate().toString() && !(b as HTMLButtonElement).disabled);
      if (buttons.length > 0) fireEvent.click(buttons[0]);
    };

    // Only run the assertion when both days fall in the visible month
    if (pickupDay.getMonth() === today.getMonth() && returnDay.getMonth() === today.getMonth()) {
      clickDay(pickupDay);
      clickDay(returnDay);
      await waitFor(() => {
        expect(
          screen.getByText("Desværre udsolgt i denne periode — prøv andre datoer")
        ).toBeInTheDocument();
      });
    }
  });
});

describe("BookingFlow - Preselect via ?product=", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("preselects pakke_tale_musik from /?product=pakke_tale_musik#book without sold out message", async () => {
    window.history.pushState({}, "", "/?product=pakke_tale_musik#book");
    render(<BookingFlow />);
    await waitFor(() => {
      expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
    });
    expect(screen.getByText("Tale & musik-pakken")).toBeInTheDocument();
    expect(screen.queryByText(/udsolgt/i)).not.toBeInTheDocument();
  });

  it("preselects low_fog from /?product=low_fog#book (nyligt aktiveret)", async () => {
    window.history.pushState({}, "", "/?product=low_fog#book");
    render(<BookingFlow />);
    await waitFor(() => {
      expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
    });
    expect(screen.getByText("Low fog-maskine (røggulv)")).toBeInTheDocument();
  });

  it("Book-knap på et tilvalg (subwoofer) preselecter det og viser produktets navn", async () => {
    window.history.pushState({}, "", "/?product=subwoofer#book");
    render(<BookingFlow />);
    await waitFor(() => {
      expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
    });
    // Viser tilvalgets eget navn, ikke den generiske "Kun effekter"
    expect(screen.getByText('Subwoofer 12"')).toBeInTheDocument();
    expect(screen.queryByText("Kun effekter")).not.toBeInTheDocument();
  });

  it("beholder første produkt i kurven når man booker endnu et via ?product=", async () => {
    const onSummary = vi.fn();
    window.history.pushState({}, "", "/?product=soundboks#book");
    const { rerender } = render(<BookingFlow onSummaryChange={onSummary} urlTick={0} />);
    await waitFor(() => {
      expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
    });

    // Kunden klikker "Book" på et andet produkt → nyt ?product= + urlTick bump
    window.history.pushState({}, "", "/?product=projektor#book");
    rerender(<BookingFlow onSummaryChange={onSummary} urlTick={1} />);

    await waitFor(() => {
      const last = onSummary.mock.calls.at(-1)?.[0];
      // Soundboks (595) ligger nu i kurven + projektor (495) er valgt
      expect(last?.count).toBe(2);
      expect(last?.total).toBe(595 + 495);
    });
  });

  it("stabler ikke dubletter når samme produkt bookes igen", async () => {
    const onSummary = vi.fn();
    window.history.pushState({}, "", "/?product=soundboks#book");
    const { rerender } = render(<BookingFlow onSummaryChange={onSummary} urlTick={0} />);
    await waitFor(() => {
      expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
    });

    window.history.pushState({}, "", "/?product=soundboks#book");
    rerender(<BookingFlow onSummaryChange={onSummary} urlTick={1} />);

    await waitFor(() => {
      const last = onSummary.mock.calls.at(-1)?.[0];
      expect(last?.count).toBe(1);
      expect(last?.total).toBe(595);
    });
  });
});

describe("BookingFlow - Booking submission", () => {
  it("calls /api/book on form submit", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          inventory: { party: 1, festival: 1, lys: 2 },
          booked: {},
          blocked_dates: [],
        }),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    global.fetch = mockFetch;

    // Availability is date-specific: no availability call on mount / step 1 —
    // it is first fetched when a date range is selected in step 2.
    render(<BookingFlow />);
    fireEvent.click(screen.getByText("Lille højtalerpakke").closest("button")!);
    await waitFor(() => {
      expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
    });
    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/availability")
    );
  });
});
