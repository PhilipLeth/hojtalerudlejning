"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  parseAnmeldelsesSvar,
  TOMME_ANMELDELSER,
  type GoogleReviewsData,
} from "@/lib/googleReviews";

/** Ét kald pr. sprog pr. sidevisning — Testimonials står på 16 sider */
const cache: Partial<Record<Locale, GoogleReviewsData>> = {};
const inflight: Partial<Record<Locale, Promise<GoogleReviewsData>>> = {};

async function hentAnmeldelser(locale: Locale): Promise<GoogleReviewsData> {
  const cached = cache[locale];
  if (cached) return cached;
  if (!inflight[locale]) {
    inflight[locale] = fetch(`/api/anmeldelser?sprog=${locale}`)
      .then((res) => res.json())
      .then((json) => {
        const data = parseAnmeldelsesSvar(json);
        cache[locale] = data;
        return data;
      })
      // Ingen anmeldelser er et gyldigt svar: sitet viser sin egen tekst i stedet
      .catch(() => TOMME_ANMELDELSER)
      .finally(() => {
        delete inflight[locale];
      });
  }
  return inflight[locale]!;
}

export interface GoogleReviewsState {
  data: GoogleReviewsData;
  /** Sandt indtil første svar — sitet skal ikke blinke tomt imens */
  loading: boolean;
}

export function useGoogleReviews(locale: Locale = "da"): GoogleReviewsState {
  const [data, setData] = useState<GoogleReviewsData>(() => cache[locale] ?? TOMME_ANMELDELSER);
  const [loading, setLoading] = useState(() => !cache[locale]);

  useEffect(() => {
    let levende = true;
    const kendt = cache[locale];
    if (kendt) {
      setData(kendt);
      setLoading(false);
      return;
    }
    setLoading(true);
    hentAnmeldelser(locale).then((næste) => {
      if (!levende) return;
      setData(næste);
      setLoading(false);
    });
    return () => {
      levende = false;
    };
  }, [locale]);

  return { data, loading };
}

/** Kun til test — nulstiller modul-cachen mellem cases */
export function __nulstilAnmeldelsesCache() {
  for (const key of Object.keys(cache)) delete cache[key as Locale];
  for (const key of Object.keys(inflight)) delete inflight[key as Locale];
}
