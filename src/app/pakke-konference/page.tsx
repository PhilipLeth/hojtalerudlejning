import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Konferencepakken København | 1195 kr | Lejhøjtaler.dk",
  description: "55\" storskærm + trådløst headset + lille højtalerpakke. Spar 140 kr. 1195 kr/weekend. Betal ved afhentning. Book online.",
  keywords: ["konferencepakke leje", "lej skærm og lyd konference", "av udstyr konference københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/pakke-konference" },
  openGraph: {
    title: "Lej Konferencepakken København | 1195 kr",
    description: "55\" storskærm + trådløst headset + lille højtalerpakke. Spar 140 kr. 1195 kr/weekend. Betal ved afhentning. Book online.",
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
      price={1195}
      headline="Konferencepakken — klar til mødet"
      sub={'55" storskærm + trådløst headset + lille højtalerpakke. Spar 140 kr.'}
      image="/images/product-skaerm.png"
      imageAlt="Konferencepakke med storskærm, headset og højtalere"
      productId="pakke_konference"
      bullets={["55\" LED-skærm på 3-fod stativ", "Trådløst headset", "2× 10\" højtalere med Bluetooth", "Alle kabler og adaptere", "Spar 140 kr ift. enkeltpriser"]}
    />
  );
}
