import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Karaoke Party Bundle Rental Copenhagen | 2,000 DKK | Lejhøjtaler.dk",
  description:
    "Karaoke party bundle with machine, 55\" display and large speakers — karaoke for up to 100 guests for 2,000 DKK. Save 285 DKK. Book online.",
  keywords: ["large karaoke package rental", "karaoke system for party hire copenhagen", "karaoke company party rental"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/pakke-karaoke-fest",
    languages: localeAlternates("/pakke-karaoke-fest"),
  },
  openGraph: {
    title: "Karaoke party bundle rental | 2,000 DKK",
    description: "Karaoke machine + 55\" display + large speakers. Save 285 DKK.",
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
      price={2000}
      headline="The karaoke party bundle — up to 100 people"
      sub={"Karaoke machine + 55\" display + large speakers. Save 285 DKK."}
      image="/images/product-pakke-karaoke-fest-v2.webp"
      imageAlt="Large karaoke bundle with a large screen and speakers for rent"
      productId="pakke_karaoke_fest"
      bullets={[
        "Singing Machine + 2 wireless microphones",
        "55\" LED display on a tripod stand",
        "2× 12\" EV speakers with stands",
        "Karaoke for up to 100 people",
        "Save 285 DKK compared to single prices",
      ]}
    />
  );
}
