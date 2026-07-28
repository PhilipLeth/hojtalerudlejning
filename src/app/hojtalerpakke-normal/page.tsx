import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Højtalerpakke Normal København | Fra 700 kr | Lejhøjtaler.dk",
  description:
    "Lej normal/stor højtalerpakke i København fra 700 kr/weekend. 2× 12\" EV aktive højtalere med stativer. Book online.",
  keywords: ["stor højtalerpakke", "lej PA anlæg", "EV højtaler leje", "højtalerudlejning københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/hojtalerpakke-normal" },
  openGraph: {
    title: "Lej Højtalerpakke Normal | Fra 700 kr",
    description: "2× 12\" EV højtalere med stativer fra 700 kr/weekend. Book online.",
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
      name="Højtalerpakke normal"
      price={700}
      headline="Lej højtalerpakke normal i København"
      sub="To kraftige 12\" EV aktive højtalere — klar lyd til større rum og udendørs."
      image="/images/product-festival.png"
      imageAlt="Normal højtalerpakke til leje i København"
      productId="festival"
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
