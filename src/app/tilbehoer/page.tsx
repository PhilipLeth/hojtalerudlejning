import type { Metadata } from "next";
import TilbehoerSide from "@/components/TilbehoerSide";
import { localeAlternates } from "@/lib/hreflang";
import { ogImages } from "@/lib/og";

export const metadata: Metadata = {
  title: "Lej tilbehør København | Mikrofon, stativer, mixer og kabler | Lejhøjtaler.dk",
  description:
    "Lej tilbehør til lyd og lys i København: mikrofoner, højtalerstativer, subwoofer, mixer, røgvæske og forlængerledninger. Fast pris for op til fem dage, book online.",
  keywords: ["lej tilbehør", "lej mikrofon", "lej højtalerstativ", "lej subwoofer", "lej forlængerledning"],
  alternates: { canonical: "https://lejhojtaler.dk/tilbehoer", languages: localeAlternates("/tilbehoer") },
  openGraph: {
    title: "Lej tilbehør København | Mikrofon, stativer og kabler",
    description: "Mikrofoner, stativer, subwoofer, mixer, væsker og strøm. Book online.",
    url: "https://lejhojtaler.dk/tilbehoer",
    images: ogImages("/images/product-stativer-white.webp"),
  },
};

export default function Page() {
  return <TilbehoerSide locale="da" />;
}
