/**
 * Find tenant-slug i klienten: /t/<slug> i stien → ?t= → sidst brugte
 * (localStorage, så PWA'en åbner rigtigt fra hjemmeskærmen) → demo.
 */

const LS_NOEGLE = "fv_tenant";

export function resolveSlug(): string {
  if (typeof window === "undefined") return "demo";
  const sti = window.location.pathname.match(/^\/t\/([a-z0-9][a-z0-9-]{1,30})/);
  const fraQuery = new URLSearchParams(window.location.search).get("t");
  const slug =
    sti?.[1] ??
    (fraQuery && /^[a-z0-9][a-z0-9-]{1,30}$/.test(fraQuery) ? fraQuery : null) ??
    window.localStorage.getItem(LS_NOEGLE) ??
    "demo";
  try {
    window.localStorage.setItem(LS_NOEGLE, slug);
  } catch {
    // Privat browsing uden localStorage er fint
  }
  return slug;
}
