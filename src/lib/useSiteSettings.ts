"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PHONE, type SitePhone } from "@/lib/phone";

let cached: SitePhone | null = null;
let inflight: Promise<SitePhone> | null = null;

async function loadSitePhone(): Promise<SitePhone> {
  if (cached) return cached;
  if (!inflight) {
    inflight = fetch("/api/site-settings")
      .then(async (res) => {
        const json = (await res.json()) as Partial<SitePhone> & { phone?: string };
        const next: SitePhone = {
          digits: json.digits || DEFAULT_PHONE.digits,
          display: json.display || DEFAULT_PHONE.display,
          e164: json.e164 || DEFAULT_PHONE.e164,
          href: json.href || DEFAULT_PHONE.href,
        };
        cached = next;
        return next;
      })
      .catch(() => DEFAULT_PHONE)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Public site settings (telefon). Én fetch deles af header/footer/menu. */
export function useSiteSettings(): SitePhone {
  const [phone, setPhone] = useState<SitePhone>(cached ?? DEFAULT_PHONE);

  useEffect(() => {
    let cancelled = false;
    loadSitePhone().then((next) => {
      if (!cancelled) setPhone(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return phone;
}

/** Efter admin gemmer — næste page-load henter friskt. */
export function clearSiteSettingsCache(): void {
  cached = null;
}
