"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PHONE, type SitePhone } from "@/lib/phone";
import {
  DEFAULT_OPENING_HOURS,
  normalizeOpeningHours,
  type OpeningHours,
} from "@/lib/openingHours";

/** Det offentlige sitet henter i én omgang: nummer og åbningstider */
export interface SiteSettings extends SitePhone {
  hours: OpeningHours;
}

const DEFAULTS: SiteSettings = { ...DEFAULT_PHONE, hours: DEFAULT_OPENING_HOURS };

let cached: SiteSettings | null = null;
let inflight: Promise<SiteSettings> | null = null;

async function loadSiteSettings(): Promise<SiteSettings> {
  if (cached) return cached;
  if (!inflight) {
    inflight = fetch("/api/site-settings")
      .then(async (res) => {
        const json = (await res.json()) as Partial<SitePhone> & { phone?: string; hours?: unknown };
        const next: SiteSettings = {
          digits: json.digits || DEFAULT_PHONE.digits,
          display: json.display || DEFAULT_PHONE.display,
          e164: json.e164 || DEFAULT_PHONE.e164,
          href: json.href || DEFAULT_PHONE.href,
          // Serveren normaliserer også, men klienten skal kunne stå alene med
          // et gammelt eller halvt svar uden at vise tomme åbningstider
          hours: normalizeOpeningHours(json.hours),
        };
        cached = next;
        return next;
      })
      .catch(() => DEFAULTS)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * Offentlige indstillinger (telefon + åbningstider). Én fetch deles af header,
 * footer, menu, forsidens åbningstider og FAQ.
 */
export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(cached ?? DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    loadSiteSettings().then((next) => {
      if (!cancelled) setSettings(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}

/** Efter admin gemmer — næste page-load henter friskt. */
export function clearSiteSettingsCache(): void {
  cached = null;
}
