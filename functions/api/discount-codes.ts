/* ───── Rabatkoder (admin) ─────
 *
 * GET  → alle koder (standard + egne) med status og antal gange brugt.
 * POST → gemmer det egne kode-map i KV. Standardkoderne kan ikke slettes,
 *        men kan slås fra (0) eller få en anden procent via samme map.
 */
import { DEFAULT_CODES, listCodes, normalizeCode } from "./_lib/discounts";
import { loadBookings } from "./_lib/bookings";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

function unauthorized(context: { request: Request; env: Env }): Response | null {
  const secret = new URL(context.request.url).searchParams.get("secret");
  if (!context.env.ADMIN_SECRET || secret !== context.env.ADMIN_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const denied = unauthorized(context);
  if (denied) return denied;

  try {
    const [codes, bookings] = await Promise.all([
      listCodes(context.env.BOOKINGS),
      loadBookings(context.env.BOOKINGS),
    ]);

    // Hvor mange bookinger har brugt hver kode?
    const usage: Record<string, number> = {};
    for (const b of bookings) {
      if (b.discount?.code) usage[b.discount.code] = (usage[b.discount.code] ?? 0) + 1;
    }

    return json({ codes, usage, defaults: DEFAULT_CODES });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Ukendt fejl" }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const denied = unauthorized(context);
  if (denied) return denied;

  let body: { codes?: Record<string, number> };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }
  if (!body.codes || typeof body.codes !== "object" || Array.isArray(body.codes)) {
    return json({ error: "codes skal være et objekt: { kode: procent }" }, 400);
  }

  // Normalisér og validér alt før noget gemmes — enten gemmes hele mappet
  // eller intet af det.
  const clean: Record<string, number> = {};
  for (const [rawCode, rawPct] of Object.entries(body.codes)) {
    const code = normalizeCode(rawCode);
    if (!code || !/^[a-z0-9-]{2,30}$/.test(code)) {
      return json({ error: `Ugyldig kode: "${rawCode}" — brug 2-30 tegn, bogstaver/tal/bindestreg` }, 400);
    }
    const pct = Number(rawPct);
    // 0 = slået fra er tilladt; ellers 1-99
    if (!Number.isFinite(pct) || pct < 0 || pct > 99) {
      return json({ error: `Ugyldig procent for "${code}": ${rawPct} — brug 0 (slået fra) eller 1-99` }, 400);
    }
    if (clean[code] !== undefined) {
      return json({ error: `Koden "${code}" optræder to gange (æ/ø normaliseres — "genkøb" og "genkoeb" er samme kode)` }, 400);
    }
    clean[code] = Math.round(pct);
  }

  // Fjern rene dubletter af standardkoder (samme procent = intet override)
  for (const [code, pct] of Object.entries(clean)) {
    if (DEFAULT_CODES[code] === pct) delete clean[code];
  }

  await context.env.BOOKINGS.put("discount_codes", JSON.stringify(clean));
  const codes = await listCodes(context.env.BOOKINGS);
  return json({ ok: true, codes });
};
