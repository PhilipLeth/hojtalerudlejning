import { prisDkk, rabatDkk } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Presentation Bundle Rental Copenhagen | ${prisDkk("pakke_praesentation")} | Lejhøjtaler.dk`,
  description:
    `Presentation bundle with projector, 160 cm screen and wired handheld microphone, everything for the presentation for ${prisDkk("pakke_praesentation")}. Save ${rabatDkk("pakke_praesentation")}. Book online in Copenhagen.`,
  keywords: ["presentation equipment rental copenhagen", "projector and screen hire", "av package for meeting denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/pakke-praesentation",
    languages: localeAlternates("/pakke-praesentation"),
  },
  openGraph: {
    images: ogImages("/images/product-projektor.webp"),
    title: `Presentation bundle rental | ${prisDkk("pakke_praesentation")}`,
    description: `Projector + 160 cm screen + handheld microphone. Save ${rabatDkk("pakke_praesentation")} compared to single prices.`,
    url: "https://lejhojtaler.dk/en/pakke-praesentation",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/pakke-praesentation"
      name="Presentation bundle"
      headline="The presentation bundle, everything for the meeting"
      sub={`Projector + 160 cm screen + handheld microphone. Save ${rabatDkk("pakke_praesentation")} compared to single prices.`}
      image="/images/product-projektor-white.webp"
      imageAlt="Presentation bundle with projector, screen and microphone"
      productId="pakke_praesentation"
      bullets={[
        "Full HD projector",
        "160 cm screen on a stand",
        "Wired handheld microphone",
        "All cables included",
        `Save ${rabatDkk("pakke_praesentation")} compared to renting the parts separately`,
      ]}
    />
  );
}
