/** Afhentningsadressen — ét sted, redigerbar fra /admin/indstillinger.
 *
 * Adressen stod som tekst i i18n, i BookingFlow, i FAQ og på kvitteringssiden.
 * Den er den vigtigste sætning på hele sitet for en kunde der står med
 * bilnøglerne i hånden, så den skal kunne rettes uden deploy.
 *
 * Fra 19. august 2026 er firmaadressen den SAMME som denne — Frederik driver
 * kun fra Vermlandsgade. De to felter findes stadig hver for sig, fordi
 * firmaadressen bærer CVR-registreringen og kan skulle afvige igen; men står
 * de to forskelligt, er det en fejl indtil nogen bevidst adskiller dem.
 * DEFAULT_COMPANY i siteInfo.ts skal derfor holdes i sync med linjen herunder.
 */

export const DEFAULT_PICKUP_ADDRESS = "Vermlandsgade 66, 2300 København";

/** Adressen som den skal gemmes: trimmet, uden linjeskift, med et loft */
export function normalizePickupAddress(input: unknown): string {
  if (typeof input !== "string") return DEFAULT_PICKUP_ADDRESS;
  const clean = input.replace(/\s+/g, " ").trim().slice(0, 120);
  return clean || DEFAULT_PICKUP_ADDRESS;
}
