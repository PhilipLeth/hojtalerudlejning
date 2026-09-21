import { prisKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import UpsellBox from "@/components/UpsellBox";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lej Trådløs Mikrofon København | Fra ${prisKr("traadloes_mikrofon")} | Lejhøjtaler.dk`,
  description:
    `Lej trådløs mikrofon i København fra ${prisKr("traadloes_mikrofon")}/weekend. Professionel trådløs håndholdt mikrofon til taler og events. Betal ved afhentning.`,
  keywords: [
    "lej trådløs mikrofon",
    "mikrofon udlejning",
    "trådløs mikrofon leje",
    "mikrofon til tale",
    "mikrofon til event",
    "lej mikrofon københavn",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/traadloes-mikrofon",
    languages: localeAlternates("/traadloes-mikrofon"),
  },
  openGraph: {
    images: ogImages("/images/product-mikrofon-v2.webp"),
    title: `Lej Trådløs Mikrofon København | Fra ${prisKr("traadloes_mikrofon")}`,
    description:
      `Lej trådløs mikrofon i København fra ${prisKr("traadloes_mikrofon")}. Professionel håndholdt mikrofon til taler og events. Book online.`,
    url: "https://lejhojtaler.dk/traadloes-mikrofon",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function TraadloesMikrofonPage() {
  return (
    <ProductLanding
      slug="traadloes-mikrofon"
      name="Trådløs mikrofon"
      headline="Lej trådløs mikrofon"
      sub="Shure BLX24 med SM58, trådløs håndholdt mikrofon i scenekvalitet til taler, bryllup og events."
      image="/images/product-mikrofon-pro-v2-white.webp"
      imageAlt="Shure BLX24 trådløs mikrofon til leje i København"
      productId="traadloes_mikrofon"
      bookLabel="Book mikrofon nu"
      faqPhrase="en trådløs mikrofon"
      bullets={[
        "Trådløs håndholdt mikrofon",
        "Modtager inkluderet",
        "Batterier medfølger",
        "Kabel til højtaler/mixer inkl.",
        "Betal ved afhentning – betal kun lejen",
        "Hent fredag, aflever mandag",
      ]}
    >
      <UpsellBox
        title="Kombiner med headset og højtalere"
        text="Mikrofonen er perfekt sammen med et headset og højtalere. Skab den fulde lydoplevelse til dit event."
        links={[
          { href: "/headset-mikrofon", label: "Se headset", priceId: "headset" },
          { href: "/lej-hojtaler", label: "Se højtalere", startpris: true },
        ]}
      />
    </ProductLanding>
  );
}
