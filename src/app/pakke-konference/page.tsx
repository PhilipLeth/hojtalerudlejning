import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Konferencepakken København — udlejes ikke lige nu | Lejhøjtaler.dk",
  description:
    "Konferencepakken med storskærm, headset og højtalere. Udlejes ikke lige nu — vi har samlet udlejningen om højtalere, festlys og røg i København.",
  keywords: ["konferencepakke leje", "lej skærm og lyd konference", "av udstyr konference københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/pakke-konference" },
  openGraph: {
    title: "Lej Konferencepakken København — udlejes ikke lige nu",
    description:
      "Konferencepakken med storskærm, headset og højtalere. Udlejes ikke lige nu — vi har samlet udlejningen om højtalere, festlys og røg i København.",
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
      price={1395}
      headline="Konferencepakken — klar til mødet"
      sub={'55" storskærm + trådløst headset + lille højtalerpakke. Spar 140 kr.'}
      image="/images/product-skaerm.webp"
      imageAlt="Konferencepakke med storskærm, headset og højtalere"
      productId="pakke_konference"
      bullets={["55\" LED-skærm på 3-fod stativ", "Trådløst headset", "2× 10\" højtalere med Bluetooth", "Alle kabler og adaptere", "Spar 140 kr ift. enkeltpriser"]}
    />
  );
}
