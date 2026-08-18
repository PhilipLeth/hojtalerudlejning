import { resolveDiscountFor } from "./_lib/discounts";
import { sendPush } from "../../src/lib/webpush";
import { KV_PUSH_SUBS, loadSubscriptions } from "./push";
import { notifyOverbooking } from "./_lib/overbooking";
import { loadSiteSettings, mailFooter } from "./_lib/siteSettings";
import { recordSms, sendBookingSms, type SendSmsOutcome } from "./_lib/sms";
import type { SaleContext } from "./_lib/weekendSale";
import { notifyRecipients } from "./_lib/notify";

interface Env {
  RESEND_API_KEY: string;
  NOTIFY_EMAIL: string;
  /** Push til hjemmeskærms-appen — se /admin/notifikationer */
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
  /** SMS via GatewayAPI — se /admin/kommunikation */
  SMS_API_TOKEN?: string;
  SMS_DEV_MODE?: string;
  GOOGLE_REVIEW_URL?: string;
  BOOKINGS: KVNamespace;
}

interface BookingData {
  speaker: string;
  speakerId?: string;
  speakerSize: string;
  period: string;
  days: number;
  addons: string[];
  addonIds?: string[];
  cartItems?: Array<{ name: string; price: number; productId?: string }>;
  /** Lejeperioden som ISO — sendes af kalenderen, bruges til weekendudsalget */
  pickup?: string;
  returnDate?: string;
  deliveryAddress?: string;
  /** levering_ud | afhentning_retur | levering_begge — hvilken vej vi kører */
  deliveryOptionId?: string;
  total: number;
  discountCode?: string;
  /** "online" eller "pickup" — vises i push-beskeden */
  paymentChoice?: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  comment: string;
}

/** Contextual post-booking upsell (30%). See prd.json → fulfillment_and_upsell */
interface UpsellOffer {
  id: string;
  title: string;
  blurb: string;
  listPrice: number;
  offerPrice: number;
}

const UPSELL_DISCOUNT = 0.3;

function offerPrice(list: number): number {
  return Math.round(list * (1 - UPSELL_DISCOUNT));
}

/**
 * Push til de tilmeldte telefoner. Beskeden skal kunne læses på en låseskærm
 * uden at åbne noget: hvem, hvad, hvornår og hvor meget.
 */
async function notifyPhones(env: Env, data: BookingData, bookingId: string): Promise<void> {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, BOOKINGS } = env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const subs = await loadSubscriptions(BOOKINGS);
  if (subs.length === 0) return;

  const hvad = orderProductIds(data).length
    ? [data.speaker, ...(data.cartItems || []).map((c) => c.name)].filter(Boolean).join(", ")
    : data.speaker;
  const betaling = data.paymentChoice === "online" ? "betalt online" : "betales v. afhentning";

  const payload = JSON.stringify({
    title: `Ny booking — ${data.total} kr`,
    body: `${data.name} · ${hvad}\n${data.period} · ${betaling}`,
    url: "/admin",
    tag: bookingId,
  });

  const results = await Promise.all(
    subs.map((s) =>
      sendPush(s, payload, { publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY },
        VAPID_SUBJECT || "mailto:info@lejhojtaler.dk"),
    ),
  );

  // En telefon der har afmeldt sig svarer 404/410 — ryd op, så vi ikke bliver
  // ved med at sende til den
  const gone = new Set(results.filter((r) => r.gone).map((r) => r.endpoint));
  if (gone.size) {
    await BOOKINGS.put(KV_PUSH_SUBS, JSON.stringify(subs.filter((s) => !gone.has(s.endpoint))));
  }
}

/** Produkt-ids i ordren — grundlaget for at afgøre om weekendudsalget gælder */
function orderProductIds(data: BookingData): string[] {
  const ids = new Set<string>(data.addonIds || []);
  for (const item of data.cartItems || []) {
    if (item.productId) ids.add(item.productId);
  }
  if (data.speakerId && data.speakerId !== "effects-only") ids.add(data.speakerId);
  return [...ids];
}

/** Ordren som weekendudsalget skal vurderes imod. null når datoerne mangler. */
function saleContext(data: BookingData): SaleContext | null {
  const pickup = String(data.pickup ?? "").slice(0, 10);
  const returnDate = String(data.returnDate ?? "").slice(0, 10);
  const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (!isDate(pickup) || !isDate(returnDate)) return null;
  const productIds = orderProductIds(data);
  return productIds.length ? { pickup, returnDate, productIds } : null;
}

