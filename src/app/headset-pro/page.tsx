import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lej Trådløst headset PRO København | 595 kr | Lejhøjtaler.dk",
  description: "Professionelt headset i broadcast-kvalitet, til konferencer og scener. 595 kr/weekend. Betal ved afhentning. Book online.",
  keywords: ["lej headset mikrofon pro", "trådløst headset udlejning", "headset konference leje"],
  alternates: {
    canonical: "https://lejhojtaler.dk/headset-pro",
    languages: localeAlternates("/headset-pro"),
  },
  openGraph: {
    title: "Lej Trådløst headset PRO København | 595 kr",
    description: "Professionelt headset i broadcast-kvalitet, til konferencer og scener. 595 kr/weekend. Betal ved afhentning. Book online.",
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
      sub={'Trådløst headset PRO udlejes ikke lige nu som selvstændigt produkt. Vores almindelige trådløse headset er nu Shure BLX14 til 445 kr.'}
      image="/images/product-headset-pro-v2-white.webp"
      imageAlt="Professionelt trådløst headset til leje"
      productId="headset_pro"
      faqPhrase="et trådløst PRO-headset"
      bullets={["PRO headset-mikrofon i broadcast-kvalitet", "Bodypack-sender + modtager", "Kabelforbindelse til højtaler/mixer", "Perfekt til konference og scene", "Hent fredag, aflever mandag"]}
    />
  );
}
