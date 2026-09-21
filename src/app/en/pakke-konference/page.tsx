import { prisDkk, rabatDkk } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Conference Bundle Rental Copenhagen | ${prisDkk("pakke_konference")} | Lejhøjtaler.dk`,
  description:
    `Conference bundle with 55\" display, wireless headset and two speakers, ready for the meeting room for ${prisDkk("pakke_konference")}. Save ${rabatDkk("pakke_konference")}. Book online in Copenhagen.`,
  keywords: ["conference equipment rental copenhagen", "screen and sound for conference hire", "av equipment conference denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/pakke-konference",
    languages: localeAlternates("/pakke-konference"),
  },
  openGraph: {
    images: ogImages("/images/product-skaerm.webp"),
    title: `Conference bundle rental | ${prisDkk("pakke_konference")}`,
    description: `55\" display + wireless headset + small speaker package. Save ${rabatDkk("pakke_konference")}.`,
    url: "https://lejhojtaler.dk/en/pakke-konference",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/pakke-konference"
      name="Conference bundle"
      headline="The conference bundle, ready for the meeting"
      sub={`55\" display + wireless headset + small speaker package. Save ${rabatDkk("pakke_konference")}.`}
      imageAlt="Conference bundle with large screen, headset and speakers"
      productId="pakke_konference"
      bullets={[
        "55\" LED display on a tripod stand",
        "Wireless headset",
        "2× 10\" speakers with Bluetooth",
        "All cables and adapters",
        `Save ${rabatDkk("pakke_konference")} compared to single prices`,
      ]}
    />
  );
}
