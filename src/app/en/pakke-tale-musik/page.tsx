import { prisDkk, rabatDkk } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Wireless Speech Package 30-50 Rental Copenhagen | ${prisDkk("pakke_speaker_traadloes_stor")} | Lejhøjtaler.dk`,
  description:
    `Medium speaker package + wireless microphone, speeches and music for events. Save ${rabatDkk("pakke_speaker_traadloes_stor")}. ${prisDkk("pakke_speaker_traadloes_stor")} per weekend. Pay on pickup. Book online.`,
  keywords: ["sound for speeches and music rental", "speaker and microphone package copenhagen", "event sound package denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/pakke-tale-musik",
    languages: localeAlternates("/pakke-tale-musik"),
  },
  openGraph: {
    images: ogImages("/images/product-festival-v2.webp"),
    title: `Wireless speech package rental | ${prisDkk("pakke_speaker_traadloes_stor")}`,
    description: `Medium speaker package + wireless microphone, speeches and music for events. Save ${rabatDkk("pakke_speaker_traadloes_stor")}.`,
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
      name="Speech package wireless 30-50"
      headline="Speech package wireless 30-50"
      sub={`Medium speaker package + wireless microphone, speeches and music for events. Save ${rabatDkk("pakke_speaker_traadloes_stor")}.`}
      imageAlt="Speech package with two EV speakers and a wireless microphone"
      productId="pakke_speaker_traadloes_stor"
      bullets={[
        "2× 12\" EV speakers with stands",
        "Wireless handheld microphone",
        "30-50 guests",
        "All cables included",
        `Save ${rabatDkk("pakke_speaker_traadloes_stor")} compared to single prices`,
      ]}
    />
  );
}
