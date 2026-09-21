import { prisDkk, rabatDkk } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Karaoke Machine Rental Copenhagen | ${prisDkk("karaoke")} | Lejhøjtaler.dk`,
  description:
    `Rent a Singing Machine karaoke machine in Copenhagen for ${prisDkk("karaoke")}. Built-in screen, two wireless microphones and party lights, connect your TV via HDMI.`,
  keywords: ["karaoke machine rental copenhagen", "karaoke hire denmark", "singing machine rental"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/karaoke-maskine",
    languages: localeAlternates("/karaoke-maskine"),
  },
  openGraph: {
    images: ogImages("/images/product-karaoke-v2.webp"),
    title: `Karaoke machine rental Copenhagen | ${prisDkk("karaoke")}`,
    description: "Singing Machine with built-in screen, 2 wireless microphones and party lights, connect a TV via HDMI.",
    url: "https://lejhojtaler.dk/en/karaoke-maskine",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/karaoke-maskine"
      name="Karaoke machine"
      headline="Rent a karaoke machine in Copenhagen"
      sub="Singing Machine with built-in screen, 2 wireless microphones and party lights, connect a TV via HDMI."
      image="/images/product-karaoke-v2-white.webp"
      imageAlt="Singing Machine karaoke machine with two wireless microphones for rent"
      productId="karaoke"
      faqPhrase="a karaoke machine"
      bullets={[
        "Singing Machine with built-in screen",
        "2 wireless microphones included",
        "Party lights in the speaker",
        "HDMI to TV/projector + Bluetooth",
        "Ready in 5 minutes",
        `Cheapest in the Karaoke bundle, save ${rabatDkk("pakke_karaoke")}`,
      ]}
    />
  );
}
