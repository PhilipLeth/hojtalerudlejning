import type { Metadata } from "next";
import LydOgLysPakkerSide from "@/components/LydOgLysPakkerSide";
import { localeAlternates } from "@/lib/hreflang";
import { ogImages } from "@/lib/og";

export const metadata: Metadata = {
  title: "Sound and Light Packages Copenhagen | Party Speakers + Light Bar | Lejhøjtaler.dk",
  description:
    "Rent sound and light as one package in Copenhagen: speakers, light bar and cables by guest count, cheaper than renting the parts separately. Book online, collect in Copenhagen S or add delivery.",
  alternates: { canonical: "https://lejhojtaler.dk/en/lyd-og-lyspakker", languages: localeAlternates("/lyd-og-lyspakker") },
  openGraph: {
    title: "Sound and light packages for parties",
    description: "Speakers, light bar and cables in one package, by guest count. Book online.",
    url: "https://lejhojtaler.dk/en/lyd-og-lyspakker",
    images: ogImages("/images/hero/festpakke-stor.webp"),
    locale: "en_GB",
  },
};

export default function Page() {
  return <LydOgLysPakkerSide locale="en" />;
}
