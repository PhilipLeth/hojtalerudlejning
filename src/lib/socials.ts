/** Sociale profiler — ét sted, redigerbare fra /admin/indstillinger.
 *
 * Linkene bruges to steder: som synlige links i footeren og som `sameAs` i
 * LocalBusiness-markup'en, så Google kan koble sitet og profilerne sammen.
 * Google Business Profile viser dem også, men skal stadig have dem sat i
 * hånden (Rediger profil → Kontakt → Sociale profiler) — samme links begge
 * steder, ellers modsiger vi os selv.
 *
 * Tomme felter betyder "har vi ikke" og udelades alle steder. Der er ingen
 * defaults i koden: en profil, der ikke findes, må aldrig linkes.
 */

export const SOCIAL_PLATFORMS = [
  { id: "facebook", label: "Facebook", host: "facebook.com" },
  { id: "instagram", label: "Instagram", host: "instagram.com" },
  { id: "tiktok", label: "TikTok", host: "tiktok.com" },
  { id: "linkedin", label: "LinkedIn", host: "linkedin.com" },
  { id: "youtube", label: "YouTube", host: "youtube.com" },
] as const;

export type SocialPlatformId = (typeof SOCIAL_PLATFORMS)[number]["id"];

export type SocialLinks = Record<SocialPlatformId, string>;

export const TOMME_SOCIALS: SocialLinks = {
  facebook: "",
  instagram: "",
  tiktok: "",
  linkedin: "",
  youtube: "",
};

/** Gyldigt link: https og på platformens eget domæne (evt. www. eller m.) */
function gyldigtLink(url: string, host: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    return u.hostname === host || u.hostname.endsWith(`.${host}`);
  } catch {
    return false;
  }
}

/** Læs sociale links fra KV. Alt ulæseligt eller off-domain bliver tomt. */
export function normalizeSocials(input: unknown): SocialLinks {
  const out = { ...TOMME_SOCIALS };
  if (!input || typeof input !== "object") return out;
  const raw = input as Record<string, unknown>;
  for (const p of SOCIAL_PLATFORMS) {
    const v = typeof raw[p.id] === "string" ? (raw[p.id] as string).trim().slice(0, 200) : "";
    out[p.id] = gyldigtLink(v, p.host) ? v : "";
  }
  return out;
}

/**
 * Streng validering ved gemning: et link på det forkerte domæne skal give en
 * fejl til admin, ikke blive smidt stille væk af normaliseringen.
 */
export function validateSocials(
  input: unknown,
): { ok: true; socials: SocialLinks } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Sociale links mangler" };
  const raw = input as Record<string, unknown>;
  const out = { ...TOMME_SOCIALS };
  for (const p of SOCIAL_PLATFORMS) {
    const v = typeof raw[p.id] === "string" ? (raw[p.id] as string).trim() : "";
    if (!v) continue; // tomt felt = har vi ikke
    if (v.length > 200) return { ok: false, error: `${p.label}-linket er for langt` };
    if (!gyldigtLink(v, p.host)) {
      return { ok: false, error: `${p.label}-linket skal være en https-adresse på ${p.host}` };
    }
    out[p.id] = v;
  }
  return { ok: true, socials: out };
}

/** Kun de udfyldte, i fast rækkefølge — til footer og sameAs */
export function socialEntries(socials: SocialLinks): Array<{ id: SocialPlatformId; label: string; url: string }> {
  return SOCIAL_PLATFORMS.filter((p) => socials[p.id]).map((p) => ({ id: p.id, label: p.label, url: socials[p.id] }));
}
