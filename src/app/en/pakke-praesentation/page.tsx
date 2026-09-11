import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Presentation Bundle Rental Copenhagen | 695 DKK | Lejhøjtaler.dk",
  description:
    "Presentation bundle with projector, 160 cm screen and wired handheld microphone — everything for the presentation for 695 DKK. Save 90 DKK. Book online in Copenhagen.",
  keywords: ["presentation equipment rental copenhagen", "projector and screen hire", "av package for meeting denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/pakke-praesentation",
    languages: localeAlternates("/pakke-praesentation"),
  },
  openGraph: {
    title: "Presentation bundle rental | 695 DKK",
    description: "Projector + 160 cm screen + handheld microphone. Save 90 DKK compared to single prices.",
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
      price={695}
      headline="The presentation bundle — everything for the meeting"
      sub="Projector + 160 cm screen + handheld microphone. Save 90 DKK compared to single prices."
      image="/images/product-projektor.webp"
      imageAlt="Presentation bundle with projector, screen and microphone"
      productId="pakke_praesentation"
      bullets={[
        "Full HD projector",
        "160 cm screen on a stand",
        "Wired handheld microphone",
        "All cables included",
        "Save 90 DKK compared to renting the parts separately",
      ]}
    />
  );
}
