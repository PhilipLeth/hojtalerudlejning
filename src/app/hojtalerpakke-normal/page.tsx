import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Stor Højtalerpakke København | Fra 495 kr | Lejhøjtaler.dk",
  description:
    "Lej stor højtalerpakke i København fra 495 kr/weekend. 2× 12\" EV aktive højtalere med stativer. Book online.",
  keywords: ["stor højtalerpakke", "lej PA anlæg", "EV højtaler leje", "højtalerudlejning københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/hojtalerpakke-normal" },
  openGraph: {
    title: "Lej Stor Højtalerpakke | Fra 495 kr",
    description: "2× 12\" EV højtalere med stativer fra 495 kr/weekend. Book online.",
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
      name="Stor højtalerpakke"
      price={495}
      headline="Lej stor højtalerpakke i København"
      sub={'To kraftige 12" EV aktive højtalere - klar lyd til større rum og udendørs.'}
      image="/images/product-festival.png"
      imageAlt="Stor højtalerpakke til leje i København"
      productId="festival"
      reviewed={{ ratingValue: "5.0", reviewCount: "1" }}
      bullets={[
        '2× 12" EV aktive højtalere',
        "40–100 personer",
        "Stativer og alle kabler inkl.",
        "Bluetooth",
        "Hent fredag, aflever mandag",
      ]}
    />
  );
}
