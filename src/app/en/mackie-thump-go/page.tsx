import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Rent Mackie Thump GO Copenhagen | 345 DKK/weekend | Lejhøjtaler.dk",
  description:
    "Rent a battery-powered Mackie Thump GO speaker in Copenhagen from 345 DKK/weekend. Up to 12 hours of battery, Bluetooth, no power outlet needed. Pick up Friday, return Monday.",
  keywords: [
    "rent battery speaker copenhagen",
    "mackie thump go rental",
    "portable speaker hire copenhagen",
    "bluetooth speaker rental copenhagen",
  ],
  // Både canonical og languages sættes her: en side, der selv sætter
  // alternates.canonical, erstatter hele alternates-objektet fra root-layoutet
  // og taber ellers sine hreflang-par. Se src/lib/hreflang.ts.
  alternates: {
    canonical: "https://lejhojtaler.dk/en/mackie-thump-go",
    languages: localeAlternates("/mackie-thump-go"),
  },
  openGraph: {
    title: "Rent Mackie Thump GO Copenhagen | 345 DKK/weekend | Lejhøjtaler.dk",
    description:
      "Rent a battery-powered Mackie Thump GO speaker in Copenhagen from 345 DKK/weekend. Up to 12 hours of battery, Bluetooth, no power outlet needed. Pick up Friday, return Monday.",
    url: "https://lejhojtaler.dk/en/mackie-thump-go",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function MackieThumpGoEn() {
  return (
    <ProductLanding
      locale="en"
      slug="en/mackie-thump-go"
      name="Mackie Thump GO"
      price={345}
      headline="Rent Mackie Thump GO in Copenhagen"
      sub='Battery-powered 8" speaker — park, beach, courtyard. No power needed.'
      image="/images/product-thumpgo.webp"
      imageAlt="Mackie Thump GO battery speaker for rent in Copenhagen"
      productId="thumpgo"
      faqPhrase="the Mackie Thump GO"
      bullets={[
        '8" battery speaker with Bluetooth',
        "Up to 12 hours of battery",
        "Only 10 kg — fits on a bike",
        "Charger and AUX cable included",
        "Collect Friday, return Monday",
      ]}
    />
  );
}
