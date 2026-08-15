/** Offentligt telefonnummer. Live-værdi kommer fra KV (admin /indstillinger). */

export const DEFAULT_PHONE_DIGITS = "31132852";

export interface SitePhone {
  digits: string;
  display: string;
  e164: string;
  href: string;
}

export function digitsOnly(raw: string): string {
  const d = String(raw || "").replace(/\D/g, "");
  if (d.startsWith("45") && d.length === 10) return d.slice(2);
  return d;
}

export function formatDkPhone(digits: string): string {
  const d = digitsOnly(digits);
  if (d.length === 8) return `${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 6)} ${d.slice(6, 8)}`;
  return d;
}

export function phoneFromInput(raw: string): SitePhone {
  const d = digitsOnly(raw);
  const digits = d.length === 8 ? d : DEFAULT_PHONE_DIGITS;
  const e164 = `+45${digits}`;
  return { digits, display: formatDkPhone(digits), e164, href: `tel:${e164}` };
}

export const DEFAULT_PHONE = phoneFromInput(DEFAULT_PHONE_DIGITS);

/** Tilbagefald til hardcoded visning før /api/site-settings loader */
export const PHONE_DISPLAY = DEFAULT_PHONE.display;
export const PHONE_E164 = DEFAULT_PHONE.e164;
export const PHONE_HREF = DEFAULT_PHONE.href;
