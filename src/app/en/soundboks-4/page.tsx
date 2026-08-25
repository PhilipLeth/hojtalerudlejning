import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Rent Soundboks 4 Copenhagen | 795 DKK/weekend | Lejhøjtaler.dk",
  description:
    "Rent a Soundboks 4 in Copenhagen from 795 DKK/weekend. Battery-powered with powerful bass for outdoor parties, up to 50 guests. Pick up Friday, return Monday.",
  keywords: [
    "rent soundboks copenhagen",
    "soundboks rental",
    "soundboks hire copenhagen",
    "loud battery speaker rental copenhagen",
  ],
  // Både canonical og languages sættes her: en side, der selv sætter
  // alternates.canonical, erstatter hele alternates-objektet fra root-layoutet
  // og taber ellers sine hreflang-par. Se src/lib/hreflang.ts.
  alternates: {
    canonical: "https://lejhojtaler.dk/en/soundboks-4",
    languages: localeAlternates("/soundboks-4"),
  },
  openGraph: {
    title: "Rent Soundboks 4 Copenhagen | 795 DKK/weekend | Lejhøjtaler.dk",
    description:
      "Rent a Soundboks 4 in Copenhagen from 795 DKK/weekend. Battery-powered with powerful bass for outdoor parties, up to 50 guests. Pick up Friday, return Monday.",
    url: "https://lejhojtaler.dk/en/soundboks-4",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Soundboks4En() {
  return (
    <ProductLanding
      locale="en"
      slug="en/soundboks-4"
      name="Soundboks 4"
      price={795}
      headline="Rent Soundboks 4 in Copenhagen"
      sub="Battery-powered speaker with heavy bass — no power outlet needed."
      image="/images/product-soundboks.webp"
      imageAlt="Soundboks 4 for rent in Copenhagen"
      productId="soundboks"
      faqPhrase="a Soundboks 4"
      bullets={[
        "Battery-powered — take it anywhere",
        "Heavy bass for outdoor parties",
        "Bluetooth + AUX",
        "Charger and cables included",
        "Collect Friday, return Monday",
      ]}
    />
  );
}
