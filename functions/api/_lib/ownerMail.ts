/* ───── Beskeder til os selv ─────
 *
 * Alt om en ordre ligger i KV, men betalingerne skal også kunne findes i
 * indbakken: det er dér, man leder, når regnskabet skal stemme, og det er den
 * eneste kopi der ikke forsvinder med en fejlsletning i admin.
 *
 * Fejler blødt. En mail til os selv må aldrig kunne vælte den handling, den
 * hænger på — en betaling skal registreres, også når Resend er nede.
 */

import { notifyRecipients } from "./notify";
import { TIMEOUT_MAIL_MS, timeoutSignal } from "../../../src/lib/fetchTimeout";

export interface OwnerMailEnv {
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
}

export async function sendOwnerMail(
  env: OwnerMailEnv,
  mail: { subject: string; html: string; replyTo?: string },
): Promise<boolean> {
  const to = notifyRecipients(env.NOTIFY_EMAIL);
  if (!env.RESEND_API_KEY || to.length === 0) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: timeoutSignal(TIMEOUT_MAIL_MS),
      body: JSON.stringify({
        from: "Lejhøjtaler.dk <info@lejhojtaler.dk>",
        to,
        subject: mail.subject,
        html: mail.html,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("[ownerMail] resend:", (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[ownerMail] kunne ikke sende:", e);
    return false;
  }
}

const kr = (n: number) => `${Math.round(n).toLocaleString("da-DK")} kr`;

export interface PaymentMailContext {
  bookingId: string;
  name: string;
  period?: string;
  total: number;
  /** Summen af alle registrerede indbetalinger efter denne handling */
  paid: number;
  amount: number;
  method: string;
  note?: string;
  /** Hvem der trykkede — tomt ved Stripe */
  by?: string;
  removed?: boolean;
}

/**
 * Kvitteringen til os selv. Skal kunne læses på en telefon uden at åbne noget:
 * hvem, hvor meget, hvordan, og hvad der mangler.
 */
export function paymentMail(ctx: PaymentMailContext): { subject: string; html: string } {
  const outstanding = Math.max(0, ctx.total - ctx.paid);
  const verb = ctx.removed ? "Betaling fjernet" : "Betaling registreret";
  const rows: Array<[string, string]> = [
    ["Kunde", ctx.name],
    ["Beløb", kr(ctx.amount)],
    ["Metode", ctx.method],
    ["Ordrens total", kr(ctx.total)],
    ["Betalt i alt", kr(ctx.paid)],
    ["Mangler", outstanding > 0 ? kr(outstanding) : "Ingenting — ordren er betalt"],
  ];
  if (ctx.period) rows.splice(1, 0, ["Periode", ctx.period]);
  if (ctx.note) rows.push(["Note", ctx.note]);
  if (ctx.by) rows.push(["Registreret af", ctx.by]);

  return {
    subject: `${verb}: ${kr(ctx.amount)} — ${ctx.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:460px;color:#111;">
        <h2 style="margin:0 0 12px;font-size:17px;">${verb} — ${kr(ctx.amount)}</h2>
        <table style="border-collapse:collapse;font-size:14px;">
          ${rows
            .map(
              ([k, v]) =>
                `<tr><td style="padding:3px 14px 3px 0;color:#666;">${k}</td><td style="padding:3px 0;"><strong>${v}</strong></td></tr>`,
            )
            .join("")}
        </table>
        <p style="margin:14px 0 0;font-size:12px;color:#999;">Ordre ${ctx.bookingId}</p>
      </div>`,
  };
}
