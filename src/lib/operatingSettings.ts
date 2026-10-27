import { DEFAULT_OPENING_HOURS, normalizeOpeningHours } from "./openingHours";
import { DEFAULT_PICKUP_ADDRESS } from "./pickup";

export const OPERATING_REVISION = 20261027;

/** Læs gamle KV-indstillinger med flytningens nye regler. Gemte ændringer efter
 * migrationen bevares. Ændrer ikke den juridiske firmaadresse eller kontaktdata. */
export function migrateOperatingSettings<T extends { hours?: unknown; pickupAddress?: unknown; operatingRevision?: number }>(doc: T): T {
  if ((doc.operatingRevision ?? 0) >= OPERATING_REVISION) return doc;
  const old = normalizeOpeningHours(doc.hours);
  return { ...doc, pickupAddress: DEFAULT_PICKUP_ADDRESS, hours: {
    ...DEFAULT_OPENING_HOURS, exceptions: old.exceptions, earliestPickup: old.earliestPickup,
  }, operatingRevision: OPERATING_REVISION };
}
