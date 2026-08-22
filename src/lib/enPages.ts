import type { Locale } from "@/lib/i18n";

/**
 * Hvilke danske sider der har en engelsk udgave.
 *
 * Uden den her liste sendte /en sine besøgende videre til danske produktsider:
 * SpeakerCompare linker til `sp.page` fra kataloget, som altid er den danske
 * sti. En engelsk kunde klikkede "read more" og landede i dansk tekst.
 *
 * Listen holdes i snor af en-sider.test.ts, som sammenligner den med de mapper,
 * der faktisk ligger i src/app/en. Bygger man en ny engelsk side uden at skrive
 * den her, fejler testen — og omvendt.
 */
export const EN_PAGES = [
  "/",
  "/blog",
  "/festpakke-150",
  "/festpakke-250",
  "/festpakke-lille",
  "/festpakke-stor",
  "/hojtalerpakke-lille",
  "/hojtalerpakke-normal",
  "/lejevilkaar",
  "/mackie-thump-go",
  "/om",
  "/soundboks-4",
] as const;

const SET: ReadonlySet<string> = new Set(EN_PAGES);

/** Findes siden på engelsk? */
export function hasEnglish(daPath: string): boolean {
  return SET.has(daPath.replace(/\/$/, "") || "/");
}

/**
 * Samme side på det ønskede sprog.
 *
 * Findes den ikke på engelsk, returneres den danske sti uændret — et link til
 * en side, der findes på det forkerte sprog, er stadig bedre end et link til
 * en side, der ikke findes.
 */
export function localizedHref(daPath: string, locale: Locale): string {
  if (locale !== "en") return daPath;
  const clean = daPath.replace(/\/$/, "") || "/";
  if (!SET.has(clean)) return daPath;
  return clean === "/" ? "/en" : `/en${clean}`;
}
