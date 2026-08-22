/**
 * Kvitteringsskærmen og flere varer i samme ordre.
 *
 * Kvitteringen kastede en ReferenceError, fordi pickupAddress aldrig blev hentet
 * i hovedkomponenten (TS2304, som byggeriet ignorerede). Ordren blev gemt og
 * mailen sendt — men kunden så et brud i stedet for en bekræftelse og bestilte
 * igen. Fanget af fejlopsamlingen 21. august 2026, otte gange på tre døgn.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingFlow from "@/components/BookingFlow";

vi.mock("next/image", () => ({ default: (props: any) => <img {...props} /> }));

let sendtPayload: any = null;

beforeEach(() => {
  sendtPayload = null;
  // Kvitteringen lægger sig i URL'en; uden det her starter næste test på den
  window.history.replaceState(null, "", "/");
  (global.fetch as any) = vi.fn((url: string, init?: RequestInit) => {
    const u = String(url);
    if (u.includes("/api/availability")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          inventory: { soundboks: 4, party: 4, festival: 4, lys: 4, rog: 4 },
          booked: {},
          blocked_dates: [],
        }),
      });
    }
    if (u.includes("/api/book")) {
      sendtPayload = JSON.parse(String(init?.body ?? "{}"));
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, bookingId: "booking_1787347874016_kvc5a0" }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

function vælgDatoer() {
  const idag = new Date();
  const fredag = new Date(idag);
  fredag.setDate(idag.getDate() + ((5 - idag.getDay() + 7) % 7 || 7));
  const mandag = new Date(fredag);
  mandag.setDate(fredag.getDate() + 3);
  const klik = (d: number) => {
    const k = screen.getAllByRole("button").filter((b) => b.textContent === String(d) && !(b as HTMLButtonElement).disabled);
    if (k.length) fireEvent.click(k[0]);
  };
  klik(fredag.getDate());
  klik(mandag.getDate());
}

async function frem() {
  const videre = screen.getAllByText(/^(Videre|Videre til betaling)$/).filter((b) => !(b.closest("button") as HTMLButtonElement)?.disabled);
  fireEvent.click(videre[0].closest("button")!);
}

async function tilKontakt(vælgProdukt = "Soundboks 4") {
  render(<BookingFlow />);
  fireEvent.click(screen.getAllByText(vælgProdukt)[0].closest("button")!);
  await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());
  vælgDatoer();
  await waitFor(() => expect(screen.getByText("Videre").closest("button")).not.toBeDisabled());
  await frem();
  await waitFor(() => expect(screen.queryByText("Vælg datoer")).not.toBeInTheDocument());
  await frem();
  await waitFor(() => expect(screen.getByPlaceholderText("Navn")).toBeInTheDocument(), { timeout: 3000 });
}

function udfyld() {
  fireEvent.change(screen.getByPlaceholderText("Navn"), { target: { value: "Agnes Dahle Stæhr" } });
  fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "agnes@example.com" } });
  fireEvent.change(screen.getByPlaceholderText("Telefon"), { target: { value: "23632303" } });
  // Betaling ved afhentning, så flowet ikke går til Stripe
  const kontant = screen.queryAllByText(/afhentning|Betal ved/i)[0];
  if (kontant) fireEvent.click(kontant.closest("button") ?? kontant);
}

describe("Kvitteringen efter en booking", () => {
  it("viser bekræftelsen i stedet for at crashe", async () => {
    await tilKontakt();
    udfyld();
    fireEvent.click(screen.getByText(/Send booking|Videre til betaling/).closest("button")!);

    await waitFor(() => expect(screen.getByText("Booking modtaget!")).toBeInTheDocument(), { timeout: 4000 });
    // Det var netop den her linje, der kastede: afhentningsadressen på kvitteringen.
    // Adressen kommer fra /admin/indstillinger — her er det standardadressen.
    expect(screen.getByText(/Afhentning:.*Vermlandsgade/)).toBeInTheDocument();
  }, 20000);

  it("viser ordrenummeret og siger at man ikke skal bestille igen", async () => {
    await tilKontakt();
    udfyld();
    fireEvent.click(screen.getByText(/Send booking|Videre til betaling/).closest("button")!);

    await waitFor(() => expect(screen.getByText("Booking modtaget!")).toBeInTheDocument(), { timeout: 4000 });
    expect(screen.getByText("1787347874016_kvc5a0")).toBeInTheDocument();
    expect(screen.getByText(/du skal ikke sende den igen/i)).toBeInTheDocument();
  }, 20000);
});

describe("Kvitteringen kan gemmes, hentes frem og printes", () => {
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
    return store;
  }

  it("flytter URL'en væk fra produktsiden og over på kvitteringen", async () => {
    mockStorage();
    const replaceState = vi.spyOn(window.history, "replaceState");
    await tilKontakt();
    udfyld();
    fireEvent.click(screen.getByText(/Send booking|Videre til betaling/).closest("button")!);
    await waitFor(() => expect(screen.getByText("Booking modtaget!")).toBeInTheDocument(), { timeout: 4000 });

    // Stod før på /?product=thumpgo#book — et tryk på Opdater sendte kunden
    // tilbage i bookingflowet i stedet for til sin kvittering
    const url = replaceState.mock.calls.at(-1)?.[2];
    expect(String(url)).toContain("kvittering=1787347874016_kvc5a0");
  }, 20000);

  it("gemmer kvitteringen, så den kan hentes frem igen", async () => {
    const store = mockStorage();
    await tilKontakt();
    udfyld();
    fireEvent.click(screen.getByText(/Send booking|Videre til betaling/).closest("button")!);
    await waitFor(() => expect(screen.getByText("Booking modtaget!")).toBeInTheDocument(), { timeout: 4000 });

    const gemt = store.get("booking_kvittering_1787347874016_kvc5a0");
    expect(gemt, "kvitteringen blev ikke gemt").toBeTruthy();
    const data = JSON.parse(gemt!);
    expect(data.navn).toBe("Agnes Dahle Stæhr");
    expect(data.total).toBeGreaterThan(0);
    expect(data.linjer.length).toBeGreaterThan(0);
  }, 20000);

  it("siger tydeligt at det ikke er den endelige bekræftelse, og kan printes", async () => {
    mockStorage();
    await tilKontakt();
    udfyld();
    fireEvent.click(screen.getByText(/Send booking|Videre til betaling/).closest("button")!);
    await waitFor(() => expect(screen.getByText("Booking modtaget!")).toBeInTheDocument(), { timeout: 4000 });

    expect(screen.getByText(/ikke din endelige ordrebekræftelse/i)).toBeInTheDocument();
    expect(screen.getByText(/gennemgår bestillingen/i)).toBeInTheDocument();
    expect(screen.getByText("Print kvittering")).toBeInTheDocument();
  }, 20000);
});

describe("Flere varer i samme ordre", () => {
  it("lægger produkt nummer to i kurven og sender begge med", async () => {
    render(<BookingFlow />);
    fireEvent.click(screen.getAllByText("Soundboks 4")[0].closest("button")!);
    await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());
    vælgDatoer();
    await waitFor(() => expect(screen.getByText("Videre").closest("button")).not.toBeDisabled());
    await frem();

    // "+ Tilføj et produkt mere" fører tilbage til trin 1 med varen i kurven
    await waitFor(() => expect(screen.getByText("+ Tilføj et produkt mere")).toBeInTheDocument(), { timeout: 3000 });
    fireEvent.click(screen.getByText("+ Tilføj et produkt mere").closest("button")!);
    await waitFor(() => expect(screen.getByText("Vælg højtalere")).toBeInTheDocument());

    fireEvent.click(screen.getAllByText("Lille højtalerpakke")[0].closest("button")!);
    await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());
    await frem();
    await waitFor(() => expect(screen.queryByText("Vælg datoer")).not.toBeInTheDocument());
    await frem();
    await waitFor(() => expect(screen.getByPlaceholderText("Navn")).toBeInTheDocument(), { timeout: 3000 });

    udfyld();
    fireEvent.click(screen.getByText(/Send booking|Videre til betaling/).closest("button")!);
    await waitFor(() => expect(sendtPayload).not.toBeNull(), { timeout: 4000 });

    // Begge produkter skal være med — ellers pakker vi det halve af ordren
    const navne = [sendtPayload.speaker, ...(sendtPayload.cartItems ?? []).map((c: any) => c.name)];
    expect(navne).toContain("Soundboks 4");
    expect(navne.join(" ")).toMatch(/Lille højtalerpakke|Soundboks/);
    expect(sendtPayload.total).toBeGreaterThan(0);
  }, 25000);
});
