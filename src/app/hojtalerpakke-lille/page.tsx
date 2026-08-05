import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Højtalerpakke Lille København | Fra 395 kr | Lejhøjtaler.dk",
  description:
    "Lej lille højtalerpakke i København fra 395 kr/weekend. 2× 10\" Alto med Bluetooth. Kabler og taske inkluderet. Book online.",
  keywords: ["lille højtalerpakke", "lej højtaler pakke", "alto højtaler leje", "højtalerudlejning københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/hojtalerpakke-lille" },
  openGraph: {
    title: "Lej Højtalerpakke Lille | Fra 395 kr",
    description: "2× 10\" Alto højtalere fra 395 kr/weekend. Book online.",
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
      price={395}
      headline="Lej højtalerpakke lille i København"
      sub={'To kompakte 10" Alto højtalere med Bluetooth - klar til cyklen.'}
      image="/images/product-party.png"
      imageAlt="Lille højtalerpakke til leje i København"
      productId="party"
      reviewed={{ ratingValue: "5.0", reviewCount: "2" }}
      bullets={[
        '2× 10" Alto med Bluetooth',
        "Op til 40 personer",
        "Bæretaske og alle kabler inkl.",
        "Kun 12 kg",
        "Hent fredag, aflever mandag",
      ]}
    />
  );
}
