/**
 * Opret Stripe Checkout Session (ui_mode: embedded) til online-betaling af en booking.
 * Beløb beregnes altid server-side ud fra kataloget — klienten sender kun produkt-id'er.
 */
import Stripe from "stripe";
import { loadPriceTable, buildLineItems, type LineItemInput } from "../_lib/pricing";

interface Env {
  BOOKINGS: KVNamespace;
  STRIPE_SECRET_KEY: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

interface Body {
  items: LineItemInput[];
  bookingId?: string;
  locale?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!context.env.STRIPE_SECRET_KEY?.startsWith("sk_") && !context.env.STRIPE_SECRET_KEY?.startsWith("rk_")) {
    return json({ error: "Stripe not configured" }, 503);
  }

  let body: Body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  let lineItems, totalOre;
  try {
    const table = await loadPriceTable(context.env.BOOKINGS);
    ({ lineItems, totalOre } = buildLineItems(table, body.items));
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Invalid items" }, 400);
  }

  const stripe = new Stripe(context.env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  const origin = new URL(context.request.url).origin;
  const suffix = Array.from({ length: 8 }, () =>
    "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]
  ).join("");

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded_page",
      line_items: lineItems,
      currency: "dkk",
      locale: body.locale === "en" ? "en" : "da",
      return_url: `${origin}/book/tak?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        bookingId: body.bookingId ?? "",
        source: "lejhojtaler-booking",
      },
      // Dynamic payment methods: payment_method_types udelades bevidst —
      // kort/MobilePay styres i Stripe-dashboardet.
      integration_identifier: `lejhojtaler-booking-${suffix}`,
    } as Stripe.Checkout.SessionCreateParams);

    return json({
      clientSecret: session.client_secret,
      sessionId: session.id,
      amount: totalOre,
    });
  } catch (e) {
    console.error("[stripe] session create failed:", e);
    return json({ error: "Could not start payment" }, 502);
  }
};
