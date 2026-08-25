/**
 * Lejesedlen er én side, man har med ud i døren.
 *
 * Den skal kunne det, papir skal kunne: vise hvad der pakkes, hvad der mangler
 * at blive betalt, og bære en underskrift.
 *
 * Vilkårene stod før i et bilag, som sedlen henviste til. Men bilaget blev
 * sjældent printet med, så kunden skrev under på noget, hun ikke havde fået
 * udleveret. Frederik bad om at få dem på selve sedlen — stadig på én A4,
 * hvilket er derfor de står med lille skrift i to spalter.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderAdmin } from "./adminTestUtils";
import LejeseddelPage from "@/app/admin/lejeseddel/page";

const booking = {
  id: "booking_1755500000000_abc123",
  name: "Agnes Dahle Stæhr",
  email: "agnes@example.com",
  phone: "31 13 28 52",
  speaker: "Stor højtalerpakke",
  speakerId: "festival",
  speakerSize: "—",
  period: "fre 21. aug → man 24. aug",
  days: 3,
  addons: [],
  addonIds: ["lys"],
  cartItems: [{ name: "Lys-pakke", price: 495, productId: "lys" }],
  total: 2000,
  payments: [{ amount: 500, method: "mobilepay" }],
  depositAmount: 500,
  comment: "Festen starter kl. 19",
  status: "bekraeftet",
  createdAt: "2026-08-10T10:00:00.000Z",
};

/** jsdom har ikke localStorage her — samme stub som lager-testen bruger */
function mockStorage() {
  const store = new Map<string, string>([["admin_token", "hemmelig"]]);
  const api = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(window, "localStorage", { value: api, configurable: true });
  Object.defineProperty(window, "sessionStorage", { value: { ...api }, configurable: true });
}

beforeEach(() => {
  mockStorage();
  // AdminNav lytter efter skærmbredde; jsdom har ingen matchMedia
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }),
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (String(url).includes("/api/bookings")) {
        return new Response(JSON.stringify({ bookings: [booking] }), { status: 200 });
      }
      if (String(url).includes("/api/handover")) return new Response("{}", { status: 200 });
      return new Response(JSON.stringify({ users: [] }), { status: 200 });
    }),
  );
});

async function openSeddel() {
  renderAdmin(<LejeseddelPage />);
  const knap = await screen.findByText(/Agnes Dahle Stæhr/);
  fireEvent.click(knap.closest("button")!);
  await waitFor(() => expect(screen.getByText("Lejeseddel")).toBeInTheDocument());
}

describe("Lejesedlen", () => {
  it("viser det man skal bruge i døren: kunde, periode og pakkeliste", async () => {
    await openSeddel();
    expect(screen.getByText("agnes@example.com")).toBeInTheDocument();
    expect(screen.getByText(/fre 21\. aug/)).toBeInTheDocument();
    // Pakkelisten er ordrens egne linjer — og kun dem
    expect(screen.getByText("Stor højtalerpakke")).toBeInTheDocument();
    expect(screen.getByText("Lys-pakke")).toBeInTheDocument();
  });

  it("siger hvad der MANGLER at blive betalt, ikke bare prisen", async () => {
    await openSeddel();
    // 2.000 kr i alt, 500 betalt → 1.500 tilbage ved afhentning
    expect(screen.getByText(/1\.500 kr — MobilePay ved afhentning/)).toBeInTheDocument();
    // Både det betalte og depositummet står der — derfor to gange "500 kr"
    expect(screen.getAllByText("500 kr")).toHaveLength(2);
  });

  it("bærer en underskriftslinje til kunden — og kun til kunden", async () => {
    await openSeddel();
    expect(screen.getByText(/Lejers underskrift/)).toBeInTheDocument();
    // Udleverers felt er væk: Frederik står med sedlen i hånden, så hans
    // underskrift beviser ingenting, og feltet tog pladsen fra datoen.
    expect(screen.queryByText(/Udleveret af/)).not.toBeInTheDocument();
  });

  it("har plads til datoen under underskriften", async () => {
    await openSeddel();
    expect(screen.getByText(/^Dato:/)).toBeInTheDocument();
  });

  it("har alle vilkårene på selve sedlen", async () => {
    await openSeddel();
    // Alle seks afsnit skal stå der — ellers skriver kunden under på noget,
    // hun ikke kan læse
    for (const tekst of [
      /Ansvar og hæftelse/,
      /Depositum/,
      /Forsinket retur/,
      /Annullering/,
      /Ansvarsfraskrivelse/,
      /Tvister afgøres/,
    ]) {
      expect(screen.getAllByText(tekst).length).toBeGreaterThan(0);
    }
  });

  it("påstår ikke længere at vilkårene er vedhæftet", async () => {
    await openSeddel();
    expect(screen.queryByText(/står i bilaget/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/vedhæftet/i)).not.toBeInTheDocument();
  });

  it("kan skifte til bilaget med de fulde vilkår", async () => {
    await openSeddel();
    fireEvent.click(screen.getByText("Bilag: lejevilkår"));
    await waitFor(() => expect(screen.getByText(/Bilag — lejevilkår/)).toBeInTheDocument());
    expect(screen.getByText(/Tvister afgøres/)).toBeInTheDocument();
    // Bilaget skal kunne kobles til ordren det hører til
    expect(screen.getByText(/1755500000000_abc123/)).toBeInTheDocument();
  });
});

/**
 * Udstyrslisten er ordren — og ikke andet.
 *
 * Sedlen havde to faste linjer, "Strømkabel" og "AUX-kabel + iPhone-adapter",
 * på hver eneste ordre. Først gjorde vi AUX betinget af, om der var noget at
 * spille i; Frederik ville have dem helt væk. De er ikke ordrelinjer — de
 * følger med udstyret — og på en optælling i døren står de bare og fylder.
 */
describe("Lejeseddel — listen er ordren", () => {
  it("har ingen faste kabellinjer", async () => {
    await openSeddel();
    expect(screen.queryByText(/AUX-kabel/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Strømkabel$/)).not.toBeInTheDocument();
  });

  it("viser stadig det, der faktisk er bestilt", async () => {
    await openSeddel();
    expect(screen.getByText(/Stor højtalerpakke/)).toBeInTheDocument();
    expect(screen.getByText(/Lys-pakke/)).toBeInTheDocument();
  });
});
