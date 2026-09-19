import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import UpsellBox from "@/components/UpsellBox";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: "Lej Lysbar København | Fra 395 kr | Lejhøjtaler.dk",
  description:
    "Lej lysbar i København fra 395 kr/weekend. 2 farvede LED-lamper + centereffekt på stativ. Plug-and-play festlys. Betal ved afhentning.",
  keywords: [
    "lej lysbar",
    "lysbar udlejning",
    "festlys leje københavn",
    "LED lysbar leje",
    "lej lys til fest",
    "festbelysning leje",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/lys-pakke",
    languages: localeAlternates("/lys-pakke"),
  },
  openGraph: {
    images: ogImages("/images/product-lys-v4.webp"),
    title: "Lej Lysbar København | Fra 395 kr",
    description:
      "2 farvede LED-lamper + centereffekt på stativ. Fra 395 kr/weekend. Book online.",
    url: "https://lejhojtaler.dk/lys-pakke",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function LysPakkePage() {
  return (
    <ProductLanding
      slug="lysbar"
      name="Lysbar"
      price={395}
      headline="Lej lysbar i København"
      sub="2 farvede LED-lamper + centereffekt på stativ. Klar på få minutter."
      image="/images/product-lys-v4-white.webp"
      imageAlt="Lysbar til leje i København"
      productId="lys"
      bookLabel="Book lysbar nu"
      faqPhrase="lysbaren"
      bullets={[
        "2× farvede LED-lamper",
        "Centereffekt inkluderet",
        "Stativ + strøm og kabler medfølger",
        "Betal ved afhentning",
        "Hent fredag, aflever mandag",
      ]}
    >
      <UpsellBox
        title="Kombiner med røg og lyd"
        text="Røg gør lyset 10× federe. Tilføj højtalere for den komplette festpakke."
        links={[
          { href: "/roegmaskine", label: "Se røgmaskine", priceId: "rog" },
          { href: "/lej-hojtaler", label: "Se højtalere", startpris: true },
        ]}
      />
    </ProductLanding>
  );
}
