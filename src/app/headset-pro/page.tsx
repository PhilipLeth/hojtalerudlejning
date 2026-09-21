import { prisKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lej Trådløst headset PRO København | ${prisKr("headset_pro")} | Lejhøjtaler.dk`,
  description: `Professionelt headset i broadcast-kvalitet, til konferencer og scener. ${prisKr("headset_pro")}/weekend. Betal ved afhentning. Book online.`,
  keywords: ["lej headset mikrofon pro", "trådløst headset udlejning", "headset konference leje"],
  alternates: {
    canonical: "https://lejhojtaler.dk/headset-pro",
    languages: localeAlternates("/headset-pro"),
  },
  openGraph: {
    images: ogImages("/images/product-headset-pro-v2.webp"),
    title: `Lej Trådløst headset PRO København | ${prisKr("headset_pro")}`,
    description: `Professionelt headset i broadcast-kvalitet, til konferencer og scener. ${prisKr("headset_pro")}/weekend. Betal ved afhentning. Book online.`,
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
