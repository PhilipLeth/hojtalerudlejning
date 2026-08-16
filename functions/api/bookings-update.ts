import {
  DEFAULT_SETTINGS,
  KV_COMM_SETTINGS,
  buildFollowUpMail,
  parseCommSettings,
  signatureFor,
} from "../../src/lib/commTemplates";
import { KV_SALE_CAMPAIGN, parseCampaign } from "./_lib/weekendSale";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
  RESEND_API_KEY: string;
  /** Direkte "skriv en anmeldelse"-link fra Google Business Profile (g.page/r/…/review) */
  GOOGLE_REVIEW_URL?: string;
}

// Direkte "skriv en anmeldelse"-link fra Google Business Profile. Ligger som
// default i koden (det er en offentlig URL, ikke en hemmelighed), så mailen
// altid virker. GOOGLE_REVIEW_URL kan overskrive det uden ny deploy.
// Sender videre til search.google.com/local/writereview?placeid=ChIJ9UxZq-xTUkYRsiSY3hvy-MY
const GOOGLE_REVIEW_FALLBACK = "https://g.page/r/CbIkmN4b8vjGEBM/review";

function reviewMailHtml(name: string, reviewUrl: string, locale?: string): { subject: string; html: string } {
  if (locale === "en") {
    return {
      subject: "Thanks for renting with us — got 30 seconds? ⭐",
      html: `
        <div style="font-family:sans-serif;max-width:480px;">
          <p>Hi ${name},</p>
          <p>We hope you had a great party with the music pumping!</p>
          <p>We'd really appreciate it if you'd take 30 seconds to leave us a review — it means a lot to us as a small business and helps others find us.</p>
          <p style="margin:20px 0;">
            <a href="${reviewUrl}" style="display:inline-block;background:#bfa000;color:#000;font-weight:bold;padding:12px 24px;border-radius:24px;text-decoration:none;">⭐ Review us on Google</a>
          </p>
          <p>If you have any questions, or need gear for your next party, you're always welcome to reply to this email.</p>
          <p>Thanks again!</p>
          <p>Best regards,<br>Lejhøjtaler.dk</p>
          <p style="margin-top:16px;color:#bbb;font-size:12px;">Scharling Studio &middot; Halvtolv 9, 1. th &middot; 1436 København K &middot; CVR 40994904</p>
        </div>`,
    };
  }
  return {
    subject: "Tak for denne gang — vil du give os en anmeldelse? ⭐",
    html: `
      <div style="font-family:sans-serif;max-width:480px;">
        <p>Hej ${name},</p>
        <p>Håber I har haft en fed weekend med musikken kørende!</p>
        <p>Vi vil sætte stor pris på, hvis du vil bruge 30 sekunder på at give os en anmeldelse på Google — det betyder rigtig meget for os som lille virksomhed, og hjælper andre med at finde os.</p>
        <p style="margin:20px 0;">
          <a href="${reviewUrl}" style="display:inline-block;background:#bfa000;color:#000;font-weight:bold;padding:12px 24px;border-radius:24px;text-decoration:none;">⭐ Anmeld os på Google</a>
        </p>
        <p>Har du spørgsmål, eller mangler du udstyr til næste fest, er du altid velkommen til at svare på denne mail.</p>
        <p>Mange tak for denne gang!</p>
        <p>Bedste hilsner,<br>Lejhøjtaler.dk</p>
        <p style="margin-top:16px;color:#bbb;font-size:12px;">Scharling Studio &middot; Halvtolv 9, 1. th &middot; 1436 København K &middot; CVR 40994904</p>
      </div>`,
  };
}

/**
 * Opfølgningsmailen bygges nu fra skabelonen i /admin/kommunikation, så
 * teksten kan rettes uden deploy. Den engelske reviewMailHtml ovenfor er
 * fallback: skabelonen er dansk, og en engelsk kunde skal ikke få den.
 */
