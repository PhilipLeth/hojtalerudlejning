/** Afhentningsadressen — ét sted, redigerbar fra /admin/indstillinger.
 *
 * Adressen stod som tekst i i18n, i BookingFlow, i FAQ og på kvitteringssiden.
 * Den er den vigtigste sætning på hele sitet for en kunde der står med
 * bilnøglerne i hånden, så den skal kunne rettes uden deploy.
 *
 * Bemærk at firmaadressen (Scharling Studio, CVR) er noget andet: den står i
 * footeren, i lejevilkårene og på fakturaen, og den følger ikke med her.
 */

export const DEFAULT_PICKUP_ADDRESS = "Vermlandsgade 66, 2300 København";

/** Adressen som den skal gemmes: trimmet, uden linjeskift, med et loft */
export function normalizePickupAddress(input: unknown): string {
  if (typeof input !== "string") return DEFAULT_PICKUP_ADDRESS;
  const clean = input.replace(/\s+/g, " ").trim().slice(0, 120);
  return clean || DEFAULT_PICKUP_ADDRESS;
}
