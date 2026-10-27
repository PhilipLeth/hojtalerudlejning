// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { onRequestPost as book } from "../../functions/api/book";
import { onRequestPost as checkout } from "../../functions/api/stripe/create-checkout-session";
import { onRequestGet as settings } from "../../functions/api/site-settings";

const stripe = vi.hoisted(() => ({ create: vi.fn(), coupon: vi.fn() }));
vi.mock("stripe", () => ({ default: class {
  static createFetchHttpClient() { return {}; }
  checkout = { sessions: { create: stripe.create } };
  coupons = { retrieve: stripe.coupon, create: stripe.coupon };
} }));

function kv() {
  const data = new Map<string, string>();
  return { data, get: vi.fn(async (key: string) => data.get(key) ?? null), put: vi.fn(async (key: string, value: string) => { data.set(key, value); }), list: vi.fn(async () => ({ keys: [], list_complete: true })) };
}
const order = { speaker: "Stor højtalerpakke", speakerId: "festival", speakerSize: "", period: "29. okt – 2. nov", days: 4, pickupDay: "2026-10-29", returnDay: "2026-11-02", addons: [], addonIds: [], cartItems: [], total: 1, name: "Demo", email: "demo@example.com", phone: "12345678", comment: "", paymentChoice: "pickup" };
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
  vi.stubGlobal("caches", { default: { delete: vi.fn(async () => true) } });
  stripe.create.mockResolvedValue({ id: "cs_test_demo", client_secret: "demo_secret" });
  stripe.coupon.mockResolvedValue({ id: "coupon" });
});

