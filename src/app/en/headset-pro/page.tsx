import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "PRO Wireless Headset Rental Copenhagen | 595 DKK | Lejhøjtaler.dk",
  description:
    "Rent a broadcast-quality wireless headset microphone in Copenhagen for 595 DKK per weekend. For conferences, stages and full-day speakers. Pay on pickup.",
  keywords: [
    "professional headset microphone rental copenhagen",
    "broadcast headset hire copenhagen",
    "conference headset rental",
    "wireless headset rental denmark",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/headset-pro",
    languages: localeAlternates("/headset-pro"),
  },
  openGraph: {
    title: "PRO Wireless Headset Rental Copenhagen | 595 DKK",
    description:
      "Broadcast-quality wireless headset — for conferences and stages. Book online.",
    url: "https://lejhojtaler.dk/en/headset-pro",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/headset-pro"
      name="Wireless headset PRO"
      price={595}
      headline="Rent a PRO wireless headset"
      sub="Broadcast-quality headset microphone — for conferences and stages."
      image="/images/product-headset-pro-v2.webp"
      imageAlt="Professional wireless headset microphone for rent in Copenhagen"
      productId="headset_pro"
      faqPhrase="a PRO wireless headset"
      bullets={[
        "PRO headset microphone in broadcast quality",
        "Bodypack transmitter and receiver",
        "Cable connection to speaker or mixer",
        "Made for conferences and stages",
        "Collect Friday, return Monday",
      ]}
    />
  );
}
