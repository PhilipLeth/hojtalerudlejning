/**
 * Offentlige web-indstillinger (telefonnummer).
 * GET  /api/site-settings — public
 * POST /api/site-settings?secret= — admin
 */
import { requireAdmin } from "./_lib/adminAuth";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const KV_KEY = "site_settings";
const DEFAULT_DIGITS = "31132852";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function digitsOnly(raw: string): string {
  const d = String(raw || "").replace(/\D/g, "");
  if (d.startsWith("45") && d.length === 10) return d.slice(2);
  return d;
}

function formatDk(digits: string): string {
  if (digits.length === 8) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)}`;
  }
  return digits;
}

function toResponse(digits: string, updatedAt: string | null) {
  const d = digits.length === 8 ? digits : DEFAULT_DIGITS;
  const e164 = `+45${d}`;
  return {
    phone: d,
    digits: d,
    display: formatDk(d),
    e164,
    href: `tel:${e164}`,
    updatedAt,
  };
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const raw = await context.env.BOOKINGS.get(KV_KEY);
    if (!raw) return json(toResponse(DEFAULT_DIGITS, null));
    const doc = JSON.parse(raw) as { phone?: string; updatedAt?: string };
    return json(toResponse(digitsOnly(doc.phone || ""), doc.updatedAt ?? null));
  } catch (e) {
    console.error("[site-settings] GET failed:", e);
    return json(toResponse(DEFAULT_DIGITS, null));
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, cors);
  if (auth instanceof Response) return auth;

  let body: { phone?: unknown };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  const digits = digitsOnly(String(body.phone || ""));
  if (digits.length !== 8) {
    console.warn("[site-settings] ugyldigt nummer:", body.phone);
    return json({ error: "Telefonnummer skal være 8 cifre (fx 31 13 28 52)" }, 400);
  }

  const updatedAt = new Date().toISOString();
  await context.env.BOOKINGS.put(KV_KEY, JSON.stringify({ phone: digits, updatedAt }));
  console.log("[site-settings] gemt telefon", digits);
  return json({ ok: true, ...toResponse(digits, updatedAt) });
};
