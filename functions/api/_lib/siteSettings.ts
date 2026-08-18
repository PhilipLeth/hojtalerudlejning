/** Sitets indstillinger, læst fra KV på serveren.
 *
 * Mails og SMS'er skal sige det samme som hjemmesiden: samme adresse, samme
 * åbningstider, samme CVR i bunden. De stod som tekst i hver enkelt skabelon,
 * så en flytning ville efterlade den gamle adresse i alt hvad vi sender.
 *
 * Klientens udgave er src/lib/useSiteSettings.ts — samme KV-nøgle, samme
 * standardværdier fra koden.
 */

import { DEFAULT_OPENING_HOURS, normalizeOpeningHours, type OpeningHours } from "../../../src/lib/openingHours";
import { DEFAULT_PICKUP_ADDRESS, normalizePickupAddress } from "../../../src/lib/pickup";
import { DEFAULT_COMPANY, formatCompanyLine, normalizeCompany, type CompanyInfo } from "../../../src/lib/siteInfo";

export const SITE_SETTINGS_KEY = "site_settings";

export interface ServerSiteSettings {
  company: CompanyInfo;
  hours: OpeningHours;
  pickupAddress: string;
  /** 8 cifre uden mellemrum */
  phone: string;
}

export const DEFAULT_SITE_SETTINGS: ServerSiteSettings = {
  company: DEFAULT_COMPANY,
  hours: DEFAULT_OPENING_HOURS,
  pickupAddress: DEFAULT_PICKUP_ADDRESS,
  phone: "31132852",
};

/** Aldrig fejle: en mail skal sendes, også hvis KV er utilgængelig */
export async function loadSiteSettings(kv: KVNamespace): Promise<ServerSiteSettings> {
  try {
    const raw = await kv.get(SITE_SETTINGS_KEY);
    if (!raw) return DEFAULT_SITE_SETTINGS;
    const doc = JSON.parse(raw) as { phone?: string; hours?: unknown; pickupAddress?: unknown; company?: unknown };
    const digits = String(doc.phone || "").replace(/\D/g, "");
    return {
      company: normalizeCompany(doc.company),
      hours: normalizeOpeningHours(doc.hours),
      pickupAddress: normalizePickupAddress(doc.pickupAddress),
      phone: digits.length === 8 ? digits : DEFAULT_SITE_SETTINGS.phone,
    };
  } catch (e) {
    console.error("[site-settings] kunne ikke læses:", e);
    return DEFAULT_SITE_SETTINGS;
  }
}

/** Bundlinjen under hver mail: firma, adresse og CVR */
export function mailFooter(settings: ServerSiteSettings): string {
  return `<p style="margin-top:16px;color:#bbb;font-size:12px;">${formatCompanyLine(settings.company).replace(/ · /g, " &middot; ")}</p>`;
}
