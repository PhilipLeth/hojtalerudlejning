/* ───── Daglige SMS-påmindelser ─────
 *
 * POST /api/sms-paamindelser?secret=…  (også ?dryRun=1)
 *
 * Kaldes én gang om dagen af GitHub Actions (.github/workflows/sms-paamindelser.yml)
 * — Pages Functions har ingen cron. Kan også trykkes manuelt fra
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
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

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
    return json({ error: "SMS_API_TOKEN mangler i Cloudflare — der blev ikke sendt noget" }, 503);
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
