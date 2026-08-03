import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Håndholdt mikrofon PRO (kabel) København | 195 kr | Lejhøjtaler.dk",
  description: "Shure Beta 58A med kabel — klassikeren til sang og taler. 195 kr/weekend. Betal ved afhentning. Book online.",
  keywords: ["lej shure beta 58", "sangmikrofon leje", "mikrofon til sang københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/haandholdt-mikrofon-pro" },
  openGraph: {
    title: "Lej Håndholdt mikrofon PRO (kabel) København | 195 kr",
    description: "Shure Beta 58A med kabel — klassikeren til sang og taler. 195 kr/weekend. Betal ved afhentning. Book online.",
    url: "https://lejhojtaler.dk/haandholdt-mikrofon-pro",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="haandholdt-mikrofon-pro"
      name="Håndholdt mikrofon PRO (kabel)"
      price={195}
      headline="Lej Shure Beta 58A"
      sub={'Shure Beta 58A med kabel — klassikeren til sang og taler.'}
      image="/images/product-mikrofon-kabel-pro.png"
      imageAlt="Shure Beta 58A mikrofon til leje"
      productId="haandholdt_mikrofon_pro"
      bullets={["Shure Beta 58A — industristandarden", "XLR-kabel inkluderet", "Perfekt til sang og taler", "Tilslut direkte til vores højtalere", "195 kr/weekend"]}
    />
  );
}
