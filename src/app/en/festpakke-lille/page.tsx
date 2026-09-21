import { prisDkk, rabatDkk } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Party Package 0-30 Copenhagen | ${prisDkk("pakke_fest_lille")} | Sound & Lights | Lejhøjtaler.dk`,
  description:
    `Rent sound and lights for your party in Copenhagen from ${prisDkk("pakke_fest_lille")}. Two 10" speakers with Bluetooth plus a light bar, for up to 30 guests. Save ${rabatDkk("pakke_fest_lille")} on the bundle.`,
  keywords: [
    "party package rental copenhagen",
    "sound and light hire copenhagen",
    "party equipment rental denmark",
  ],
  // Både canonical og languages sættes her: en side, der selv sætter
  // alternates.canonical, erstatter hele alternates-objektet fra root-layoutet
  // og taber ellers sine hreflang-par. Se src/lib/hreflang.ts.
  alternates: {
    canonical: "https://lejhojtaler.dk/en/festpakke-lille",
    languages: localeAlternates("/festpakke-lille"),
  },
  openGraph: {
    images: ogImages("/images/product-pakke-fest-lille.webp"),
    title: `Party Package 0-30 Copenhagen | ${prisDkk("pakke_fest_lille")} | Sound & Lights | Lejhøjtaler.dk`,
    description:
      `Rent sound and lights for your party in Copenhagen from ${prisDkk("pakke_fest_lille")}. Two 10" speakers with Bluetooth plus a light bar, for up to 30 guests. Save ${rabatDkk("pakke_fest_lille")} on the bundle.`,
    url: "https://lejhojtaler.dk/en/festpakke-lille",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function SmallPartyPackageEn() {
  return (
    <ProductLanding
      locale="en"
      slug="en/festpakke-lille"
      name="Party package 0-30"
      headline="Party package 0-30, sound and lights"
      sub={`2× Alto 10" speakers + a light bar. Everything for a party of up to 30 guests, save ${rabatDkk("pakke_fest_lille")}.`}
      image="/images/product-pakke-fest-lille-white.webp"
      imageAlt="Party package 0-30 with Alto speakers and a light bar"
      productId="pakke_fest_lille"
      faqPhrase="the party package 0-30"
      bullets={[
        '2× Alto 10" speakers with Bluetooth (up to 30 guests)',
        "Light bar: 2 coloured lamps + centre effect on a stand",
        "All cables included",
        `Save ${rabatDkk("pakke_fest_lille")} compared to renting the parts separately`,
        "Delivery and setup available in the booking",
      ]}
    />
  );
}
