// @vitest-environment node
/**
 * Stripe-integration: server-side prisberegning, checkout-session (ægte kald
 * mod Stripe testmode) og webhook-signaturverifikation.
 */
import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import { loadPriceTable, buildLineItems } from "../../functions/api/_lib/pricing";
import { onRequestPost as createSession } from "../../functions/api/stripe/create-checkout-session";
import { onRequestGet as stripeConfig } from "../../functions/api/stripe/config";
import { onRequestPost as webhook } from "../../functions/api/stripe/webhook";
import Stripe from "stripe";
import { beforeAll } from "vitest";

// setup.ts mocker fetch globalt — Stripe-kaldene her skal bruge den ægte
beforeAll(() => {
  const real = (globalThis as any).__realFetch;
  if (real) global.fetch = real;
});

function fakeKv(store: Record<string, string> = {}) {
  const map = new Map(Object.entries(store));
  return {
    map,
    get: vi.fn(async (k: string) => map.get(k) ?? null),
    put: vi.fn(async (k: string, v: string) => {
      map.set(k, v);
    }),
  } as any;
}

function devVar(name: string): string | null {
  try {
    const m = fs.readFileSync(".dev.vars", "utf8").match(new RegExp(`^${name}=(.+)$`, "m"));
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

describe("Server-side prisberegning (pricing)", () => {
  it("bruger katalogets priser — party = 595 kr", async () => {
    const table = await loadPriceTable(fakeKv());
    const { lineItems, totalOre } = buildLineItems(table, [{ id: "party" }]);
    expect(totalOre).toBe(59500);
    expect(lineItems[0].price_data.unit_amount).toBe(59500);
    expect(lineItems[0].price_data.currency).toBe("dkk");
  });

  it("festpakke lille = præcis 890 kr", async () => {
    const table = await loadPriceTable(fakeKv());
    expect(buildLineItems(table, [{ id: "pakke_fest_lille" }]).totalOre).toBe(89000);
  });

  it("flere varer summeres korrekt (party + lys + rog)", async () => {
    const table = await loadPriceTable(fakeKv());
    const { totalOre } = buildLineItems(table, [{ id: "party" }, { id: "lys" }, { id: "rog" }]);
    expect(totalOre).toBe((595 + 495 + 595) * 100);
  });

  it("KV-katalog (admin-priser) overskriver defaults", async () => {
    const kv = fakeKv({
      products_catalog: JSON.stringify({
        speakers: [{ id: "party", price: 444, da: { name: "Lille højtalerpakke" } }],
      }),
    });
    const table = await loadPriceTable(kv);
    expect(buildLineItems(table, [{ id: "party" }]).totalOre).toBe(44400);
  });

  it("afviser ukendte produkt-id'er — klienten kan ikke opfinde varer", async () => {
    const table = await loadPriceTable(fakeKv());
    expect(() => buildLineItems(table, [{ id: "hacket-produkt" }])).toThrow(/Unknown product/);
  });

  it("klienten kan ikke sende beløb — kun id'er accepteres", async () => {
    const table = await loadPriceTable(fakeKv());
    const evil = [{ id: "party", price: 1, unitAmount: 1 } as any];
    const { totalOre } = buildLineItems(table, evil);
    expect(totalOre).toBe(59500); // katalogpris — det medsendte beløb ignoreres
  });

  it("afviser tom og absurd lang kurv", async () => {
    const table = await loadPriceTable(fakeKv());
    expect(() => buildLineItems(table, [])).toThrow();
    expect(() => buildLineItems(table, Array(26).fill({ id: "party" }))).toThrow();
  });
});

describe("Stripe config-endpoint", () => {
  it("returnerer publishable key", async () => {
    const res = await stripeConfig({ env: { STRIPE_PUBLISHABLE_KEY: "pk_test_abc" } } as any);
    expect(res.status).toBe(200);
    expect((await res.json()).publishableKey).toBe("pk_test_abc");
  });

  it("503 uden konfigureret nøgle", async () => {
    const res = await stripeConfig({ env: { STRIPE_PUBLISHABLE_KEY: "" } } as any);
    expect(res.status).toBe(503);
  });
});

describe("Checkout Session (ægte Stripe testmode)", () => {
  const sk = devVar("STRIPE_SECRET_KEY");
  it.skipIf(!sk)("opretter session med server-beregnet beløb", async () => {
    const req = new Request("https://lejhojtaler.dk/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: "party" }, { id: "lys" }], bookingId: "booking_test_vitest", locale: "da" }),
    });
    const res = await createSession({ request: req, env: { BOOKINGS: fakeKv(), STRIPE_SECRET_KEY: sk } } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.clientSecret).toMatch(/^cs_test_/);
    expect(body.amount).toBe((595 + 495) * 100);

    // Verificér mod Stripe: sessionens beløb og metadata
    const stripe = new Stripe(sk!);
    const session = await stripe.checkout.sessions.retrieve(body.sessionId);
    expect(session.amount_total).toBe((595 + 495) * 100);
    expect(session.currency).toBe("dkk");
    expect(session.metadata?.bookingId).toBe("booking_test_vitest");
  }, 30000);

  it("400 ved manipulerede/ukendte varer", async () => {
    const req = new Request("https://x.dk/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: "findes-ikke" }] }),
    });
    const res = await createSession({ request: req, env: { BOOKINGS: fakeKv(), STRIPE_SECRET_KEY: "sk_test_x" } } as any);
    expect(res.status).toBe(400);
  });
});

