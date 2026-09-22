import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: "Slush Machine Rental Copenhagen | Price on request | Lejhøjtaler.dk",
  description:
    "Hire a slush machine for a graduation party, summer party or children's birthday in Copenhagen. Two bowls, two flavours. Send us the date and the numbers for a same-day price.",
  keywords: ["slush machine rental copenhagen", "hire slush machine denmark", "slushie machine rental"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/slushicemaskine",
    languages: localeAlternates("/slushicemaskine"),
  },
  openGraph: {
    images: ogImages(),
    title: "Slush Machine Rental Copenhagen | Price on request",
    description: "A two-bowl slush machine for your party. Send us the date and the numbers for a same-day price.",
    url: "https://lejhojtaler.dk/en/slushicemaskine",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/slushicemaskine"
      name="Slush machine"
      headline="Slush machine rental in Copenhagen"
      sub="Two bowls, so you can run two flavours. For graduation parties, summer parties and children's birthdays."
      imageAlt="Two-bowl slush machine for hire in Copenhagen"
      productId="slushice"
      bullets={[
        "A two-bowl machine, two flavours at once",
        "Syrup agreed to match the number of guests",
        "Cups and straws can come with it",
        "Runs on ordinary 230 V mains",
        "Can be delivered with sound and lighting for the same party",
      ]}
    />
  );
}
