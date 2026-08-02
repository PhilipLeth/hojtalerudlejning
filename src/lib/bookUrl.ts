/** Canonical booking URLs — plain pages, no hash/drawer magic. */

export function bookHref(productId?: string | null, locale: "da" | "en" = "da"): string {
  const base = locale === "en" ? "/en/book" : "/book";
  if (!productId) return base;
  return `${base}?product=${encodeURIComponent(productId)}`;
}
