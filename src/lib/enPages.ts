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
  "/baeretaske",
  "/blog",
  "/bryllup",
  "/bryllupslys",
  "/bryllupspakke",
  "/discokugle",
  "/diskolys",
  "/diskotek-pakke",
  "/ekstra-batteri",
  "/enkelt-lyseffekt",
  "/festlys",
  "/festpakke-150",
  "/festpakke-250",
  "/festpakke-lille",
  "/festpakke-lydmand",
  "/festpakke-stor",
  "/festtelt-lys",
  "/filmaften",
  "/firmaevent-lydmand",
  "/firmafestpakke",
  "/foedselsdag",
  "/haandholdt-mikrofon",
  "/haandholdt-mikrofon-pro",
  "/havefest",
  "/headset-mikrofon",
  "/headset-pro",
  "/hojtalerpakke-bas",
  "/hojtalerpakke-lille",
  "/hojtalerpakke-normal",
  "/hojtalerstativer",
  "/julefrokost",
  "/karaoke-maskine",
  "/konferencepakke-150",
  "/konfirmation",
  "/kontakt",
  "/laerred-160",
  "/lej-hojtaler",
  "/lej-mikrofon",
  "/lejevilkaar",
  "/lydanlaeg",
  "/lydmand",
  "/lys-pakke",
  "/lyskaeder",
  "/lyspakker",
  "/lysshow",
  "/lysshow-pakke",
  "/lysshow-stor",
  "/mackie-thump-go",
  "/mixer",
  "/om",
  "/pakke-karaoke",
  "/pakke-karaoke-fest",
  "/pakke-konference",
  "/pakke-praesentation",
  "/pakke-tale-musik",
  "/privatlivspolitik",
  "/projektor",
  "/projektor-pro",
  "/roeg",
  "/roegmaskine",
  "/skaerm",
  "/skaerm-32",
  "/soundboks-4",
  "/soundboks-pakke-lys",
  "/speakerpakke",
  "/stemningslys",
  "/stor-fest-lydmand",
  "/studenterkoersel",
  "/studenterpakke",
  "/subwoofer",
  "/teenagefest-lys",
  "/ungdomsfest",
  "/ungdomsfest-pakke",
  "/ungdomsfest-pakke-stor",
  "/traadloes-mikrofon",
  "/traadloes-mikrofon-pro",
  "/udendorspakke",
  "/uplights",
] as const;

const SET: ReadonlySet<string> = new Set(EN_PAGES);

/** Findes siden på engelsk? */
export function hasEnglish(daPath: string): boolean {
  return SET.has(daPath.replace(/\/$/, "") || "/");
}

/**
 * Den danske sti bag en hvilken som helst sti på sitet.
 *
 * EN_PAGES og localizedHref regner begge i danske stier, fordi det er dem,
 * kataloget og sidernes hreflang bruger som nøgle. Skal man den anden vej —
 * fra den side, brugeren står på, tilbage til parret — er det her vejen:
 * "/en/festlys" → "/festlys", "/en" → "/", og en dansk sti bliver stående.
 *
 * Bruges af sprogskifteren i menuen, så den bliver på samme side i stedet for
 * altid at sende folk til forsiden.
 */
export function danskSti(sti: string): string {
  const clean = sti.replace(/\/$/, "") || "/";
  if (clean === "/en") return "/";
  if (clean.startsWith("/en/")) return clean.slice(3);
  return clean;
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
