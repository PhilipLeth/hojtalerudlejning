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
 *
 * Markup'en hører til på de sider, der handler om VIRKSOMHEDEN — forsiden,
 * /en, /kobenhavn, /kontakt og /om. Ikke på de 30 produktsider: en produktside
 * handler om et produkt, og LocalBusiness på hver af dem er markup for
 * markup'ens skyld.
 */

import { useSiteSettings } from "@/lib/useSiteSettings";
import { openingHoursSpecification } from "@/lib/openingHours";

/**
 * Google Business Profile-profilen for Lejhøjtaler.dk.
 *
 * Uden den her kobling er hjemmesiden og virksomhedsprofilen to ting, Google
 * selv skal gætte hører sammen. sameAs og hasMap fortæller det direkte — det er
 * den billigste ting, man kan gøre for lokal synlighed.
 */
const PLACE_ID = "ChIJ9UxZq-xTUkYRsiSY3hvy-MY";
const PROFILE_URL = "https://g.page/r/CbIkmN4b8vjGEBM";
const MAP_URL = `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`;

export default function LocalBusinessJsonLd({ extra = {} }: { extra?: Record<string, unknown> }) {
  const { company, hours, e164 } = useSiteSettings();

  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    // Fast @id, så alle sider taler om den SAMME virksomhed og ikke om hver
    // sin. Uden den er tre sider med LocalBusiness tre kandidater til at være
    // firmaet.
    "@id": "https://lejhojtaler.dk/#virksomhed",
    url: "https://lejhojtaler.dk",
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
    sameAs: [PROFILE_URL],
    hasMap: MAP_URL,
    logo: "https://lejhojtaler.dk/icon-512.png",
    openingHoursSpecification: openingHoursSpecification(hours),
    ...extra,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
