import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Projector Screen 160 cm Rental Copenhagen | 195 DKK | Lejhøjtaler.dk",
  description:
    "Rent a 160 cm projector screen on a stand in Copenhagen for 195 DKK. Fits all our projectors — set up in a minute. Book online.",
  keywords: ["projector screen rental copenhagen", "projection screen hire", "screen for projector denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/laerred-160",
    languages: localeAlternates("/laerred-160"),
  },
  openGraph: {
    title: "Projector screen 160 cm rental | 195 DKK",
    description: "160 cm projector screen on a stand — the perfect partner for the projector.",
    url: "https://lejhojtaler.dk/en/laerred-160",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/laerred-160"
      name="Projector screen 160 cm"
      price={195}
      headline="Rent a 160 cm projector screen"
      sub="160 cm screen on a stand — the perfect partner for the projector."
      image="/images/product-laerred.webp"
      imageAlt="160 cm projector screen on a stand for rent"
      productId="laerred_160"
      faqPhrase="a 160 cm projector screen"
      bullets={[
        "160 cm wide screen",
        "Stable tripod stand",
        "Set up in 2 minutes",
        "Combine with a projector from 495 DKK",
        "Collect Friday, return Monday",
      ]}
    />
  );
}
