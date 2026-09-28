"use client";

import { useEffect, useState } from "react";
import { heroSrcSet, heroStandard } from "@/lib/heroStandard";

declare global {
  interface Window {
    /** Sat af functions/_middleware.ts: sti → godkendt stemningsbillede */
    __HERO__?: Record<string, string>;
  }
}

let manifestLøfte: Promise<Record<string, string>> | null = null;

/** Middlewaren har lagt manifestet i siden; uden den (lokalt) hentes det */
function hentManifest(): Promise<Record<string, string>> {
  if (typeof window !== "undefined" && window.__HERO__) return Promise.resolve(window.__HERO__);
  manifestLøfte ??= fetch("/api/hero")
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));
  return manifestLøfte;
}

/**
 * Stemningsbilledet bag en hero. Sektionen omkring skal have klassen
 * `stemnings-hero moerk-flade`, som giver mørkt slør og lys tekst.
 *
 * Første billede er kodens standard; middlewaren har allerede byttet src ud i
 * HTML'en, hvis et billede er godkendt i admin, og effekten her gør det samme
 * efter et klik mellem sider. Se src/lib/heroBilleder.ts.
 */
export default function StemningsBaggrund({ sti }: { sti: string }) {
  const [src, setSrc] = useState(() => heroStandard(sti));
  useEffect(() => {
    let levende = true;
    setSrc(heroStandard(sti));
    hentManifest().then((m) => {
      if (levende && m[sti]) setSrc(m[sti]);
    });
    return () => {
      levende = false;
    };
  }, [sti]);
  return (
    <img
      data-hero-sti={sti}
      src={src}
      srcSet={heroSrcSet(src)}
      sizes="100vw"
      alt=""
      fetchPriority="high"
      className="stemnings-hero-billede"
    />
  );
}
