/**
 * Booking-forløbet kørt mod PRODUKTIONENS egne data.
 *
 * Katalog og ledighed hentes live fra lejhojtaler.dk, så en ændring i
 * kataloget eller et lagertal, der pludselig blokerer, fanges her og ikke af
 * en kunde. Netværk kræves — springes over, hvis sitet ikke kan nås.
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingFlow from "@/components/BookingFlow";
import { speakers as kodeSpeakers, rentalProducts as kodeRentals } from "@/lib/products";

vi.mock("next/image", () => ({ default: (props: any) => <img {...props} /> }));

const rigtigFetch: typeof fetch = (globalThis as any).__realFetch ?? fetch;
let katalog: any = null;
let ledighed: any = null;
const rapporteredeFejl: any[] = [];

beforeAll(async () => {
  const i_dag = new Date();
  const fra = new Date(i_dag.getTime() + 7 * 86400000).toISOString().slice(0, 10);
  const til = new Date(i_dag.getTime() + 10 * 86400000).toISOString().slice(0, 10);
  const [k, l] = await Promise.all([
    rigtigFetch("https://lejhojtaler.dk/api/products").then((r) => r.json()),
    rigtigFetch(`https://lejhojtaler.dk/api/availability?from=${fra}&to=${til}`).then((r) => r.json()),
  ]);
  katalog = k;
  ledighed = l;
}, 30000);

beforeEach(() => {
  rapporteredeFejl.length = 0;
  (global.fetch as any) = vi.fn((url: string, init?: RequestInit) => {
    const u = String(url);
    if (u.includes("/api/availability")) return Promise.resolve({ ok: true, json: () => Promise.resolve(ledighed) });
    if (u.includes("/api/products")) return Promise.resolve({ ok: true, json: () => Promise.resolve(katalog) });
    if (u.includes("/api/fejl")) {
      rapporteredeFejl.push(JSON.parse(String(init?.body ?? "{}")));
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    if (u.includes("/api/book")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, bookingId: "booking_test" }) });
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

function vælgDatoer() {
  const i_dag = new Date();
  const fredag = new Date(i_dag);
  fredag.setDate(i_dag.getDate() + ((5 - i_dag.getDay() + 7) % 7 || 7));
  const mandag = new Date(fredag);
  mandag.setDate(fredag.getDate() + 3);
  const klik = (d: number) => {
    const k = screen.getAllByRole("button").filter((b) => b.textContent === String(d) && !(b as HTMLButtonElement).disabled);
    if (k.length) fireEvent.click(k[0]);
    return k.length > 0;
  };
  return klik(fredag.getDate()) && klik(mandag.getDate());
}

describe("Produktionens katalog og ledighed", () => {
  /**
   * /api/products svarer med null-lister, når der ikke er gemt et katalog i
   * KV — og så falder klienten tilbage på defaults i products.ts. Det er den
   * tilstand produktionen står i efter 25. august 2026, hvor det gemte
   * katalog blev nulstillet: det var et forældet øjebliksbillede, der
   * skyggede for nye priser, sytten produkter og WebP-billederne.
   *
   * Testen skal derfor kunne begge dele. Er der et katalog i KV, er DET
   * sandheden; er der ikke, er koden det. Begge veje skal flowets produkter
   * findes — ellers står kunden med en tom forside.
   */
  it("indeholder de produkter flowet regner med", () => {
    const cat = katalog?.catalog ?? katalog ?? {};
    const fraKv = [...(cat.speakers ?? []), ...(cat.rentalProducts ?? [])];
    const brugtKilde = fraKv.length ? fraKv : [...kodeSpeakers, ...kodeRentals];
    const ids = brugtKilde.map((p: any) => p.id);
    for (const id of ["soundboks", "party", "festival", "thumpgo"]) {
      expect(ids, `${id} mangler i ${fraKv.length ? "det live katalog" : "kodens katalog"}`).toContain(id);
    }
  });

  it("har lagertal, der ikke spærrer for booking i den kommende uge", () => {
    for (const id of ["soundboks", "party", "festival"]) {
      const bookbare = ledighed.inventory[id];
      const optaget = ledighed.booked?.[id] ?? 0;
      expect(bookbare, `${id} mangler lagertal`).toBeGreaterThan(0);
      expect(bookbare - optaget, `${id} er udsolgt i perioden`).toBeGreaterThan(0);
    }
  });
});

describe("En kunde booker en Soundboks med produktionens data", () => {
  it("kommer fra produkt til datoer til tilvalg uden fejlrapport", async () => {
    render(<BookingFlow />);
    fireEvent.click(screen.getAllByText("Soundboks 4")[0].closest("button")!);
    await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());

    expect(vælgDatoer()).toBe(true);
    await waitFor(() => expect(screen.getByText("Videre")).not.toBeDisabled());
    expect(screen.queryByText(/udsolgt/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Videre"));
    await waitFor(() => expect(screen.queryByText("Vælg datoer")).not.toBeInTheDocument());

    // Fejlopsamlingen skal være tavs, når intet går galt
    expect(rapporteredeFejl.map((f) => f.type)).toEqual([]);
  }, 20000);
});
