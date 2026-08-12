import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Tale & musik-pakken København | 695 kr | Lejhøjtaler.dk",
  description: "Stor højtalerpakke + trådløs mikrofon — taler og musik til events. Spar 95 kr. 695 kr/weekend. Betal ved afhentning. Book online.",
  keywords: ["lej lyd til tale og musik", "højtaler og mikrofon pakke", "event lyd pakke københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/pakke-tale-musik" },
  openGraph: {
    title: "Lej Tale & musik-pakken København | 695 kr",
    description: "Stor højtalerpakke + trådløs mikrofon — taler og musik til events. Spar 95 kr. 695 kr/weekend. Betal ved afhentning. Book online.",
    url: "https://lejhojtaler.dk/pakke-tale-musik",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="pakke-tale-musik"
      name="Tale & musik-pakken"
      price={695}
      headline="Tale & musik-pakken"
      sub={'Stor højtalerpakke + trådløs mikrofon — taler og musik til events. Spar 95 kr.'}
      image="/images/product-festival.png"
      imageAlt="Tale og musik pakke med store højtalere og trådløs mikrofon"
      productId="pakke_tale_musik"
      bullets={["2× 12\" EV højtalere med stativer", "Trådløs håndholdt mikrofon", "Op til 100 personer", "Alle kabler inkluderet", "Spar 95 kr ift. enkeltpriser"]}
    />
  );
}
