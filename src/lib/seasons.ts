import type { Locale } from "./i18n";

/**
 * Sæsonkampagner (Halloween, julefrokost, …).
 *
 * Ny kampagne: tilføj et objekt i SEASONS, en hub-side i src/app/<href> og
 * src/app/en/<href>, evt. COPY i SeasonCampaign.tsx, og et tema i
 * HalloweenHome.module.css. Fra/til er MM-DD inklusiv (lokal dato).
 * Uden for sæsonen ligger siderne stadig, de er bare ikke i menuen.
 */
export interface Season {
  id: string;
  href: string;
  /** MM-DD, inklusiv, lokal dato */
  from: string;
  to: string;
  navDa: string;
  navEn: string;
  kickerDa: string;
  kickerEn: string;
  titleDa: string;
  titleEn: string;
  leadDa: string;
  leadEn: string;
  accent: string;
  hero: string;
  productIds: string[];
  featuredId?: string;
}

export const SEASONS: Season[] = [
  {
    id: "halloween",
    href: "/halloween",
    from: "09-01",
    to: "11-02",
    navDa: "Halloween",
    navEn: "Halloween",
    kickerDa: "Halloween · 31. oktober",
    kickerEn: "Halloween · 31 October",
    titleDa: "Skru op for uhyggen.",
    titleEn: "Turn up the fright.",
    leadDa: "Tre pakker med lyd, lys og røg. Du står for kostumerne.",
    leadEn: "Three packages with sound, lights and fog. You bring the costumes.",
    accent: "#e87a2a",
    hero: "/images/halloween-hero.webp",
    productIds: ["halloween_lys", "halloween_lille", "halloween_stor"],
    featuredId: "halloween_lille",
  },
  {
    id: "julefrokost",
    href: "/julefrokost",
    from: "09-15",
    to: "12-23",
    navDa: "Julefrokost",
    navEn: "Christmas party",
    kickerDa: "Julefrokost · november og december",
    kickerEn: "Christmas lunch · November and December",
    titleDa: "Talen først. Dansegulvet bagefter.",
    titleEn: "The speech first. The dance floor after.",
    leadDa: "Kontorets julehygge, kantinens julefrokost eller fredagsbaren i december. Book pakken online.",
    leadEn: "Office hygge, the canteen Christmas lunch or the December Friday bar. Book the package online.",
    accent: "#b42318",
    hero: "/images/julefrokost-hero.webp",
    productIds: ["jul_hygge", "pakke_firmafest", "event_fredagsbar_2"],
    featuredId: "pakke_firmafest",
  },
];

function monthDay(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Inklusiv interval. `from` > `to` betyder at sæsonen går over nytår. */
export function isSeasonActive(season: Season, date: Date = new Date()): boolean {
  const md = monthDay(date);
  if (season.from <= season.to) return md >= season.from && md <= season.to;
  return md >= season.from || md <= season.to;
}

export function activeSeasons(date: Date = new Date()): Season[] {
  return SEASONS.filter((s) => isSeasonActive(s, date));
}

export function seasonById(id: string): Season | undefined {
  return SEASONS.find((s) => s.id === id);
}

export function seasonNavLabel(season: Season, locale: Locale): string {
  return locale === "en" ? season.navEn : season.navDa;
}
