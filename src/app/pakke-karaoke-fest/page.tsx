import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Karaoke-festpakken København | 1395 kr | Lejhøjtaler.dk",
  description: "Karaokemaskine + 55\" storskærm + store højtalere. Spar 190 kr. 1395 kr/weekend. Betal online. Book på 2 min.",
  keywords: ["stor karaoke pakke", "karaoke anlæg til fest", "karaoke firmafest leje"],
  alternates: { canonical: "https://lejhojtaler.dk/pakke-karaoke-fest" },
  openGraph: {
    title: "Lej Karaoke-festpakken København | 1395 kr",
    description: "Karaokemaskine + 55\" storskærm + store højtalere. Spar 190 kr. 1395 kr/weekend. Betal online. Book på 2 min.",
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
      price={1395}
      headline="Karaoke-festpakken — op til 100 pers."
      sub={'Karaokemaskine + 55" storskærm + store højtalere. Spar 190 kr.'}
      image="/images/product-karaoke.png"
      imageAlt="Stor karaokepakke med storskærm og højtalere til leje"
      productId="pakke_karaoke_fest"
      bullets={["Singing Machine + 2 trådløse mikrofoner", "55\" LED-skærm på gulvstativ", "2× 12\" EV-højtalere med stativer", "Karaoke til op til 100 personer", "Spar 190 kr ift. enkeltpriser"]}
    />
  );
}
