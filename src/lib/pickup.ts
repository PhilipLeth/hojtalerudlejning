/** Afhentningsadresse fra Frederiks seneste mail 27/10 2026.
 * Firmaets CVR-adresse er separat og ændres ikke af flytning af lager. */

export const DEFAULT_PICKUP_ADDRESS = "Njalsgade 40, 2300 København";

/** Adressen som den skal gemmes: trimmet, uden linjeskift, med et loft */
export function normalizePickupAddress(input: unknown): string {
  if (typeof input !== "string") return DEFAULT_PICKUP_ADDRESS;
  const clean = input.replace(/\s+/g, " ").trim().slice(0, 120);
  return clean || DEFAULT_PICKUP_ADDRESS;
}
