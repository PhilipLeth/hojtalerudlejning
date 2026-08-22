import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Small Speaker Package Rental Copenhagen | 395 DKK | Lejhøjtaler.dk",
  description:
    'Rent two 10" Alto speakers with Bluetooth in Copenhagen from 395 DKK/weekend. Enough sound for up to 30 guests, all cables included. Pick up Friday, return Monday.',
  keywords: [
    "speaker package rental copenhagen",
    "rent speakers for party copenhagen",
    "PA hire copenhagen",
    "bluetooth speakers rental denmark",
  ],
  // Både canonical og languages sættes her: en side, der selv sætter
  // alternates.canonical, erstatter hele alternates-objektet fra root-layoutet
  // og taber ellers sine hreflang-par. Se src/lib/hreflang.ts.
  alternates: {
    canonical: "https://lejhojtaler.dk/en/hojtalerpakke-lille",
    languages: localeAlternates("/hojtalerpakke-lille"),
  },
  openGraph: {
    title: "Small Speaker Package Rental Copenhagen | 395 DKK | Lejhøjtaler.dk",
    description:
      'Rent two 10" Alto speakers with Bluetooth in Copenhagen from 395 DKK/weekend. Enough sound for up to 30 guests, all cables included. Pick up Friday, return Monday.',
    url: "https://lejhojtaler.dk/en/hojtalerpakke-lille",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function SmallSpeakerPackageEn() {
  return (
    <ProductLanding
      locale="en"
      slug="en/hojtalerpakke-lille"
      name="Small Speaker Package"
      price={395}
      headline="Rent a small speaker package in Copenhagen"
      sub='Two compact 10" Alto speakers with Bluetooth — light enough for a bike.'
      image="/images/product-party.webp"
      imageAlt="Small speaker package for rent in Copenhagen"
      productId="party"
      faqPhrase="the small speaker package"
      capacity={{ level: 1, label: "0-30 people" }}
      bullets={[
        '2× 10" Alto speakers with Bluetooth',
        "All cables included — carry bag and stands available as add-ons",
        "Only 12 kg",
        "Collect Friday, return Monday",
      ]}
    />
  );
}