function pickUpsell(data: BookingData): UpsellOffer | null {
  const ids = new Set<string>(data.addonIds || []);
  for (const item of data.cartItems || []) {
    if (item.productId) ids.add(item.productId);
  }
  if (data.speakerId) ids.add(data.speakerId);

  // Infer from Danish labels if addonIds missing (older clients)
  const labels = (data.addons || []).map((a) => a.toLowerCase());
  const hasLys =
    ids.has("lys") ||
    ids.has("lyseffekt") ||
    ids.has("discokugle") ||
    ids.has("lyskaeder") ||
    ids.has("lyskaeder_farvet") ||
    ids.has("uplight") ||
    ids.has("uplight_4") ||
    // Lille festpakke = lyseffekt; stor festpakke = lys-pakke
    ids.has("pakke_fest_lille") ||
    ids.has("pakke_fest_stor") ||
    labels.some((l) => l.includes("lys") || l.includes("disco"));
  const hasRog =
    ids.has("rog") ||
    ids.has("low_fog") ||
    labels.some((l) => l.includes("røg") || l.includes("rog") || l.includes("fog"));
  const hasDelivery =
    ids.has("levering_ud") ||
    ids.has("afhentning_retur") ||
    ids.has("levering_begge") ||
    // Ældre bookinger
    ids.has("levering_opsaetning") ||
    labels.some((l) => l.includes("levering") || l.includes("afhentning efter"));

  const speakerIds = new Set(["thumpgo", "party", "soundboks", "festival"]);
  const hasSpeaker =
    (data.speakerId && speakerIds.has(data.speakerId)) ||
    ids.has("pakke_fest_lille") ||
    ids.has("pakke_fest_stor") ||
    (data.speakerId !== "effects-only" &&
      !!data.speaker &&
      !String(data.speaker).toLowerCase().includes("kun effekter") &&
      !String(data.speaker).toLowerCase().includes("effects only"));

  // 1) Speaker without light → lys
  if (hasSpeaker && !hasLys) {
    const list = 495;
    return {
      id: "lys",
      title: "Lys-pakke",
      blurb: "Gør festen komplet — vores lys-pakke passer til din højtaler.",
      listPrice: list,
      offerPrice: offerPrice(list),
    };
  }

  // 2) Has light, no fog → røg
  if (hasLys && !hasRog) {
    const list = 245;
    return {
      id: "rog",
      title: "Røgmaskine",
      blurb: "Røg får lyset til at se 10× federe ud.",
      listPrice: list,
      offerPrice: offerPrice(list),
    };
  }

  // 3) No delivery → levering + afhentning begge veje (795)
  if (!hasDelivery) {
    const list = 795;
    return {
      id: "levering_begge",
      title: "Levering + afhentning",
      blurb: "Vi kører ud, sætter alt op klar til brug og henter igen.",
      listPrice: list,
      offerPrice: offerPrice(list),
    };
  }

  return null;
}

/**
 * Kørslen på ordren i klartekst. Levering (ud) og afhentning (retur) er to
 * selvstændige ture — 495 kr. for én vej, 795 for begge — så både vi og kunden
 * skal kunne se præcis hvilke(n) vej vi kører.
 */
function deliveryLine(data: BookingData): string | null {
  const ids = new Set<string>([
    ...(data.deliveryOptionId ? [data.deliveryOptionId] : []),
    ...(data.addonIds || []),
  ]);
  if (ids.has("levering_ud")) return "Vi leverer og sætter op — kunden afleverer selv";
  if (ids.has("afhentning_retur")) return "Kunden henter selv — vi henter udstyret igen";
  if (ids.has("levering_begge") || ids.has("levering_opsaetning")) return "Vi leverer, sætter op og henter igen";
  // Ældre bookinger uden id'er: en adresse betyder at der blev aftalt kørsel
  return data.deliveryAddress ? "Levering aftalt" : null;
}

