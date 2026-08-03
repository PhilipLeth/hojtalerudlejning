/**
 * Stripe webhook: markerer bookinger som betalt ved checkout.session.completed.
 * Signaturen verificeres ALTID (constructEventAsync — Workers-runtime kræver
 * async WebCrypto).
 */
import Stripe from "stripe";

interface Env {
  BOOKINGS: KVNamespace;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const sig = context.request.headers.get("stripe-signature");
  if (!sig || !context.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing signature", { status: 400 });
  }

  const stripe = new Stripe(context.env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  const payload = await context.request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      sig,
      context.env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (e) {
    console.error("[stripe] webhook signature verification failed:", e);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (bookingId && bookingId.startsWith("booking_")) {
      const raw = await context.env.BOOKINGS.get(bookingId);
      if (raw) {
        try {
          const booking = JSON.parse(raw);
          booking.paid = true;
          booking.paymentMethod = "stripe";
          booking.stripeSessionId = session.id;
          booking.stripePaymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
          booking.paidAmount = session.amount_total;
          booking.paidAt = new Date(event.created * 1000).toISOString();
          await context.env.BOOKINGS.put(bookingId, JSON.stringify(booking));
          console.log("[stripe] booking marked paid:", bookingId, session.amount_total);
        } catch (e) {
          console.error("[stripe] could not update booking:", bookingId, e);
        }
      } else {
        console.error("[stripe] booking not found for paid session:", bookingId);
      }
    }
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.error("[stripe] async payment failed for booking:", session.metadata?.bookingId);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
