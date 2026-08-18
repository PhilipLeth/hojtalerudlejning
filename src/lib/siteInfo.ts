/** Firmaets oplysninger — ét sted, redigerbare fra /admin/indstillinger.
 *
 * Navn, adresse, postnummer, by, CVR og mail stod som tekst 84 steder: i
 * footeren, i lejevilkårene, i privatlivspolitikken, i JSON-LD til Google, på
 * lejesedlen og i bunden af hver eneste mail vi sender. Flytter firmaet, eller
 * skifter mailen, skulle en udvikler finde dem alle.
 *
 * Nu er standarden koden, og admin kan overskrive den i KV (site_settings.company).
 * Bemærk at afhentningsadressen er noget andet — se src/lib/pickup.ts: kunden
 * henter ét sted, firmaet er registreret et andet.
 */

export interface CompanyInfo {
  /** Firmanavnet på fakturaen og i footeren */
  name: string;
  /** Vej og nummer, fx "Halvtolv 9, 1. th" */
  street: string;
  postalCode: string;
  city: string;
  /** Kun cifre */
  cvr: string;
  /** Mailadressen kunden skriver til, og som ordrer sendes til. Flere adskilt af komma. */
  email: string;
}

export const DEFAULT_COMPANY: CompanyInfo = {
  name: "Scharling Studio",
  street: "Halvtolv 9, 1. th",
  postalCode: "1436",
  city: "København K",
  cvr: "40994904",
  email: "info@lejhojtaler.dk",
};

const felt = (value: unknown, fallback: string, max = 80): string => {
  if (typeof value !== "string") return fallback;
  const clean = value.replace(/\s+/g, " ").trim().slice(0, max);
  return clean || fallback;
};

/** Læs firmaoplysninger fra KV. Alt ulæseligt falder tilbage på standarden. */
export function normalizeCompany(input: unknown): CompanyInfo {
  if (!input || typeof input !== "object") return { ...DEFAULT_COMPANY };
  const raw = input as Partial<CompanyInfo>;
  return {
    name: felt(raw.name, DEFAULT_COMPANY.name),
    street: felt(raw.street, DEFAULT_COMPANY.street),
    postalCode: felt(raw.postalCode, DEFAULT_COMPANY.postalCode, 10),
    city: felt(raw.city, DEFAULT_COMPANY.city, 40),
    cvr: felt(String(raw.cvr ?? "").replace(/\D/g, ""), DEFAULT_COMPANY.cvr, 12),
    // Rummer flere modtagere adskilt af komma. Loftet er sat efter det, ikke
    // efter én adresse: klippes der midt i den sidste, fejler afsendelsen
    // lydløst til netop den modtager.
    email: felt(raw.email, DEFAULT_COMPANY.email, 200),
  };
}

/**
 * Streng validering ved gemning: her skal admin have at vide, hvis noget er
 * galt, i stedet for at standarden bliver gemt bag hans ryg.
 */
export function validateCompany(
  input: unknown,
): { ok: true; company: CompanyInfo } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Firmaoplysninger mangler" };
  const raw = input as Partial<CompanyInfo>;

  const krav: Array<[keyof CompanyInfo, string, number]> = [
    ["name", "Firmanavn", 2],
    ["street", "Adresse", 4],
    ["postalCode", "Postnummer", 3],
    ["city", "By", 2],
  ];
  for (const [key, navn, min] of krav) {
    const v = String(raw[key] ?? "").trim();
    if (v.length < min) return { ok: false, error: `${navn} mangler` };
  }

  const cvr = String(raw.cvr ?? "").replace(/\D/g, "");
  if (cvr.length !== 8) return { ok: false, error: "CVR skal være 8 cifre" };

  // Feltet må rumme flere modtagere adskilt af komma: ordrer og
  // kontaktformular sendes hertil, og de skal kunne gå til både firmaet og en
  // medarbejder uden at kræve et deploy. Hver adresse valideres for sig, så én
  // slåfejl ikke sender resten ud i ingenting.
  const adresser = String(raw.email ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
  if (adresser.length === 0) return { ok: false, error: "Mailadressen mangler" };
  for (const adresse of adresser) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adresse)) {
      return { ok: false, error: `Mailadressen ser forkert ud: ${adresse}` };
    }
  }
  const email = adresser.join(", ");

  return { ok: true, company: normalizeCompany({ ...raw, cvr, email }) };
}

/** "Halvtolv 9, 1. th, 1436 København K" */
export function formatAddress(c: CompanyInfo): string {
  return `${c.street}, ${c.postalCode} ${c.city}`;
}

/** Bundlinjen i mails og på lejesedlen */
export function formatCompanyLine(c: CompanyInfo): string {
  return `${c.name} · ${c.street} · ${c.postalCode} ${c.city} · CVR ${c.cvr}`;
}
