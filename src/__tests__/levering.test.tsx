/**
 * Kørslen skal kunne vælges — og den skal faktisk komme med på ordren.
 * Frederik 15. aug 2026: "Leveringen bliver ikke sat."
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingFlow from "@/components/BookingFlow";

beforeEach(() => {
  vi.clearAllMocks();
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ inventory: {}, booked: {}, blocked_dates: [] }),
  });
});
afterEach(() => window.history.pushState({}, "", "/"));

/**
 * Vælg produkt via ?product=, vælg fredag → mandag, gå til tilvalg.
 *
 * Datoerne er bevidst to ÅBNE dage: på en lukket dag lægger checkout gebyret
 * for at mødes uden for åbningstid oveni, og så handler testen pludselig om
 * noget andet end kørslen.
 */
async function toAddonStep() {
  window.history.pushState({}, "", "/?product=festival#book");
  render(<BookingFlow />);
  await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());

  const today = new Date();
  const fredag = new Date(today);
  fredag.setDate(fredag.getDate() + ((5 - fredag.getDay() + 7) % 7 || 7));
  const mandag = new Date(fredag);
  mandag.setDate(mandag.getDate() + 3);

  const click = (day: number) => {
    const btn = screen
      .getAllByRole("button")
      .find((x) => x.textContent === String(day) && !(x as HTMLButtonElement).disabled);
    if (btn) fireEvent.click(btn);
  };
  const næsteMåned = () => fireEvent.click(screen.getByLabelText("Næste måned"));

  // Fredagen kan ligge i næste måned — så skal kalenderen bladres derhen først
  if (fredag.getMonth() !== today.getMonth()) næsteMåned();
  click(fredag.getDate());
  if (mandag.getMonth() !== fredag.getMonth()) næsteMåned();
  click(mandag.getDate());
  await waitFor(() => {
    const next = screen.getByText("Videre") as HTMLButtonElement;
    expect(next.disabled).toBe(false);
  });
  fireEvent.click(screen.getByText("Videre"));
  await waitFor(() => expect(screen.getByText("Levering og afhentning")).toBeInTheDocument());
}

describe("Levering og afhentning i bookingen", () => {
  it("viser begge veje som selvstændige valg med pris", async () => {
    await toAddonStep();
    expect(screen.getByText("Levering + opsætning")).toBeInTheDocument();
    expect(screen.getByText("Afhentning efter festen")).toBeInTheDocument();
    expect(screen.getByText("Levering + afhentning (begge veje)")).toBeInTheDocument();
    // Priserne skal stå på knapperne — én vej 495, begge veje 795
    expect(screen.getAllByText("+495,-").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("+795,-")).toBeInTheDocument();
  });

  it("beder om adressen og spærrer for at gå videre uden", async () => {
    await toAddonStep();
    fireEvent.click(screen.getByText("Levering + afhentning (begge veje)"));

    const address = screen.getByPlaceholderText("Leveringsadresse i København");
    expect(address).toBeInTheDocument();

    fireEvent.click(screen.getByText("Videre"));
    expect(screen.getByText(/Skriv adressen/)).toBeInTheDocument();
    // Vi er stadig på tilvalgs-trinnet
    expect(screen.getByText("Levering og afhentning")).toBeInTheDocument();

    fireEvent.change(address, { target: { value: "Vestergade 5, 1456 København K" } });
    fireEvent.click(screen.getByText("Videre"));
    await waitFor(() => expect(screen.getByText("Dine oplysninger")).toBeInTheDocument());
  });

  it("lægger kørslen i totalen og sender den med til serveren", async () => {
    await toAddonStep();
    fireEvent.click(screen.getByText("Afhentning efter festen"));
    fireEvent.change(screen.getByPlaceholderText("Leveringsadresse i København"), {
      target: { value: "Nørrebrogade 1" },
    });
    // Stor højtalerpakke 495 + afhentning 495
    expect(screen.getAllByText("1490 kr").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText("Videre"));
    await waitFor(() => expect(screen.getByText("Dine oplysninger")).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText("Navn"), { target: { value: "Test Testesen" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Telefon"), { target: { value: "31132852" } });
    // Betal ved afhentning — så slipper vi for Stripe i testen
    fireEvent.click(screen.getByText("Betal ved afhentning"));
    fireEvent.click(screen.getByText("Send booking"));

    await waitFor(() => {
      const call = (global.fetch as any).mock.calls.find((c: any[]) => c[0] === "/api/book");
      expect(call).toBeTruthy();
      const body = JSON.parse(call[1].body);
      expect(body.addonIds).toContain("afhentning_retur");
      expect(body.deliveryOptionId).toBe("afhentning_retur");
      expect(body.deliveryAddress).toBe("Nørrebrogade 1");
      expect(body.total).toBe(1490);
    });
  });
});
