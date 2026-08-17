/**
 * Offentlige web-indstillinger: telefonnummer og åbningstider.
 * GET  /api/site-settings — public
 * POST /api/site-settings?secret= — admin
 *
 * Begge dele skal kunne rettes uden deploy. Strukturen for åbningstider ligger i
 * src/lib/openingHours.ts, så serveren validerer efter præcis de regler
 * klienten viser.
 */
import { requireAdmin } from "./_lib/adminAuth";
import {
  DEFAULT_OPENING_HOURS,
  normalizeOpeningHours,
  validateOpeningHours,
  type OpeningHours,
} from "../../src/lib/openingHours";

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

function toResponse(digits: string, hours: OpeningHours, updatedAt: string | null) {
  const d = digits.length === 8 ? digits : DEFAULT_DIGITS;
  const e164 = `+45${d}`;
  return {
    phone: d,
    digits: d,
    display: formatDk(d),
    e164,
    href: `tel:${e164}`,
    hours,
    updatedAt,
  };
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const raw = await context.env.BOOKINGS.get(KV_KEY);
    if (!raw) return json(toResponse(DEFAULT_DIGITS, DEFAULT_OPENING_HOURS, null));
    const doc = JSON.parse(raw) as { phone?: string; hours?: unknown; updatedAt?: string };
    return json(
      toResponse(digitsOnly(doc.phone || ""), normalizeOpeningHours(doc.hours), doc.updatedAt ?? null),
    );
  } catch (e) {
    console.error("[site-settings] GET failed:", e);
    return json(toResponse(DEFAULT_DIGITS, DEFAULT_OPENING_HOURS, null));
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, cors);
  if (auth instanceof Response) return auth;

  let body: { phone?: unknown; hours?: unknown };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  // Det gemte er udgangspunktet: admin kan sende kun telefon eller kun tider
  let stored: { phone?: string; hours?: unknown } = {};
  try {
    const raw = await context.env.BOOKINGS.get(KV_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch {
    // ulæseligt dokument erstattes af det vi gemmer nu
  }

  let digits = digitsOnly(String(stored.phone || "")) || DEFAULT_DIGITS;
  if (body.phone !== undefined) {
    digits = digitsOnly(String(body.phone || ""));
    if (digits.length !== 8) {
      console.warn("[site-settings] ugyldigt nummer:", body.phone);
      return json({ error: "Telefonnummer skal være 8 cifre (fx 31 13 28 52)" }, 400);
    }
  }

  let hours = normalizeOpeningHours(stored.hours);
  if (body.hours !== undefined) {
    const valid = validateOpeningHours(body.hours);
    if (!valid.ok) {
      console.warn("[site-settings] ugyldige åbningstider:", valid.error);
      return json({ error: valid.error }, 400);
    }
    hours = valid.hours;
  }

  const updatedAt = new Date().toISOString();
  await context.env.BOOKINGS.put(KV_KEY, JSON.stringify({ phone: digits, hours, updatedAt }));
  console.log("[site-settings] gemt telefon", digits, "og", Object.values(hours.days).filter((d) => !d.closed).length, "åbne dage");
  return json({ ok: true, ...toResponse(digits, hours, updatedAt) });
};
