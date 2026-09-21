import { prisKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lej Stor Højtalerpakke København | Fra ${prisKr("festival")} | Lejhøjtaler.dk`,
  description:
    `Lej mellem højtalerpakke i København fra ${prisKr("festival")}/weekend. 2× 12\" EV aktive højtalere. Stativer kan tilkøbes. Book online.`,
  keywords: ["mellem højtalerpakke", "lej PA anlæg", "EV højtaler leje", "højtalerudlejning københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/hojtalerpakke-normal",
    languages: localeAlternates("/hojtalerpakke-normal"),
  },
  openGraph: {
    images: ogImages("/images/product-festival-v2.webp"),
    title: `Lej Stor Højtalerpakke | Fra ${prisKr("festival")}`,
    description: `2× 12\" EV højtalere fra ${prisKr("festival")}/weekend. Book online.`,
    url: "https://lejhojtaler.dk/hojtalerpakke-normal",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function HojtalerpakkeNormalPage() {
  return (
    <ProductLanding
      slug="hojtalerpakke-normal"
      name="Mellem højtalerpakke"
      headline="Lej mellem højtalerpakke i København"
      sub={'To kraftige 12" EV aktive højtalere - klar lyd til større rum og udendørs.'}
      image="/images/product-festival-v2-white.webp"
      imageAlt="Mellem højtalerpakke til leje i København"
      productId="festival"
      faqPhrase="Mellem højtalerpakke"
      capacity={{ level: 2, label: "30-50 pers." }}
      bullets={[
        '2× 12" EV aktive højtalere',
        "Alle kabler inkl., stativer kan tilkøbes (95 kr)",
        "Bluetooth",
        "Hent fredag, aflever mandag",
      ]}
    />
  );
}
