import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Party Package 30-50 Copenhagen | 1,095 DKK | 30-50 Guests | Lejhøjtaler.dk",
  description:
    'Rent sound and lights for 30-50 guests in Copenhagen from 1,095 DKK. Two 12" EV speakers plus coloured lights and a centre effect. Save 95 DKK on the bundle.',
  keywords: [
    "party sound rental copenhagen",
    "party package 30-50 hire",
    "event lighting rental copenhagen",
  ],
  // Både canonical og languages sættes her: en side, der selv sætter
  // alternates.canonical, erstatter hele alternates-objektet fra root-layoutet
  // og taber ellers sine hreflang-par. Se src/lib/hreflang.ts.
  alternates: {
    canonical: "https://lejhojtaler.dk/en/festpakke-stor",
    languages: localeAlternates("/festpakke-stor"),
  },
  openGraph: {
    title: "Party Package 30-50 Copenhagen | 1,095 DKK | 30-50 Guests | Lejhøjtaler.dk",
    description:
      'Rent sound and lights for 30-50 guests in Copenhagen from 1,095 DKK. Two 12" EV speakers plus coloured lights and a centre effect. Save 95 DKK on the bundle.',
    url: "https://lejhojtaler.dk/en/festpakke-stor",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function LargePartyPackageEn() {
  return (
    <ProductLanding
      locale="en"
      slug="en/festpakke-stor"
      name="Party package 30-50"
      price={1095}
      headline="Party package 30-50, sound and lights for 30-50 guests"
      sub='2× EV 12" speakers + the full light package. A proper party, save 95 DKK.'
      image="/images/product-pakke-fest-stor-white.webp"
      imageAlt="Party package 30-50 with EV speakers and light bar"
      productId="pakke_fest_stor"
      faqPhrase="the party package 30-50"
      bullets={[
        '2× EV 12" active speakers with Bluetooth (30-50 guests)',
        "Speaker stands available as an add-on (95 DKK)",
        "Light bar: 2 coloured lamps + centre effect",
        "Save 95 DKK compared to renting the parts separately",
        "Delivery and setup available in the booking",
      ]}
    />
  );
}
