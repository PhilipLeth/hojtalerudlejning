/** Public: status på en Checkout Session — bruges af /book/tak-siden. */
import Stripe from "stripe";

interface Env {
  STRIPE_SECRET_KEY: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const sessionId = url.searchParams.get("session_id") ?? "";
  if (!sessionId.startsWith("cs_")) {
    return new Response(JSON.stringify({ error: "Invalid session id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(context.env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return new Response(
      JSON.stringify({
        status: session.status,
        paymentStatus: session.payment_status,
        amount: session.amount_total,
        bookingId: session.metadata?.bookingId ?? null,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Session not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
};
