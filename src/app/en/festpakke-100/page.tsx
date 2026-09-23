import { prisDkk, rabatDkk } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Party Package 50-100 Copenhagen | ${prisDkk("pakke_fest_100")} | Lejhøjtaler.dk`,
  description:
    `Rent a complete party setup for up to 100 guests in Copenhagen for ${prisDkk("pakke_fest_100")}. The large speaker package with a subwoofer and two light bars. Delivery available.`,
  keywords: [
    "large event sound rental copenhagen",
    "party package 100 guests",
    "subwoofer rental copenhagen",
  ],
  // Både canonical og languages sættes her: en side, der selv sætter
  // alternates.canonical, erstatter hele alternates-objektet fra root-layoutet
  // og taber ellers sine hreflang-par. Se src/lib/hreflang.ts.
  alternates: {
    canonical: "https://lejhojtaler.dk/en/festpakke-100",
    languages: localeAlternates("/festpakke-100"),
  },
  openGraph: {
    images: ogImages(),
    title: `Party Package 50-100 Copenhagen | ${prisDkk("pakke_fest_100")} | Lejhøjtaler.dk`,
    description:
      `Rent a complete party setup for up to 100 guests in Copenhagen for ${prisDkk("pakke_fest_100")}. The large speaker package with a subwoofer and two light bars. Delivery available.`,
    url: "https://lejhojtaler.dk/en/festpakke-100",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function PartyPackage100En() {
  return (
    <ProductLanding
      locale="en"
      slug="en/festpakke-100"
      name="Party Package 50-100"
      headline="Party package for up to 100 guests"
      sub='The large speaker package with a subwoofer and two light bars.'
      imageAlt="Party package for 100 guests with a subwoofer and two light bars"
      productId="pakke_fest_100"
      faqPhrase="Party Package 50-100"
      capacity={{ level: 3, label: "50-100 people" }}
      bullets={[
        '2× EV 12" active speakers and a 12" subwoofer',
        "Two light bars, so the light covers the whole floor",
        "The bass is what keeps people on the dance floor",
        "All cables, Bluetooth and mains included",
        "Speaker stands and a fog machine can be added when you book",
        `Save ${rabatDkk("pakke_fest_100")} compared to hiring the parts separately`,
      ]}
    />
  );
}
