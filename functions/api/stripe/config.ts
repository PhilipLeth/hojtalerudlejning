/** Public: publishable key til frontend (så nøgleskift ikke kræver rebuild). */
interface Env {
  STRIPE_PUBLISHABLE_KEY: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const key = context.env.STRIPE_PUBLISHABLE_KEY ?? "";
  if (!key.startsWith("pk_")) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ publishableKey: key }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
  });
};
