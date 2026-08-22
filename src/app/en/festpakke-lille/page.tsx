import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Small Party Package Copenhagen | 495 DKK | Sound & Lights | Lejhøjtaler.dk",
  description:
    'Rent sound and lights for your party in Copenhagen from 495 DKK. Two 10" speakers with Bluetooth plus a LED light effect, for up to 40 guests. Save 95 DKK on the bundle.',
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
    title: "Small Party Package Copenhagen | 495 DKK | Sound & Lights | Lejhøjtaler.dk",
    description:
      'Rent sound and lights for your party in Copenhagen from 495 DKK. Two 10" speakers with Bluetooth plus a LED light effect, for up to 40 guests. Save 95 DKK on the bundle.',
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
      name="Small Party Package"
      price={495}
      headline="Small party package — sound and lights"
      sub='2× Alto 10" speakers + a light effect. Everything for the small party — save 95 DKK.'
      image="/images/product-pakke-fest-lille.webp"
      imageAlt="Small party package with Alto speakers and a light effect"
      productId="pakke_fest_lille"
      faqPhrase="the small party package"
      bullets={[
        '2× Alto 10" speakers with Bluetooth (up to 40 guests)',
        "One LED light effect with colour patterns",
        "All cables included",
        "Save 95 DKK compared to renting the parts separately",
        "Delivery and setup available in the booking",
      ]}
    />
  );
}
