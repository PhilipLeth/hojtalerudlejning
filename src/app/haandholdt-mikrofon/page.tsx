import { prisKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lej Håndholdt mikrofon (kabel) København | ${prisKr("mikrofon_kabel")} | Lejhøjtaler.dk`,
  description: `Almindelig håndholdt mikrofon med kabel, til taler og sang. ${prisKr("mikrofon_kabel")}/weekend. Betal ved afhentning. Book online.`,
  keywords: ["lej mikrofon", "håndholdt mikrofon leje", "mikrofon til tale leje københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/haandholdt-mikrofon",
    languages: localeAlternates("/haandholdt-mikrofon"),
  },
  openGraph: {
    images: ogImages("/images/product-mikrofon-kabel-v2.webp"),
    title: `Lej Håndholdt mikrofon (kabel) København | ${prisKr("mikrofon_kabel")}`,
    description: `Almindelig håndholdt mikrofon med kabel, til taler og sang. ${prisKr("mikrofon_kabel")}/weekend. Betal ved afhentning. Book online.`,
    url: "https://lejhojtaler.dk/haandholdt-mikrofon",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="haandholdt-mikrofon"
      name="Håndholdt mikrofon (kabel)"
      headline="Lej håndholdt mikrofon"
      sub={'the t.bone MB 60, håndholdt dynamisk mikrofon med kabel, til taler og sang.'}
      image="/images/product-mikrofon-kabel-v2-white.webp"
      imageAlt="Håndholdt mikrofon med kabel til leje"
      productId="mikrofon_kabel"
      faqPhrase="en håndholdt mikrofon med kabel"
      bullets={["Klassisk håndholdt dynamisk mikrofon", "XLR-kabel inkluderet", "Tilslut direkte til vores højtalere", "Perfekt til taler og fest", `Kun ${prisKr("mikrofon_kabel")}/weekend`]}
    />
  );
}
