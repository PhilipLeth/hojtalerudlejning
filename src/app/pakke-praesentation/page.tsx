import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Præsentationspakken København | 695 kr | Lejhøjtaler.dk",
  description: "Projektor + lærred 160 cm + håndholdt mikrofon. Spar 90 kr ift. enkeltpriser. 695 kr/weekend. Betal ved afhentning. Book online.",
  keywords: ["præsentationspakke leje", "lej projektor og lærred", "av pakke til møde"],
  alternates: { canonical: "https://lejhojtaler.dk/pakke-praesentation" },
  openGraph: {
    title: "Lej Præsentationspakken København | 695 kr",
    description: "Projektor + lærred 160 cm + håndholdt mikrofon. Spar 90 kr ift. enkeltpriser. 695 kr/weekend. Betal ved afhentning. Book online.",
    url: "https://lejhojtaler.dk/pakke-praesentation",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="pakke-praesentation"
      name="Præsentationspakken"
      price={695}
      headline="Præsentationspakken — alt til mødet"
      sub={'Projektor + lærred 160 cm + håndholdt mikrofon. Spar 90 kr ift. enkeltpriser.'}
      image="/images/product-projektor.webp"
      imageAlt="Præsentationspakke med projektor, lærred og mikrofon"
      productId="pakke_praesentation"
      bullets={["Full HD projektor", "Lærred 160 cm på stativ", "Håndholdt mikrofon m. kabel", "Alle kabler inkluderet", "Spar 90 kr ift. at leje delene enkeltvis"]}
    />
  );
}
