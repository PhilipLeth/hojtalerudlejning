import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import UpsellBox from "@/components/UpsellBox";

export const metadata: Metadata = {
  title: "Lej Lys-pakke København | Fra 495 kr | Lejhøjtaler.dk",
  description:
    "Lej lys-pakke i København fra 495 kr/weekend. 2 farvede LED-lamper + centereffekt på stativ. Plug-and-play festlys. Betal ved afhentning.",
  keywords: [
    "lej lys-pakke",
    "lysbar udlejning",
    "festlys leje københavn",
    "LED lysbar leje",
    "lej lys til fest",
    "festbelysning leje",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/lys-pakke" },
  openGraph: {
    title: "Lej Lys-pakke København | Fra 495 kr",
    description:
      "2 farvede LED-lamper + centereffekt på stativ. Fra 495 kr/weekend. Book online.",
    url: "https://lejhojtaler.dk/lys-pakke",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function LysPakkePage() {
  return (
    <ProductLanding
      slug="lys-pakke"
      name="Lys-pakke"
      price={495}
      headline="Lej lys-pakke i København"
      sub="2 farvede LED-lamper + centereffekt på stativ. Klar på få minutter."
      image="/images/product-lys.webp"
      imageAlt="Lys-pakke til leje i København"
      productId="lys"
      bookLabel="Book lys-pakke nu"
      faqPhrase="lys-pakken"
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
