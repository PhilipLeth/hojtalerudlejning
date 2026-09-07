"use client";

/**
 * Anmeldelserne fra vores Google-profil, som de ser ud på sitet.
 *
 * Data kommer fra /api/anmeldelser (Places API + KV-cache). Er der ingen
 * anmeldelser endnu — eller er nøglen ikke sat — returnerer komponenten null,
 * og <Testimonials> viser sin egen tekst i stedet. Vi opfinder aldrig en
 * rating: alt herunder står i Googles egne felter.
 */

import { useState } from "react";
import { type Locale, t } from "@/lib/i18n";
import {
  formaterRating,
  GOOGLE_ANMELDELSESLINK,
  GOOGLE_PROFIL_URL,
  halveStjerner,
  initialer,
  type GoogleReview,
} from "@/lib/googleReviews";
import { useGoogleReviews } from "@/lib/useGoogleReviews";

/** Længere tekster foldes sammen — hele teksten står stadig i DOM'en */
const KLIP_VED_TEGN = 240;

function StjerneSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
    </svg>
  );
}

/**
 * Fem stjerner med guldfyld op til `value`. Halve stjerner klippes med en
 * overlejring i procent, så 4,5 ikke rundes op til 5 for øjet.
 */
function Stjerner({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  const pct = (Math.max(0, Math.min(5, halveStjerner(value))) / 5) * 100;
  return (
    <span className="relative inline-flex" role="img" aria-label={`${value} / 5`}>
      <span className="flex gap-0.5 text-white/15">
        {Array.from({ length: 5 }).map((_, i) => (
          <StjerneSvg key={i} className={`${size} fill-current`} />
        ))}
      </span>
      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-brand-500"
        style={{ width: `${pct}%` }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <StjerneSvg key={i} className={`${size} shrink-0 fill-current`} />
        ))}
      </span>
    </span>
  );
}

/** Googles egen G — den skal se ud som Google, ellers er det ikke troværdigt */
function GoogleLogo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

function Avatar({ review }: { review: GoogleReview }) {
  const [fejlet, setFejlet] = useState(false);
  if (review.photo && !fejlet) {
    return (
      // Googles profilbilleder ligger på lh3.googleusercontent.com og må vises
      // direkte derfra — de må ikke kopieres til vores egen R2.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={review.photo}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFejlet(true)}
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/15"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400/30 to-brand-600/10 text-sm font-semibold text-brand-300 ring-1 ring-white/15"
    >
      {initialer(review.author)}
    </span>
  );
}

function Kort({ review, locale }: { review: GoogleReview; locale: Locale }) {
  const s = t[locale].googleReviews;
  const [foldet, setFoldet] = useState(true);
  const lang = review.text.length > KLIP_VED_TEGN;

  return (
    <article className="group relative flex min-w-[85%] snap-center flex-col overflow-hidden rounded-2xl glass p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-400/40 hover:bg-white/[0.07] sm:min-w-0">
      {/* Citattegn som vandmærke — giver kortet dybde uden at stjæle plads */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 -top-8 select-none font-serif text-[7rem] leading-none text-white/[0.04] transition group-hover:text-brand-400/10"
      >
        &rdquo;
      </span>

      <div className="flex items-center gap-3">
        <Avatar review={review} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{review.author}</p>
          <p className="text-xs text-white/40">{review.relative}</p>
        </div>
        {review.uri ? (
          <a
            href={review.uri}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label={s.seeAll}
            className="ml-auto shrink-0 opacity-60 transition hover:opacity-100"
          >
            <GoogleLogo />
          </a>
        ) : (
          <GoogleLogo className="ml-auto h-4 w-4 shrink-0 opacity-60" />
        )}
      </div>

      <div className="mt-4">
        <Stjerner value={review.rating} />
      </div>

      <p
        className={`mt-3 text-sm leading-relaxed text-white/70 ${lang && foldet ? "line-clamp-5" : ""}`}
      >
        {review.text}
      </p>

      {lang && (
        <button
          type="button"
          onClick={() => setFoldet((v) => !v)}
          className="mt-2 self-start text-xs font-medium text-brand-400 hover:text-brand-300"
        >
          {foldet ? s.more : s.less}
        </button>
      )}
    </article>
  );
}

function Skelet() {
  return (
    <div className="grid gap-6 sm:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass animate-pulse rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10" />
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-white/10" />
              <div className="h-2 w-16 rounded bg-white/5" />
            </div>
          </div>
          <div className="mt-5 h-3 w-24 rounded bg-white/10" />
          <div className="mt-4 space-y-2">
            <div className="h-2.5 w-full rounded bg-white/5" />
            <div className="h-2.5 w-11/12 rounded bg-white/5" />
            <div className="h-2.5 w-4/5 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface GoogleReviewsProps {
  locale?: Locale;
  /** Vist mens vi henter — så sektionen ikke hopper ind fra ingenting */
  showSkeleton?: boolean;
}

/**
 * Returnerer null når der ikke er nogen anmeldelser at vise. Kalderen
 * bestemmer, hvad der så skal stå i stedet.
 */
export default function GoogleReviews({ locale = "da", showSkeleton = false }: GoogleReviewsProps) {
  const { data, loading } = useGoogleReviews(locale);
  const s = t[locale].googleReviews;

  if (loading && showSkeleton) {
    return (
      <section className="relative z-20 mx-auto max-w-4xl px-4 py-24">
        <Skelet />
      </section>
    );
  }
  if (!data.reviews.length) return null;

  const snit = data.rating ?? 0;
  const antal = data.total || data.reviews.length;
  const profil = data.url || GOOGLE_PROFIL_URL;

  return (
    <section className="relative z-20 mx-auto max-w-5xl px-4 py-24">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/60">
          <GoogleLogo />
          {s.badge}
        </span>

        <h2 className="mt-6 text-3xl font-bold sm:text-4xl">{s.title}</h2>
        <p className="mt-3 max-w-md text-sm text-white/50">{s.subtitle}</p>

        {!!data.rating && (
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl glass px-6 py-4">
            <span className="text-4xl font-bold leading-none text-white">
              {formaterRating(snit, locale)}
            </span>
            <span className="flex flex-col items-start gap-1">
              <Stjerner value={snit} size="h-5 w-5" />
              <span className="text-xs text-white/50">
                {antal} {antal === 1 ? s.countOne : s.countMany}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Mobil: swipe gennem kortene. Desktop: to og to. */}
      <div className="mt-12 -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0">
        {data.reviews.map((review, i) => (
          <Kort key={`${review.author}-${review.publishTime || i}`} review={review} locale={locale} />
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <a
          href={profil}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:border-brand-400/40 hover:bg-white/10"
        >
          <GoogleLogo />
          {s.seeAll}
        </a>
        <a
          href={GOOGLE_ANMELDELSESLINK}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white/50 transition hover:text-white"
        >
          {s.write}
        </a>
      </div>
    </section>
  );
}
