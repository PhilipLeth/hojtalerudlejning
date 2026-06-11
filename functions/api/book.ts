interface Env {
  SENDGRID_API_KEY: string;
  NOTIFY_EMAIL: string;
}

interface BookingData {
  speaker: string;
  speakerSize: string;
  period: string;
  addons: string[];
  total: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  comment: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { SENDGRID_API_KEY, NOTIFY_EMAIL } = context.env;

  if (!SENDGRID_API_KEY || !NOTIFY_EMAIL) {
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data: BookingData = await context.request.json();

  const addonsText =
    data.addons.length > 0 ? data.addons.join(", ") : "Ingen";

  // Email to owner
  const ownerHtml = `
    <h2>Ny booking fra ${data.name}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;">
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Højtaler:</td><td>${data.speaker} (${data.speakerSize})</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Periode:</td><td>${data.period}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Dato:</td><td>${data.date}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Tilvalg:</td><td>${addonsText}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Total:</td><td><strong>${data.total} kr</strong></td></tr>
      <tr><td colspan="2" style="padding-top:12px;border-top:1px solid #ddd;"></td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Navn:</td><td>${data.name}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email:</td><td>${data.email}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Telefon:</td><td>${data.phone}</td></tr>
      ${data.comment ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Kommentar:</td><td>${data.comment}</td></tr>` : ""}
    </table>
  `;

  // Email to customer
  const customerHtml = `
    <div style="font-family:sans-serif;max-width:480px;">
      <h2 style="color:#9b07bf;">Tak for din booking!</h2>
      <p>Hej ${data.name},</p>
      <p>Vi har modtaget din booking og vender tilbage med afhentningsadresse og bekræftelse hurtigst muligt.</p>
      <div style="background:#f8f4ff;padding:16px;border-radius:8px;margin:16px 0;">
        <p style="margin:4px 0;"><strong>Højtaler:</strong> ${data.speaker} (${data.speakerSize})</p>
        <p style="margin:4px 0;"><strong>Periode:</strong> ${data.period}</p>
        <p style="margin:4px 0;"><strong>Dato:</strong> ${data.date}</p>
        <p style="margin:4px 0;"><strong>Tilvalg:</strong> ${addonsText}</p>
        <p style="margin:8px 0 0;font-size:20px;"><strong>Total: ${data.total} kr</strong></p>
        <p style="margin:0;font-size:12px;color:#888;">Betales ved afhentning (MobilePay eller kontant)</p>
      </div>
      <p><strong>Åbningstider:</strong></p>
      <p style="margin:4px 0;">Afhentning: Fredag 14:00–18:00</p>
      <p style="margin:4px 0;">Aflevering: Mandag 15:00–17:00</p>
      <p style="margin-top:16px;color:#888;font-size:13px;">Ved spørgsmål er du velkommen til at svare på denne mail.</p>
    </div>
  `;

  const messages = [
    {
      to: [{ email: NOTIFY_EMAIL }],
      from: { email: NOTIFY_EMAIL, name: "Højtalerudlejning.dk" },
      reply_to: { email: data.email, name: data.name },
      subject: `Ny booking: ${data.speaker} — ${data.date} — ${data.name}`,
      content: [{ type: "text/html", value: ownerHtml }],
    },
    {
      to: [{ email: data.email, name: data.name }],
      from: { email: NOTIFY_EMAIL, name: "Højtalerudlejning.dk" },
      subject: "Booking bekræftelse — Højtalerudlejning.dk",
      content: [{ type: "text/html", value: customerHtml }],
    },
  ];

  for (const msg of messages) {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ personalizations: [{ to: msg.to }], from: msg.from, reply_to: msg.reply_to, subject: msg.subject, content: msg.content }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("SendGrid error:", text);
      return new Response(JSON.stringify({ error: "Email failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
