/** Offentligt opslag af rabatkode: GET /api/discount?code=venner → { valid, code, pct }.
 *
 * Bevidst altid 200 — en forkert kode er ikke en fejl, bare valid:false.
 * Procenten er kun til visning; ved betaling genberegnes alt server-side.
 */
import { resolveDiscount } from "./_lib/discounts";

interface Env {
  BOOKINGS: KVNamespace;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const code = new URL(context.request.url).searchParams.get("code");
  const discount = await resolveDiscount(context.env.BOOKINGS, code);
  return new Response(
    JSON.stringify(discount ? { valid: true, ...discount } : { valid: false }),
    { status: 200, headers: corsHeaders },
  );
};
