/* ───── Bekræftelsen på en godkendt ordre ─────
 *
 * Kunden får en kvittering, når han bestiller, men den siger kun "vi vender
 * tilbage hurtigst muligt". Det her er beskeden, der gør aftalen fast — og den
 * kunden finder frem igen fredag eftermiddag for at se, hvor han skal hente.
 * Derfor skal den kunne stå alene: hvad, hvornår, hvor, og hvad der skal betales.
 *
 * Teksten ligger i KV som de andre skabeloner, så Frederik kan rette den uden
 * en deploy. Selve afsendelsen sker ved at sætte ordren til bekræftet.
 */

import {
  DEFAULT_SETTINGS,
  KV_COMM_SETTINGS,
  buildConfirmationMail,
  parseCommSettings,
  signatureFor,
  type CommSettings,
} from "../../../src/lib/commTemplates";
import { loadSiteSettings, mailFooter, type ServerSiteSettings } from "./siteSettings";
import { formatDkPhone } from "../../../src/lib/phone";
import { TIMEOUT_MAIL_MS, timeoutSignal } from "../../../src/lib/fetchTimeout";

export interface ConfirmMailEnv {
  BOOKINGS: KVNamespace;
  RESEND_API_KEY?: string;
}

async function loadCommSettings(kv: KVNamespace): Promise<CommSettings> {
  try {
    const raw = await kv.get(KV_COMM_SETTINGS);
    return raw ? parseCommSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch (e) {
    console.error("[bekraeftelse] kunne ikke læse skabelonen:", e);
    return DEFAULT_SETTINGS;
  }
}

/** Hvad kunden lejer, som læsbar tekst */
function productNames(booking: Record<string, unknown>): string {
  const names: string[] = [];
  if (booking.speaker && booking.speakerId !== "effects-only") names.push(String(booking.speaker));
  for (const item of (booking.cartItems as Array<{ name?: string }>) || []) {
    if (item?.name) names.push(String(item.name));
  }
  for (const a of (booking.addons as string[]) || []) {
    if (a) names.push(String(a));
  }
  return [...new Set(names)].join(", ");
}

/**
 * Hvor udstyret skal hentes eller leveres. Kunden skal kunne læse én linje og
 * vide, om han selv skal køre — det er den hyppigste kilde til opkald.
 */
export function placeLine(booking: Record<string, unknown>, site: ServerSiteSettings): string {
  const ids = new Set<string>([
    ...(booking.deliveryOptionId ? [String(booking.deliveryOptionId)] : []),
    ...((booking.addonIds as string[]) || []).map(String),
  ]);
  const address = String(booking.deliveryAddress ?? "").trim();
  // levering_begge (og det gamle levering_opsaetning) dækker begge veje i ét
  // tilvalg — ikke kun turen ud. Blev de talt som "kun levering", ville kunden
  // få besked på selv at aflevere udstyr, vi har lovet at hente.
  const both = ids.has("levering_begge") || ids.has("levering_opsaetning");
  const delivers = both || ids.has("levering_ud");
  const picksUp = both || ids.has("afhentning_retur");

  if (delivers && picksUp) return `Vi leverer og henter igen${address ? `: ${address}` : ""}`;
  if (delivers) return `Vi leverer og sætter op${address ? `: ${address}` : ""} — du afleverer selv hos os`;
  if (picksUp) return `Du henter hos os: ${site.pickupAddress} — vi henter udstyret igen bagefter`;
  if (address) return `Levering aftalt: ${address}`;
  return `Hentes og afleveres hos os: ${site.pickupAddress}`;
}

/**
 * Hvad der mangler at blive betalt. Er ordren betalt online, skal der ikke stå
 * et beløb, kunden tror han skylder — og omvendt skal en ubetalt ordre sige
 * præcis hvor meget og hvordan.
 */
export function paymentLine(booking: Record<string, unknown>): string {
  const total = Number(booking.total) || 0;
  const payments = (booking.payments as Array<{ amount?: number }>) || [];
  const paid = payments.reduce((sum, p) => sum + (Number(p?.amount) || 0), 0);
  const outstanding = Math.max(0, total - paid);
  const kr = (n: number) => `${Math.round(n).toLocaleString("da-DK")} kr`;

  if (outstanding <= 0 && paid > 0) return `Betalt: ${kr(paid)}. Der er ikke mere at betale.`;
  if (paid > 0) return `Betalt: ${kr(paid)}. Rest ved afhentning: ${kr(outstanding)} — betales med MobilePay.`;
  if (booking.invoice) return `I alt ${kr(total)} — faktura er sendt særskilt.`;
  return `I alt ${kr(total)} — betales ved afhentning med MobilePay.`;
}

export interface ConfirmResult {
  ok: boolean;
  skipped?: "slaaet_fra" | "ingen_mail" | "allerede_sendt" | "ikke_konfigureret";
  error?: string;
  subject?: string;
  sentAt?: string;
}

/**
 * Send bekræftelsen. Fejler blødt: statusskiftet er det vigtige, og en mail der
 * ikke kunne sendes må ikke forhindre ordren i at blive markeret som bekræftet.
 */
export async function sendConfirmationMail(
  env: ConfirmMailEnv,
  booking: Record<string, unknown>,
): Promise<ConfirmResult> {
  if (booking.confirmMailSentAt) return { ok: false, skipped: "allerede_sendt" };
  const to = String(booking.email ?? "").trim();
  if (!to) return { ok: false, skipped: "ingen_mail" };
  if (!env.RESEND_API_KEY) return { ok: false, skipped: "ikke_konfigureret" };

  const [settings, site] = await Promise.all([loadCommSettings(env.BOOKINGS), loadSiteSettings(env.BOOKINGS)]);
  if (!settings.confirmationAutoSend) return { ok: false, skipped: "slaaet_fra" };

  const navn = String(booking.name || "");
  const ansvarlig = typeof booking.handledBy === "string" ? booking.handledBy : undefined;
  const mail = buildConfirmationMail(settings, {
    fornavn: navn.split(" ")[0] || navn,
    navn,
    produkter: productNames(booking),
    periode: String(booking.period || ""),
    sted: placeLine(booking, site),
    betaling: paymentLine(booking),
    total: Number(booking.total) || 0,
    telefon: formatDkPhone(site.phone),
    ansvarlig,
    hilsen: signatureFor(settings, ansvarlig),
    besked: typeof booking.personalNote === "string" ? booking.personalNote : "",
    footer: mailFooter(site),
  });

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
        to: [to],
        reply_to: site.company.email,
        subject: mail.subject,
        html: mail.html,
      }),
    });
    if (!res.ok) {
      console.error("[bekraeftelse] resend:", (await res.text()).slice(0, 300));
      return { ok: false, error: `resend_${res.status}` };
    }
  } catch (e) {
    console.error("[bekraeftelse] kunne ikke sende:", e);
    return { ok: false, error: "netvaerksfejl" };
  }

  const sentAt = new Date().toISOString();
  booking.confirmMailSentAt = sentAt;
  booking.communications = [
    ...(Array.isArray(booking.communications) ? booking.communications : []),
    { type: "bekraeftelse", label: "Bekræftelse på godkendt ordre", to, sentAt },
  ];
  return { ok: true, subject: mail.subject, sentAt };
}
