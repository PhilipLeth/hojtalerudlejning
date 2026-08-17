import { requireAdmin } from "./_lib/adminAuth";

/**
 * Udleveringskvittering: kunden skriver under på telefonen ved udlevering.
 *
 * Underskriften er et PNG (data-URL) og gemmes for sig under
 * "handover_sig_<bookingId>" — ikke på selve bookingen. Ellers ville hvert
 * kald til /api/bookings trække alle underskrifter med og gøre admin-listen
 * tung på mobilen. På bookingen står kun kvitteringens metadata.
 */

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

const sigKey = (bookingId: string) => `handover_sig_${bookingId}`;

/** Maks. størrelse på en underskrift — et signature pad giver typisk 10-40 kB */
const MAX_SIGNATURE_CHARS = 400_000;

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

/** Hent en gemt underskrift (billedet) til visning på lejeseddel/udleveringsside */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  const id = new URL(context.request.url).searchParams.get("id");
  if (!id || !id.startsWith("booking_")) return json({ error: "Invalid booking id" }, 400);

  try {
    const [raw, signature] = await Promise.all([
      context.env.BOOKINGS.get(id),
      context.env.BOOKINGS.get(sigKey(id)),
    ]);
    if (!raw) return json({ error: "Booking not found" }, 404);
    const booking = JSON.parse(raw);
    return json({ booking, signature: signature ?? null });
  } catch (e) {
    console.error("Handover GET error:", e);
    return json({ error: "Failed to load handover" }, 500);
  }
};

interface HandoverBody {
  id: string;
  /** PNG som data-URL fra signature-canvas */
  signature: string;
  /** Hvem der skrev under — typisk lejeren selv */
  signerName?: string;
  /** Hvilke varelinjer der blev kvitteret for */
  items?: string[];
  /** Bemærkninger om stand/mangler ved udlevering */
  note?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  let body: HandoverBody;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!body.id || !body.id.startsWith("booking_")) return json({ error: "Invalid booking id" }, 400);
  if (typeof body.signature !== "string" || !body.signature.startsWith("data:image/png;base64,")) {
    return json({ error: "Underskrift mangler" }, 400);
  }
  if (body.signature.length > MAX_SIGNATURE_CHARS) return json({ error: "Underskrift for stor" }, 413);

  try {
    const raw = await context.env.BOOKINGS.get(body.id);
    if (!raw) return json({ error: "Booking not found" }, 404);

    const booking = JSON.parse(raw);
    const signedAt = new Date().toISOString();

    booking.handover = {
      signedAt,
      signerName: String(body.signerName || booking.name || "").slice(0, 120),
      items: Array.isArray(body.items) ? body.items.slice(0, 40).map((i) => String(i).slice(0, 160)) : [],
      note: String(body.note || "").slice(0, 1000),
    };
    // Underskriften er selve udleveringen — statussen skal ikke sættes bagefter
    if (booking.status === "ny" || booking.status === "bekraeftet" || booking.status === "pakket") {
      booking.status = "afhentet";
    }
    booking.updatedAt = signedAt;

    await Promise.all([
      context.env.BOOKINGS.put(sigKey(body.id), body.signature),
      context.env.BOOKINGS.put(body.id, JSON.stringify(booking)),
    ]);

    return json({ ok: true, booking });
  } catch (e) {
    console.error("Handover POST error:", e);
    return json({ error: "Failed to save handover" }, 500);
  }
};
