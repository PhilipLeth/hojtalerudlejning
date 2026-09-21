import { prisDkk, rabatDkk } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Karaoke Party Bundle Rental Copenhagen | ${prisDkk("pakke_karaoke_fest")} | Lejhøjtaler.dk`,
  description:
    `Karaoke party bundle with machine, 55\" display and large speakers, karaoke for up to 100 guests for ${prisDkk("pakke_karaoke_fest")}. Save ${rabatDkk("pakke_karaoke_fest")}. Book online.`,
  keywords: ["large karaoke package rental", "karaoke system for party hire copenhagen", "karaoke company party rental"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/pakke-karaoke-fest",
    languages: localeAlternates("/pakke-karaoke-fest"),
  },
  openGraph: {
    images: ogImages("/images/product-pakke-karaoke-fest-v2.webp"),
    title: `Karaoke party bundle rental | ${prisDkk("pakke_karaoke_fest")}`,
    description: `Karaoke machine + 55\" display + large speakers. Save ${rabatDkk("pakke_karaoke_fest")}.`,
    url: "https://lejhojtaler.dk/en/pakke-karaoke-fest",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/pakke-karaoke-fest"
      name="Karaoke party bundle"
      headline="The karaoke party bundle, up to 100 people"
      sub={`Karaoke machine + 55\" display + large speakers. Save ${rabatDkk("pakke_karaoke_fest")}.`}
      imageAlt="Large karaoke bundle with a large screen and speakers for rent"
      productId="pakke_karaoke_fest"
      bullets={[
        "Singing Machine + 2 wireless microphones",
        "55\" LED display on a tripod stand",
        "2× 12\" EV speakers with stands",
        "Karaoke for up to 100 people",
        `Save ${rabatDkk("pakke_karaoke_fest")} compared to single prices`,
      ]}
    />
  );
}
