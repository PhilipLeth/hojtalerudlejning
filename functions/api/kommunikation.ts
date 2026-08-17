/* ───── Kundekommunikation (admin) ─────
 *
 * GET  → skabelon, personaleliste, delekode + en forhåndsvisning fyldt ud med
 *        en rigtig booking, så man kan se mailen som kunden får den.
 * POST → gemmer indstillingerne.
 *
 * Delekoden skrives samtidig ind i rabatkode-mappet. Ellers ville mailen love
 * en rabat, der ikke kan indløses — koden skal være ægte i samme øjeblik den
 * står i teksten.
 */

import { loadBookings } from "./_lib/bookings";
import {
  DEFAULT_SETTINGS,
  KV_COMM_SETTINGS,
  SHORTCODES,
  buildFollowUpMail,
  parseCommSettings,
  signatureFor,
} from "../../src/lib/commTemplates";
import { DISCOUNT_CODES_KEY, loadCustomCodes } from "./_lib/discounts";
import { KV_SALE_CAMPAIGN, parseCampaign } from "./_lib/weekendSale";

import { requireAdmin } from "./_lib/adminAuth";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
  GOOGLE_REVIEW_URL?: string;
}

const GOOGLE_REVIEW_FALLBACK = "https://g.page/r/CbIkmN4b8vjGEBM/review";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

async function readJson(kv: KVNamespace, key: string): Promise<unknown> {
  const raw = await kv.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Eksempeldata til forhåndsvisningen. Tages fra den senest afsluttede ordre,
 * så man ser mailen med rigtige produktnavne og datoer — ikke "Lorem ipsum".
 */
async function previewContext(kv: KVNamespace) {
  const bookings = await loadBookings(kv);
  const latest = bookings.sort((a, b) => b.pickup.localeCompare(a.pickup))[0];
  const produkter = latest?.cartItems?.map((c) => c.name).filter(Boolean).join(", ");
  return {
    fornavn: "Agnes",
    navn: "Agnes Dahle Stæhr",
    produkter: produkter || "Stor højtalerpakke, Lys-pakke",
    periode: latest ? `${latest.pickup} → ${latest.returnDate}` : "fre 21. aug → man 24. aug",
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  try {
    const kv = context.env.BOOKINGS;
    const [settingsRaw, campaignRaw, preview] = await Promise.all([
      readJson(kv, KV_COMM_SETTINGS),
      readJson(kv, KV_SALE_CAMPAIGN),
      previewContext(kv),
    ]);

    const settings = settingsRaw ? parseCommSettings(settingsRaw) : DEFAULT_SETTINGS;
    const campaign = campaignRaw ? parseCampaign(campaignRaw) : null;
    const reviewUrl = context.env.GOOGLE_REVIEW_URL || GOOGLE_REVIEW_FALLBACK;

    // Udsalgsafsnittet er kun med, når udsalget rent faktisk er tændt
    const udsalg =
      campaign?.active
        ? `PS: Vi har weekendudsalg lige nu — ${campaign.pct}% på det udstyr der står ledigt til weekenden. Brug koden ${campaign.code.toUpperCase()}.`
        : "";

    const ansvarlig = settings.staff[0]?.name;
    const mail = buildFollowUpMail(settings, {
      ...preview,
      ansvarlig,
      hilsen: signatureFor(settings, ansvarlig),
      besked: "Fedt I fik gang i dansegulvet — kom endelig igen!",
      rabatkode: settings.referralCode,
      rabatpct: settings.referralPct,
      udsalg,
      reviewUrl,
    });

    return json({
      settings,
      shortcodes: SHORTCODES,
      preview: mail,
      /** Så admin kan se, at udsalgs-shortcoden faktisk har noget at sige */
      saleActive: !!campaign?.active,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Ukendt fejl" }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  const settings = parseCommSettings(body);
  const kv = context.env.BOOKINGS;

  try {
    await kv.put(KV_COMM_SETTINGS, JSON.stringify(settings));

    // Gør delekoden ægte. Uden dette lover mailen en rabat, der bliver afvist
    // ved booking.
    const codes = await loadCustomCodes(kv);
    if (codes[settings.referralCode] !== settings.referralPct) {
      codes[settings.referralCode] = settings.referralPct;
      await kv.put(DISCOUNT_CODES_KEY, JSON.stringify(codes));
    }

    return json({ ok: true, settings });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Kunne ikke gemme" }, 500);
  }
};
