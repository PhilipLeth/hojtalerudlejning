import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Trådløs mikrofon PRO København | 595 kr | Lejhøjtaler.dk",
  description: "Shure BLX trådløs mikrofon — scenekvalitet til events og konferencer. 595 kr/weekend. Betal ved afhentning. Book online.",
  keywords: ["lej shure mikrofon", "trådløs mikrofon pro leje", "scene mikrofon udlejning"],
  alternates: { canonical: "https://lejhojtaler.dk/traadloes-mikrofon-pro" },
  openGraph: {
    title: "Lej Trådløs mikrofon PRO København | 595 kr",
    description: "Shure BLX trådløs mikrofon — scenekvalitet til events og konferencer. 595 kr/weekend. Betal ved afhentning. Book online.",
    url: "https://lejhojtaler.dk/traadloes-mikrofon-pro",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="traadloes-mikrofon-pro"
      name="Trådløs mikrofon PRO"
      price={595}
      headline="Lej trådløs mikrofon PRO (Shure BLX)"
      sub={'Shure BLX trådløs mikrofon — scenekvalitet til events og konferencer.'}
      image="/images/product-mikrofon-pro.webp"
      imageAlt="Shure BLX trådløs mikrofon til leje"
      productId="traadloes_mikrofon_pro"
      faqPhrase="en trådløs PRO-mikrofon"
      bullets={["Shure BLX trådløst system", "Håndholdt mikrofon i scenekvalitet", "Modtager + kabelforbindelse", "Perfekt til konference og scene", "Hent fredag, aflever mandag"]}
    />
  );
}
