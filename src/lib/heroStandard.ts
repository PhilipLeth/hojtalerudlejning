/**
 * Den lille del af stemningsbillederne, som browseren skal bruge: standarden
 * og stierne. Uden kataloget, så StemningsBaggrund ikke trækker produkterne og
 * promptopsætningen med ud til kunden. Resten står i heroBilleder.ts.
 */

import standard from "./heroStandard.json";

export const HERO_FALLBACK = "/images/hero.webp";

/**
 * Kodens stemningsbilleder, sti → billede. Skrives af
 * scripts/product-images/hero-stemning.mjs, når et billede er lavet og set
 * efter — derfor JSON og ikke TypeScript.
 */
export const HERO_STANDARD: Record<string, string> = standard;

/** KV-nøglen for det godkendte: sti → { src, updatedBy, updatedAt } */
export const HERO_MANIFEST_KEY = "hero_manifest";

export interface HeroEntry {
  src: string;
  updatedBy?: string;
  updatedAt?: string;
  note?: string;
}

/** "/en/festpakke-stor/" → "/festpakke-stor" */
export function heroSti(pathname: string): string {
  const uden = pathname.replace(/^\/en(?=\/|$)/, "").replace(/\/$/, "");
  return uden || "/";
}

/** Billedet der vises, når intet er godkendt i admin */
export function heroStandard(sti: string): string {
  return HERO_STANDARD[sti] ?? HERO_FALLBACK;
}

/** Kodens billeder har en 800 px-udgave til mobil; uploadede har ikke */
export function heroSrcSet(src: string): string | undefined {
  if (!src.startsWith("/images/hero/") || !src.endsWith(".webp")) return undefined;
  return `${src.replace(/\.webp$/, "-800.webp")} 800w, ${src} 1920w`;
}
