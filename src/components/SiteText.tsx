"use client";

/**
 * Tekst med pladsholdere, der udfyldes fra /admin/indstillinger.
 *
 * Brødtekst i lejevilkår, privatlivspolitik og landingssider nævnte firmaets
 * adresse, CVR, mail og åbningstider som ren tekst. I stedet skriver siderne nu
 * {{firmaadresse}} eller {{aabningstider}}, og teksten hentes fra
 * indstillingerne — så en flytning slår igennem alle steder på én gang.
 *
 * Dobbelt-tuborg er valgt frem for ord som PHONE, fordi "CVR" og "ADRESSE" også
 * optræder som almindelige ord i de samme tekster.
 */

import { useSiteSettings } from "@/lib/useSiteSettings";
import { formatAddress } from "@/lib/siteInfo";
import { formatSentence } from "@/lib/openingHours";
import { type Locale } from "@/lib/i18n";

export function useSiteText(locale: Locale = "da"): (text: string) => string {
  const { company, hours, pickupAddress, display } = useSiteSettings();
  return (text: string) =>
    text
      .replaceAll("{{firma}}", company.name)
      .replaceAll("{{firmaadresse}}", formatAddress(company))
      .replaceAll("{{vej}}", company.street)
      .replaceAll("{{postby}}", `${company.postalCode} ${company.city}`)
      .replaceAll("{{cvr}}", company.cvr)
      .replaceAll("{{mail}}", company.email)
      .replaceAll("{{telefon}}", display)
      .replaceAll("{{afhentningsadresse}}", pickupAddress)
      .replaceAll("{{aabningstider}}", formatSentence(hours, locale));
}

/** Én tekst med pladsholdere, udfyldt */
export default function SiteText({ children, locale = "da" }: { children: string; locale?: Locale }) {
  const fill = useSiteText(locale);
  return <>{fill(children)}</>;
}
