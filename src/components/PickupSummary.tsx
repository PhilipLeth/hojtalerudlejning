"use client";

import { useSiteSettings } from "@/lib/useSiteSettings";
import { formatAfterHours, formatSentence } from "@/lib/openingHours";
import { type Locale } from "@/lib/i18n";

/**
 * Én linje med hvor og hvornår man henter — adressen og tiderne fra
 * /admin/indstillinger, så siden ikke kan stå med en gammel adresse.
 */
export default function PickupSummary({
  locale = "da",
  className = "",
  suffix,
}: {
  locale?: Locale;
  className?: string;
  /** Fx CVR-nummeret, der hører til firmaet og ikke til afhentningen */
  suffix?: string;
}) {
  const { hours, pickupAddress } = useSiteSettings();
  const dele = [
    `${locale === "en" ? "Pickup" : "Afhentning"}: ${pickupAddress}`,
    formatSentence(hours, locale).replace(/\.$/, ""),
    formatAfterHours(hours, locale).replace(/\.$/, ""),
    suffix,
  ].filter(Boolean);

  return <p className={className}>{dele.join(" · ")}</p>;
}
