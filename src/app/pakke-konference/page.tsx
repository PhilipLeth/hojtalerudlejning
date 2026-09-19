import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: "Lej Konferencepakken København | 1.485 kr | Lejhøjtaler.dk",
  description:
    "Konferencepakken med 55\" storskærm, trådløst headset og to højtalere, klar til mødelokalet for 1.485 kr. Spar 150 kr. Book online i København.",
  keywords: ["konferencepakke leje", "lej skærm og lyd konference", "av udstyr konference københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/pakke-konference",
    languages: localeAlternates("/pakke-konference"),
  },
  openGraph: {
    images: ogImages("/images/product-skaerm.webp"),
    title: "Lej Konferencepakken København | 1.485 kr",
    description:
      "Konferencepakken med 55\" storskærm, trådløst headset og to højtalere, klar til mødelokalet for 1.485 kr. Spar 150 kr. Book online i København.",
    url: "https://lejhojtaler.dk/pakke-konference",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="pakke-konference"
      name="Konferencepakken"
      price={1485}
      headline="Konferencepakken, klar til mødet"
      sub={'55" storskærm + trådløst headset + lille højtalerpakke. Spar 150 kr.'}
      image="/images/product-skaerm-white.webp"
      imageAlt="Konferencepakke med storskærm, headset og højtalere"
      productId="pakke_konference"
      bullets={["55\" LED-skærm på 3-fod stativ", "Trådløst headset", "2× 10\" højtalere med Bluetooth", "Alle kabler og adaptere", "Spar 150 kr ift. enkeltpriser"]}
    />
  );
}