async function followUpMail(
  kv: KVNamespace,
  booking: Record<string, unknown>,
  reviewUrl: string,
): Promise<{ subject: string; html: string }> {
  if (booking.locale === "en") {
    return reviewMailHtml(String(booking.name || ""), reviewUrl, "en");
  }
  try {
    const raw = await kv.get(KV_COMM_SETTINGS);
    const settings = raw ? parseCommSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;

    // Udsalgsafsnittet er kun med, når udsalget faktisk er tændt
    let udsalg = "";
    try {
      const campaignRaw = await kv.get(KV_SALE_CAMPAIGN);
      const campaign = campaignRaw ? parseCampaign(JSON.parse(campaignRaw)) : null;
      if (campaign?.active) {
        udsalg = `PS: Vi har weekendudsalg lige nu — ${campaign.pct}% på det udstyr der står ledigt til weekenden. Brug koden ${campaign.code.toUpperCase()}.`;
      }
    } catch {
      // uden udsalg er afsnittet bare tomt
    }

    const navn = String(booking.name || "");
    const ansvarlig = typeof booking.handledBy === "string" ? booking.handledBy : undefined;
    const produkter = orderLineNames(booking);

    return buildFollowUpMail(settings, {
      fornavn: navn.split(" ")[0] || navn,
      navn,
      produkter,
      periode: String(booking.period || ""),
      ansvarlig,
      hilsen: signatureFor(settings, ansvarlig),
      besked: typeof booking.personalNote === "string" ? booking.personalNote : "",
      rabatkode: settings.referralCode,
      rabatpct: settings.referralPct,
      udsalg,
      reviewUrl,
    });
  } catch (e) {
    // Skabelonen må ikke kunne forhindre mailen i at blive sendt
    console.error("[kommunikation] faldt tilbage på standardmail:", e);
    return reviewMailHtml(String(booking.name || ""), reviewUrl, undefined);
  }
}

