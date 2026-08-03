/** Canonical booking URLs — åbner kurv-draweren (se prd.json → booking_drawer). */

export function bookHref(productId?: string | null, locale: "da" | "en" = "da"): string {
  const home = locale === "en" ? "/en" : "/";
  if (!productId) return `${home}#book`;
  return `${home}?product=${encodeURIComponent(productId)}#book`;
}
