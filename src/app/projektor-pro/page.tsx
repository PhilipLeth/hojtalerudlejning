import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Projektor Pro (5000 lumen) København | 795 kr | Lejhøjtaler.dk",
  description: "Kraftig 5000 lumen projektor — skarp selv i dagslys. 795 kr/weekend. Betal ved afhentning. Book online.",
  keywords: ["lej projektor pro", "5000 lumen projektor leje", "kraftig projektor udlejning"],
  alternates: { canonical: "https://lejhojtaler.dk/projektor-pro" },
  openGraph: {
    title: "Lej Projektor Pro (5000 lumen) København | 795 kr",
    description: "Kraftig 5000 lumen projektor — skarp selv i dagslys. 795 kr/weekend. Betal ved afhentning. Book online.",
    url: "https://lejhojtaler.dk/projektor-pro",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="projektor-pro"
      name="Projektor Pro (5000 lumen)"
      price={795}
      headline="Lej Projektor Pro — 5000 lumen"
      sub={'Kraftig 5000 lumen projektor — skarp selv i dagslys.'}
      image="/images/product-projektor-pro.png"
      imageAlt="5000 lumen projektor til leje"
      productId="projektor_pro"
      bullets={["5000 ANSI lumen — virker i dagslys", "Full HD-opløsning", "HDMI + strømkabel inkluderet", "Perfekt til konferencer og store rum", "Kombinér med lærred for 195 kr"]}
    />
  );
}
