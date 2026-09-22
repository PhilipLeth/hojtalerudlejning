import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: "Draught Beer System Rental Copenhagen | Price on request | Lejhøjtaler.dk",
  description:
    "Hire a draught beer system with cooling, tap and CO2 for a company party, summer party or reception in Copenhagen. Send us the date and the numbers for a same-day price.",
  keywords: ["draught beer system rental copenhagen", "beer tap hire denmark", "keg system rental"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/fadoelsanlaeg",
    languages: localeAlternates("/fadoelsanlaeg"),
  },
  openGraph: {
    images: ogImages(),
    title: "Draught Beer System Rental Copenhagen | Price on request",
    description: "A draught system with cooling, tap and CO2. Send us the date and the numbers for a same-day price.",
    url: "https://lejhojtaler.dk/en/fadoelsanlaeg",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/fadoelsanlaeg"
      name="Draught beer system"
      headline="Draught beer system rental in Copenhagen"
      sub="A system with cooling, tap and CO2. We agree on the keg and the brand once we know the numbers."
      imageAlt="Draught beer system with cooling and tap for hire in Copenhagen"
      productId="fadoel"
      bullets={[
        "Cooling unit with a tap, ready for the keg",
        "CO2 and lines included",
        "Keg and brand agreed to match the number of guests",
        "A run-through on delivery, so you can pour it yourselves",
        "Can be delivered with sound and lighting for the same party",
      ]}
    />
  );
}
