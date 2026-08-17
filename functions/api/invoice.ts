/**
 * POST /api/invoice?secret=  — send faktura til kunden.
 *
 * Fakturaen oprettes på ordren (nummer + forfaldsdato), sendes som mail og
 * logges i kommunikationsloggen. Ordren tæller stadig som ubetalt, indtil
 * pengene registreres — fakturering er en tilstand, ikke en betaling.
 */
import { invoiceHtml, invoiceSubject, type InvoiceLine } from "./_lib/invoiceMail";

import { requireAdmin } from "./_lib/adminAuth";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
  RESEND_API_KEY: string;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

interface Body {
  id: string;
  /** Betalingsfrist i dage fra i dag (default 8) */
  dueDays?: number;
  /** Linjer som admin viser dem — så mail og skærm er enige */
  lines?: InvoiceLine[];
  note?: string;
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function nextInvoiceNumber(kv: KVNamespace): Promise<string> {
  const year = new Date().getFullYear();
  const key = `invoice_seq_${year}`;
  const current = Number((await kv.get(key)) || 0);
  const next = Number.isFinite(current) ? current + 1 : 1;
  await kv.put(key, String(next));
  return `${year}-${String(next).padStart(3, "0")}`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, cors);
  if (auth instanceof Response) return auth;
  if (!context.env.RESEND_API_KEY) return json({ error: "Mail er ikke konfigureret" }, 503);

  let body: Body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (!body.id || !body.id.startsWith("booking_")) return json({ error: "Invalid booking id" }, 400);

  const raw = await context.env.BOOKINGS.get(body.id);
  if (!raw) return json({ error: "Booking not found" }, 404);

  const booking = JSON.parse(raw);
  if (!booking.email) return json({ error: "Bookingen har ingen e-mail" }, 400);

  const today = new Date().toISOString().slice(0, 10);
  const dueDays = Number.isFinite(Number(body.dueDays)) ? Math.min(60, Math.max(0, Math.round(Number(body.dueDays)))) : 8;

  // Regnskabsindstillinger: betalingsoplysninger og fodnote
  let settings: Record<string, string> = {};
  try {
    const s = await context.env.BOOKINGS.get("accounting_settings");
    if (s) settings = JSON.parse(s);
  } catch {
    /* uden betalingsoplysninger skriver mailen "kontakt os" */
  }

  const total = Number(booking.total) || 0;
  const payments: Array<{ amount?: number }> = Array.isArray(booking.payments) ? booking.payments : [];
  const alreadyPaid = payments.reduce((s, p) => s + (Number(p?.amount) || 0), 0);
  const amountDue = Math.max(0, total - alreadyPaid);

  const number = booking.invoice?.number || (await nextInvoiceNumber(context.env.BOOKINGS));
  const dueDate = addDays(today, dueDays);
  const sentAt = new Date().toISOString();

  const lines: InvoiceLine[] =
    Array.isArray(body.lines) && body.lines.length
      ? body.lines.slice(0, 40).map((l) => ({
          label: String(l.label).slice(0, 160),
          qty: Math.max(1, Math.round(Number(l.qty) || 1)),
          amount: typeof l.amount === "number" ? Math.round(l.amount) : undefined,
        }))
      : [{ label: `Leje: ${booking.speaker || "udstyr"}`, qty: 1, amount: total }];

  const mailData = {
    invoiceNumber: number,
    issuedAt: sentAt,
    dueDate,
    customerName: booking.name || "",
    company: booking.company || undefined,
    email: booking.email,
    address: booking.deliveryAddress || undefined,
    period: booking.period || "",
    lines,
    total,
    alreadyPaid,
    amountDue,
    bankReg: settings.bankReg,
    bankKonto: settings.bankKonto,
    mobilePay: settings.mobilePay,
    footer: settings.invoiceFooter,
    note: body.note,
  };

  const html = invoiceHtml(mailData);
  const subject = invoiceSubject(mailData);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Lejhøjtaler.dk <booking@lejhojtaler.dk>",
      to: [booking.email],
      reply_to: "info@lejhojtaler.dk",
      subject,
      html,
    }),
  });

  if (!res.ok) {
    console.error("[invoice] resend error:", await res.text());
    return json({ error: "Kunne ikke sende fakturaen" }, 502);
  }

  booking.invoice = { number, dueDate, amount: total, sentAt };
  booking.communications = [
    ...(Array.isArray(booking.communications) ? booking.communications : []),
    {
      type: "faktura",
      label: `Faktura ${number}`,
      to: booking.email,
      sentAt,
      note: `${amountDue} kr — forfalder ${dueDate}`,
    },
  ];
  booking.updatedAt = sentAt;
  await context.env.BOOKINGS.put(body.id, JSON.stringify(booking));

  return json({ ok: true, invoice: booking.invoice, booking });
};