describe("Webhook", () => {
  const whsec = "whsec_test_secret_til_vitest";

  async function signedRequest(payload: object) {
    const body = JSON.stringify(payload);
    const sig = Stripe.webhooks.generateTestHeaderString({ payload: body, secret: whsec });
    return new Request("https://lejhojtaler.dk/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": sig },
      body,
    });
  }

  it("afviser ugyldig signatur (400)", async () => {
    const req = new Request("https://x.dk/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=forkert" },
      body: JSON.stringify({ type: "checkout.session.completed" }),
    });
    const res = await webhook({ request: req, env: { BOOKINGS: fakeKv(), STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: whsec } } as any);
    expect(res.status).toBe(400);
  });

  it("markerer booking som betalt ved checkout.session.completed", async () => {
    const kv = fakeKv({
      booking_123_abc: JSON.stringify({ id: "booking_123_abc", name: "Test", status: "ny" }),
    });
    const event = {
      id: "evt_test",
      type: "checkout.session.completed",
      created: 1700000000,
      data: {
        object: {
          id: "cs_test_123",
          amount_total: 50000,
          payment_intent: "pi_test_123",
          metadata: { bookingId: "booking_123_abc" },
        },
      },
    };
    const res = await webhook({ request: await signedRequest(event), env: { BOOKINGS: kv, STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: whsec } } as any);
    expect(res.status).toBe(200);
    const updated = JSON.parse(kv.map.get("booking_123_abc"));
    expect(updated.paid).toBe(true);
    expect(updated.paidAmount).toBe(50000);
    expect(updated.stripePaymentIntent).toBe("pi_test_123");
  });

  it("rører ikke fremmede KV-nøgler (kun booking_-prefix)", async () => {
    const kv = fakeKv({ inventory: JSON.stringify({ party: 1 }) });
    const event = {
      id: "evt_test2",
      type: "checkout.session.completed",
      created: 1700000000,
      data: { object: { id: "cs_x", amount_total: 1, metadata: { bookingId: "inventory" } } },
    };
    const res = await webhook({ request: await signedRequest(event), env: { BOOKINGS: kv, STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: whsec } } as any);
    expect(res.status).toBe(200);
    expect(JSON.parse(kv.map.get("inventory")).paid).toBeUndefined();
  });
});
