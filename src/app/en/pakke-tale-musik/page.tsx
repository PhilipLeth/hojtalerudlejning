import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Speech & Music Package Rental Copenhagen | 1,195 DKK | Lejhøjtaler.dk",
  description:
    "Large speaker package + wireless microphone — speeches and music for events. Save 95 DKK. 1,195 DKK per weekend. Pay on pickup. Book online.",
  keywords: ["sound for speeches and music rental", "speaker and microphone package copenhagen", "event sound package denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/pakke-tale-musik",
    languages: localeAlternates("/pakke-tale-musik"),
  },
  openGraph: {
    title: "Speech & music package rental | 1,195 DKK",
    description: "Large speaker package + wireless microphone — speeches and music for events. Save 95 DKK.",
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
      price={1195}
      headline="The speech & music package"
      sub="Large speaker package + wireless microphone — speeches and music for events. Save 95 DKK."
      image="/images/product-festival-v2.webp"
      imageAlt="Speech and music package with large speakers and a wireless microphone"
      productId="pakke_tale_musik"
      bullets={[
        "2× 12\" EV speakers with stands",
        "Wireless handheld microphone",
        "Up to 100 people",
        "All cables included",
        "Save 95 DKK compared to single prices",
      ]}
    />
  );
}