describe("Booking og betaling bruger samme regler", () => {
  async function bookOrder(body = order, store = kv()) {
    const response = await book({ request: new Request("https://local/api/book", { method: "POST", body: JSON.stringify(body) }), env: { BOOKINGS: store, RESEND_API_KEY: "test", NOTIFY_EMAIL: "demo@example.com" }, waitUntil: () => {} } as any);
    return { response, store };
  }
  async function pay(body: object, store = kv()) {
    return checkout({ request: new Request("https://local/api/stripe/create-checkout-session", { method: "POST", body: JSON.stringify(body) }), env: { BOOKINGS: store, STRIPE_SECRET_KEY: "sk_test_demo" } } as any);
  }
  it("afviser selvafhentning under 500 før mail og lagring, selv med falsk høj total", async () => {
    const { response, store } = await bookOrder({ ...order, speakerId: "party", total: 9999 });
    expect(response.status).toBe(400);
    expect(await response.text()).toContain("500 kr");
    expect(store.put).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("tager ikke deliveryOptionId som bevis på betalt levering", async () => {
    const { response } = await bookOrder({ ...order, speakerId: "party", deliveryOptionId: "levering_begge" } as any);
    expect(response.status).toBe(400);
  });
  it("gemmer 595 + 200 fra serverpriser og sender gebyret i kvitteringen", async () => {
    const { response, store } = await bookOrder({ ...order, pickupDay: "2026-10-30" });
    expect(response.status).toBe(200);
    const result = await response.json() as any;
    const saved = JSON.parse(store.data.get(result.bookingId)!);
    expect(saved.total).toBe(795);
    expect(saved.outsideHoursFee).toBe(200);
    expect(saved.pickupTime).toContain("tidspunkt aftales");
    expect((fetch as any).mock.calls.some(([, init]: any[]) => init?.body?.includes("Andre ind-/udleveringstider"))).toBe(true);
    const payment = await pay({ items: [{ id: "festival" }], bookingId: result.bookingId, pickupDay: "2026-10-30", returnDay: "2026-11-02" }, store);
    expect(payment.status).toBe(200);
    expect((await payment.json() as any).amount).toBe(79500);
    expect(stripe.create.mock.calls[0][0].line_items.at(-1).price_data.unit_amount).toBe(20000);
  });
  it.each([
    ["2026-10-29", "2026-11-02", 0],
    ["2026-10-30", "2026-11-01", 400],
  ])("gemmer og opkræver gebyr %s til %s: %s kr", async (pickupDay, returnDay, fee) => {
    const { response, store } = await bookOrder({ ...order, pickupDay, returnDay });
    expect(response.status).toBe(200);
    const { bookingId } = await response.json() as any;
    const saved = JSON.parse(store.data.get(bookingId)!);
    expect(saved.outsideHoursFee).toBe(fee);
    expect(saved.total).toBe(595 + fee);
    if (fee === 0) {
      expect(saved.pickupTime).toBe("kl. 17");
      expect(saved.returnTime).toBe("kl. 17");
    }
    const payment = await pay({ items: [{ id: "festival" }], bookingId, pickupDay, returnDay }, store);
    expect(payment.status).toBe(200);
    expect((await payment.json() as any).amount).toBe((595 + fee) * 100);
  });
  it("afviser at fjerne et gebyr efter bookingen er gemt", async () => {
    const { response, store } = await bookOrder({ ...order, pickupDay: "2026-10-30" });
    const result = await response.json() as any;
    const payment = await pay({ items: [{ id: "festival" }], bookingId: result.bookingId, pickupDay: "2026-10-29", returnDay: "2026-11-02" }, store);
    expect(payment.status).toBe(400);
    expect(stripe.create).not.toHaveBeenCalled();
  });
  it("giver rabat på varerne og beholder hele aftalegebyret", async () => {
    const { response, store } = await bookOrder({ ...order, pickupDay: "2026-10-30", discountCode: "genkoeb" } as any);
    expect(response.status).toBe(200);
    const result = await response.json() as any;
    expect(JSON.parse(store.data.get(result.bookingId)!).total).toBe(735.5);
    const payment = await pay({ items: [{ id: "festival" }], bookingId: result.bookingId, pickupDay: "2026-10-30", returnDay: "2026-11-02", discountCode: "genkoeb" }, store);
    expect(payment.status).toBe(200);
    expect((await payment.json() as any).amount).toBe(73550);
    expect(stripe.coupon).toHaveBeenCalledWith("RABAT10_5950");
    expect(stripe.create.mock.calls[0][0].line_items.at(-1).price_data.unit_amount).toBe(20000);
  });
  it("regner minimum efter rabat, uden at gebyret kan opfylde minimum", async () => {
    const { response, store } = await bookOrder({ ...order, pickupDay: "2026-10-30", discountCode: "venner" } as any);
    expect(response.status).toBe(400);
    expect(store.put).not.toHaveBeenCalled();
    const payment = await pay({ items: [{ id: "festival" }], pickupDay: "2026-10-30", returnDay: "2026-11-02", discountCode: "venner" });
    expect(payment.status).toBe(400);
    expect(stripe.create).not.toHaveBeenCalled();
  });
  it("Stripe afviser minimum og ugyldige datoer inden betalingskald", async () => {
    expect((await pay({ items: [{ id: "party" }], pickupDay: "2026-10-29", returnDay: "2026-11-02" })).status).toBe(400);
    expect((await pay({ items: [{ id: "festival" }] })).status).toBe(400);
    expect(stripe.create).not.toHaveBeenCalled();
  });
  it("billig vare med betalt levering er tilladt", async () => {
    const result = await pay({ items: [{ id: "party" }, { id: "levering_begge" }], pickupDay: "2026-10-30", returnDay: "2026-11-01" });
    expect(result.status).toBe(200);
    expect(stripe.create.mock.calls[0][0].line_items).toHaveLength(2);
  });
  it("det offentlige endpoint migrerer også gemte gamle tider", async () => {
    const store = kv();
    store.data.set("site_settings", JSON.stringify({ pickupAddress: "Pelican", hours: { onlyOpenDays: true } }));
    const response = await settings({ env: { BOOKINGS: store } } as any);
    const result = await response.json() as any;
    expect(result.pickupAddress).toBe("Njalsgade 40, 2300 København");
    expect(result.company.street).toBe("Njalsgade 40");
    expect(result.hours.days.mon.open).toBe("17:00");
    expect(result.hours.onlyOpenDays).toBe(false);
  });
});
