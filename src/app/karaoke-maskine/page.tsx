import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Karaokemaskine København | 695 kr | Lejhøjtaler.dk",
  description:
    "Lej en Singing Machine karaokemaskine i København for 695 kr. Indbygget skærm, to trådløse mikrofoner og festlys — tilslut dit TV via HDMI.",
  keywords: ["lej karaokemaskine", "karaoke maskine leje københavn", "singing machine leje"],
  alternates: { canonical: "https://lejhojtaler.dk/karaoke-maskine" },
  openGraph: {
    title: "Lej Karaokemaskine København | 695 kr",
    description:
      "Lej en Singing Machine karaokemaskine i København for 695 kr. Indbygget skærm, to trådløse mikrofoner og festlys — tilslut dit TV via HDMI.",
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
