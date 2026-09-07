import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Shure BLX Wireless Microphone Rental Copenhagen | 595 DKK | Lejhøjtaler.dk",
  description:
    "Rent a Shure BLX wireless microphone in Copenhagen for 595 DKK per weekend. Stage-quality sound for conferences, events and live performance. Pay on pickup.",
  keywords: [
    "shure microphone rental copenhagen",
    "professional microphone rental copenhagen",
    "stage microphone hire copenhagen",
    "conference microphone rental",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/traadloes-mikrofon-pro",
    languages: localeAlternates("/traadloes-mikrofon-pro"),
  },
  openGraph: {
    title: "Shure BLX Wireless Microphone Rental Copenhagen | 595 DKK",
    description:
      "Shure BLX wireless microphone — stage quality for events and conferences. Book online.",
    url: "https://lejhojtaler.dk/en/traadloes-mikrofon-pro",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/traadloes-mikrofon-pro"
      name="Wireless microphone PRO"
      price={595}
      headline="Rent a Shure BLX wireless microphone"
      sub="Stage-quality wireless microphone for conferences, events and live performance."
      image="/images/product-mikrofon-pro.webp"
      imageAlt="Shure BLX wireless microphone for rent in Copenhagen"
      productId="traadloes_mikrofon_pro"
      faqPhrase="a Shure BLX wireless microphone"
      bullets={[
        "Shure BLX wireless system",
        "Handheld microphone in stage quality",
        "Receiver and cable connection included",
        "Made for conferences and stages",
        "Collect Friday, return Monday",
      ]}
    />
  );
}
