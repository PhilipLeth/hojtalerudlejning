/**
 * Pakkerne med lydmand har kørslen MED i prisen (11. sept 2026).
 *
 * Teknikeren kommer med grejet, sætter op og tager det med hjem — så må
 * bookingen hverken spørge om kunden henter selv, eller lægge 795 kr oveni
 * for en levering, der allerede er betalt. Adressen skal vi stadig have.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingFlow from "@/components/BookingFlow";
import { vælgDatoer } from "./vaelgDatoer";

beforeEach(() => {
  vi.clearAllMocks();
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ inventory: {}, booked: {}, blocked_dates: [] }),
  });
});

afterEach(() => window.history.pushState({}, "", "/"));

async function tilTilvalg(productId = "pakke_lydmand_fest") {
  window.history.pushState({}, "", `/?product=${productId}#book`);
  render(<BookingFlow />);
  await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());
  vælgDatoer();
  await waitFor(() => {
    const next = screen.getByText("Videre") as HTMLButtonElement;
    expect(next.disabled).toBe(false);
  });
  fireEvent.click(screen.getByText("Videre"));
  await waitFor(() => expect(screen.getByText("Levering og afhentning")).toBeInTheDocument());
}

describe("Pakke med lydmand i bookingen", () => {
  it("viser kørslen som låst og inkluderet — ikke som et valg", async () => {
    await tilTilvalg();
    expect(screen.getByText("Levering, opsætning og afhentning er med")).toBeInTheDocument();
    expect(screen.getByText("Inkl.")).toBeInTheDocument();
    expect(screen.queryByText("Jeg henter og afleverer selv")).not.toBeInTheDocument();
    expect(screen.queryByText("Levering + afhentning (begge veje)")).not.toBeInTheDocument();
    expect(screen.queryByText("+795,-")).not.toBeInTheDocument();
    // Adressen skal vi stadig have — ellers ved lydmanden ikke hvor festen er
    expect(screen.getByPlaceholderText("Leveringsadresse i København")).toBeInTheDocument();
  });

  it("kræver adressen, holder prisen på pakkens og sender kørslen med til serveren", async () => {
    await tilTilvalg();
    fireEvent.click(screen.getByText("Videre"));
    expect(screen.getByText(/Skriv adressen/)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Leveringsadresse i København"), {
      target: { value: "Amagerbrogade 100, 2300 København S" },
    });
    // Pakkens pris — ikke pakken plus 795 kr
    expect(screen.getAllByText("5995 kr").length).toBeGreaterThan(0);
    expect(screen.queryByText("6790 kr")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Videre"));
    await waitFor(() => expect(screen.getByText("Dine oplysninger")).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText("Navn"), { target: { value: "Test Testesen" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Telefon"), { target: { value: "31132852" } });
    fireEvent.click(screen.getByText("Betal ved afhentning"));
    fireEvent.click(screen.getByText("Send booking"));

    await waitFor(() => {
      const call = (global.fetch as any).mock.calls.find((c: any[]) => c[0] === "/api/book");
      expect(call).toBeTruthy();
      const body = JSON.parse(call[1].body);
      expect(body.deliveryOptionId).toBe("levering_begge");
      expect(body.addonIds).not.toContain("levering_begge");
      expect(body.deliveryAddress).toBe("Amagerbrogade 100, 2300 København S");
      expect(body.total).toBe(5995);
    });
  });

  it("lydmanden kan vælges som ekstra timer på pakken, men kørslen kan ikke vælges igen", async () => {
    await tilTilvalg();
    expect(screen.getByText("Lydmand")).toBeInTheDocument();
    expect(screen.queryByText("Levering + opsætning")).not.toBeInTheDocument();
  });
});
