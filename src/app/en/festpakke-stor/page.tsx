import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Large Party Package Copenhagen | 1.290 DKK | 100 Guests | Lejhøjtaler.dk",
  description:
    'Rent sound and lights for up to 100 guests in Copenhagen from 1.290 DKK. Two 12" EV speakers plus coloured lights and a centre effect. Save 95 DKK on the bundle.',
  keywords: [
    "party sound rental copenhagen",
    "large party package hire",
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
    title: "Large Party Package Copenhagen | 1.290 DKK | 100 Guests | Lejhøjtaler.dk",
    description:
      'Rent sound and lights for up to 100 guests in Copenhagen from 1.290 DKK. Two 12" EV speakers plus coloured lights and a centre effect. Save 95 DKK on the bundle.',
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
      name="Large Party Package"
      price={1290}
      headline="Large party package — sound and lights for 100 guests"
      sub='2× EV 12" speakers + the full light package. A proper party — save 95 DKK.'
      image="/images/product-pakke-fest-stor.webp"
      imageAlt="Large party package with EV speakers and light package"
      productId="pakke_fest_stor"
      faqPhrase="the large party package"
      bullets={[
        '2× EV 12" active speakers with Bluetooth (up to 100 guests)',
        "Speaker stands available as an add-on (100 DKK)",
        "Light package: 2 coloured lamps + centre effect",
        "Save 95 DKK compared to renting the parts separately",
        "Delivery and setup available in the booking",
      ]}
    />
  );
}
