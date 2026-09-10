import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Rent a Soundboks in Copenhagen | Soundboks 4, 695 DKK/weekend | Lejhøjtaler.dk",
  description:
    "Rent a Soundboks in Copenhagen — Soundboks 4 from 695 DKK for a whole weekend. Battery-powered with heavy bass, no deposit. Pick up Friday, return Monday.",
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
    title: "Rent a Soundboks in Copenhagen | 695 DKK/weekend",
    description:
      "Rent a Soundboks in Copenhagen from 695 DKK/weekend. Battery-powered, heavy bass, no deposit. Pick up Friday, return Monday.",
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
      price={695}
      headline="Rent a Soundboks in Copenhagen"
      sub="Soundboks 4 — battery-powered with heavy bass, no power outlet needed. No deposit: you only pay when you pick it up."
      weekendAvailability
      image="/images/product-soundboks.webp"
      imageAlt="Soundboks 4 for rent in Copenhagen"
      productId="soundboks"
      faqPhrase="a Soundboks 4"
      faqExtra={[
        {
          q: "Do I have to pay a deposit to rent a Soundboks?",
          a: "No. We charge neither deposit nor bond — you only pay the rent. You are liable for the equipment from pickup to return, but nothing is held up front.",
        },
        {
          q: "How long does the battery last on a Soundboks 4?",
          a: "Expect up to 12 hours of playtime at party volume — plenty for a full evening with no power outlet. The charger is included, so on a weekend rental you can recharge for the next day.",
        },
        {
          q: "Is a Soundboks loud enough for my party?",
          a: "Yes — the Soundboks 4 covers up to 50 people, outdoors too. For bigger crowds or more low end, look at the large speaker package with subwoofer. And if you play outdoors at night, be kind to the neighbours — you are the host.",
        },
      ]}
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
