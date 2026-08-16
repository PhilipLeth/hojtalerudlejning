/**
 * GET /api/ads-spend?from=&to=&secret=  — annonceforbrug pr. kampagne.
 *
 * Ligger for sig og ikke inde i /api/accounting, fordi det kalder ud til
 * Google: regnskabstallene skal ikke vente på — eller falde med — Google Ads.
 * Siden henter begge dele parallelt og viser forbruget når det kommer.
 */
import { campaignSpend, AdsNotConfigured, AdsApiError, type GoogleAdsEnv } from "./_lib/googleads";

interface Env extends GoogleAdsEnv {
  ADMIN_SECRET: string;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  if (!context.env.ADMIN_SECRET || url.searchParams.get("secret") !== context.env.ADMIN_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }

  const today = new Date().toISOString().slice(0, 10);
  const from = url.searchParams.get("from") || `${today.slice(0, 7)}-01`;
  const to = url.searchParams.get("to") || today;
  if (!isIsoDate(from) || !isIsoDate(to)) return json({ error: "from/to skal være YYYY-MM-DD" }, 400);
  if (to < from) return json({ error: "to skal være >= from" }, 400);

  try {
    const report = await campaignSpend(context.env, from, to);
    console.log("[ads-spend]", from, "→", to, "forbrug=", report.cost, report.currency);
    return json(report);
  } catch (e) {
    if (e instanceof AdsNotConfigured) {
      return json({ error: e.message, configured: false }, 503);
    }
    if (e instanceof AdsApiError) {
      console.error("[ads-spend] google-fejl:", e.message);
      return json({ error: e.message }, 502);
    }
    console.error("[ads-spend] error:", e);
    return json({ error: "Kunne ikke hente annonceforbrug" }, 500);
  }
};
