/**
 * De to ting kunden møder i kurven: at han ikke skal skrive sig selv ind igen,
 * og at rabatfeltet ikke sender ham ud at lede efter en kode, han ikke har.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingFlow from "@/components/BookingFlow";
import { vælgDatoer } from "./vaelgDatoer";

vi.mock("next/image", () => ({ default: (props: any) => <img {...props} /> }));

function mockStorage(start: Record<string, string> = {}) {
  const store = new Map(Object.entries(start));
  const api = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
  Object.defineProperty(window, "localStorage", { value: api, configurable: true });
  return store;
}

beforeEach(() => {
  (global.fetch as any) = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ inventory: { soundboks: 4 }, booked: {}, blocked_dates: [] }) }),
  );
});

/** Kurven og kontaktfelterne findes først på de senere trin */
async function tilKontakttrin() {
  render(<BookingFlow />);
  fireEvent.click(screen.getAllByText("Soundboks 4")[0].closest("button")!);
  await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());

  vælgDatoer();
  await waitFor(() => expect(screen.getByText("Videre").closest("button")).not.toBeDisabled());
  fireEvent.click(screen.getByText("Videre").closest("button")!);
  await waitFor(() => expect(screen.queryByText("Vælg datoer")).not.toBeInTheDocument());
  const videre = screen.getAllByText(/^(Videre|Videre til betaling)$/)[0];
  fireEvent.click(videre.closest("button")!);
  await waitFor(() => expect(screen.getByPlaceholderText("Navn")).toBeInTheDocument(), { timeout: 3000 });
}

describe("Rabatkoden ligger foldet væk", () => {
  it("viser kun en lille linje, ikke et åbent felt", async () => {
    mockStorage();
    await tilKontakttrin();
    // Feltet må ikke stå åbent — det får folk til at lede efter koder andre steder
    expect(screen.queryByPlaceholderText(/rabatkode|kode/i)).not.toBeInTheDocument();
    expect(screen.getByText("Har du en rabatkode?")).toBeInTheDocument();
  });

  it("åbner feltet, når man trykker på linjen", async () => {
    mockStorage();
    await tilKontakttrin();
    fireEvent.click(screen.getByText("Har du en rabatkode?"));
    await waitFor(() => expect(screen.getByPlaceholderText(/rabatkode|kode/i)).toBeInTheDocument());
  });
});

describe("Kunden skal ikke skrive sig selv ind igen", () => {
  it("udfylder navn, mail og telefon fra sidste booking", async () => {
    mockStorage({
      booking_kontakt: JSON.stringify({
        name: "Agnes Dahle Stæhr",
        email: "agnes@example.com",
        phone: "23632303",
        company: "Stæhr ApS",
      }),
    });
    await tilKontakttrin();
    expect((screen.getByPlaceholderText("Navn") as HTMLInputElement).value).toBe("Agnes Dahle Stæhr");
    expect((screen.getByPlaceholderText("Email") as HTMLInputElement).value).toBe("agnes@example.com");
    expect((screen.getByPlaceholderText("Telefon") as HTMLInputElement).value).toBe("23632303");
  });

  it("gemmer ikke kommentaren — den hører til den enkelte fest", async () => {
    const store = mockStorage({
      booking_kontakt: JSON.stringify({ name: "Agnes", email: "a@b.dk", phone: "23632303", comment: "Husk stativer" }),
    });
    await tilKontakttrin();
    expect((screen.getByPlaceholderText("Navn") as HTMLInputElement).value).toBe("Agnes");
    const kommentar = screen.getByPlaceholderText(/kommentar|Kommentar|besked/i) as HTMLTextAreaElement;
    expect(kommentar.value).toBe("");
    expect(store.size).toBe(1);
  });

  it("tåler ugyldigt indhold i browserens hukommelse", async () => {
    mockStorage({ booking_kontakt: "det her er ikke json" });
    await tilKontakttrin();
    // Må ikke kaste — formularen skal bare være tom
    expect((screen.getByPlaceholderText("Navn") as HTMLInputElement).value).toBe("");
  });
});
