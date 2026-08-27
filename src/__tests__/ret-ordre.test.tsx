/**
 * Ret en ordre efter den er lavet.
 *
 * Aftalen ændrer sig: der skal en mikrofon mere med, kunden skrev sin mail
 * forkert, festen blev mindre. Før kunne admin kun skifte status og slette,
 * så rettelser levede i hovedet på Frederik, mens bekræftelsen, lejesedlen og
 * fakturaen blev ved med at vise den oprindelige ordre.
 *
 * Testen vogter to ting: at beløbet altid regnes ud fra kataloget (aldrig fra
 * det klienten sender), og at linjer uden produkt-id — gamle bookinger — ikke
 * forsvinder, fordi ordren blev rettet et andet sted.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdminPage from "@/app/admin/page";
import { renderAdmin } from "./adminTestUtils";
import {
  orderItemsFromBooking,
  parseOrderItems,
  rebuildOrder,
  type CatalogEntry,
} from "@/lib/orderEdit";

const KATALOG: CatalogEntry[] = [
  { id: "party", name: "Lille højtalerpakke", price: 595, kind: "speaker", size: '2× 10" Alto' },
  { id: "festival", name: "Stor højtalerpakke", price: 995, kind: "speaker", size: '2× 12" EV' },
  { id: "mikrofon", name: "Trådløs mikrofon", price: 295, kind: "addon" },
  { id: "rog", name: "Røgmaskine", price: 595, kind: "addon" },
  { id: "levering_begge", name: "Levering og afhentning", price: 795, kind: "addon" },
  { id: "pakke_fest_lille", name: "Lille festpakke", price: 890, kind: "rental" },
];

const lookup = (id: string) => KATALOG.find((e) => e.id === id);

describe("Ordren bygges om fra katalogets priser", () => {
  it("første produkt bliver hovedproduktet, resten lægger sig som ekstra varer", () => {
    const { order } = rebuildOrder(
      [{ id: "party", qty: 2 }, { id: "mikrofon", qty: 1 }],
      lookup,
    );
    expect(order.speakerId).toBe("party");
    expect(order.speaker).toBe("Lille højtalerpakke");
    expect(order.speakerSize).toBe('2× 10" Alto');
    // Anden højtaler ligger i kurven — samme model som en kundebooking
    expect(order.cartItems).toEqual([{ name: "Lille højtalerpakke", price: 595, productId: "party" }]);
    expect(order.addons).toEqual(["Trådløs mikrofon"]);
    expect(order.addonIds).toEqual(["mikrofon"]);
    expect(order.total).toBe(595 * 2 + 295);
  });

  it("regner rabatkoden med, så en rettet ordre ikke mister kundens rabat", () => {
    const { order } = rebuildOrder([{ id: "festival", qty: 1 }], lookup, { discountPct: 10 });
    expect(order.subtotal).toBe(995);
    expect(order.total).toBe(896); // 995 − 10 %
  });

  it("en aftalt pris slår katalogets sum — men kun når den er sat bevidst", () => {
    const aftalt = rebuildOrder([{ id: "festival", qty: 1 }], lookup, { manualTotal: 800 });
    expect(aftalt.order.subtotal).toBe(995);
    expect(aftalt.order.total).toBe(800);

    const uden = rebuildOrder([{ id: "festival", qty: 1 }], lookup, { manualTotal: null });
    expect(uden.order.total).toBe(995);
  });

  it("ukendte id'er bliver ikke til linjer — de kommer retur som fejl", () => {
    const { order, ukendte } = rebuildOrder([{ id: "findes_ikke", qty: 1 }, { id: "rog", qty: 1 }], lookup);
    expect(ukendte).toEqual(["findes_ikke"]);
    expect(order.addons).toEqual(["Røgmaskine"]);
    expect(order.total).toBe(595);
  });

  it("en ordre uden højtaler markeres som 'kun effekter'", () => {
    const { order } = rebuildOrder([{ id: "rog", qty: 1 }], lookup);
    expect(order.speakerId).toBe("effects-only");
    expect(order.total).toBe(595);
  });

  it("linjer uden produkt-id beholder deres egen pris", () => {
    const { order } = rebuildOrder([{ id: "party", qty: 1 }], lookup, {
      legacy: [
        { label: "Gammel discokugle", price: 150, kind: "kurv" },
        { label: "Ekstra kabel", kind: "tilvalg" },
      ],
    });
    expect(order.cartItems).toContainEqual({ name: "Gammel discokugle", price: 150 });
    expect(order.addons).toContain("Ekstra kabel");
    // Tilvalget uden pris tæller 0 — vi opfinder ikke et beløb
    expect(order.total).toBe(595 + 150);
  });
});

describe("Varelinjer fra klienten valideres", () => {
  it("lægger dubletter sammen i stedet for at lave to ens linjer", () => {
    const parsed = parseOrderItems([{ id: "rog", qty: 1 }, { id: "rog", qty: 2 }]);
    expect("items" in parsed && parsed.items).toEqual([{ id: "rog", qty: 3 }]);
  });

  it("afviser antal der ikke er et helt tal mellem 1 og 20", () => {
    expect("error" in parseOrderItems([{ id: "rog", qty: 0 }])).toBe(true);
    expect("error" in parseOrderItems([{ id: "rog", qty: 2.5 }])).toBe(true);
    expect("error" in parseOrderItems([{ id: "rog", qty: 99 }])).toBe(true);
    expect("error" in parseOrderItems([{ id: "", qty: 1 }])).toBe(true);
    expect("error" in parseOrderItems("ikke en liste")).toBe(true);
  });
});

describe("En eksisterende ordre kan læses ind til redigering", () => {
  it("kender sine katalogvarer igen — også kørslen", () => {
    const { items, legacy } = orderItemsFromBooking(
      {
        speaker: "Lille højtalerpakke",
        speakerId: "party",
        speakerSize: '2× 10" Alto',
        cartItems: [{ name: "Lille festpakke", price: 890, productId: "pakke_fest_lille" }],
        addons: ["Trådløs mikrofon", "Levering og afhentning"],
        addonIds: ["mikrofon", "levering_begge"],
      },
      lookup,
    );
    expect(items).toEqual([
      { id: "party", qty: 1 },
      { id: "pakke_fest_lille", qty: 1 },
      { id: "mikrofon", qty: 1 },
      { id: "levering_begge", qty: 1 },
    ]);
    expect(legacy).toEqual([]);
  });

  it("holder fast i linjer fra bookinger uden produkt-id", () => {
    const { items, legacy } = orderItemsFromBooking(
      {
        speaker: "Lille højtalerpakke",
        speakerId: "party",
        cartItems: [{ name: "Højtaler vi ikke har mere", price: 400 }],
        addons: ["Levering (aftalt i telefonen)"],
        addonIds: [],
      },
      lookup,
    );
    expect(items).toEqual([{ id: "party", qty: 1 }]);
    expect(legacy).toEqual([
      { label: "Højtaler vi ikke har mere", price: 400, kind: "kurv" },
      { label: "Levering (aftalt i telefonen)", kind: "tilvalg" },
    ]);
  });
});

/* ───── Admin: modalen ───── */

