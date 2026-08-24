/**
 * Trin 3 skal kunne overskues.
 *
 * Før stod otte tilvalg og seks krydssalg åbne på én gang, og kørsel — det
 * eneste spørgsmål kunden faktisk SKAL tage stilling til — lå nedenunder det
 * hele. Og havde man kun ét produkt, kunne det ikke fjernes fra kurven igen.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import BookingFlow from "@/components/BookingFlow";

vi.mock("next/image", () => ({ default: (props: any) => <img {...props} /> }));

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  (global.fetch as any) = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ inventory: { soundboks: 4, party: 4 }, booked: {}, blocked_dates: [] }) }),
  );
});

async function tilTilvalg() {
  render(<BookingFlow />);
  fireEvent.click(screen.getAllByText("Soundboks 4")[0].closest("button")!);
  await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());
  const idag = new Date();
  const fredag = new Date(idag);
  fredag.setDate(idag.getDate() + ((5 - idag.getDay() + 7) % 7 || 7));
  const mandag = new Date(fredag);
  mandag.setDate(fredag.getDate() + 3);
  for (const d of [fredag.getDate(), mandag.getDate()]) {
    const k = screen.getAllByRole("button").filter((b) => b.textContent === String(d) && !(b as HTMLButtonElement).disabled);
    if (k.length) fireEvent.click(k[0]);
  }
  await waitFor(() => expect(screen.getByText("Videre").closest("button")).not.toBeDisabled());
  fireEvent.click(screen.getByText("Videre").closest("button")!);
  await waitFor(() => expect(screen.getByText("Tilvalg")).toBeInTheDocument());
}

describe("Tilvalgstrinnet", () => {
  it("viser fem tilvalg, ikke hele sortimentet", async () => {
    await tilTilvalg();
    // De fem der faktisk tilføjes til en fest
    for (const navn of ["Lys-pakke", "Røgmaskine", "Højtalerstativer"]) {
      expect(screen.getAllByText(new RegExp(navn, "i")).length, navn).toBeGreaterThan(0);
    }
    // Og resten er foldet væk bag én knap
    expect(screen.getByText(/Vis alle tilvalg/)).toBeInTheDocument();
  }, 20000);

  it("folder resten ud, når man beder om det", async () => {
    await tilTilvalg();
    const knap = screen.getByText(/Vis alle tilvalg/);
    fireEvent.click(knap);
    await waitFor(() => expect(screen.queryByText(/Vis alle tilvalg/)).not.toBeInTheDocument());
    // Bæretasken er nederst i relevansrækkefølgen og kommer først frem nu
    expect(screen.getAllByText(/taske/i).length).toBeGreaterThan(0);
  }, 20000);

  it("sætter kørsel før tilvalgene — det er dét, kunden skal svare på", async () => {
    await tilTilvalg();
    const tekst = document.body.textContent ?? "";
    const iKørsel = tekst.search(/levering|Kørsel|henter selv/i);
    const iTilvalg = tekst.indexOf("Lys-pakke");
    expect(iKørsel).toBeGreaterThan(-1);
    expect(iKørsel, "kørsel skal stå før tilvalgene").toBeLessThan(iTilvalg);
  }, 20000);
});

describe("Kurven med ét produkt", () => {
  it("kan fjerne produktet, også når det er det eneste", async () => {
    await tilTilvalg();
    const kurv = screen.getByText("I din kurv:").closest("div")!;
    expect(within(kurv).getByText(/Soundboks 4/)).toBeInTheDocument();

    fireEvent.click(within(kurv).getByLabelText("Fjern"));

    // Tom kurv → tilbage til produktvalget, ikke en blindgyde
    await waitFor(() => expect(screen.getByText("Vælg højtalere")).toBeInTheDocument());
  }, 20000);
});

/**
 * Kalenderen står på trin 2, kørslen på trin 3. Vælger kunden "Jeg henter og
 * afleverer selv", stod der ikke længere noget om HVORNÅR døren er åben — man
 * skulle huske tiderne fra forrige trin. Nu står åbningstiderne for netop de
 * valgte datoer under valget.
 */
describe("Åbningstider ved 'jeg henter selv'", () => {
  it("skriver tiderne for de valgte dage under valget", async () => {
    await tilTilvalg();
    // Teksten → tekstkolonnen → knappen → rækken med åbningstiderne under
    const selv = screen.getByText("Jeg henter og afleverer selv").closest("div")!.parentElement!
      .parentElement!;
    const tekst = selv.textContent ?? "";
    // Fredag hentes, mandag afleveres — standardtiderne, dag for dag
    expect(tekst).toMatch(/Afhentning:\s*Fredag 14–18/);
    expect(tekst).toMatch(/Aflevering:\s*Mandag 15–17/);
    // Og gebyret for at møde uden for åbningstid, så det ikke kommer bagefter
    expect(tekst).toMatch(/Uden for åbningstid/);
  }, 20000);

  it("fjerner tiderne igen, når kunden vælger levering", async () => {
    await tilTilvalg();
    expect(document.body.textContent).toMatch(/Afhentning:\s*Fredag 14–18/);

    fireEvent.click(screen.getByText("Levering + afhentning (begge veje)").closest("button")!);

    await waitFor(() => expect(document.body.textContent).not.toMatch(/Afhentning:\s*Fredag 14–18/));
  }, 20000);
});
