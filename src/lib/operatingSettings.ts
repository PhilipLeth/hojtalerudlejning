import { DEFAULT_OPENING_HOURS, normalizeOpeningHours } from "./openingHours";
import { DEFAULT_PICKUP_ADDRESS } from "./pickup";
import { DEFAULT_COMPANY, normalizeCompany } from "./siteInfo";

const PICKUP_REVISION = 2026102702;
export const OPERATING_REVISION = 2026102703;

/** Flytningens regler og firmaadresse. Senere adminændringer bevares.
 * Philip godkendte også firmaadressen 27/10; navn, CVR og kontaktdata bevares. */
export function migrateOperatingSettings<T extends { hours?: unknown; pickupAddress?: unknown; company?: unknown; operatingRevision?: number }>(doc: T): T {
  if ((doc.operatingRevision ?? 0) >= OPERATING_REVISION) return doc;
  const old = normalizeOpeningHours(doc.hours);
  const pickupUpdate = (doc.operatingRevision ?? 0) < PICKUP_REVISION ? {
    pickupAddress: DEFAULT_PICKUP_ADDRESS,
    hours: { ...DEFAULT_OPENING_HOURS, exceptions: old.exceptions, earliestPickup: old.earliestPickup },
  } : {};
  return {
    ...doc,
    ...pickupUpdate,
    company: {
      ...normalizeCompany(doc.company),
      street: DEFAULT_COMPANY.street,
      postalCode: DEFAULT_COMPANY.postalCode,
      city: DEFAULT_COMPANY.city,
    },
    operatingRevision: OPERATING_REVISION,
  };
}
