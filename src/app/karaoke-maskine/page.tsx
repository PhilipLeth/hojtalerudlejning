import { prisKr, rabatKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lej Karaokemaskine København | ${prisKr("karaoke")} | Lejhøjtaler.dk`,
  description:
    `Lej en Singing Machine karaokemaskine i København for ${prisKr("karaoke")}. Indbygget skærm, to trådløse mikrofoner og festlys, tilslut dit TV via HDMI.`,
  keywords: ["lej karaokemaskine", "karaoke maskine leje københavn", "singing machine leje"],
  alternates: {
    canonical: "https://lejhojtaler.dk/karaoke-maskine",
    languages: localeAlternates("/karaoke-maskine"),
  },
  openGraph: {
    images: ogImages("/images/product-karaoke-v2.webp"),
    title: `Lej Karaokemaskine København | ${prisKr("karaoke")}`,
    description:
      `Lej en Singing Machine karaokemaskine i København for ${prisKr("karaoke")}. Indbygget skærm, to trådløse mikrofoner og festlys, tilslut dit TV via HDMI.`,
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
      headline="Lej karaokemaskine i København"
      sub={'Singing Machine med indbygget skærm, 2 trådløse mikrofoner og festlys, tilslut TV via HDMI.'}
      imageAlt="Singing Machine karaokemaskine med to trådløse mikrofoner til leje"
      productId="karaoke"
      faqPhrase="en karaokemaskine"
      bullets={["Singing Machine med indbygget skærm", "2 trådløse mikrofoner medfølger", "Festlys i højtaleren", "HDMI til TV/projektor + Bluetooth", "Klar på 5 minutter", `Billigst i Karaokepakken, spar ${rabatKr("pakke_karaoke")}`]}
    />
  );
}
