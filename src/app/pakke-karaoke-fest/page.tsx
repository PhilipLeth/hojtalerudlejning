import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Karaoke-festpakken København | 1.500 kr | Lejhøjtaler.dk",
  description: "Karaokemaskine + 55\" storskærm + store højtalere. Spar 285 kr. 1.500 kr/weekend. Betal online. Book på 2 min.",
  keywords: ["stor karaoke pakke", "karaoke anlæg til fest", "karaoke firmafest leje"],
  alternates: { canonical: "https://lejhojtaler.dk/pakke-karaoke-fest" },
  openGraph: {
    title: "Lej Karaoke-festpakken København | 1.500 kr",
    description: "Karaokemaskine + 55\" storskærm + store højtalere. Spar 285 kr. 1.500 kr/weekend. Betal online. Book på 2 min.",
    url: "https://lejhojtaler.dk/pakke-karaoke-fest",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="pakke-karaoke-fest"
      name="Karaoke-festpakken"
      price={1500}
      headline="Karaoke-festpakken — op til 100 pers."
      sub={'Karaokemaskine + 55" storskærm + store højtalere. Spar 285 kr.'}
      image="/images/product-pakke-karaoke-fest.webp"
      imageAlt="Stor karaokepakke med storskærm og højtalere til leje"
      productId="pakke_karaoke_fest"
      bullets={["Singing Machine + 2 trådløse mikrofoner", "55\" LED-skærm på 3-fod stativ", "2× 12\" EV-højtalere med stativer", "Karaoke til op til 100 personer", "Spar 285 kr ift. enkeltpriser"]}
    />
  );
}
