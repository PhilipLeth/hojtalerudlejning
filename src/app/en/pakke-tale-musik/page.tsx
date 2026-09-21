import { prisDkk, rabatDkk } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Speech & Music Package Rental Copenhagen | ${prisDkk("pakke_tale_musik")} | Lejhøjtaler.dk`,
  description:
    `Medium speaker package + wireless microphone, speeches and music for events. Save ${rabatDkk("pakke_tale_musik")}. ${prisDkk("pakke_tale_musik")} per weekend. Pay on pickup. Book online.`,
  keywords: ["sound for speeches and music rental", "speaker and microphone package copenhagen", "event sound package denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/pakke-tale-musik",
    languages: localeAlternates("/pakke-tale-musik"),
  },
  openGraph: {
    images: ogImages("/images/product-festival-v2.webp"),
    title: `Speech & music package rental | ${prisDkk("pakke_tale_musik")}`,
    description: `Medium speaker package + wireless microphone, speeches and music for events. Save ${rabatDkk("pakke_tale_musik")}.`,
    url: "https://lejhojtaler.dk/en/pakke-tale-musik",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/pakke-tale-musik"
      name="Speech & music package"
      headline="The speech & music package"
      sub={`Medium speaker package + wireless microphone, speeches and music for events. Save ${rabatDkk("pakke_tale_musik")}.`}
      image="/images/product-festival-v2-white.webp"
      imageAlt="Speech and music package with large speakers and a wireless microphone"
      productId="pakke_tale_musik"
      bullets={[
        "2× 12\" EV speakers with stands",
        "Wireless handheld microphone",
        "Up to 100 people",
        "All cables included",
        `Save ${rabatDkk("pakke_tale_musik")} compared to single prices`,
      ]}
    />
  );
}
