import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Præsentationspakken København — udlejes ikke lige nu | Lejhøjtaler.dk",
  description:
    "Præsentationspakken med projektor, lærred og mikrofon. Udlejes ikke lige nu — vi har samlet udlejningen om højtalere, festlys og røg i København.",
  keywords: ["præsentationspakke leje", "lej projektor og lærred", "av pakke til møde"],
  alternates: { canonical: "https://lejhojtaler.dk/pakke-praesentation" },
  openGraph: {
    title: "Lej Præsentationspakken København — udlejes ikke lige nu",
    description:
      "Præsentationspakken med projektor, lærred og mikrofon. Udlejes ikke lige nu — vi har samlet udlejningen om højtalere, festlys og røg i København.",
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
