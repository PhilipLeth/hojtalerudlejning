import type { Metadata } from "next";
import TilbehoerSide from "@/components/TilbehoerSide";
import { localeAlternates } from "@/lib/hreflang";
import { ogImages } from "@/lib/og";

export const metadata: Metadata = {
  title: "Accessory Rental Copenhagen | Microphones, Stands, Mixers & Cables | Lejhøjtaler.dk",
  description:
    "Rent sound and lighting accessories in Copenhagen: microphones, speaker stands, subwoofer, mixer, fog fluid and extension leads. One price for up to five days, book online.",
  alternates: { canonical: "https://lejhojtaler.dk/en/tilbehoer", languages: localeAlternates("/tilbehoer") },
  openGraph: {
    title: "Accessory rental Copenhagen | Microphones, stands and cables",
    description: "Microphones, stands, subwoofer, mixer, fluids and power. Book online.",
    url: "https://lejhojtaler.dk/en/tilbehoer",
    images: ogImages("/images/product-stativer-white.webp"),
    locale: "en_GB",
  },
};

export default function Page() {
  return <TilbehoerSide locale="en" />;
}
