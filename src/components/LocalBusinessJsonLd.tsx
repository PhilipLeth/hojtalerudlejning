"use client";

/**
 * LocalBusiness-markup til Google, bygget af indstillingerne.
 *
 * Stod før som tre håndskrevne blokke — forsiden, /en og /kobenhavn — der ikke
 * var enige: to forskellige fredags-åbningstider og hver sin adresse-stavning.
 * Nu kommer navn, CVR, adresse, telefon, mail og åbningstider fra samme sted
 * som resten af sitet.
 *
 * Den statiske HTML indeholder standarden fra koden, og markup'en opdateres når
 * indstillingerne er hentet. Retter Frederik fx åbningstiderne, ser Google det
 * først, når siden er renderet — eller ved næste deploy. Google Business
 * Profile skal stadig rettes i hånden.
 */

import { useSiteSettings } from "@/lib/useSiteSettings";
import { openingHoursSpecification } from "@/lib/openingHours";

export default function LocalBusinessJsonLd({ extra = {} }: { extra?: Record<string, unknown> }) {
  const { company, hours, e164 } = useSiteSettings();

  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${company.name} / Lejhøjtaler.dk`,
    legalName: company.name,
    taxID: `DK${company.cvr}`,
    telephone: e164,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.street,
      postalCode: company.postalCode,
      addressLocality: company.city,
      addressCountry: "DK",
    },
    areaServed: { "@type": "City", name: "København" },
    openingHoursSpecification: openingHoursSpecification(hours),
    ...extra,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
