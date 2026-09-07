/**
 * Google-anmeldelser: fælles form for /api/anmeldelser og sitet.
 *
 * Vi viser rigtige anmeldelser fra Google Business-profilen (Place ID
 * ChIJ9UxZq-xTUkYRsiSY3hvy-MY) — de samme som review-mailen og -SMS'en beder
 * kunderne om at skrive. Places API (New) leverer højst fem, og vi viser de
 * fire nyeste.
 *
 * Googles vilkår for anmeldelsesdata er det, der styrer formen her:
 *   - navn, profilbillede og "for 2 uger siden" skal med, som Google skriver dem
 *   - teksten må ikke ændres (vi klipper den visuelt, men hele teksten står i DOM'en)
 *   - der skal linkes til anmeldelsen/profilen på Google
 *   - stedsdata må højst gemmes 30 dage (se KV_TTL_SEC i functions/api/anmeldelser.ts)
 *
 * Vi lægger IKKE aggregateRating/Review i structured data af det her. Google
 * tillader ikke, at man markerer anmeldelser op, som man selv har hentet fra
 * Google — se src/__tests__/structured-data.test.tsx.
 */

/** Lejhøjtaler.dk på Google Maps — samme sted som review-mailen peger på */
export const GOOGLE_PLACE_ID = "ChIJ9UxZq-xTUkYRsiSY3hvy-MY";

/** Kortlinket der åbner "skriv en anmeldelse" direkte */
export const GOOGLE_ANMELDELSESLINK = "https://g.page/r/CbIkmN4b8vjGEBM/review";

/** Profilen på Google Maps — bruges indtil Google selv har givet os en URL */
export const GOOGLE_PROFIL_URL = `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`;

/** Sitet viser de fire nyeste */
export const ANTAL_ANMELDELSER = 4;

export interface GoogleReview {
  /** Anmelderens navn, som Google viser det */
  author: string;
  /** Googles profilbillede — vises direkte fra Google, gemmes ikke */
  photo?: string;
  /** 1-5 */
  rating: number;
  /** Anmeldelsens tekst, uændret */
  text: string;
  /** Googles egen formulering: "for 2 uger siden" */
  relative: string;
  /** ISO — bruges til at sortere de nyeste frem */
  publishTime: string;
  /** Link til selve anmeldelsen på Google */
  uri?: string;
}

export interface GoogleReviewsData {
  /** Gennemsnittet på profilen, fx 4.9 */
  rating: number | null;
  /** Antal anmeldelser i alt — også dem vi ikke viser */
  total: number;
  /** Profilen på Google Maps */
  url: string | null;
  reviews: GoogleReview[];
  /** ISO — hvornår vi sidst hentede fra Google */
  fetchedAt: string;
}

export const TOMME_ANMELDELSER: GoogleReviewsData = {
  rating: null,
  total: 0,
  url: null,
  reviews: [],
  fetchedAt: "",
};

interface PlaceTekst {
  text?: unknown;
}

interface PlaceReview {
  rating?: unknown;
  text?: PlaceTekst;
  originalText?: PlaceTekst;
  relativePublishTimeDescription?: unknown;
  publishTime?: unknown;
  googleMapsUri?: unknown;
  authorAttribution?: {
    displayName?: unknown;
    photoUri?: unknown;
    uri?: unknown;
  };
}

function tekst(v: PlaceTekst | undefined): string {
  return typeof v?.text === "string" ? v.text.trim() : "";
}

function tal(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function normaliserAnmeldelse(raw: PlaceReview): GoogleReview | null {
  const author =
    typeof raw.authorAttribution?.displayName === "string"
      ? raw.authorAttribution.displayName.trim()
      : "";
  // Googles egen oversættelse først, ellers originalsproget
  const text = tekst(raw.text) || tekst(raw.originalText);
  const rating = tal(raw.rating);
  // Navn og stjerner er kravet; en anmeldelse uden tekst er stadig en rating,
  // men den fylder et kort uden at sige noget — den springer vi over
  if (!author || !text || !rating) return null;
  const photo =
    typeof raw.authorAttribution?.photoUri === "string" ? raw.authorAttribution.photoUri : undefined;
  const uri =
    typeof raw.googleMapsUri === "string"
      ? raw.googleMapsUri
      : typeof raw.authorAttribution?.uri === "string"
        ? raw.authorAttribution.uri
        : undefined;
  return {
    author,
    photo,
    rating: Math.max(1, Math.min(5, Math.round(rating))),
    text,
    relative:
      typeof raw.relativePublishTimeDescription === "string"
        ? raw.relativePublishTimeDescription
        : "",
    publishTime: typeof raw.publishTime === "string" ? raw.publishTime : "",
    uri,
  };
}

/**
 * Googles svar → det sitet skal bruge. De nyeste først, højst `antal`.
 * Alt der ikke ligner det forventede bliver kasseret frem for at vælte.
 */
export function parsePlace(
  raw: unknown,
  antal = ANTAL_ANMELDELSER,
): Omit<GoogleReviewsData, "fetchedAt"> {
  const place = (raw ?? {}) as {
    rating?: unknown;
    userRatingCount?: unknown;
    googleMapsUri?: unknown;
    reviews?: unknown;
  };
  const liste = Array.isArray(place.reviews) ? (place.reviews as PlaceReview[]) : [];
  const reviews = liste
    .map(normaliserAnmeldelse)
    .filter((r): r is GoogleReview => r !== null)
    // Google sorterer efter relevans som default — vi vil have de nyeste
    .sort((a, b) => (b.publishTime || "").localeCompare(a.publishTime || ""))
    .slice(0, antal);
  const total = tal(place.userRatingCount);
  return {
    rating: tal(place.rating),
    total: total !== null ? Math.round(total) : 0,
    url: typeof place.googleMapsUri === "string" ? place.googleMapsUri : null,
    reviews,
  };
}

/** Et svar fra /api/anmeldelser → sikker form, uanset hvad der kom retur */
export function parseAnmeldelsesSvar(raw: unknown): GoogleReviewsData {
  const data = (raw ?? {}) as Partial<GoogleReviewsData>;
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];
  return {
    rating: tal(data.rating),
    total: typeof data.total === "number" ? data.total : 0,
    url: typeof data.url === "string" ? data.url : null,
    reviews: reviews.filter(
      (r): r is GoogleReview =>
        !!r && typeof r.author === "string" && typeof r.text === "string" && typeof r.rating === "number",
    ),
    fetchedAt: typeof data.fetchedAt === "string" ? data.fetchedAt : "",
  };
}

/** Stjernerækken viser hele og halve stjerner — 4,7 bliver 4,5 */
export function halveStjerner(rating: number): number {
  return Math.round(rating * 2) / 2;
}

/** 4.9 → "4,9" (dansk komma), 5 → "5,0" */
export function formaterRating(rating: number, locale: "da" | "en" = "da"): string {
  const s = rating.toFixed(1);
  return locale === "da" ? s.replace(".", ",") : s;
}

/** Initialer til pladsholder-avatar når Google ikke har et profilbillede */
export function initialer(navn: string): string {
  return navn
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((d) => d[0]?.toUpperCase() ?? "")
    .join("");
}
