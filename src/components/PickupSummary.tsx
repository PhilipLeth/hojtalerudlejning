"use client";

import { useSiteSettings } from "@/lib/useSiteSettings";
import { formatSentence } from "@/lib/openingHours";
import { type Locale } from "@/lib/i18n";

/**
 * Én linje med hvor og hvornår man henter — adressen og tiderne fra
 * /admin/indstillinger, så siden ikke kan stå med en gammel adresse.
 */
export default function PickupSummary({
  locale = "da",
  className = "",
  withCvr = false,
}: {
  locale?: Locale;
  className?: string;
  /** Tag CVR-nummeret med til sidst — det hører til firmaet, ikke afhentningen */
  withCvr?: boolean;
}) {
  const { hours, pickupAddress, company } = useSiteSettings();
  const dele = [
    `${locale === "en" ? "Pickup" : "Afhentning"}: ${pickupAddress}`,
    formatSentence(hours, locale).replace(/\.$/, ""),
    withCvr ? `CVR ${company.cvr}` : "",
  ].filter(Boolean);

  return <p className={className}>{dele.join(" · ")}</p>;
}
