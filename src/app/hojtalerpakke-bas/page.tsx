import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lej Højtalerpakke 100 København | 1.495 kr | Lejhøjtaler.dk",
  description:
    "Lej højtalerpakke til 50-100 gæster i København for 1.495 kr. 2× 12\" EV højtalere på stativer med 12\" subwoofer. Trinnet over den store højtalerpakke.",
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
    title: "Lej Højtalerpakke 100 | 1.495 kr",
    description: '2× 12" EV højtalere på stativer + 12" subwoofer. Til 50-100 gæster.',
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
      name="Højtalerpakke 100"
      price={1495}
      headline="Lej højtalerpakke til 50-100 gæster"
      sub={'De store 12" EV-højtalere på stativer med en 12" subwoofer under — trinnet over den store højtalerpakke.'}
      image="/images/product-festival-bas.webp"
      imageAlt="Højtalerpakke med to 12 tommer EV-højtalere på stativer og subwoofer til leje i København"
      productId="hojtaler_100"
      faqPhrase="højtalerpakken med subwoofer"
      capacity={{ level: 3, label: "50-100 pers." }}
      bullets={[
        '2× 12" EV aktive højtalere',
        "Højtalerstativer inkluderet",
        '12" subwoofer til bunden i musikken',
        "Bluetooth + alle kabler",
        "Uden lys — Festpakke 150 er samme lyd plus lys og røg",
      ]}
    />
  );
}
