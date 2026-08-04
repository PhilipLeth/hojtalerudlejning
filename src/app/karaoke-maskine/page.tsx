import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Karaokemaskine København | 695 kr | Lejhøjtaler.dk",
  description: "Singing Machine med indbygget skærm, 2 trådløse mikrofoner og festlys — tilslut TV via HDMI. 695 kr/weekend. Betal online. Book på 2 min.",
  keywords: ["lej karaokemaskine", "karaoke maskine leje københavn", "singing machine leje"],
  alternates: { canonical: "https://lejhojtaler.dk/karaoke-maskine" },
  openGraph: {
    title: "Lej Karaokemaskine København | 695 kr",
    description: "Singing Machine med indbygget skærm, 2 trådløse mikrofoner og festlys — tilslut TV via HDMI. 695 kr/weekend. Betal online. Book på 2 min.",
    url: "https://lejhojtaler.dk/karaoke-maskine",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="karaoke-maskine"
      name="Karaokemaskine"
      price={695}
      headline="Lej karaokemaskine i København"
      sub={'Singing Machine med indbygget skærm, 2 trådløse mikrofoner og festlys — tilslut TV via HDMI.'}
      image="/images/product-karaoke.png"
      imageAlt="Singing Machine karaokemaskine med to trådløse mikrofoner til leje"
      productId="karaoke"
      bullets={["Singing Machine med indbygget skærm", "2 trådløse mikrofoner medfølger", "Festlys i højtaleren", "HDMI til TV/projektor + Bluetooth", "Klar på 5 minutter", "Billigst i Karaokepakken — spar 190 kr"]}
    />
  );
}
