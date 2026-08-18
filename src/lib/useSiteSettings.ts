"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PHONE, type SitePhone } from "@/lib/phone";
import {
  DEFAULT_OPENING_HOURS,
  normalizeOpeningHours,
  type OpeningHours,
} from "@/lib/openingHours";
import { DEFAULT_PICKUP_ADDRESS, normalizePickupAddress } from "@/lib/pickup";
import { DEFAULT_COMPANY, normalizeCompany, type CompanyInfo } from "@/lib/siteInfo";

/** Det offentlige sitet henter i én omgang: nummer, åbningstider og adresse */
export interface SiteSettings extends SitePhone {
  hours: OpeningHours;
  /** Hvor kunden henter — ikke firmaadressen i footeren */
  pickupAddress: string;
  /** Navn, adresse, CVR og mail — det der står i footeren og på fakturaen */
  company: CompanyInfo;
}

const DEFAULTS: SiteSettings = {
  ...DEFAULT_PHONE,
  hours: DEFAULT_OPENING_HOURS,
  pickupAddress: DEFAULT_PICKUP_ADDRESS,
  company: DEFAULT_COMPANY,
};

let cached: SiteSettings | null = null;
let inflight: Promise<SiteSettings> | null = null;

async function loadSiteSettings(): Promise<SiteSettings> {
  if (cached) return cached;
  if (!inflight) {
    inflight = fetch("/api/site-settings")
      .then(async (res) => {
        const json = (await res.json()) as Partial<SitePhone> & {
          phone?: string;
          hours?: unknown;
          pickupAddress?: unknown;
          company?: unknown;
        };
        const next: SiteSettings = {
          digits: json.digits || DEFAULT_PHONE.digits,
          display: json.display || DEFAULT_PHONE.display,
          e164: json.e164 || DEFAULT_PHONE.e164,
          href: json.href || DEFAULT_PHONE.href,
          // Serveren normaliserer også, men klienten skal kunne stå alene med
          // et gammelt eller halvt svar uden at vise tomme åbningstider
          hours: normalizeOpeningHours(json.hours),
          pickupAddress: normalizePickupAddress(json.pickupAddress),
          company: normalizeCompany(json.company),
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
