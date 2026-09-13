/**
 * Lydmanden er ét produkt, og antallet er timer (13. september 2026).
 *
 * Før lå der to varer: "Lydmand" til 1.000 kr, hvor kunden skulle skrive
 * antal timer i kommentaren, og "Lydmand, 4 timer" til 4.000 kr. Frederik:
 * "Det er dumt." Nu vælger kunden timerne som antal — og kan, hvis han vil,
 * skrive hvornår festen starter og slutter, så regnes timerne ud af det.
 * Start og slut er en hjælp, ikke et krav.
 *
 * Ordren bærer lydmanden som ÉN linje med timerne i navnet og hele beløbet,
 * så mail, admin og lejeseddel viser "Lydmand, 4 timer (kl. 18–22)" — mens
 * Stripe får id'et én gang pr. time, fordi den regner pr. id.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingFlow, { timerMellem } from "@/components/BookingFlow";
import { addons, RETIRED_ADDON_IDS, type Addon } from "@/lib/products";
import { mergeAddonsForTest } from "@/lib/useProducts";
import { vælgDatoer } from "./vaelgDatoer";

beforeEach(() => {
  vi.clearAllMocks();
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ inventory: {}, booked: {}, blocked_dates: [] }),
  });
});

afterEach(() => window.history.pushState({}, "", "/"));

const bookKald = () =>
  (global.fetch as any).mock.calls.find((c: any[]) => c[0] === "/api/book");
const stripeKald = () =>
  (global.fetch as any).mock.calls.find((c: any[]) => c[0] === "/api/stripe/create-checkout-session");

/** Stor højtalerpakke (995 kr), datoer valgt, frem til tilvalgene — og lydmanden valgt til */
async function medLydmand() {
  window.history.pushState({}, "", "/?product=festival#book");
  render(<BookingFlow />);
  await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());
  vælgDatoer();
  await waitFor(() => expect((screen.getByText("Videre") as HTMLButtonElement).disabled).toBe(false));
  fireEvent.click(screen.getByText("Videre"));
  await waitFor(() => expect(screen.getByText("Levering og afhentning")).toBeInTheDocument());
  // Lydmanden hører ikke til de fem mest valgte tilvalg og ligger bag folden
  const visAlle = screen.queryByText(/Vis alle tilvalg/);
  if (visAlle) fireEvent.click(visAlle);
  fireEvent.click(screen.getByText("Lydmand").closest("button")!);
  await waitFor(() => expect(screen.getByText("Antal timer")).toBeInTheDocument());
}

function tilKontakt() {
  fireEvent.click(screen.getByText("Videre"));
  fireEvent.change(screen.getByPlaceholderText("Navn"), { target: { value: "Test Testesen" } });
  fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@example.com" } });
  fireEvent.change(screen.getByPlaceholderText("Telefon"), { target: { value: "31132852" } });
}

describe("Kataloget", () => {
  it("har én lydmand — timerne er antallet, ikke en vare mere", () => {
    expect(addons.filter((a) => a.id.startsWith("lydmand")).map((a) => a.id)).toEqual(["lydmand"]);
    expect(RETIRED_ADDON_IDS).toContain("lydmand_4t");
    expect(addons.find((a) => a.id === "lydmand")?.da.desc).not.toMatch(/kommentar/i);
    expect(addons.find((a) => a.id === "lydmand")?.en.desc).not.toMatch(/comment/i);
  });

  it("smider den gamle 4-timers vare ud af et KV-katalog og tager beskrivelsen fra koden", () => {
    const lydmand = addons.find((a) => a.id === "lydmand")!;
    const gammelt: Addon[] = [
      { ...lydmand, da: { label: "Lydmand", desc: "Skriv antal timer i kommentaren, så retter vi ordren." } },
      { ...lydmand, id: "lydmand_4t", price: 4000 },
    ];
    const flettet = mergeAddonsForTest(gammelt);
    expect(flettet.map((a) => a.id)).not.toContain("lydmand_4t");
    expect(flettet.find((a) => a.id === "lydmand")?.da.desc).not.toMatch(/kommentar/);
    // Prisen er stadig admins — kun teksterne og enheden kommer fra koden
    expect(flettet.find((a) => a.id === "lydmand")?.price).toBe(lydmand.price);
  });
});

describe("Timer ud af start og slut", () => {
  it("runder op til hele timer og kan gå hen over midnat", () => {
    expect(timerMellem("18:00", "22:00")).toBe(4);
    expect(timerMellem("18:00", "22:30")).toBe(5);
    expect(timerMellem("20:00", "02:00")).toBe(6);
  });

  it("er ikke et tidsrum, før begge klokkeslæt er sat og er forskellige", () => {
    expect(timerMellem("", "22:00")).toBeNull();
    expect(timerMellem("18:00", "")).toBeNull();
    expect(timerMellem("18:00", "18:00")).toBeNull();
  });
});

describe("Lydmand i bookingen", () => {
  it("vælges med timer som antal, fire som udgangspunkt — og ingen besked om kommentaren", async () => {
    await medLydmand();
    expect(screen.getAllByText("Lydmand, 4 timer").length).toBeGreaterThan(0);
    expect(screen.getAllByText("4000 kr").length).toBeGreaterThan(0);
    expect(screen.queryByText(/kommentaren/)).not.toBeInTheDocument();

    // Én time mere — timepanelet ligger før kurven, så det er den første "Én mere"
    fireEvent.click(screen.getAllByLabelText("Én mere")[0]);
    expect(screen.getAllByText("Lydmand, 5 timer").length).toBeGreaterThan(0);
    expect(screen.getAllByText("5000 kr").length).toBeGreaterThan(0);
  });

  it("regner timerne ud af start og slut, og sender én linje med hele beløbet", async () => {
    await medLydmand();
    fireEvent.change(screen.getByLabelText("Fra kl."), { target: { value: "18:00" } });
    // Kun starten sat: stadig de fire timer fra antallet
    expect(screen.getAllByText("Lydmand, 4 timer").length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText("Til kl."), { target: { value: "22:30" } });
    expect(screen.getAllByText("Lydmand, 5 timer (kl. 18–22.30)").length).toBeGreaterThan(0);

    tilKontakt();
    fireEvent.click(screen.getByText("Betal ved afhentning"));
    fireEvent.click(screen.getByText("Send booking"));

    await waitFor(() => expect(bookKald()).toBeTruthy());
    const body = JSON.parse(bookKald()[1].body);
    expect(body.cartItems).toContainEqual({ name: "Lydmand, 5 timer (kl. 18–22.30)", price: 5000, productId: "lydmand" });
    // Ikke også som tilvalg — så stod den to gange på ordren
    expect(body.addonIds).not.toContain("lydmand");
    expect(body.addons).not.toContain("Lydmand");
    expect(body.total).toBe(995 + 5000);
  });

  it("betaler pr. time hos Stripe — id'et sendes én gang pr. time", async () => {
    await medLydmand();
    tilKontakt();
    fireEvent.click(screen.getByText("Videre til betaling"));

    await waitFor(() => expect(stripeKald()).toBeTruthy());
    const items = JSON.parse(stripeKald()[1].body).items as Array<{ id: string }>;
    expect(items.filter((i) => i.id === "lydmand")).toHaveLength(4);
    expect(items.filter((i) => i.id === "festival")).toHaveLength(1);
  });
});
