import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Karaokepakken København | 1.100 kr | Lejhøjtaler.dk",
  description: "Karaokemaskine + 32\" skærm + lille højtalerpakke — alt til karaoke. Spar 385 kr. 1.100 kr/weekend. Betal online. Book på 2 min.",
  keywords: ["karaoke pakke leje", "karaoke med storskærm", "lej karaoke anlæg"],
  alternates: { canonical: "https://lejhojtaler.dk/pakke-karaoke" },
  openGraph: {
    title: "Lej Karaokepakken København | 1.100 kr",
    description: "Karaokemaskine + 32\" skærm + lille højtalerpakke. Spar 385 kr. 1.100 kr/weekend. Book online.",
    url: "https://lejhojtaler.dk/pakke-karaoke",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="pakke-karaoke"
      name="Karaokepakken"
      price={1100}
      headline="Karaokepakken — maskine, skærm og lyd"
      sub={'Karaokemaskine + 32" skærm + 2× Alto-højtalere. Alt til karaoke — spar 385 kr.'}
      image="/images/product-pakke-karaoke.webp"
      imageAlt={'Karaokepakke med maskine, 32" skærm og højtalere til leje'}
      productId="pakke_karaoke"
      bullets={["Singing Machine + 2 trådløse mikrofoner", "32\" LED-skærm på 3-fod stativ til teksterne", "2× Alto 10\" højtalere med Bluetooth", "HDMI + alle kabler", "Spar 385 kr ift. enkeltpriser (1.485 kr)", "Karaoke til op til 40 personer"]}
    />
  );
}
