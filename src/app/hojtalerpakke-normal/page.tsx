import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lej Stor Højtalerpakke København | Fra 795 kr | Lejhøjtaler.dk",
  description:
    "Lej mellem højtalerpakke i København fra 795 kr/weekend. 2× 12\" EV aktive højtalere. Stativer kan tilkøbes. Book online.",
  keywords: ["mellem højtalerpakke", "lej PA anlæg", "EV højtaler leje", "højtalerudlejning københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/hojtalerpakke-normal",
    languages: localeAlternates("/hojtalerpakke-normal"),
  },
  openGraph: {
    title: "Lej Stor Højtalerpakke | Fra 795 kr",
    description: "2× 12\" EV højtalere fra 795 kr/weekend. Book online.",
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
      price={795}
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
