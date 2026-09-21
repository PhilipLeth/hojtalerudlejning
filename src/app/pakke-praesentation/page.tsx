import { prisKr, rabatKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lej Præsentationspakken København | ${prisKr("pakke_praesentation")} | Lejhøjtaler.dk`,
  description:
    `Præsentationspakken med projektor, 160 cm lærred og håndholdt mikrofon, alt til præsentationen for ${prisKr("pakke_praesentation")}. Spar ${rabatKr("pakke_praesentation")}. Book online i København.`,
  keywords: ["præsentationspakke leje", "lej projektor og lærred", "av pakke til møde"],
  alternates: {
    canonical: "https://lejhojtaler.dk/pakke-praesentation",
    languages: localeAlternates("/pakke-praesentation"),
  },
  openGraph: {
    images: ogImages("/images/product-projektor.webp"),
    title: `Lej Præsentationspakken København | ${prisKr("pakke_praesentation")}`,
    description:
      `Præsentationspakken med projektor, 160 cm lærred og håndholdt mikrofon, alt til præsentationen for ${prisKr("pakke_praesentation")}. Spar ${rabatKr("pakke_praesentation")}. Book online i København.`,
    url: "https://lejhojtaler.dk/pakke-praesentation",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="pakke-praesentation"
      name="Præsentationspakken"
      headline="Præsentationspakken, alt til mødet"
      sub={`Projektor + lærred 160 cm + håndholdt mikrofon. Spar ${rabatKr("pakke_praesentation")} ift. enkeltpriser.`}
      imageAlt="Præsentationspakke med projektor, lærred og mikrofon"
      productId="pakke_praesentation"
      bullets={["Full HD projektor", "Lærred 160 cm på stativ", "Håndholdt mikrofon m. kabel", "Alle kabler inkluderet", `Spar ${rabatKr("pakke_praesentation")} ift. at leje delene enkeltvis`]}
    />
  );
}
