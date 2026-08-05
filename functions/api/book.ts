interface Env {
  RESEND_API_KEY: string;
  NOTIFY_EMAIL: string;
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
  deliveryAddress?: string;
  total: number;
  name: string;
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
    // Festpakkerne indeholder lys-pakken
    ids.has("pakke_fest_lille") ||
    ids.has("pakke_fest_stor") ||
    labels.some((l) => l.includes("lys") || l.includes("disco"));
  const hasRog =
    ids.has("rog") ||
    ids.has("low_fog") ||
    labels.some((l) => l.includes("røg") || l.includes("rog") || l.includes("fog"));
  const hasSetup =
    ids.has("levering_opsaetning") ||
    labels.some((l) => l.includes("opsætning") || l.includes("opsatning"));
  const hasDelivery = hasSetup;

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

  // 3) No delivery → levering + opsætning (495)
  if (!hasDelivery) {
    const list = 495;
    return {
      id: "levering_opsaetning",
      title: "Levering + opsætning",
      blurb: "Vi kører ud, sætter alt op klar til brug og henter igen.",
      listPrice: list,
      offerPrice: offerPrice(list),
    };
  }

  return null;
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

  const addonsText =
    data.addons.length > 0 ? data.addons.join(", ") : "Ingen";

  const upsell = pickUpsell(data);
  console.log("[book] upsell:", upsell?.id ?? "none", "addonIds:", data.addonIds);

  const ownerHtml = `
    <h2>Ny booking fra ${data.name}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;">
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Højtaler:</td><td>${data.speaker} (${data.speakerSize})</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Periode:</td><td>${data.period}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Dage:</td><td>${data.days}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Tilvalg:</td><td>${addonsText}</td></tr>
      ${data.deliveryAddress ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Leveringsadresse:</td><td>${data.deliveryAddress}</td></tr>` : ""}
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Total:</td><td><strong>${data.total} kr</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Upsell tilbudt:</td><td>${upsell ? `${upsell.title} @ ${upsell.offerPrice} kr (norm. ${upsell.listPrice})` : "Ingen"}</td></tr>
      <tr><td colspan="2" style="padding-top:12px;border-top:1px solid #ddd;"></td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Navn:</td><td>${data.name}</td></tr>
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
        <p style="margin:4px 0;"><strong>Højtaler:</strong> ${data.speaker} (${data.speakerSize})</p>
        <p style="margin:4px 0;"><strong>Periode:</strong> ${data.period}</p>
        <p style="margin:4px 0;"><strong>Tilvalg:</strong> ${addonsText}</p>
        ${data.deliveryAddress ? `<p style="margin:4px 0;"><strong>Levering til:</strong> ${data.deliveryAddress}</p>` : `<p style="margin:4px 0;"><strong>Afhentning:</strong> Halvtolv 9, 1. th, København K</p>`}
        <p style="margin:8px 0 0;font-size:20px;"><strong>Total: ${data.total} kr</strong></p>
        <p style="margin:0;font-size:12px;color:#888;">Betales ved afhentning (MobilePay eller kontant)</p>
      </div>
      <p><strong>Inkluderet:</strong> Alle kabler (iPhone m/ USB-C adapter, AUX, strøm).</p>
      ${upsell ? upsellCustomerHtml(upsell) : ""}
      <p style="margin-top:16px;color:#888;font-size:13px;">Ved spørgsmål er du velkommen til at svare på denne mail.</p>
      <p style="margin-top:8px;color:#bbb;font-size:12px;">Scharling Studio &middot; Halvtolv 9, 1. th &middot; 1436 København K &middot; CVR 40994904</p>
    </div>
  `;

  const fromEmail = `Lejhøjtaler.dk <booking@lejhojtaler.dk>`;

  const emails = [
    {
      from: fromEmail,
      to: [NOTIFY_EMAIL],
      reply_to: data.email,
      subject: `Ny booking: ${data.speaker} — ${data.period} — ${data.name}`,
      html: ownerHtml,
    },
    {
      from: fromEmail,
      to: [data.email],
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
    await context.env.BOOKINGS.put(key, JSON.stringify(booking));
  } catch (e) {
    console.error("KV save error:", e);
    // Don't fail the booking if KV save fails — emails were already sent
  }

  return new Response(JSON.stringify({ ok: true, bookingId: key, upsell: upsell?.id ?? null }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
