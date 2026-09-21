import { prisKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lej Projektor Pro (5000 lumen) København | ${prisKr("projektor_pro")} | Lejhøjtaler.dk`,
  description:
    `Lej en 5000 lumen PRO-projektor i København for ${prisKr("projektor_pro")}. Skarp selv i oplyste lokaler og i dagslys, til sale, messer og store møder. Book online.`,
  keywords: ["lej projektor pro", "5000 lumen projektor leje", "kraftig projektor udlejning"],
  alternates: {
    canonical: "https://lejhojtaler.dk/projektor-pro",
    languages: localeAlternates("/projektor-pro"),
  },
  openGraph: {
    images: ogImages("/images/product-projektor-pro-v2.webp"),
    title: `Lej Projektor Pro (5000 lumen) København | ${prisKr("projektor_pro")}`,
    description:
      `Lej en 5000 lumen PRO-projektor i København for ${prisKr("projektor_pro")}. Skarp selv i oplyste lokaler og i dagslys, til sale, messer og store møder. Book online.`,
    url: "https://lejhojtaler.dk/projektor-pro",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="projektor-pro"
      name="Projektor Pro (5000 lumen)"
      headline="Lej Projektor Pro, 5000 lumen"
      sub={'Kraftig 5000 lumen projektor, skarp selv i dagslys.'}
      image="/images/product-projektor-pro-v2-white.webp"
      imageAlt="5000 lumen projektor til leje"
      productId="projektor_pro"
      faqPhrase="Projektor Pro"
      bullets={["5000 ANSI lumen, virker i dagslys", "Full HD-opløsning", "HDMI + strømkabel inkluderet", "Perfekt til konferencer og store rum", "Kombinér med lærred for 195 kr"]}
    />
  );
}