/** Hvad kunden lejede, som læsbar tekst til mailen */
function orderLineNames(booking: Record<string, unknown>): string {
  const names: string[] = [];
  if (booking.speaker && booking.speakerId !== "effects-only") names.push(String(booking.speaker));
  for (const item of (booking.cartItems as Array<{ name?: string }>) || []) {
    if (item?.name) names.push(item.name);
  }
  for (const a of (booking.addons as string[]) || []) {
    if (a) names.push(String(a));
  }
  return [...new Set(names)].join(", ");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

interface UpdateBody {
  id: string;
  status?: string;
  action?: "delete" | "set_flag" | "set_fields" | "add_payment" | "delete_payment" | "set_invoice";
  /** add_payment: en indbetaling på ordren */
  payment?: { amount?: unknown; method?: unknown; paidAt?: unknown; note?: unknown };
  /** delete_payment: hvilken indbetaling der skal væk */
  paymentId?: string;
  /** set_invoice: forfaldsdato, eller null for at fjerne fakturaen igen */
  invoice?: { dueDate?: unknown } | null;
  /** set_flag: hvilket felt der slås til/fra */
  flag?: "paidManual" | "reviewDone";
  value?: boolean;
  /** set_fields: flere felter i én skrivning (fx betaling + metode) */
  fields?: Record<string, unknown>;
}

/** Felter admin kan slå til/fra direkte i ordreoverblikket */
const VALID_FLAGS = ["paidManual", "reviewDone"] as const;

/**
 * Felter admin kan sætte fra de to spor i ordreoverblikket. Hver har en
 * validator, så en tastefejl i frontend ikke kan skrive vrøvl i KV.
 */
const FIELD_VALIDATORS: Record<string, (v: unknown) => boolean> = {
  // Betaling
  paidManual: (v) => typeof v === "boolean",
  paidMethod: (v) => v === null || ["mobilepay", "kontant", "bank"].includes(v as string),
  // Depositum — beløb i kr, 0 betyder "intet depositum"
  depositAmount: (v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100000,
  depositState: (v) => v === null || ["afventer", "modtaget", "tilbagebetalt"].includes(v as string),
  // Udstyr
  inspected: (v) => typeof v === "boolean",
  reviewDone: (v) => typeof v === "boolean",
  // Kommunikation: hvem stod for udlejningen, og hvad de vil skrive til kunden
  handledBy: (v) => v === null || (typeof v === "string" && v.length <= 60),
  personalNote: (v) => v === null || (typeof v === "string" && v.length <= 600),
};

const PAYMENT_METHODS = ["mobilepay", "kontant", "bank", "kort", "andet"];

/**
 * Fakturanummer som løbenummer pr. år (2026-001). Tælleren ligger i KV, så vi
 * slipper for at scanne alle bookinger for at finde det højeste nummer.
 */
async function nextInvoiceNumber(kv: KVNamespace): Promise<string> {
  const year = new Date().getFullYear();
  const key = `invoice_seq_${year}`;
  const current = Number((await kv.get(key)) || 0);
  const next = Number.isFinite(current) ? current + 1 : 1;
  await kv.put(key, String(next));
  return `${year}-${String(next).padStart(3, "0")}`;
}

const VALID_STATUSES = ["ny", "bekraeftet", "pakket", "afhentet", "afleveret", "annulleret_kunde", "annulleret_admin"];

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const secret = url.searchParams.get("secret");

  if (!context.env.ADMIN_SECRET || secret !== context.env.ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const body: UpdateBody = await context.request.json();

    // Slet booking (kræver eksplicit action)
    if (body.action === "delete") {
      if (!body.id || !body.id.startsWith("booking_")) {
        return new Response(JSON.stringify({ error: "Invalid booking id" }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      const existing = await context.env.BOOKINGS.get(body.id);
      if (!existing) {
        return new Response(JSON.stringify({ error: "Booking not found" }), {
          status: 404,
          headers: corsHeaders,
        });
      }
      await context.env.BOOKINGS.delete(body.id);
      return new Response(JSON.stringify({ ok: true, deleted: body.id }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Slå betalings- eller anmeldelsesflueben til/fra
    if (body.action === "set_flag") {
      if (!body.flag || !VALID_FLAGS.includes(body.flag)) {
        return new Response(JSON.stringify({ error: `Invalid flag. Must be one of: ${VALID_FLAGS.join(", ")}` }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      const existingFlag = await context.env.BOOKINGS.get(body.id);
      if (!existingFlag) {
        return new Response(JSON.stringify({ error: "Booking not found" }), {
          status: 404,
          headers: corsHeaders,
        });
      }
      const bookingFlag = JSON.parse(existingFlag);
      const on = body.value !== false;
      bookingFlag[body.flag] = on;
      bookingFlag[`${body.flag}At`] = on ? new Date().toISOString() : null;
      bookingFlag.updatedAt = new Date().toISOString();
      await context.env.BOOKINGS.put(body.id, JSON.stringify(bookingFlag));
      return new Response(JSON.stringify({ ok: true, booking: bookingFlag }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // ── Betalinger: en ordre kan betales ad flere gange og med flere metoder
    if (body.action === "add_payment" || body.action === "delete_payment" || body.action === "set_invoice") {
      const existingRaw = await context.env.BOOKINGS.get(body.id);
      if (!existingRaw) {
        return new Response(JSON.stringify({ error: "Booking not found" }), { status: 404, headers: corsHeaders });
      }
      const booking = JSON.parse(existingRaw);
      const now = new Date().toISOString();
      booking.payments = Array.isArray(booking.payments) ? booking.payments : [];

      if (body.action === "add_payment") {
        const amount = Math.round(Number(body.payment?.amount));
        const method = String(body.payment?.method || "");
        if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
          return new Response(JSON.stringify({ error: "Beløbet skal være mellem 1 og 1.000.000 kr" }), { status: 400, headers: corsHeaders });
        }
        if (!PAYMENT_METHODS.includes(method)) {
          return new Response(JSON.stringify({ error: `Ukendt betalingsmetode. Vælg: ${PAYMENT_METHODS.join(", ")}` }), { status: 400, headers: corsHeaders });
        }
        const paidAt = typeof body.payment?.paidAt === "string" && /^\d{4}-\d{2}-\d{2}/.test(body.payment.paidAt)
          ? new Date(body.payment.paidAt).toISOString()
          : now;
        booking.payments.push({
          id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          amount,
          method,
          paidAt,
          note: typeof body.payment?.note === "string" ? body.payment.note.slice(0, 200) : undefined,
          source: "manuel",
        });
      }

      if (body.action === "delete_payment") {
        const before = booking.payments.length;
        booking.payments = booking.payments.filter((p: { id?: string }) => p?.id !== body.paymentId);
        if (booking.payments.length === before) {
          return new Response(JSON.stringify({ error: "Indbetalingen findes ikke" }), { status: 404, headers: corsHeaders });
        }
      }

      if (body.action === "set_invoice") {
        if (body.invoice === null) {
          booking.invoice = null;
        } else {
          const dueDate = String(body.invoice?.dueDate || "");
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
            return new Response(JSON.stringify({ error: "Forfaldsdato skal være YYYY-MM-DD" }), { status: 400, headers: corsHeaders });
          }
          const number = booking.invoice?.number || (await nextInvoiceNumber(context.env.BOOKINGS));
          booking.invoice = { ...(booking.invoice || {}), number, dueDate, amount: Number(booking.total) || 0 };
        }
      }

      // Den gamle model holdes i sync, så alt der endnu læser paidManual
      // ser det samme som betalingslisten
      const paidSum = booking.payments.reduce((s: number, p: { amount?: number }) => s + (Number(p?.amount) || 0), 0);
      booking.paidManual = paidSum > 0 && paidSum >= (Number(booking.total) || 0) - 1;
      booking.updatedAt = now;

      await context.env.BOOKINGS.put(body.id, JSON.stringify(booking));
      return new Response(JSON.stringify({ ok: true, booking }), { status: 200, headers: corsHeaders });
    }

    // Sæt flere felter på én gang (betalingsmetode, depositum, inspektion)
    if (body.action === "set_fields") {
      const fields = body.fields;
      if (!fields || typeof fields !== "object" || Array.isArray(fields) || Object.keys(fields).length === 0) {
        return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: corsHeaders });
      }
      for (const [key, value] of Object.entries(fields)) {
        const validator = FIELD_VALIDATORS[key];
        if (!validator) {
          return new Response(
            JSON.stringify({ error: `Invalid field "${key}". Must be one of: ${Object.keys(FIELD_VALIDATORS).join(", ")}` }),
            { status: 400, headers: corsHeaders },
          );
        }
        if (!validator(value)) {
          return new Response(JSON.stringify({ error: `Invalid value for "${key}"` }), { status: 400, headers: corsHeaders });
        }
      }
      const existingFields = await context.env.BOOKINGS.get(body.id);
      if (!existingFields) {
        return new Response(JSON.stringify({ error: "Booking not found" }), { status: 404, headers: corsHeaders });
      }
      const bookingFields = JSON.parse(existingFields);
      const now = new Date().toISOString();
      for (const [key, value] of Object.entries(fields)) {
        bookingFields[key] = value;
        // Booleans får et tidsstempel, så vi kan se hvornår hakket blev sat
        if (typeof value === "boolean") bookingFields[`${key}At`] = value ? now : null;
      }
      bookingFields.updatedAt = now;
      await context.env.BOOKINGS.put(body.id, JSON.stringify(bookingFields));
      return new Response(JSON.stringify({ ok: true, booking: bookingFields }), { status: 200, headers: corsHeaders });
    }

    if (!body.id || !body.status) {
      return new Response(JSON.stringify({ error: "Missing id or status" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!VALID_STATUSES.includes(body.status)) {
      return new Response(
        JSON.stringify({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }),
        { status: 400, headers: corsHeaders }
      );
    }

    const existing = await context.env.BOOKINGS.get(body.id);
    if (!existing) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    const booking = JSON.parse(existing);
    const previousStatus = booking.status;
    booking.status = body.status;
    booking.updatedAt = new Date().toISOString();

    // Follow-up anmeldelsesmail (Google) når udstyret er afleveret — kun én gang
    if (
      body.status === "afleveret" &&
      previousStatus !== "afleveret" &&
      !booking.reviewMailSentAt &&
      booking.email &&
      context.env.RESEND_API_KEY
    ) {
      try {
        const reviewUrl = context.env.GOOGLE_REVIEW_URL || GOOGLE_REVIEW_FALLBACK;
        const mail = await followUpMail(context.env.BOOKINGS, booking, reviewUrl);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Lejhøjtaler.dk <booking@lejhojtaler.dk>",
            to: [booking.email],
            // Svar på anmeldelsesmailen skal kunne modtages — booking@ har
            // ingen rute i Cloudflare
            reply_to: "info@lejhojtaler.dk",
            subject: mail.subject,
            html: mail.html,
          }),
        });
        if (res.ok) {
          const sentAt = new Date().toISOString();
          booking.reviewMailSentAt = sentAt;
          booking.communications = [
            ...(Array.isArray(booking.communications) ? booking.communications : []),
            {
              type: "anmeldelse",
              label: "Anmeldelsesmail (Google)",
              to: booking.email,
              sentAt,
            },
          ];
        } else {
          console.error("Review mail failed:", await res.text());
        }
      } catch (e) {
        // Statusopdateringen må ikke fejle pga. mailen
        console.error("Review mail error:", e);
      }
    }

    await context.env.BOOKINGS.put(body.id, JSON.stringify(booking));

    return new Response(JSON.stringify({ ok: true, booking }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    console.error("Update error:", e);
    return new Response(JSON.stringify({ error: "Failed to update booking" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
