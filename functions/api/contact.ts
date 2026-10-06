/* ───── Kontaktformular ─────
 *
 * POST { name, email, message, phone?, website?, billeder? } → mail til
 * NOTIFY_EMAIL via Resend, med kundens adresse som reply_to.
 *
 * billeder (6. okt 2026): kundens fotos af lokalet, så vi kan lave et eksempel
 * på opstillingen i tilbuddet. De gemmes i R2 og serveres fra /api/image/…,
 * så linket i mailen kan sættes direkte ind i /admin/tilbud → Billeder.
 *
 * "website" er et honeypot-felt: skjult for mennesker, udfyldes af bots.
 * Udfyldt honeypot giver et falsk OK, så botten ikke lærer noget.
 */

import { notifyRecipients } from "./_lib/notify";
import { loadSiteSettings } from "./_lib/siteSettings";
import { TIMEOUT_MAIL_MS, timeoutSignal } from "../../src/lib/fetchTimeout";

interface Env {
  RESEND_API_KEY: string;
  NOTIFY_EMAIL: string;
  BOOKINGS: KVNamespace;
  MEDIA?: R2Bucket;
}

export const MAX_KUNDE_BILLEDER = 5;
const MAX_BILLED_BYTES = 1_000_000;

export interface KundeBillede {
  navn: string;
  type: "image/jpeg" | "image/png" | "image/webp";
  bytes: Uint8Array;
}

/** Filens første bytes skal passe til typen — ikke kun det, browseren påstår */
function rigtigtFormat(b: Uint8Array): KundeBillede["type"] | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  return null;
}

/** Ren funktion — testbar. Ugyldige filer springes over i stedet for at afvise beskeden. */
export function parseKundeBilleder(input: unknown): KundeBillede[] {
  const ud: KundeBillede[] = [];
  for (const raw of Array.isArray(input) ? input.slice(0, MAX_KUNDE_BILLEDER) : []) {
    const r = raw as { navn?: unknown; data?: unknown };
    if (typeof r?.data !== "string" || r.data.length > MAX_BILLED_BYTES * 1.4) continue;
    let bytes: Uint8Array;
    try {
      const bin = atob(r.data);
      bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    } catch {
      continue;
    }
    if (!bytes.length || bytes.length > MAX_BILLED_BYTES) continue;
    const type = rigtigtFormat(bytes);
    if (!type) continue;
    const navn = String(r.navn ?? "billede").replace(/[^\w.\- æøåÆØÅ]/g, "").slice(0, 80) || "billede";
    ud.push({ navn, type, bytes });
  }
  return ud;
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
  billeder?: unknown;
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

function bytesTilB64(b: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(bin);
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

  // Kundens billeder: i R2, så de har et link, vi kan bruge i tilbuddet. Fejler
  // det, kommer de stadig med som vedhæftning — beskeden må ikke gå tabt.
  const billeder = parseKundeBilleder(input.billeder);
  const links: string[] = [];
  const origin = new URL(context.request.url).origin;
  for (const b of billeder) {
    if (!context.env.MEDIA) break;
    const key = `kunde_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    try {
      await context.env.MEDIA.put(`img/${key}`, b.bytes, { httpMetadata: { contentType: b.type } });
      links.push(`${origin}/api/image/${key}`);
    } catch (e) {
      console.error("[contact] kunne ikke gemme billede:", e);
    }
  }
  const billedHtml = billeder.length
    ? `<h3 style="font-family:sans-serif;margin-top:20px;">${billeder.length} billede${billeder.length === 1 ? "" : "r"} fra kunden</h3>
       ${links.length ? `<p style="font-family:sans-serif;font-size:13px;color:#555;">Sæt linket ind i /admin/tilbud → Billeder → "Link til billede", så kan det bruges i tilbuddet eller som kundens lokale i AI-billedet.</p>` : ""}
       <div>${links.map((l) => `<a href="${l}" style="display:inline-block;margin:0 8px 8px 0;"><img src="${l}" width="180" style="border-radius:8px;display:block;"></a>`).join("")}</div>
       ${links.map((l) => `<div style="font-family:monospace;font-size:12px;">${l}</div>`).join("")}`
    : "";

  const html = `
    <h2>Kontaktformular — besked fra ${escapeHtml(v.name)}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;">
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Navn:</td><td>${escapeHtml(v.name)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email:</td><td>${escapeHtml(v.email)}</td></tr>
      ${v.phone ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Telefon:</td><td>${escapeHtml(v.phone)}</td></tr>` : ""}
    </table>
    <p style="font-family:sans-serif;white-space:pre-wrap;background:#f8f8f8;padding:14px;border-radius:8px;">${escapeHtml(v.message)}</p>
    ${billedHtml}
  `;

  // Samme modtager som ordremails: firmaets adresse fra /admin/indstillinger,
  // med NOTIFY_EMAIL som nødspor hvis KV ikke svarer.
  const site = await loadSiteSettings(context.env.BOOKINGS);
  const modtagere = site.company.email || NOTIFY_EMAIL;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    signal: timeoutSignal(TIMEOUT_MAIL_MS),
    body: JSON.stringify({
      from: "Lejhøjtaler.dk <info@lejhojtaler.dk>",
      to: notifyRecipients(modtagere),
      reply_to: v.email,
      subject: `${v.topic ? `${v.topic}: ${v.name}` : `Kontaktformular: ${v.name}`}${billeder.length ? ` (${billeder.length} billede${billeder.length === 1 ? "" : "r"})` : ""}`,
      html,
      ...(billeder.length
        ? { attachments: billeder.map((b) => ({ filename: b.navn.includes(".") ? b.navn : `${b.navn}.${b.type.split("/")[1]}`, content: bytesTilB64(b.bytes) })) }
        : {}),
    }),
  });

  if (!res.ok) {
    console.error("[contact] send failed:", await res.text());
    return json({ error: "Kunne ikke sende beskeden — prøv igen eller ring til os" }, 502);
  }
  return json({ ok: true });
};
