/* ───── SMS (admin) ─────
 *
 * GET  → er gatewayen sat op, hvad står saldoen på, og hvilke skabeloner gælder
 * POST → gem indstillinger (save), send en testbesked (test), eller send til
 *        kunden på en ordre (send)
 *
 * Beløb og adresser hentes aldrig fra klienten: teksten til en kunde bygges af
 * skabelonen i KV, og admin kan kun rette den tekst, der faktisk sendes.
 */

import { requireAdmin } from "./_lib/adminAuth";
import {
  recordSms,
  saveSmsSettings,
  sendBookingSms,
  smsConfigured,
  smsContext,
  smsErrorText,
  type SmsEnv,
} from "./_lib/sms";
import { SMS_PROVIDERS, resolveProvider, smsBalance, smsLength, toE164Dk } from "../../src/lib/sms";
import { isSmsType, parseSmsSettings, SMS_TYPES } from "../../src/lib/smsTemplates";

interface Env extends SmsEnv {
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

/** Max tre beskeder i én sending — længere er næsten altid en fejl */
const MAX_TEXT = 480;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  const ctx = await smsContext(context.env);

  return json({
    configured: smsConfigured(context.env),
    devMode: !!context.env.SMS_DEV_MODE,
    /** Hvilken udbyder nøglerne peger på — null når der ingen er */
    provider: resolveProvider(context.env),
    providers: SMS_PROVIDERS,
    settings: ctx.settings,
    types: SMS_TYPES,
    // Samme værdier serveren fylder i beskederne, så admins forhåndsvisning og
    // manuelle beskeder viser det rigtige nummer og det rigtige anmeldelseslink
    telefon: ctx.telefon,
    link: ctx.link,
    // Saldoen må ikke kunne blokere siden — null betyder "kunne ikke hentes"
    balance: await smsBalance(context.env),
  });
};

interface PostBody {
  action?: string;
  settings?: unknown;
  /** test: nummeret der skal modtage testbeskeden */
  phone?: unknown;
  text?: unknown;
  /** send: ordren beskeden hører til */
  bookingId?: unknown;
  type?: unknown;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  let body: PostBody;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  const kv = context.env.BOOKINGS;

  // ── Gem skabeloner og afsendernavn
  if (body.action === "save") {
    const settings = parseSmsSettings(body.settings);
    await saveSmsSettings(kv, settings);
    console.log("[sms] indstillinger gemt af", auth.name);
    return json({ ok: true, settings });
  }

  // ── Testbesked til et nummer man selv skriver
  if (body.action === "test") {
    if (!smsConfigured(context.env)) {
      return json({ error: "Ingen SMS-udbyder er sat op i Cloudflare — der kan ikke sendes endnu" }, 503);
    }
    const to = toE164Dk(body.phone);
    if (!to) {
      return json({ error: "Ugyldigt nummer. Skriv fx 31 13 28 52 eller +45 31132852" }, 400);
    }
    const text =
      (typeof body.text === "string" && body.text.trim().slice(0, MAX_TEXT)) ||
      "Test fra Lejhojtaler.dk - SMS virker.";

    const ctx = await smsContext(context.env);
    const outcome = await sendBookingSms(
      context.env,
      { phone: to, name: auth.name },
      "manuel",
      { force: true, text, ctx },
    );
    if (!outcome.ok) {
      return json({ error: smsErrorText(outcome.error || outcome.skipped) }, 502);
    }
    console.log("[sms] testbesked sendt til", to, "af", auth.name);
    return json({ ok: true, to, text, length: smsLength(text) });
  }

  // ── Send til kunden på en ordre
  if (body.action === "send") {
    const id = String(body.bookingId ?? "");
    if (!id.startsWith("booking_")) return json({ error: "Ugyldigt booking-id" }, 400);

    const raw = await kv.get(id);
    if (!raw) return json({ error: "Bookingen findes ikke" }, 404);
    const booking = JSON.parse(raw) as Record<string, unknown>;

    const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_TEXT) : "";
    const type = isSmsType(body.type) ? body.type : "manuel";
    if (!text && type === "manuel") return json({ error: "Beskeden er tom" }, 400);

    if (!smsConfigured(context.env)) {
      return json({ error: "Ingen SMS-udbyder er sat op i Cloudflare — der kan ikke sendes endnu" }, 503);
    }

    // force: admin har trykket på knappen, så typens automatik er irrelevant
    const outcome = await sendBookingSms(context.env, booking, type, { force: true, text: text || undefined });
    if (!outcome.ok) {
      return json({ error: smsErrorText(outcome.error || outcome.skipped), skipped: outcome.skipped }, 502);
    }

    recordSms(booking, outcome);
    booking.updatedAt = new Date().toISOString();
    booking.updatedBy = auth.name;
    await kv.put(id, JSON.stringify(booking));

    console.log("[sms]", type, "sendt til", outcome.to, "på", id, "af", auth.name);
    return json({ ok: true, to: outcome.to, text: outcome.text, booking });
  }

  return json({ error: "Ukendt action" }, 400);
};
