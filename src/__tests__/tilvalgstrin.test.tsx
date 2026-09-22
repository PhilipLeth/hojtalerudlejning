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
import { vælgDatoer } from "./vaelgDatoer";

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
  vælgDatoer();
  await waitFor(() => expect(screen.getByText("Videre").closest("button")).not.toBeDisabled());
  fireEvent.click(screen.getByText("Videre").closest("button")!);
  await waitFor(() => expect(screen.getByText("Tilvalg")).toBeInTheDocument());
}

describe("Tilvalgstrinnet", () => {
  it("viser de relevante tilvalg, ikke hele sortimentet", async () => {
    await tilTilvalg();
    // De fem der faktisk tilføjes til en Soundboks. Produktarket 17. sept 2026:
    // Soundboks 4 har nu sin egen liste af tilvalg (lysbar, batteri, mikrofon med
    // ledning, ét stativ), røgmaskine og stativ-sættet hører ikke til den længere
    for (const navn of ["Lysbar", "Soundboks batteri", "Mikrofon med ledning"]) {
      expect(screen.getAllByText(new RegExp(navn, "i")).length, navn).toBeGreaterThan(0);
    }
    // Og resten er foldet væk bag én knap
    expect(screen.getByText(/Vis alle tilvalg/)).toBeInTheDocument();
  }, 20000);

  it("folder resten ud, når man beder om det", async () => {
    await tilTilvalg();
    const knap = screen.getByText(/Vis alle tilvalg/);
    // Stroboskopet er sidst i rækkefølgen og kommer først frem, når man folder ud
    expect(screen.queryByText("Stroboskop")).not.toBeInTheDocument();
    fireEvent.click(knap);
    await waitFor(() => expect(screen.queryByText(/Vis alle tilvalg/)).not.toBeInTheDocument());
    expect(screen.getAllByText(/Stroboskop/i).length).toBeGreaterThan(0);
    // Bæretasken er sat på pause (produktarket 17. sept 2026) og kommer aldrig frem
    expect(screen.queryByText(/taske/i)).not.toBeInTheDocument();
  }, 20000);

  /**
   * Arkets afsnit 0 rummer teknikertimen, og Frederik bad om at kunden tager
   * stilling til den. Den lå bag "Vis alle tilvalg", hvor ingen så den.
   */
  it("teknikertimen står fremme uden at man skal folde ud", async () => {
    await tilTilvalg();
    expect(screen.getAllByText(/Lydmand/i).length).toBeGreaterThan(0);
  }, 20000);

  /**
   * Arkets afsnit 4: forlængerledninger og stikdåser. De har ingen fotos og
   * skal ikke fylde som et tilvalgskort — men de skal være der, for det er
   * dem kunden opdager mangler, når teltet står tyve meter fra stikkontakten.
   */
  it("tilbyder strøm i et sammenfoldet afsnit for sig", async () => {
    await tilTilvalg();
    expect(screen.getByText("Mangler I strøm?")).toBeInTheDocument();
    expect(screen.getByText(/Kabeltromle 10 m/)).toBeInTheDocument();
    expect(screen.getByText(/Stikdåse, 4 udtag/)).toBeInTheDocument();
  }, 20000);

  it("sætter kørsel før tilvalgene — det er dét, kunden skal svare på", async () => {
    await tilTilvalg();
    const tekst = document.body.textContent ?? "";
    const iKørsel = tekst.search(/levering|Kørsel|henter selv/i);
    const iTilvalg = tekst.indexOf("Lysbar");
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
    expect(tekst).toMatch(/Afhentning:\s*Fredag 9.30–18/);
    expect(tekst).toMatch(/Aflevering:\s*Mandag 9.30–18/);
    // Og ingen løfter om at møde uden for tiderne — det gør vi ikke,
    // heller ikke mod betaling
    expect(tekst).not.toMatch(/[Uu]den for åbningstid/);
  }, 20000);

  it("fjerner tiderne igen, når kunden vælger levering", async () => {
    await tilTilvalg();
    expect(document.body.textContent).toMatch(/Afhentning:\s*Fredag 9.30–18/);

    fireEvent.click(screen.getByText("Levering og afhentning (begge veje)").closest("button")!);

    await waitFor(() => expect(document.body.textContent).not.toMatch(/Afhentning:\s*Fredag 14–18/));
  }, 20000);
});
