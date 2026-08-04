import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Karaokepakken København | 795 kr | Lejhøjtaler.dk",
  description: "Karaokemaskine + 55\" storskærm, så alle kan synge med. Spar 95 kr. 795 kr/weekend. Betal online. Book på 2 min.",
  keywords: ["karaoke pakke leje", "karaoke med storskærm", "lej karaoke anlæg"],
  alternates: { canonical: "https://lejhojtaler.dk/pakke-karaoke" },
  openGraph: {
    title: "Lej Karaokepakken København | 795 kr",
    description: "Karaokemaskine + 55\" storskærm, så alle kan synge med. Spar 95 kr. 795 kr/weekend. Betal online. Book på 2 min.",
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
      price={795}
      headline="Karaokepakken — maskine + storskærm"
      sub={'Karaokemaskine + 55" storskærm, så alle kan synge med. Spar 95 kr.'}
      image="/images/product-karaoke.png"
      imageAlt="Karaokepakke med maskine og storskærm til leje"
      productId="pakke_karaoke"
      bullets={["Singing Machine + 2 trådløse mikrofoner", "55\" LED-skærm på gulvstativ til teksterne", "HDMI + alle kabler", "Spar 95 kr ift. enkeltpriser", "Klar på 10 minutter"]}
    />
  );
}
