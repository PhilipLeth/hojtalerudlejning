import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Party Package 150 Copenhagen | 1.495 DKK | Lejhøjtaler.dk",
  description:
    'Rent a complete party setup for up to 150 guests in Copenhagen for 1.495 DKK. Two 12" speakers, a subwoofer, stands, light package and fog machine. Delivery available.',
  keywords: [
    "large event sound rental copenhagen",
    "party package 150 guests",
    "subwoofer rental copenhagen",
  ],
  // Både canonical og languages sættes her: en side, der selv sætter
  // alternates.canonical, erstatter hele alternates-objektet fra root-layoutet
  // og taber ellers sine hreflang-par. Se src/lib/hreflang.ts.
  alternates: {
    canonical: "https://lejhojtaler.dk/en/festpakke-150",
    languages: localeAlternates("/festpakke-150"),
  },
  openGraph: {
    title: "Party Package 150 Copenhagen | 1.495 DKK | Lejhøjtaler.dk",
    description:
      'Rent a complete party setup for up to 150 guests in Copenhagen for 1.495 DKK. Two 12" speakers, a subwoofer, stands, light package and fog machine. Delivery available.',
    url: "https://lejhojtaler.dk/en/festpakke-150",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function PartyPackage150En() {
  return (
    <ProductLanding
      locale="en"
      slug="en/festpakke-150"
      name="Party Package 150"
      price={1495}
      headline="Party package for 150 guests"
      sub='2× EV 12" speakers, subwoofer, stands, lights and a fog machine.'
      image="/images/product-pakke-fest-150.webp"
      imageAlt="Party package for 150 guests with subwoofer and lights"
      productId="pakke_fest_150"
      faqPhrase="Party Package 150"
      bullets={[
        '2× EV 12" active speakers on stands',
        '12" subwoofer for the low end',
        "Light package and fog machine included",
        "All cables included",
        "Delivery and setup recommended for this size",
      ]}
    />
  );
}
