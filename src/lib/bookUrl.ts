/** Canonical booking-URL: fuld side /book, ikke drawer. */

export function bookHref(
  productId?: string | null,
  locale: "da" | "en" = "da",
  extra?: Record<string, string | null | undefined>,
): string {
  const base = locale === "en" ? "/en/book" : "/book";
  const q = new URLSearchParams();
  if (productId) q.set("product", productId);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) q.set(k, v);
    }
  }
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

/** Flere produkter i samme booking, fx et AI-lyssetup. */
export function bookSetupHref(ids: string[], locale: "da" | "en" = "da"): string {
  const unikke = [...new Set(ids.filter(Boolean))];
  if (!unikke.length) return bookHref(null, locale);
  const [first, ...rest] = unikke;
  return bookHref(first, locale, rest.length ? { extras: rest.join(",") } : undefined);
}
