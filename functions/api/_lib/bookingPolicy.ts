import { handoverFee, minimumOrderError, orderDelivery, validBookingDay } from "../../../src/lib/bookingPolicy";
import type { OpeningHours } from "../../../src/lib/openingHours";
import type { LineItemInput } from "./pricing";

export interface BookingItems {
  speakerId?: string;
  addonIds?: string[];
  cartItems?: Array<{ productId?: string; quantity?: number; dj?: LineItemInput["dj"] }>;
}

/** Samme enheder som Stripe; klientens priser og deliveryOptionId ignoreres. */
export function bookingItems(data: BookingItems): LineItemInput[] {
  const items: LineItemInput[] = [];
  if (data.speakerId && data.speakerId !== "effects-only") items.push({ id: data.speakerId });
  for (const id of data.addonIds ?? []) items.push({ id });
  for (const item of data.cartItems ?? []) {
    const quantity = item.quantity ?? 1;
    if (!item.productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 200) throw new Error("Ugyldigt produktantal");
    for (let i = 0; i < quantity; i++) items.push({ id: item.productId, dj: item.dj });
  }
  if (items.length > 200) throw new Error("For mange produkter");
  return items;
}

export function validateBookingPolicy({ hours, pickupDay, returnDay, ids, amountKr, pickupSlot, returnSlot, locale = "da" }: {
  hours: OpeningHours; pickupDay: string; returnDay: string; ids: string[]; amountKr: number;
  pickupSlot?: string; returnSlot?: string; locale?: "da" | "en";
}): number {
  if (!validBookingDay(pickupDay) || !validBookingDay(returnDay) || returnDay < pickupDay) throw new Error(locale === "en" ? "Choose valid pickup and return dates." : "Vælg gyldige afhentnings- og afleveringsdatoer.");
  const error = minimumOrderError(amountKr, orderDelivery(ids).any, locale);
  if (error) throw new Error(error);
  return handoverFee(hours, pickupDay, returnDay, ids, pickupSlot, returnSlot);
}
