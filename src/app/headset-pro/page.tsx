import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Trådløst headset PRO København | 595 kr | Lejhøjtaler.dk",
  description: "Professionelt headset i broadcast-kvalitet — til konferencer og scener. 595 kr/weekend. Betal ved afhentning. Book online.",
  keywords: ["lej headset mikrofon pro", "trådløst headset udlejning", "headset konference leje"],
  alternates: { canonical: "https://lejhojtaler.dk/headset-pro" },
  openGraph: {
    title: "Lej Trådløst headset PRO København | 595 kr",
    description: "Professionelt headset i broadcast-kvalitet — til konferencer og scener. 595 kr/weekend. Betal ved afhentning. Book online.",
    url: "https://lejhojtaler.dk/headset-pro",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="headset-pro"
      name="Trådløst headset PRO"
      price={595}
      headline="Lej trådløst headset PRO"
      sub={'Professionelt headset i broadcast-kvalitet — til konferencer og scener.'}
      image="/images/product-headset-pro.webp"
      imageAlt="Professionelt trådløst headset til leje"
      productId="headset_pro"
      faqPhrase="et trådløst PRO-headset"
      bullets={["PRO headset-mikrofon i broadcast-kvalitet", "Bodypack-sender + modtager", "Kabelforbindelse til højtaler/mixer", "Perfekt til konference og scene", "Hent fredag, aflever mandag"]}
    />
  );
}
