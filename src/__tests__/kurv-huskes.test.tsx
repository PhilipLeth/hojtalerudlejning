/**
 * Frederik, november 2026: "Det er virkelig svært at booke flere produkter.
 * Det er som om den ikke husker kurven." Produktsiderne sender til /book med
 * en rigtig sideindlæsning, så al React-state forsvandt mellem to produkter.
 * Kurven ligger nu i kundens egen browser og skal overleve, at BookingFlow
 * bliver mountet forfra.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import BookingFlow from "@/components/BookingFlow";
import { catalogPrice } from "@/lib/products";

vi.mock("next/image", () => ({ default: (props: any) => <img {...props} /> }));

const NØGLE = "booking_kurv";

/** jsdom's localStorage mangler sine metoder under vitest her, så vi lægger vores egen ind (som kurv-detaljer.test) */
function mockStorage() {
  const store = new Map<string, string>();
  const api = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
  Object.defineProperty(window, "localStorage", { value: api, configurable: true });
}

beforeEach(() => mockStorage());

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
});

/** Kunden trykker Book på en produktside: ny sideindlæsning med ?product= */
async function aabnSiden(url: string) {
  const onSummary = vi.fn();
  window.history.pushState({}, "", url);
  const r = render(<BookingFlow variant="page" onSummaryChange={onSummary} />);
  return { ...r, onSummary };
}

function gemtKurv(ekstra: Record<string, unknown>) {
  window.localStorage.setItem(
    NØGLE,
    JSON.stringify({ v: 1, gemt: Date.now(), cartItems: [], speaker: null, selectedAddons: [], ...ekstra }),
  );
}

describe("Kurven huskes mellem sideindlæsninger", () => {
  it("husker produktet, når /book hentes forfra uden ?product=", async () => {
    const første = await aabnSiden("/book?product=soundboks");
    await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());
    expect(JSON.parse(window.localStorage.getItem(NØGLE)!).speaker).toBe("soundboks");
    første.unmount();

    const anden = await aabnSiden("/book");
    await waitFor(() => expect(anden.onSummary.mock.calls.at(-1)?.[0]?.count).toBe(1));
    // Kunden står hvor han slap: datovalget, ikke produktvælgeren
    expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
  });

  it("lægger det første produkt i kurven, når kunden booker et andet fra en ny side", async () => {
    const første = await aabnSiden("/book?product=soundboks");
    await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());
    første.unmount();

    const anden = await aabnSiden("/book?product=lys");
    await waitFor(() => {
      const sidste = anden.onSummary.mock.calls.at(-1)?.[0];
      expect(sidste?.count).toBe(2);
      expect(sidste?.total).toBe(catalogPrice("soundboks") + catalogPrice("lys"));
    });
    const gemt = JSON.parse(window.localStorage.getItem(NØGLE)!);
    expect(gemt.cartItems.map((c: { productId: string }) => c.productId)).toEqual(["soundboks"]);
  });

  it("stabler ikke samme produkt, når kunden opdaterer siden", async () => {
    const første = await aabnSiden("/book?product=soundboks");
    await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());
    første.unmount();

    const anden = await aabnSiden("/book?product=soundboks");
    await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());
    await waitFor(() => expect(anden.onSummary.mock.calls.at(-1)?.[0]?.count).toBe(1));
  });

  it("tømmer kurven, når ordren er gået igennem", async () => {
    gemtKurv({ speaker: "soundboks", step: 2 });
    window.localStorage.setItem(
      "booking_kvittering_123",
      JSON.stringify({ nr: "123", oprettet: new Date().toISOString(), navn: "Agnes", email: "a@b.dk", telefon: "23632303", periode: "fre–man", sted: "Afhentning", linjer: [], total: 0, betaling: "pickup" }),
    );
    await aabnSiden("/book?kvittering=123");
    await waitFor(() => expect(window.localStorage.getItem(NØGLE)).toBeNull());
  });

  it("glemmer en kurv, der er ældre end tre dage", async () => {
    gemtKurv({ speaker: "soundboks", gemt: Date.now() - 4 * 24 * 60 * 60 * 1000 });
    const r = await aabnSiden("/book");
    await waitFor(() => expect(r.onSummary).toHaveBeenCalled());
    expect(r.onSummary.mock.calls.at(-1)?.[0]?.count).toBe(0);
    expect(window.localStorage.getItem(NØGLE)).toBeNull();
  });

  it("tager ikke produkter med, der ikke findes i kataloget", async () => {
    gemtKurv({ speaker: "findes_ikke", cartItems: [{ productId: "heller_ikke", name: "X", price: 100 }] });
    const r = await aabnSiden("/book");
    await waitFor(() => expect(r.onSummary).toHaveBeenCalled());
    expect(r.onSummary.mock.calls.at(-1)?.[0]?.count).toBe(0);
  });

  it("tager ikke datoer i fortiden med, men beholder produktet", async () => {
    const igår = new Date();
    igår.setDate(igår.getDate() - 1);
    gemtKurv({ speaker: "soundboks", step: 2, pickupDate: igår.toISOString(), returnDate: igår.toISOString() });
    const r = await aabnSiden("/book");
    await waitFor(() => expect(r.onSummary.mock.calls.at(-1)?.[0]?.count).toBe(1));
    expect(screen.getByText("Vælg datoer")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(NØGLE)!).pickupDate).toBeNull();
  });
});
