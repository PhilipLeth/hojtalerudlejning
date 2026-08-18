/* ───── Daglige SMS-påmindelser ─────
 *
 * POST /api/sms-paamindelser?secret=…  (også ?dryRun=1)
 *
 * Kaldes én gang om dagen af GitHub Actions (.github/workflows/sms-paamindelser.yml)
 * — Pages Functions har ingen cron. Jobbet bruger sin egen nøgle
 * (SMS_CRON_SECRET) i stedet for admin-adgangskoden: det skal kun kunne sende
 * dagens påmindelser, ikke se kundedata. Kan også trykkes manuelt fra
 * /admin/kommunikation, hvis en dag skal køres om.
 *
 * Hver sendt påmindelse mærkes på ordren (smsSent), så to kørsler samme dag
 * ikke rammer kunden to gange.
 */

import { requireAdmin } from "./_lib/adminAuth";
import {
  recordSms,
  sendBookingSms,
  smsConfigured,
  smsContext,
  smsErrorText,
  type SmsEnv,
} from "./_lib/sms";
import { copenhagenDateKey, remindersDue, type ReminderBooking } from "../../src/lib/smsReminders";
import { smsAutoEnabled } from "../../src/lib/smsTemplates";

interface Env extends SmsEnv {
  ADMIN_SECRET: string;
  /**
   * Egen nøgle til cron-jobbet. Dét job skal kun kunne én ting, så det skal
   * ikke have admin-adgangskoden — den ville give adgang til hele /admin,
   * inklusive kundedata, fra en GitHub-log.
   */
  SMS_CRON_SECRET?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token, X-Cron-Secret",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

/** Alle ordrer, rå — påmindelserne har brug for telefon, status og smsSent */
async function allBookings(kv: KVNamespace): Promise<Array<Record<string, unknown>>> {
  const out: Array<Record<string, unknown>> = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix: "booking_", cursor });
    for (const key of page.keys) {
      const raw = await kv.get(key.name);
      if (!raw) continue;
      try {
        out.push({ ...(JSON.parse(raw) as Record<string, unknown>), id: key.name });
      } catch {
        console.warn("[sms] ulæselig booking:", key.name);
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return out;
}

/** Sammenligning uden at afsløre hvor langt man kom — nøglen må ikke kunne gættes tegn for tegn */
function sameSecret(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // Enten en indlogget admin (knappen i /admin/kommunikation) eller cron-jobbet
  // med sin egen nøgle. Uden nøglen svarer vi som før: 401 fra requireAdmin.
  const cronKey = context.request.headers.get("X-Cron-Secret");
  const cronOk =
    !!cronKey && !!context.env.SMS_CRON_SECRET && sameSecret(cronKey, context.env.SMS_CRON_SECRET);

  if (!cronOk) {
    const auth = await requireAdmin(context, corsHeaders);
    if (auth instanceof Response) return auth;
  }

  const dryRun = new URL(context.request.url).searchParams.get("dryRun") === "1";
  const kv = context.env.BOOKINGS;
  const now = new Date();

  const ctx = await smsContext(context.env);
  const bookings = await allBookings(kv);
  const byId = new Map(bookings.map((b) => [String(b.id), b]));
  const due = remindersDue(bookings as ReminderBooking[], now);

  // Typer der er slået fra i /admin/kommunikation skal ikke engang forsøges
  const relevant = due.filter((d) => smsAutoEnabled(ctx.settings, d.type));

  const sent: Array<{ id: string; type: string; to?: string }> = [];
  const failed: Array<{ id: string; type: string; error: string }> = [];
  const skipped: Array<{ id: string; type: string; reason: string }> = [];

  if (!dryRun && relevant.length > 0 && !smsConfigured(context.env)) {
    return json({ error: "Ingen SMS-udbyder er sat op i Cloudflare — der blev ikke sendt noget" }, 503);
  }

  for (const item of relevant) {
    const booking = byId.get(item.id);
    if (!booking) continue;

    if (dryRun) {
      sent.push({ id: item.id, type: item.type });
      continue;
    }

    const outcome = await sendBookingSms(context.env, booking, item.type, { ctx });
    if (outcome.ok) {
      recordSms(booking, outcome);
      booking.updatedAt = new Date().toISOString();
      await kv.put(item.id, JSON.stringify(booking));
      sent.push({ id: item.id, type: item.type, to: outcome.to });
    } else if (outcome.skipped) {
      skipped.push({ id: item.id, type: item.type, reason: smsErrorText(outcome.skipped) });
    } else {
      failed.push({ id: item.id, type: item.type, error: smsErrorText(outcome.error) });
    }
  }

  console.log(
    `[sms] påmindelser for ${copenhagenDateKey(now, 0)}: ${sent.length} sendt, ${failed.length} fejlede, ${skipped.length} sprunget over${dryRun ? " (dryRun)" : ""}`,
  );

  return json({
    ok: failed.length === 0,
    dryRun,
    /** Dagen påmindelserne handler om */
    forDate: copenhagenDateKey(now, 0),
    checked: bookings.length,
    due: due.length,
    sent,
    failed,
    skipped,
  });
};
