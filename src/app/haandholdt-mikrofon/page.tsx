import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Håndholdt mikrofon (kabel) København | 95 kr | Lejhøjtaler.dk",
  description: "Almindelig håndholdt mikrofon med kabel — til taler og sang. 95 kr/weekend. Betal ved afhentning. Book online.",
  keywords: ["lej mikrofon", "håndholdt mikrofon leje", "mikrofon til tale leje københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/haandholdt-mikrofon" },
  openGraph: {
    title: "Lej Håndholdt mikrofon (kabel) København | 95 kr",
    description: "Almindelig håndholdt mikrofon med kabel — til taler og sang. 95 kr/weekend. Betal ved afhentning. Book online.",
    url: "https://lejhojtaler.dk/haandholdt-mikrofon",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="haandholdt-mikrofon"
      name="Håndholdt mikrofon (kabel)"
      price={95}
      headline="Lej håndholdt mikrofon"
      sub={'Almindelig håndholdt mikrofon med kabel — til taler og sang.'}
      image="/images/product-mikrofon-kabel.png"
      imageAlt="Håndholdt mikrofon med kabel til leje"
      productId="haandholdt_mikrofon"
      bullets={["Klassisk håndholdt dynamisk mikrofon", "XLR-kabel inkluderet", "Tilslut direkte til vores højtalere", "Perfekt til taler og fest", "Kun 95 kr/weekend"]}
    />
  );
}
