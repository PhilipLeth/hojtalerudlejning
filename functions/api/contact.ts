/* ───── Kontaktformular ─────
 *
 * POST { name, email, message, phone?, website? } → mail til NOTIFY_EMAIL
 * via Resend, med kundens adresse som reply_to.
 *
 * "website" er et honeypot-felt: skjult for mennesker, udfyldes af bots.
 * Udfyldt honeypot giver et falsk OK, så botten ikke lærer noget.
 */

interface Env {
  RESEND_API_KEY: string;
  NOTIFY_EMAIL: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export interface ContactInput {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  topic?: unknown;
  /** Honeypot — skal være tom */
  website?: unknown;
}

export type ContactValidation =
  | { ok: true; name: string; email: string; phone: string; message: string; topic: string }
  | { ok: false; error: string }
  | { ok: false; honeypot: true };

/** Ren valideringsfunktion — testbar uden Workers-runtime. */
export function validateContact(input: ContactInput): ContactValidation {
  if (typeof input.website === "string" && input.website.trim() !== "") {
    return { ok: false, honeypot: true };
  }
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim();
  const phone = String(input.phone ?? "").trim();
  const message = String(input.message ?? "").trim();
  // Frit emne fra ?emne= — begrænses så det ikke kan misbruges i emnelinjen
  const topic = String(input.topic ?? "").trim().slice(0, 40).replace(/[\r\n]/g, "");

  if (name.length < 2 || name.length > 100) return { ok: false, error: "Skriv dit navn" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: "Ugyldig emailadresse" };
  if (message.length < 5) return { ok: false, error: "Skriv en besked" };
  if (message.length > 5000) return { ok: false, error: "Beskeden er for lang (maks 5000 tegn)" };
  return { ok: true, name, email, phone, message, topic };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { RESEND_API_KEY, NOTIFY_EMAIL } = context.env;
  if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
    return json({ error: "Server not configured" }, 500);
  }

  let input: ContactInput;
  try {
    input = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  const v = validateContact(input);
  if (!v.ok) {
    // Honeypot: lad botten tro den lykkedes
    if ("honeypot" in v) return json({ ok: true });
    return json({ error: v.error }, 400);
  }

  const html = `
    <h2>Kontaktformular — besked fra ${escapeHtml(v.name)}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;">
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Navn:</td><td>${escapeHtml(v.name)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email:</td><td>${escapeHtml(v.email)}</td></tr>
      ${v.phone ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Telefon:</td><td>${escapeHtml(v.phone)}</td></tr>` : ""}
    </table>
    <p style="font-family:sans-serif;white-space:pre-wrap;background:#f8f8f8;padding:14px;border-radius:8px;">${escapeHtml(v.message)}</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Lejhøjtaler.dk <info@lejhojtaler.dk>",
      to: [NOTIFY_EMAIL],
      reply_to: v.email,
      subject: v.topic ? `${v.topic}: ${v.name}` : `Kontaktformular: ${v.name}`,
      html,
    }),
  });

  if (!res.ok) {
    console.error("[contact] send failed:", await res.text());
    return json({ error: "Kunne ikke sende beskeden — prøv igen eller ring til os" }, 502);
  }
  return json({ ok: true });
};
