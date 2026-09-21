import { prisDkk } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Party Package 250 Copenhagen | ${prisDkk("pakke_fest_250")} | Lejhøjtaler.dk`,
  description:
    `Rent sound and lights for up to 250 guests in Copenhagen for ${prisDkk("pakke_fest_250")}. Four 12" speakers, two subwoofers, stands, light bar and fog machine. Delivery available.`,
  keywords: [
    "event sound rental copenhagen",
    "big party sound hire",
    "festival sound rental denmark",
  ],
  // Både canonical og languages sættes her: en side, der selv sætter
  // alternates.canonical, erstatter hele alternates-objektet fra root-layoutet
  // og taber ellers sine hreflang-par. Se src/lib/hreflang.ts.
  alternates: {
    canonical: "https://lejhojtaler.dk/en/festpakke-250",
    languages: localeAlternates("/festpakke-250"),
  },
  openGraph: {
    images: ogImages("/images/product-pakke-fest-250-v2.webp"),
    title: `Party Package 250 Copenhagen | ${prisDkk("pakke_fest_250")} | Lejhøjtaler.dk`,
    description:
      `Rent sound and lights for up to 250 guests in Copenhagen for ${prisDkk("pakke_fest_250")}. Four 12" speakers, two subwoofers, stands, light bar and fog machine. Delivery available.`,
    url: "https://lejhojtaler.dk/en/festpakke-250",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function PartyPackage250En() {
  return (
    <ProductLanding
      locale="en"
      slug="en/festpakke-250"
      name="Party Package 250"
      headline="Party package for 250 guests"
      sub='4× EV 12" speakers, two subwoofers, stands, lights and fog.'
      image="/images/product-pakke-fest-250-v2-white.webp"
      imageAlt="Party package for 250 guests with four speakers and two subwoofers"
      productId="pakke_fest_250"
      faqPhrase="Party Package 250"
      bullets={[
        '4× EV 12" active speakers on stands',
        '2× 12" subwoofers',
        "Light bar and fog machine included",
        "All cables included",
        "Delivery and setup recommended for this size",
      ]}
    />
  );
}
