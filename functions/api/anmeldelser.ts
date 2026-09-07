/* ───── Google-anmeldelser: offentlig visning ─────
 *
 * GET /api/anmeldelser?sprog=da|en — ingen secret. Henter de nyeste
 * anmeldelser fra Google Business-profilen via Places API (New) og cacher dem
 * i KV, så sitet ikke rammer Google (og betaler for det) ved hvert sidevisning.
 *
 * Nøglen er en env-secret, GOOGLE_PLACES_API_KEY. Er den ikke sat, svarer
 * endpointet tomt — og sitet falder tilbage til sin egen tekst frem for at
 * vise et tomt hul. Kald aldrig Google fra klienten: nøglen ville ligge i
 * kildekoden, og enhver kunne bruge den på vores regning.
 *
 * Cachen har to lag:
 *   1. FRESH_MS: inden for seks timer svarer vi direkte fra KV
 *   2. KV_TTL_SEC: en ældre kopi bruges stadig, hvis Google er nede — men
 *      højst 30 dage, som er Googles grænse for at gemme stedsdata
 *
 * ?refresh=1 tvinger et nyt kald, men kun for en logget admin — ellers kunne
 * hvem som helst brænde vores Places-kvote af.
 */

import { requireAdmin } from "./_lib/adminAuth";
import { timeoutSignal } from "../../src/lib/fetchTimeout";
import {
  ANTAL_ANMELDELSER,
  GOOGLE_PLACE_ID,
  parsePlace,
  TOMME_ANMELDELSER,
  type GoogleReviewsData,
} from "../../src/lib/googleReviews";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET?: string;
  GOOGLE_PLACES_API_KEY?: string;
  GOOGLE_PLACE_ID?: string;
}

/** Kan overskrives med env GOOGLE_PLACE_ID uden ny deploy */
export const PLACE_ID_FALLBACK = GOOGLE_PLACE_ID;

/** Hvor længe en hentning regnes som frisk */
export const FRESH_MS = 6 * 60 * 60 * 1000;
/** Googles grænse for at gemme stedsdata: 30 dage */
export const KV_TTL_SEC = 30 * 24 * 60 * 60;
const TIMEOUT_MS = 8_000;

export const kvNoegle = (sprog: string) => `google_reviews_${sprog}`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
  // Anmeldelser ændrer sig sjældent; en time i browseren/kanten er rigeligt
  "Cache-Control": "public, max-age=3600",
};

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

const svar = (data: GoogleReviewsData) =>
  new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });

async function laesCache(kv: KVNamespace, sprog: string): Promise<GoogleReviewsData | null> {
  try {
    const raw = await kv.get(kvNoegle(sprog));
    if (!raw) return null;
    const data = JSON.parse(raw) as GoogleReviewsData;
    return Array.isArray(data?.reviews) ? data : null;
  } catch {
    return null;
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const sprog = url.searchParams.get("sprog") === "en" ? "en" : "da";
  const kv = context.env.BOOKINGS;

  const cache = kv ? await laesCache(kv, sprog) : null;

  let tvungen = false;
  if (url.searchParams.get("refresh") === "1") {
    const auth = await requireAdmin(context, corsHeaders);
    if (auth instanceof Response) return auth;
    tvungen = true;
  }

  const frisk = cache && Date.now() - Date.parse(cache.fetchedAt || "") < FRESH_MS;
  if (cache && frisk && !tvungen) return svar(cache);

  const key = context.env.GOOGLE_PLACES_API_KEY;
  // Ingen nøgle = funktionen er ikke slået til endnu. Det er ikke en fejl for
  // kunden — sitet viser bare sin egen tekst.
  if (!key) return svar(cache ?? TOMME_ANMELDELSER);

  const placeId = context.env.GOOGLE_PLACE_ID || PLACE_ID_FALLBACK;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=${sprog}&regionCode=DK`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          // Kun de felter vi bruger — Places afregnes efter felterne man beder om
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
        },
        signal: timeoutSignal(TIMEOUT_MS),
      },
    );
    if (!res.ok) {
      // 403/429 fra Google må ikke tømme sitet — den gamle kopi er bedre end intet
      return svar(cache ?? TOMME_ANMELDELSER);
    }
    const place = await res.json();
    const parsed = parsePlace(place, ANTAL_ANMELDELSER);
    // Et tomt svar fra Google (fx forkert Place ID) må ikke overskrive
    // anmeldelser vi allerede har hentet
    if (!parsed.reviews.length && cache?.reviews.length) return svar(cache);

    const data: GoogleReviewsData = { ...parsed, fetchedAt: new Date().toISOString() };
    if (kv) {
      try {
        await kv.put(kvNoegle(sprog), JSON.stringify(data), { expirationTtl: KV_TTL_SEC });
      } catch {
        // KV-kvoten er ikke kundens problem — anmeldelserne er hentet
      }
    }
    return svar(data);
  } catch {
    return svar(cache ?? TOMME_ANMELDELSER);
  }
};
