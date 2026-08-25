import type { Metadata } from "next";
import Hero from "@/components/Hero";
import SpeakerCompare from "@/components/SpeakerCompare";
import BundleGrid from "@/components/BundleGrid";
import Testimonials from "@/components/Testimonials";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import { localeAlternates } from "@/lib/hreflang";
import { FEST_LADDER_IDS } from "@/lib/products";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";
import { catalogPrice, prisDkk, startPrisDkk } from "@/lib/products";

export const metadata: Metadata = {
  title: `Rent Speaker Copenhagen | From ${startPrisDkk()}/weekend | Lejhøjtaler.dk`,
  description:
    `Rent speakers in Copenhagen from ${startPrisDkk()}/weekend. PA system rental for parties, events and celebrations. Sound equipment for hire — pick up Friday, return Monday. Book online in 2 minutes.`,
  keywords: [
    "rent speaker copenhagen",
    "speaker rental copenhagen",
    "PA system rental copenhagen",
    "party speaker hire copenhagen",
    "sound equipment rental copenhagen",
    "speaker hire denmark",
    "rent PA system copenhagen",
    "event speaker rental",
    "lej højtaler",
    "lejhojtaler",
  ],
  openGraph: {
    title: `Rent Speaker Copenhagen | From ${startPrisDkk()}/weekend | Lejhøjtaler.dk`,
    description:
      `Rent speakers and PA systems for your party in Copenhagen. Sound equipment rental from ${startPrisDkk()}/weekend. Book online in 2 minutes.`,
    url: "https://lejhojtaler.dk/en",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
  alternates: {
    canonical: "https://lejhojtaler.dk/en",
    languages: localeAlternates("/"),
  },
};

export default function EnHome() {
  return (
    <main className="min-h-screen" lang="en">
      <Hero locale="en" />
      {/* Pakkestigen manglede på engelsk — den engelske forside viste kun
          enkelthøjtalere, mens den danske havde hele stigen efter antal gæster.
          Det var også grunden til, at de engelske pakkesider stod uden ét
          eneste indgående link. */}
      <BundleGrid locale="en" ids={FEST_LADDER_IDS} title="Choose a package by number of guests" />
      <SpeakerCompare locale="en" />
      <FaqSection items={CATEGORY_FAQ["en"]} title="Frequently asked questions" />

      <Testimonials locale="en" />
      <HowItWorks locale="en" />
      <Footer locale="en" />

      {/* JSON-LD: LocalBusiness */}
      <LocalBusinessJsonLd
        extra={{
          description:
            `Speaker rental in Copenhagen. Rent speakers, PA systems and sound equipment for parties, events and celebrations. Equipment for hire from ${startPrisDkk()}/weekend.`,
          url: "https://lejhojtaler.dk/en",
          areaServed: { "@type": "City", name: "Copenhagen" },
        }}
      />

      {/* JSON-LD: Product — Small Speaker Package */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Small Speaker Package rental",
            description:
              '2x 10" Alto speakers with Bluetooth for rent. Up to 40 people. 12 kg in carry bag — ready for your bike. All cables included.',
            image: "https://lejhojtaler.dk/images/product-party.webp",
            brand: {
              "@type": "Brand",
              name: "Lejhøjtaler.dk",
            },
            offers: {
              "@type": "Offer",
              price: String(catalogPrice("thumpgo")),
              priceCurrency: "DKK",
              priceValidUntil: "2026-12-31",
                            availability: "https://schema.org/InStock",
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: { "@type": "MonetaryAmount", value: String(catalogPrice("levering_ud")), currency: "DKK" },
                shippingDestination: { "@type": "DefinedRegion", addressCountry: "DK", addressRegion: "Copenhagen" },
              },
              url: "https://lejhojtaler.dk/en#book",
              description: `From ${prisDkk("thumpgo")}/weekend (Fri-Mon). Speaker rental Copenhagen.`,
            },
          }),
        }}
      />

      {/* JSON-LD: Product — Large Speaker Package */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Large Speaker Package rental",
            description:
              '2x 12" EV speakers with Bluetooth for rent. 40-100 people. Stands and all cables included. Perfect for large parties and events in Copenhagen.',
            image: "https://lejhojtaler.dk/images/product-festival.webp",
            brand: {
              "@type": "Brand",
              name: "Lejhøjtaler.dk",
            },
            offers: {
              "@type": "Offer",
              price: String(catalogPrice("festival")),
              priceCurrency: "DKK",
              priceValidUntil: "2026-12-31",
                            availability: "https://schema.org/InStock",
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: { "@type": "MonetaryAmount", value: String(catalogPrice("levering_ud")), currency: "DKK" },
                shippingDestination: { "@type": "DefinedRegion", addressCountry: "DK", addressRegion: "Copenhagen" },
              },
              url: "https://lejhojtaler.dk/en#book",
              description: `From ${prisDkk("festival")}/weekend (Fri-Mon). PA system rental Copenhagen.`,
            },
          }),
        }}
      />

      {/* JSON-LD: Product — Light Package */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Light package rental",
            description:
              "Party lights for rent: 2 coloured LED lamps + centre effect on stand. Add to your speaker rental for the full party experience.",
            image: "https://lejhojtaler.dk/images/product-lys.webp",
            brand: {
              "@type": "Brand",
              name: "Lejhøjtaler.dk",
            },
            offers: {
              "@type": "Offer",
              price: String(catalogPrice("lys")),
              priceCurrency: "DKK",
              priceValidUntil: "2026-12-31",
                            availability: "https://schema.org/InStock",
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: { "@type": "MonetaryAmount", value: String(catalogPrice("levering_ud")), currency: "DKK" },
                shippingDestination: { "@type": "DefinedRegion", addressCountry: "DK", addressRegion: "Copenhagen" },
              },
              url: "https://lejhojtaler.dk/en#book",
              description: `${prisDkk("lys")} add-on. Party equipment rental Copenhagen.`,
            },
          }),
        }}
      />
    </main>
  );
}