const booking = {
  id: "booking_1755000000000_abc123",
  speaker: "Lille højtalerpakke",
  speakerId: "party",
  speakerSize: '2× 10" Alto',
  period: "Fre 21. aug → Man 24. aug (3 dage)",
  pickup: new Date(Date.now() + 86400000).toISOString(),
  returnDate: new Date(Date.now() + 4 * 86400000).toISOString(),
  days: 3,
  addons: [],
  addonIds: [],
  total: 595,
  name: "Julie Blegvad",
  email: "julie@eksempel.dk",
  phone: "22245880",
  comment: "",
  status: "bekraeftet",
  createdAt: new Date().toISOString(),
};

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

function mockMobile(mobile: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: mobile, media: q, addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false,
  })) as never;
}

function mockApi(bookings: unknown[]) {
  (global.fetch as unknown as { mockImplementation: (f: unknown) => void }).mockImplementation((url: string) =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve(
          String(url).startsWith("/api/products")
            ? { speakers: null, addons: null, rentalProducts: null }
            : String(url).startsWith("/api/bookings-update")
              ? { ok: true, booking: { ...bookings[0] as object } }
              : { bookings },
        ),
    }),
  );
}

/** Kroppen af det sidste kald til bookings-update */
function sidsteOpdatering() {
  const kald = (global.fetch as unknown as { mock: { calls: unknown[][] } }).mock.calls
    .filter((c) => String(c[0]).startsWith("/api/bookings-update"));
  return JSON.parse((kald[kald.length - 1][1] as { body: string }).body);
}

async function aabnRetOrdre() {
  renderAdmin(<AdminPage />);
  await waitFor(() => expect(screen.getByText("Julie Blegvad")).toBeInTheDocument());
  fireEvent.click(screen.getByText("Julie Blegvad").closest('[role="button"]')!);
  fireEvent.click(screen.getByText("✏️ Ret ordre"));
  await waitFor(() => expect(screen.getByLabelText("Email")).toBeInTheDocument());
}

