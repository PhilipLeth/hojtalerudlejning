import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lej Karaoke-festpakken København | 2.000 kr | Lejhøjtaler.dk",
  description:
    "Karaoke-festpakken med maskine, 55\" storskærm og store højtalere — karaoke til op til 100 gæster for 2.000 kr. Spar 285 kr. Book online.",
  keywords: ["stor karaoke pakke", "karaoke anlæg til fest", "karaoke firmafest leje"],
  alternates: {
    canonical: "https://lejhojtaler.dk/pakke-karaoke-fest",
    languages: localeAlternates("/pakke-karaoke-fest"),
  },
  openGraph: {
    title: "Lej Karaoke-festpakken København | 2.000 kr",
    description:
      "Karaoke-festpakken med maskine, 55\" storskærm og store højtalere — karaoke til op til 100 gæster for 2.000 kr. Spar 285 kr. Book online.",
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
      price={2000}
      headline="Karaoke-festpakken — op til 100 pers."
      sub={'Karaokemaskine + 55" storskærm + store højtalere. Spar 285 kr.'}
      image="/images/product-pakke-karaoke-fest-v2.webp"
      imageAlt="Stor karaokepakke med storskærm og højtalere til leje"
      productId="pakke_karaoke_fest"
      bullets={["Singing Machine + 2 trådløse mikrofoner", "55\" LED-skærm på 3-fod stativ", "2× 12\" EV-højtalere med stativer", "Karaoke til op til 100 personer", "Spar 285 kr ift. enkeltpriser"]}
    />
  );
}
