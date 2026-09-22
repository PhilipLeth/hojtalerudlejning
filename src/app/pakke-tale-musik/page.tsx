import { prisKr, rabatKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lej Speakerpakke trådløs 30-50 København | ${prisKr("pakke_speaker_traadloes_stor")} | Lejhøjtaler.dk`,
  description: `Mellem højtalerpakke + trådløs mikrofon, taler og musik til events. Spar ${rabatKr("pakke_speaker_traadloes_stor")}. ${prisKr("pakke_speaker_traadloes_stor")}/weekend. Betal ved afhentning. Book online.`,
  keywords: ["lej lyd til tale og musik", "højtaler og trådløs mikrofon pakke", "speakerpakke leje københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/pakke-tale-musik",
    languages: localeAlternates("/pakke-tale-musik"),
  },
  openGraph: {
    images: ogImages("/images/product-festival-v2.webp"),
    title: `Lej Speakerpakke trådløs 30-50 København | ${prisKr("pakke_speaker_traadloes_stor")}`,
    description: `Mellem højtalerpakke + trådløs mikrofon, taler og musik til events. Spar ${rabatKr("pakke_speaker_traadloes_stor")}. ${prisKr("pakke_speaker_traadloes_stor")}/weekend. Betal ved afhentning. Book online.`,
    url: "https://lejhojtaler.dk/pakke-tale-musik",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="pakke-tale-musik"
      name="Speakerpakke trådløs 30-50"
      headline="Speakerpakke trådløs 30-50"
      sub={`Mellem højtalerpakke + trådløs mikrofon, taler og musik til events. Spar ${rabatKr("pakke_speaker_traadloes_stor")}.`}
      imageAlt="Speakerpakke med to EV-højtalere og trådløs mikrofon"
      productId="pakke_speaker_traadloes_stor"
      bullets={["2× 12\" EV højtalere med stativer", "Trådløs håndholdt mikrofon", "30-50 gæster", "Alle kabler inkluderet", `Spar ${rabatKr("pakke_speaker_traadloes_stor")} ift. enkeltpriser`]}
    />
  );
}