beforeEach(() => {
  vi.clearAllMocks();
  mockStorage();
  mockMobile(true);
});

describe("Ret ordre i admin", () => {
  it("sender rettede kundeoplysninger som edit_order — ikke som ny status", async () => {
    mockApi([booking]);
    await aabnRetOrdre();

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "julie@ny-mail.dk" } });
    fireEvent.change(screen.getByLabelText("Telefon"), { target: { value: "31 13 28 52" } });
    fireEvent.click(screen.getByText("Gem ændringer"));

    await waitFor(() => {
      const body = sidsteOpdatering();
      expect(body.action).toBe("edit_order");
      expect(body.contact.email).toBe("julie@ny-mail.dk");
      expect(body.contact.phone).toBe("31 13 28 52");
      expect(body.status).toBeUndefined();
    });
  });

  it("lægger et produkt på ordren og sender kun id og antal — aldrig et beløb", async () => {
    mockApi([booking]);
    await aabnRetOrdre();

    fireEvent.change(screen.getByLabelText("Tilføj vare"), { target: { value: "Trådløs mikrofon" } });
    // Kataloget har både et tilvalg og et udlejningsprodukt med samme navn —
    // her vælges tilvalget, som er det bookingerne bruger
    const traef = await screen.findAllByRole("button", { name: /Trådløs mikrofon/ });
    fireEvent.click(traef.find((b) => b.textContent?.includes("tilvalg"))!);

    // Modalen viser hvad ordren lander på, før der gemmes
    await waitFor(() => expect(screen.getAllByText("890 kr").length).toBeGreaterThan(0));

    fireEvent.click(screen.getByText("Gem ændringer"));
    await waitFor(() => {
      const body = sidsteOpdatering();
      expect(body.items).toEqual([{ id: "party", qty: 1 }, { id: "mikrofon", qty: 1 }]);
      expect(JSON.stringify(body.items)).not.toContain("price");
      expect(body.notify).toBe(false);
    });
  });

  it("kan fjerne en vare fra ordren", async () => {
    mockApi([{ ...booking, addons: ["Røgmaskine"], addonIds: ["rog"], total: 1190 }]);
    await aabnRetOrdre();

    fireEvent.click(screen.getByLabelText("Fjern Røgmaskine"));
    fireEvent.click(screen.getByText("Gem ændringer"));

    await waitFor(() => {
      expect(sidsteOpdatering().items).toEqual([{ id: "party", qty: 1 }]);
    });
  });

  it("spørger ikke kunden om noget, medmindre hakket er sat", async () => {
    mockApi([booking]);
    await aabnRetOrdre();

    fireEvent.click(screen.getByText("Send den rettede aftale til kunden på mail").closest("label")!.querySelector("input")!);
    fireEvent.click(screen.getByText("Gem ændringer"));

    await waitFor(() => expect(sidsteOpdatering().notify).toBe(true));
  });
});

/* ───── Serveren: kilde-niveau, funktionen kræver KV for at køre ───── */

describe("action=edit_order i /api/bookings-update", () => {
  const src = readFileSync(join(process.cwd(), "functions/api/bookings-update.ts"), "utf8");

  it("kræver admin-login som resten af endpointet", () => {
    expect(src).toContain("requireAdmin");
  });

  it("henter priserne i kataloget og bygger ordren om der", () => {
    expect(src).toContain("loadPriceTable(context.env.BOOKINGS)");
    expect(src).toContain("rebuildOrder(parsed.items");
    // Beløbet må aldrig komme fra det klienten sendte med linjerne
    expect(src).not.toMatch(/body\.items[\s\S]{0,200}\.price/);
  });

  it("afviser produkter der ikke findes i kataloget", () => {
    expect(src).toContain("Findes ikke i kataloget");
  });

  it("holder kørsel, faktura og ledighed i sync med de nye varer", () => {
    expect(src).toContain("booking.deliveryOptionId = kørsel ?? null");
    expect(src).toContain("booking.invoice.amount = order.total");
    expect(src).toContain("if (varerRettet) await nulstilBookingIndex");
  });

  it("skriver hvem der rettede hvad", () => {
    expect(src).toContain("booking.orderLog");
    expect(src).toContain("by: updatedBy");
  });

  it("sender kun mail til kunden når admin har bedt om det", () => {
    expect(src).toMatch(/if \(body\.notify\)/);
    expect(src).toContain("{ force: true }");
  });
});
