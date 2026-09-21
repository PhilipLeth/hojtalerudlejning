import { prisKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lej Højtalerpakke Lille København | Fra ${prisKr("party")} | Lejhøjtaler.dk`,
  description:
    `Lej lille højtalerpakke i København fra ${prisKr("party")}/weekend. 2× 10\" Alto TX 410 med Bluetooth. Alle kabler inkluderet. Book online.`,
  keywords: ["lille højtalerpakke", "lej højtaler pakke", "alto højtaler leje", "højtalerudlejning københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/hojtalerpakke-lille",
    languages: localeAlternates("/hojtalerpakke-lille"),
  },
  openGraph: {
    images: ogImages("/images/product-party-v2.webp"),
    title: `Lej Højtalerpakke Lille | Fra ${prisKr("party")}`,
    description: `2× 10\" Alto højtalere fra ${prisKr("party")}/weekend. Book online.`,
    url: "https://lejhojtaler.dk/hojtalerpakke-lille",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function HojtalerpakkeLillePage() {
  return (
    <ProductLanding
      slug="hojtalerpakke-lille"
      name="Højtalerpakke lille"
      headline="Lej højtalerpakke lille i København"
      sub={'To kompakte 10" Alto TX 410 med Bluetooth, klar til cyklen.'}
      imageAlt="Lille højtalerpakke til leje i København"
      productId="party"
      faqPhrase="den lille højtalerpakke"
      capacity={{ level: 1, label: "0-30 pers." }}
      bullets={[
        '2× 10" Alto med Bluetooth',
        "Alle kabler inkl., stativer og mikrofon kan tilkøbes",
        "Kun 12 kg",
        "Hent fredag, aflever mandag",
      ]}
    />
  );
}
