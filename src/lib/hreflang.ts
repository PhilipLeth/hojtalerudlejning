const BASE = "https://lejhojtaler.dk";

/**
 * hreflang-par for en side der findes på begge sprog.
 *
 * Kaldes med den **danske** sti; den engelske udledes med /en-præfiks, fordi
 * i18n-strategien er præfiks på samme domæne. prd.domains.en peger på
 * lejhojtaler.com, men det domæne har dødt DNS — hreflang mod et domæne der
 * ikke svarer er værre end ingen hreflang.
 *
 * Bemærk at en side der selv sætter `alternates.canonical` **erstatter** hele
 * alternates-objektet fra root-layoutet og dermed taber dens `languages`.
 * Derfor skal begge sættes sammen, hver gang:
 *
 *   alternates: {
 *     canonical: "https://lejhojtaler.dk/om",
 *     languages: localeAlternates("/om"),
 *   }
 */
export function localeAlternates(daPath: string): Record<string, string> {
  const da = daPath === "/" ? BASE : `${BASE}${daPath}`;
  const en = daPath === "/" ? `${BASE}/en` : `${BASE}/en${daPath}`;
  // x-default fortæller Google hvad den skal vise til alle andre sprog end de
  // to. Dansk er standarden — forretningen er københavnsk.
  return { da, en, "x-default": da };
}
