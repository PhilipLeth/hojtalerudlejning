/** Offentligt opslag af rabatkode:
 *   GET /api/discount?code=venner → { valid, code, pct }
 *   GET /api/discount?code=weekend&pickup=…&returnDate=…&products=party,lys
 *
 * Bevidst altid 200 — en forkert kode er ikke en fejl, bare valid:false.
 * Procenten er kun til visning; ved betaling genberegnes alt server-side.
 *
 * Weekendudsalgets kode kræver ordren med (datoer + produkter), fordi den kun
 * gælder udstyr der står tilbage netop den weekend. Uden dem er der intet at
 * validere imod, og koden afvises.
 */
import { resolveDiscountFor } from "./_lib/discounts";
import type { SaleContext } from "./_lib/weekendSale";

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

/** Ordren fra query-parametre. null når den ikke er fuldt oplyst. */
function contextFromQuery(params: URLSearchParams): SaleContext | null {
  const pickup = (params.get("pickup") ?? "").slice(0, 10);
  const returnDate = (params.get("returnDate") ?? "").slice(0, 10);
  const productIds = (params.get("products") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (!isDate(pickup) || !isDate(returnDate) || productIds.length === 0) return null;
  return { pickup, returnDate, productIds };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const params = new URL(context.request.url).searchParams;
  const discount = await resolveDiscountFor(
    context.env.BOOKINGS,
    params.get("code"),
    contextFromQuery(params),
  );
  return new Response(
    JSON.stringify(discount ? { valid: true, ...discount } : { valid: false }),
    { status: 200, headers: corsHeaders },
  );
};
