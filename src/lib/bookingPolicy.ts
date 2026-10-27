import { formatRange, hoursForDate, type OpeningHours } from "./openingHours";
import { bundleIncludesDelivery, deliveryDirections, rentalProducts } from "./products";
import { DJ_ID } from "./dj";

/** Frederiks mail 26/10, præciseret af Philip 27/10: pr. ind-/udlevering. */
export const PICKUP_MINIMUM = 500;
export const OUTSIDE_HOURS_FEE = 200;

export function orderDelivery(ids: string[]) {
  let out = ids.includes(DJ_ID), back = out;
  for (const id of ids) {
    const included = bundleIncludesDelivery(rentalProducts.find(p => p.id === id));
    const directions = deliveryDirections(included ?? id);
    out ||= directions.out;
    back ||= directions.back;
  }
  return { out, back, any: out || back };
}

export function validBookingDay(day: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day;
}

export function outsideHours(hours: OpeningHours, day: string, slot?: string): boolean {
  return validBookingDay(day) && (hoursForDate(hours, day).closed || slot === "outside");
}

export function handoverFee(hours: OpeningHours, pickup: string, returned: string, ids: string[], pickupSlot?: string, returnSlot?: string): number {
  const delivery = orderDelivery(ids);
  const pickupFee = !delivery.out && outsideHours(hours, pickup, pickupSlot) ? OUTSIDE_HOURS_FEE : 0;
  const returnFee = !delivery.back && outsideHours(hours, returned, returnSlot) ? OUTSIDE_HOURS_FEE : 0;
  return pickupFee + returnFee;
}

export function minimumOrderError(amount: number, delivered: boolean, locale: "da" | "en" = "da"): string | null {
  if (delivered || amount >= PICKUP_MINIMUM) return null;
  const remaining = Math.ceil(PICKUP_MINIMUM - amount);
  return locale === "en"
    ? `Pickup orders require at least DKK 500 after discounts, excluding the out-of-hours fee. Add DKK ${remaining} or choose delivery.`
    : `Minimumsordre ved afhentning er 500 kr efter rabat, ekskl. gebyr uden for åbningstid. Tilføj for ${remaining} kr eller vælg levering.`;
}

export function handoverLabel(hours: OpeningHours, day: string, slot?: string, locale: "da" | "en" = "da"): string {
  if (outsideHours(hours, day, slot)) return locale === "en" ? "Outside opening hours, time to be agreed" : "Uden for åbningstid, tidspunkt aftales";
  if (!validBookingDay(day)) return "";
  return formatRange(hoursForDate(hours, day), locale);
}

export const outsideFeeLabel = (locale: "da" | "en" = "da") => locale === "en" ? "Other pickup/return times (DKK 200 each)" : "Andre ind-/udleveringstider (200 kr pr. gang)";

/** Nye ordrer genberegnes ved vareændringer. Ældre ordrer får ikke et nyt gebyr. */
export function editedHandoverFee(booking: { outsideHoursFee?: number; pickupDay?: string; returnDay?: string; pickupSlot?: string; returnSlot?: string }, hours: OpeningHours, ids: string[]): number {
  if (booking.outsideHoursFee === undefined) return 0;
  if (!booking.pickupDay || !booking.returnDay) return booking.outsideHoursFee;
  return handoverFee(hours, booking.pickupDay, booking.returnDay, ids, booking.pickupSlot, booking.returnSlot);
}
