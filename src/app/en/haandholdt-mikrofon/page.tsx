import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Wired Handheld Microphone Rental Copenhagen | 95 DKK | Lejhøjtaler.dk",
  description:
    "Rent a wired handheld microphone in Copenhagen for 95 DKK per weekend. XLR cable included — plugs straight into our speakers. For speeches and vocals. Pay on pickup.",
  keywords: [
    "microphone rental copenhagen",
    "cheap microphone rental copenhagen",
    "wired microphone hire",
    "microphone for speeches copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/haandholdt-mikrofon",
    languages: localeAlternates("/haandholdt-mikrofon"),
  },
  openGraph: {
    title: "Wired Handheld Microphone Rental Copenhagen | 95 DKK",
    description:
      "Standard wired handheld microphone for speeches and vocals. XLR cable included. Book online.",
    url: "https://lejhojtaler.dk/en/haandholdt-mikrofon",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/haandholdt-mikrofon"
      name="Handheld microphone (wired)"
      price={95}
      headline="Rent a handheld microphone"
      sub="Standard wired handheld microphone — for speeches and vocals."
      image="/images/product-mikrofon-kabel-v2.webp"
      imageAlt="Wired handheld microphone for rent in Copenhagen"
      productId="haandholdt_mikrofon"
      faqPhrase="a wired handheld microphone"
      bullets={[
        "Classic handheld dynamic microphone",
        "XLR cable included",
        "Plugs straight into our speakers",
        "Made for speeches and parties",
        "The cheapest microphone we rent out",
      ]}
    />
  );
}
