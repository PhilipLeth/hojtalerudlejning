interface Env {
  RESEND_API_KEY: string;
  NOTIFY_EMAIL: string;
  BOOKINGS: KVNamespace;
}

interface BookingData {
  speaker: string;
  speakerSize: string;
  period: string;
  days: number;
  addons: string[];
  deliveryAddress?: string;
  total: number;
  name: string;
  email: string;
  phone: string;
  comment: string;
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

  const ownerHtml = `
    <h2>Ny booking fra ${data.name}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;">
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Højtaler:</td><td>${data.speaker} (${data.speakerSize})</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Periode:</td><td>${data.period}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Dage:</td><td>${data.days}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Tilvalg:</td><td>${addonsText}</td></tr>
      ${data.deliveryAddress ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Leveringsadresse:</td><td>${data.deliveryAddress}</td></tr>` : ""}
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Total:</td><td><strong>${data.total} kr</strong></td></tr>
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
      <p><strong>Inkluderet:</strong> Alle kabler (iPhone m/ USB-C adapter, AUX, strøm), padded sportstaske.</p>
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
  try {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const key = `booking_${timestamp}_${random}`;
    const booking = {
      ...data,
      id: key,
      status: "ny",
      createdAt: new Date(timestamp).toISOString(),
    };
    await context.env.BOOKINGS.put(key, JSON.stringify(booking));
  } catch (e) {
    console.error("KV save error:", e);
    // Don't fail the booking if KV save fails — emails were already sent
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
