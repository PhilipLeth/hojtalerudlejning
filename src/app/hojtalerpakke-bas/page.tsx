import { prisKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";
import { ogImages } from "@/lib/og";

export const metadata: Metadata = {
  title: `Lej Stor højtalerpakke København | ${prisKr("hojtaler_100")} | Lejhøjtaler.dk`,
  description:
    `Lej højtalerpakke til 50-100 gæster i København for ${prisKr("hojtaler_100")}. 2× 12\" EV ZLX 12P G2 med Behringer 12\" subwoofer. Trinnet over Mellem højtalerpakke.`,
  keywords: [
    "højtalerpakke med subwoofer",
    "lej PA anlæg med bas",
    "højtalere til 100 personer",
    "lej subwoofer københavn",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/hojtalerpakke-bas",
    languages: localeAlternates("/hojtalerpakke-bas"),
  },
  openGraph: {
    images: ogImages("/images/product-festival-bas-v2.webp"),
    title: `Lej Stor højtalerpakke | ${prisKr("hojtaler_100")}`,
    description: '2× 12" EV ZLX 12P G2 + Behringer 12" subwoofer. Til 50-100 gæster.',
    url: "https://lejhojtaler.dk/hojtalerpakke-bas",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function HojtalerpakkeBasPage() {
  return (
    <ProductLanding
      slug="hojtalerpakke-bas"
      name="Stor højtalerpakke"
      headline="Lej højtalerpakke til 50-100 gæster"
      sub={'De store 12" EV ZLX 12P G2 med en Behringer 12" subwoofer, trinnet over Mellem højtalerpakke. Stativer kan tilkøbes.'}
      image="/images/product-hojtalerpakke-stor-white.webp"
      imageAlt="Stor højtalerpakke med to 12 tommer EV-højtalere og subwoofer til leje i København"
      productId="hojtaler_100"
      faqPhrase="højtalerpakken med subwoofer"
      capacity={{ level: 3, label: "50-100 pers." }}
      bullets={[
        '2× 12" EV aktive højtalere',
        "Højtalerstativer kan tilkøbes",
        '12" subwoofer til bunden i musikken',
        "Bluetooth + alle kabler",
        "Uden lys, Festpakke 150 er samme lyd plus lys og røg",
      ]}
    />
  );
}
