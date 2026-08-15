/**
 * Admin på telefonen: kortvisning, hele ordren og tydelig betaling.
 * Renderer de rigtige sider mod et mocket API — ikke kun kildetekst.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdminPage from "@/app/admin/page";
import UdleveringPage from "@/app/admin/udlevering/page";

const booking = {
  id: "booking_1755000000000_abc123",
  speaker: "Lyskæde varm hvid",
  speakerId: "lyskaeder",
  speakerSize: "—",
  period: "Fre 21. aug → Man 24. aug (3 dage)",
  pickup: new Date(Date.now() + 86400000).toISOString(),
  returnDate: new Date(Date.now() + 4 * 86400000).toISOString(),
  days: 3,
  addons: ["Røgmaskine", "Levering + afhentning (begge veje)"],
  addonIds: ["rog", "levering_begge"],
  cartItems: [{ name: "Uplight", price: 125, productId: "uplight" }],
  deliveryAddress: "Vestergade 5, 1456 København K",
  total: 1480,
  name: "Julie Blegvad",
  email: "julie@example.com",
  phone: "22245880",
  comment: "",
  status: "bekraeftet",
  createdAt: new Date().toISOString(),
};

function mockMobile() {
  window.matchMedia = ((q: string) => ({
    matches: true,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })) as any;
}

/** jsdom i denne opsætning har ingen brugbar localStorage — siderne læser
 *  admin-hemmeligheden derfra, så vi lægger en simpel udgave ind */
function mockStorage() {
  const store = new Map<string, string>([["admin_secret", "hemmelig"]]);
  const api = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
  Object.defineProperty(window, "localStorage", { value: api, configurable: true });
  Object.defineProperty(window, "sessionStorage", { value: { ...api }, configurable: true });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockStorage();
  mockMobile();
});

describe("Ordreoverblikket på mobil", () => {
  beforeEach(() => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ bookings: [booking] }),
    });
  });

  it("viser bookingen som kort med hele ordren", async () => {
    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());

    // Alle tre varelinjer — kurv-varen manglede før
    expect(screen.getByText(/Lyskæde varm hvid/)).toBeInTheDocument();
    expect(screen.getByText(/Uplight/)).toBeInTheDocument();
    expect(screen.getByText(/Røgmaskine/)).toBeInTheDocument();
    // …og ingen "Højttaler (...)" på et lys-produkt
    expect(screen.queryByText(/Højttaler/)).not.toBeInTheDocument();
  });

  it("viser kørslen med adresse", async () => {
    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());
    expect(screen.getByText(/Vi leverer OG henter/)).toBeInTheDocument();
    expect(screen.getByText(/Vestergade 5/)).toBeInTheDocument();
  });

  it("gør betalingsstatus og beløb tydeligt", async () => {
    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());
    expect(screen.getByText("⏳ IKKE BETALT")).toBeInTheDocument();
    expect(screen.getByText("1480 kr")).toBeInTheDocument();
  });

  it("har en knap til udlevering med underskrift", async () => {
    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());
    const link = screen.getByText("✍️ Udlever + underskrift").closest("a")!;
    expect(link.getAttribute("href")).toContain(`/admin/udlevering?id=${booking.id}`);
  });
});

describe("Ordren foldes ud når man klikker på den", () => {
  beforeEach(() => {
    (global.fetch as any).mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            String(url).startsWith("/api/products")
              ? { speakers: null, addons: null, rentalProducts: null }
              : { bookings: [booking] },
          ),
      }),
    );
  });

  it("viser ordrelinjer med pris, kørsel og total på mobilkortet", async () => {
    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());

    expect(screen.queryByText("Ordrelinjer")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Vis ordre & detaljer"));

    await waitFor(() => expect(screen.getByText("Ordrelinjer")).toBeInTheDocument());
    // Katalogpriser slået op pr. linje: lyskæde 195, uplight 125, røg 245, kørsel 795
    expect(screen.getByText("195 kr")).toBeInTheDocument();
    expect(screen.getByText("125 kr")).toBeInTheDocument();
    expect(screen.getByText("245 kr")).toBeInTheDocument();
    expect(screen.getByText("795 kr")).toBeInTheDocument();
    expect(screen.getByText(/Levering \+ afhentning/)).toBeInTheDocument();
    expect(screen.getByText("Total på ordren")).toBeInTheDocument();
  });

  it("folder også ud i tabellen på desktop", async () => {
    window.matchMedia = ((q: string) => ({
      matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
      addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false,
    })) as any;

    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());

    expect(screen.getByText("vis ordre")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Julie Blegvad"));
    await waitFor(() => expect(screen.getByText("Ordrelinjer")).toBeInTheDocument());
    expect(screen.getByText("Total på ordren")).toBeInTheDocument();
  });
});

describe("Tabellen på desktop", () => {
  beforeEach(() => {
    window.matchMedia = ((q: string) => ({
      matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
      addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false,
    })) as any;
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ bookings: [booking] }),
    });
  });

  it("har fem kolonner — udstyr hører under ordren, handlinger under betaling", async () => {
    const { container } = render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());

    const headers = [...container.querySelectorAll("th")].map((th) => th.textContent);
    expect(headers).toEqual(["Kunde", "Ordre & udstyr", "Periode", "Betaling & handling", "⭐"]);

    // Udstyrssporet står i samme celle som varelinjerne
    const orderCell = screen.getByText(/Lyskæde varm hvid/).closest("td")!;
    expect(orderCell.querySelector("select")).toBeTruthy();

    // Beløb, betalingsvalg og handlingsknapper i én celle
    const payCell = screen.getByText("1480 kr").closest("td")!;
    expect(payCell.querySelector("select")).toBeTruthy();
    expect(payCell.textContent).toContain("Print");
    expect(payCell.textContent).toContain("Underskrift");
  });

  it("skriver perioden kompakt over tre linjer", async () => {
    const { container } = render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());
    // Ikke længere den brede "Fre 21. aug → Man 24. aug (3 dage)" på én linje
    expect(screen.queryByText(booking.period)).not.toBeInTheDocument();
    expect(screen.getByText("3 dage")).toBeInTheDocument();
    expect(container.textContent).toMatch(/→ \w+\.? \d+\./);
  });
});

describe("Udleveringssiden", () => {
  beforeEach(() => {
    window.history.pushState({}, "", `/admin/udlevering?id=${booking.id}`);
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ booking, signature: null }),
    });
  });

  it("lister udstyret til afkrydsning og har et underskriftsfelt", async () => {
    const { container } = render(<UdleveringPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());

    expect(screen.getByText("Lyskæde varm hvid")).toBeInTheDocument();
    expect(screen.getByText("Uplight")).toBeInTheDocument();
    expect(container.querySelectorAll('input[type="checkbox"]').length).toBe(3);
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("kan ikke gemme før der er skrevet under", async () => {
    render(<UdleveringPage />);
    await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());
    const save = screen.getByText("Gem kvittering og marker som udleveret") as HTMLButtonElement;
    expect(save.disabled).toBe(true);
  });

  it("advarer om at der mangler betaling inden udstyret går ud ad døren", async () => {
    render(<UdleveringPage />);
    await waitFor(() => expect(screen.getByText("⏳ SKAL BETALES NU")).toBeInTheDocument());
    expect(screen.getByText("1480 kr")).toBeInTheDocument();
  });
});
