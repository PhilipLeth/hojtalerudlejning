import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Large Speaker Package Rental Copenhagen | 995 DKK | Lejhøjtaler.dk",
  description:
    'Rent two 12" EV active speakers in Copenhagen from 995 DKK/weekend. Clear, powerful sound for 30-50 guests. All cables included, stands available. Book online.',
  keywords: [
    "PA system rental copenhagen",
    "rent large speakers copenhagen",
    "EV speaker hire",
    "event sound rental copenhagen",
  ],
  // Både canonical og languages sættes her: en side, der selv sætter
  // alternates.canonical, erstatter hele alternates-objektet fra root-layoutet
  // og taber ellers sine hreflang-par. Se src/lib/hreflang.ts.
  alternates: {
    canonical: "https://lejhojtaler.dk/en/hojtalerpakke-normal",
    languages: localeAlternates("/hojtalerpakke-normal"),
  },
  openGraph: {
    title: "Large Speaker Package Rental Copenhagen | 995 DKK | Lejhøjtaler.dk",
    description:
      'Rent two 12" EV active speakers in Copenhagen from 995 DKK/weekend. Clear, powerful sound for 30-50 guests. All cables included, stands available. Book online.',
    url: "https://lejhojtaler.dk/en/hojtalerpakke-normal",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function LargeSpeakerPackageEn() {
  return (
    <ProductLanding
      locale="en"
      slug="en/hojtalerpakke-normal"
      name="Large Speaker Package"
      price={995}
      headline="Rent a large speaker package in Copenhagen"
      sub='Two powerful 12" EV active speakers — clear sound for larger rooms and outdoors.'
      image="/images/product-festival.webp"
      imageAlt="Large speaker package for rent in Copenhagen"
      productId="festival"
      faqPhrase="the large speaker package"
      capacity={{ level: 2, label: "30-50 people" }}
      bullets={[
        '2× 12" EV active speakers',
        "All cables included — stands available as an add-on (100 DKK)",
        "Bluetooth",
        "Collect Friday, return Monday",
      ]}
    />
  );
}
