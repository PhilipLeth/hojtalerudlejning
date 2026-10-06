import type { Metadata } from "next";
import TilbehoerSide from "@/components/TilbehoerSide";
import { localeAlternates } from "@/lib/hreflang";
import { ogImages } from "@/lib/og";

export const metadata: Metadata = {
  title: "Accessory Rental Copenhagen | Stands, Fog Fluid & Extension Leads | Lejhøjtaler.dk",
  description:
    "Rent accessories in Copenhagen: speaker stands, microphone stand, lighting stand, DJ stands, fog, snow and bubble fluid, cable reels and power strips. One price for up to five days, book online.",
  alternates: { canonical: "https://lejhojtaler.dk/en/tilbehoer", languages: localeAlternates("/tilbehoer") },
  openGraph: {
    title: "Accessory rental Copenhagen | Stands, fluids and power",
    description: "Speaker, microphone, lighting and DJ stands, fluids and power. Book online.",
    url: "https://lejhojtaler.dk/en/tilbehoer",
    images: ogImages("/images/product-kabeltromle-white.webp"),
    locale: "en_GB",
  },
};

export default function Page() {
  return <TilbehoerSide locale="en" />;
}
