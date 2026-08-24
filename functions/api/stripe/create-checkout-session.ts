/**
 * Opret Stripe Checkout Session (ui_mode: embedded) til online-betaling af en booking.
 * Beløb beregnes altid server-side ud fra kataloget — klienten sender kun produkt-id'er.
 */
import Stripe from "stripe";
import {
  loadPriceTable,
  buildLineItems,
  afterHoursLegs,
  afterHoursLineItems,
  type LineItemInput,
} from "../_lib/pricing";
import { resolveDiscountFor, discountOre } from "../_lib/discounts";
import { loadSiteSettings } from "../_lib/siteSettings";

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
  discountCode?: string;
  /** Lejeperioden — weekendudsalgets kode gælder kun bestemte datoer */
  pickup?: string;
  returnDate?: string;
  /**
   * Lejeperioden som kalenderdage ("YYYY-MM-DD"). Sendes ved siden af pickup,
   * fordi pickup er et tidspunkt: klientens lokale midnat bliver til 22:00 dagen
   * før i UTC, og et .slice(0,10) på den ramte derfor den forkerte dag hele
   * sommeren.
   */
  pickupDay?: string;
  returnDay?: string;
  /** Hvornår kunden vil mødes: open | early | late | unknown */
  pickupSlot?: string;
  returnSlot?: string;
}

const ISO_DAG = /^\d{4}-\d{2}-\d{2}$/;

/** Kalenderdagen: klientens egen dato, ellers det bedste vi kan læse ud af tidspunktet */
function dagAf(day: string | undefined, iso: string | undefined): string {
  const d = String(day ?? "");
  return ISO_DAG.test(d) ? d : String(iso ?? "").slice(0, 10);
}

/**
 * Stripe-kupon for en procentsats, oprettet idempotent med deterministisk id
 * (RABAT10, RABAT20, …), så checkout viser en synlig rabatlinje frem for
 * stiltiende lavere stykpriser.
 */
async function getOrCreateCoupon(stripe: Stripe, pct: number): Promise<string> {
  const id = `RABAT${pct}`;
  try {
    await stripe.coupons.retrieve(id);
    return id;
  } catch {
    // findes ikke — opret. Taber vi et kapløb med en anden request, findes
    // den nu, og det er lige så godt.
    try {
      await stripe.coupons.create({ id, percent_off: pct, duration: "once", name: `Rabat ${pct}%` });
    } catch {
      await stripe.coupons.retrieve(id);
    }
    return id;
  }
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

  // Vil kunden hente eller aflevere uden for åbningstid, koster turen et gebyr.
  // Beløbet slås op i åbningstiderne fra /admin/indstillinger — klienten sender
  // kun hvilket tidsrum der blev valgt, aldrig et beløb.
  try {
    const { hours } = await loadSiteSettings(context.env.BOOKINGS);
    const legs = afterHoursLegs(
      hours,
      {
        pickup: dagAf(body.pickupDay, body.pickup),
        returnDate: dagAf(body.returnDay, body.returnDate),
        pickupSlot: body.pickupSlot,
        returnSlot: body.returnSlot,
        productIds: body.items.map((i) => String(i?.id ?? "")).filter(Boolean),
      },
      body.locale === "en" ? "en" : "da",
    );
    const ekstra = afterHoursLineItems(legs);
    lineItems = [...lineItems, ...ekstra.lineItems];
    totalOre += ekstra.totalOre;
  } catch (e) {
    // Et gebyr må aldrig spærre for betalingen — så mangler linjen, og vi
    // opkræver den ved afhentningen i stedet
    console.error("[stripe] gebyr uden for åbningstid kunne ikke beregnes:", e);
  }

  const stripe = new Stripe(context.env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  // Rabatkode valideres server-side — en ukendt kode ignoreres frem for at
  // fejle, så en tastefejl aldrig blokerer en betaling.
  //
  // Bookingen er allerede gemt på dette tidspunkt, så den holdes ude af sin
  // egen ledighedsberegning: ellers ville ordren gøre sit eget udstyr udsolgt
  // og afvise den rabat, kunden lige fik godkendt.
  let discount: { code: string; pct: number } | null = null;
  if (body.discountCode) {
    const pickup = dagAf(body.pickupDay, body.pickup);
    const returnDate = dagAf(body.returnDay, body.returnDate);
    const isDate = (s: string) => ISO_DAG.test(s);
    const ctx =
      isDate(pickup) && isDate(returnDate)
        ? { pickup, returnDate, productIds: body.items.map((i) => String(i?.id ?? "")).filter(Boolean) }
        : null;
    discount = await resolveDiscountFor(context.env.BOOKINGS, body.discountCode, ctx, body.bookingId);
  }

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
      ...(discount ? { discounts: [{ coupon: await getOrCreateCoupon(stripe, discount.pct) }] } : {}),
      metadata: {
        bookingId: body.bookingId ?? "",
        source: "lejhojtaler-booking",
        ...(discount ? { discountCode: discount.code, discountPct: String(discount.pct) } : {}),
      },
      // Dynamic payment methods: payment_method_types udelades bevidst —
      // kort/MobilePay styres i Stripe-dashboardet.
      integration_identifier: `lejhojtaler-booking-${suffix}`,
    } as Stripe.Checkout.SessionCreateParams);

    return json({
      clientSecret: session.client_secret,
      sessionId: session.id,
      amount: discount ? totalOre - discountOre(totalOre, discount.pct) : totalOre,
      ...(discount ? { discount } : {}),
    });
  } catch (e) {
    console.error("[stripe] session create failed:", e);
    return json({ error: "Could not start payment" }, 502);
  }
};
