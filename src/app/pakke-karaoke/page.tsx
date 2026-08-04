import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Karaokepakken København | 900 kr | Lejhøjtaler.dk",
  description: "Karaokemaskine + 32\" skærm på stativ, så alle kan læse teksterne. Spar 190 kr. 900 kr/weekend. Betal online. Book på 2 min.",
  keywords: ["karaoke pakke leje", "karaoke med storskærm", "lej karaoke anlæg"],
  alternates: { canonical: "https://lejhojtaler.dk/pakke-karaoke" },
  openGraph: {
    title: "Lej Karaokepakken København | 900 kr",
    description: "Karaokemaskine + 32\" skærm på stativ, så alle kan læse teksterne. Spar 190 kr. 900 kr/weekend. Betal online. Book på 2 min.",
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
      price={900}
      headline="Karaokepakken — maskine + skærm"
      sub={'Karaokemaskine + 32" skærm på 3-fod stativ. Spar 190 kr — den billigste vej til karaoke.'}
      image="/images/product-karaoke.png"
      imageAlt={'Karaokepakke med maskine og 32" skærm på stativ til leje'}
      productId="pakke_karaoke"
      bullets={["Singing Machine + 2 trådløse mikrofoner", "32\" LED-skærm på 3-fod stativ til teksterne", "HDMI + alle kabler", "Spar 190 kr ift. enkeltpriser (1.090 kr)", "Klar på 10 minutter"]}
    />
  );
}