function upsellCustomerHtml(offer: UpsellOffer): string {
  return `
      <div style="margin:20px 0;padding:16px;border-radius:8px;border:1px solid #bfa000;background:#fffef0;">
        <p style="margin:0 0 6px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.04em;">Tilbud kun til dig</p>
        <p style="margin:0 0 8px;font-size:16px;"><strong>${offer.title}</strong> — ${offer.offerPrice} kr <span style="color:#888;text-decoration:line-through;font-size:13px;">${offer.listPrice} kr</span> <span style="color:#bfa000;font-size:13px;">(30% rabat)</span></p>
        <p style="margin:0 0 10px;font-size:14px;color:#444;">${offer.blurb}</p>
        <p style="margin:0;font-size:13px;color:#333;">Svar <strong>JA</strong> på denne mail, så tilføjer vi det til din booking.</p>
      </div>`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { RESEND_API_KEY, NOTIFY_EMAIL } = context.env;

  if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data: BookingData = await context.request.json();

  // Rabatkode valideres mod serverens liste — klientens ord alene tæller ikke.
  // Weekendudsalgets kode tjekkes desuden mod lageret: den gælder kun udstyr,
  // der stadig står tilbage netop den weekend.
  const discount = data.discountCode
    ? await resolveDiscountFor(context.env.BOOKINGS, data.discountCode, saleContext(data))
    : null;
  const discountRow = discount
    ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Rabatkode:</td><td>${discount.code} (−${discount.pct}%)</td></tr>`
    : "";

  const addonsText =
    data.addons.length > 0 ? data.addons.join(", ") : "Ingen";

  // Fuld ordreoversigt — kurv-varer blev tidligere slet ikke vist i mailen,
  // så ordrer med flere produkter så ud som ét produkt.
  const orderLines: Array<{ label: string; price?: number }> = [];
  if (data.speaker && data.speakerId !== "effects-only") {
    orderLines.push({
      label: data.speakerSize && data.speakerSize !== "—" ? `${data.speaker} (${data.speakerSize})` : data.speaker,
    });
  }
  for (const item of data.cartItems || []) {
    orderLines.push({ label: item.name, price: item.price });
  }
  for (const a of data.addons || []) {
    orderLines.push({ label: a });
  }
  const orderRowsHtml = orderLines.length
    ? orderLines
        .map(
          (l) =>
            `<tr><td style="padding:3px 12px 3px 0;">• ${l.label}</td><td style="text-align:right;white-space:nowrap;">${
              typeof l.price === "number" ? `${l.price} kr` : ""
            }</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="2" style="padding:3px 0;color:#888;">Ingen linjer registreret</td></tr>`;
  const orderTableHtml = `<table style="border-collapse:collapse;width:100%;max-width:420px;font-family:sans-serif;font-size:14px;">${orderRowsHtml}<tr><td style="padding-top:8px;border-top:1px solid #ddd;font-weight:bold;">I alt</td><td style="padding-top:8px;border-top:1px solid #ddd;text-align:right;font-weight:bold;">${data.total} kr</td></tr></table>`;

  const delivery = deliveryLine(data);
  const upsell = pickUpsell(data);
  // Adresse, CVR og mail i bekræftelsen kommer fra /admin/indstillinger
  const site = await loadSiteSettings(context.env.BOOKINGS);
  console.log("[book] upsell:", upsell?.id ?? "none", "addonIds:", data.addonIds);

  const ownerHtml = `
    <h2>Ny booking fra ${data.name}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;">
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top;">Ordre:</td><td>${orderTableHtml}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Periode:</td><td>${data.period}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Dage:</td><td>${data.days}</td></tr>
      ${delivery ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Kørsel:</td><td><strong>${delivery}</strong></td></tr>` : `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Kørsel:</td><td>Kunden henter og afleverer selv</td></tr>`}
      ${data.deliveryAddress ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Adresse:</td><td>${data.deliveryAddress}</td></tr>` : ""}
      ${discountRow}
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Total:</td><td><strong>${data.total} kr</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Upsell tilbudt:</td><td>${upsell ? `${upsell.title} @ ${upsell.offerPrice} kr (norm. ${upsell.listPrice})` : "Ingen"}</td></tr>
      <tr><td colspan="2" style="padding-top:12px;border-top:1px solid #ddd;"></td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Navn:</td><td>${data.name}</td></tr>
      ${data.company ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Firma:</td><td>${data.company}</td></tr>` : ""}
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email:</td><td>${data.email}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Telefon:</td><td>${data.phone}</td></tr>
      ${data.comment ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Kommentar:</td><td>${data.comment}</td></tr>` : ""}
    </table>
  `;

  const customerHtml = `
    <div style="font-family:sans-serif;max-width:480px;">
      <h2 style="color:#bfa000;">Tak for din booking!</h2>
      <p>Hej ${data.name},</p>
      <p>Vi har modtaget din booking og vender tilbage med bekræftelse hurtigst muligt.</p>
      <div style="background:#fffef0;padding:16px;border-radius:8px;margin:16px 0;">
        <p style="margin:4px 0 8px;"><strong>Din ordre:</strong></p>
        ${orderTableHtml}
        <p style="margin:12px 0 4px;"><strong>Periode:</strong> ${data.period}</p>
        ${delivery ? `<p style="margin:4px 0;"><strong>Kørsel:</strong> ${delivery}${data.deliveryAddress ? ` — ${data.deliveryAddress}` : ""}</p>` : `<p style="margin:4px 0;"><strong>Afhentning:</strong> ${site.pickupAddress}</p>`}
        ${discount ? `<p style="margin:4px 0;color:#1e7e34;"><strong>Rabat:</strong> ${discount.code} (−${discount.pct}%)</p>` : ""}
        <p style="margin:8px 0 0;font-size:20px;"><strong>Total: ${data.total} kr</strong></p>
        <p style="margin:0;font-size:12px;color:#888;">Betales ved afhentning (MobilePay eller kontant)</p>
      </div>
      <p><strong>Inkluderet:</strong> Alle kabler (iPhone m/ USB-C adapter, AUX, strøm).</p>
      ${upsell ? upsellCustomerHtml(upsell) : ""}
      <p style="margin-top:16px;color:#888;font-size:13px;">Ved spørgsmål er du velkommen til at svare på denne mail.</p>
      ${mailFooter(site)}
    </div>
  `;

  const fromEmail = `Lejhøjtaler.dk <info@lejhojtaler.dk>`;

  const emails = [
    {
      from: fromEmail,
      // Ordren går til firmaets mailadresse, så Frederik kan flytte modtageren
      // i /admin/indstillinger uden et deploy. NOTIFY_EMAIL er nødsporet hvis
      // KV ikke svarer — en ordre må aldrig gå tabt, fordi en indstilling er væk.
      to: notifyRecipients(site.company.email || NOTIFY_EMAIL),
      reply_to: data.email,
      subject: `Ny booking: ${data.speaker}${(data.cartItems?.length ?? 0) > 0 ? ` + ${data.cartItems!.length} mere` : ""} — ${data.period} — ${data.name}`,
      html: ownerHtml,
    },
    {
      from: fromEmail,
      to: [data.email],
      // Afsender og svaradresse er begge info@. Vi sendte tidligere fra
      // booking@, som ingen modtage-rute har i Cloudflare — svar dertil
      // bouncede med 550, og reply_to var det eneste værn.
      reply_to: site.company.email,
      subject: "Booking bekræftelse — Lejhøjtaler.dk",
      html: customerHtml,
    },
  ];

  for (const email of emails) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(email),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Resend error:", text);
      return new Response(JSON.stringify({ error: "Email failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // SMS-kvittering til kunden. Slået fra som standard (bekræftelsesmailen siger
  // det samme), men kan tændes i /admin/kommunikation. Sendes før KV-skrivningen,
  // så beskeden og dens linje i kommunikationsloggen lander i samme skrivning.
  let smsOutcome: SendSmsOutcome | null = null;
  try {
    smsOutcome = await sendBookingSms(context.env, data as unknown as Record<string, unknown>, "booking_modtaget");
  } catch (e) {
    console.error("[sms] kunne ikke sende kvittering:", e);
  }

  // Save booking to KV
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const key = `booking_${timestamp}_${random}`;
  try {
    const sentAt = new Date(timestamp).toISOString();
    const booking = {
      ...data,
      id: key,
      status: "ny",
      createdAt: sentAt,
      // Valideret server-side; null hvis koden var ukendt
      discount: discount ?? null,
      upsellOffered: upsell
        ? { id: upsell.id, offerPrice: upsell.offerPrice, listPrice: upsell.listPrice }
        : null,
      // Kommunikationslog: hver udgående mail til kunden gemmes her, så admin
      // kan se præcis hvad en given kunde har modtaget og hvornår.
      communications: [
        {
          type: "booking_bekraeftelse",
          label: "Bookingbekræftelse",
          to: data.email,
          sentAt,
          ...(upsell ? { note: `Inkl. tilbud: ${upsell.title} @ ${upsell.offerPrice} kr` } : {}),
        },
      ],
    };
    if (smsOutcome) recordSms(booking, smsOutcome);
    await context.env.BOOKINGS.put(key, JSON.stringify(booking));
  } catch (e) {
    console.error("KV save error:", e);
    // Don't fail the booking if KV save fails — emails were already sent
  }

  // Push til telefonen. Efter KV-skrivningen, så beskeden aldrig kommer før
  // ordren kan slås op — og i sit eget try/catch, fordi en telefon der ikke
  // kan nås aldrig må vælte en booking.
  try {
    await notifyPhones(context.env, data, key);
  } catch (e) {
    console.error("[push] kunne ikke sende:", e);
  }

  // Landede bookingen ud over det vi ejer? Vi tillader overbooking med vilje,
  // produkt for produkt (se /admin/lager), men så skal nogen vide det med det
  // samme — udstyret skal købes eller lejes ind inden udlevering.
  try {
    const hits = await notifyOverbooking(context.env, data as unknown as Record<string, unknown>, key);
    if (hits.length) {
      console.log("[overbooking]", key, hits.map((h) => `${h.id} ${h.booked}/${h.owned} ${h.day}`).join(", "));
    }
  } catch (e) {
    console.error("[overbooking] kunne ikke tjekke:", e);
  }

  return new Response(JSON.stringify({ ok: true, bookingId: key, upsell: upsell?.id ?? null }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
