import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Karaokemaskine København — udlejes ikke lige nu | Lejhøjtaler.dk",
  description:
    "Singing Machine karaokemaskine med skærm og to trådløse mikrofoner. Udlejes ikke lige nu — vi har samlet udlejningen om højtalere, festlys og røg i København.",
  keywords: ["lej karaokemaskine", "karaoke maskine leje københavn", "singing machine leje"],
  alternates: { canonical: "https://lejhojtaler.dk/karaoke-maskine" },
  openGraph: {
    title: "Lej Karaokemaskine København — udlejes ikke lige nu",
    description:
      "Singing Machine karaokemaskine med skærm og to trådløse mikrofoner. Udlejes ikke lige nu — vi har samlet udlejningen om højtalere, festlys og røg i København.",
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
      image="/images/product-karaoke.webp"
      imageAlt="Singing Machine karaokemaskine med to trådløse mikrofoner til leje"
      productId="karaoke"
      faqPhrase="en karaokemaskine"
      bullets={["Singing Machine med indbygget skærm", "2 trådløse mikrofoner medfølger", "Festlys i højtaleren", "HDMI til TV/projektor + Bluetooth", "Klar på 5 minutter", "Billigst i Karaokepakken — spar 385 kr"]}
    />
  );
}
