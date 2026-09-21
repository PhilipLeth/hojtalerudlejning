import { prisKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lej Håndholdt mikrofon PRO (kabel) København | ${prisKr("haandholdt_mikrofon_pro")} | Lejhøjtaler.dk`,
  description: `Shure Beta 58A med kabel, klassikeren til sang og taler. ${prisKr("haandholdt_mikrofon_pro")}/weekend. Betal ved afhentning. Book online.`,
  keywords: ["lej shure beta 58", "sangmikrofon leje", "mikrofon til sang københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/haandholdt-mikrofon-pro",
    languages: localeAlternates("/haandholdt-mikrofon-pro"),
  },
  openGraph: {
    images: ogImages("/images/product-mikrofon-kabel-pro-v2.webp"),
    title: `Lej Håndholdt mikrofon PRO (kabel) København | ${prisKr("haandholdt_mikrofon_pro")}`,
    description: `Shure Beta 58A med kabel, klassikeren til sang og taler. ${prisKr("haandholdt_mikrofon_pro")}/weekend. Betal ved afhentning. Book online.`,
    url: "https://lejhojtaler.dk/haandholdt-mikrofon-pro",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="haandholdt-mikrofon-pro"
      name="Håndholdt mikrofon PRO (kabel)"
      headline="Lej Shure Beta 58A"
      sub={'Shure Beta 58A med kabel, klassikeren til sang og taler.'}
      image="/images/product-mikrofon-kabel-pro-v2-white.webp"
      imageAlt="Shure Beta 58A mikrofon til leje"
      productId="haandholdt_mikrofon_pro"
      faqPhrase="en håndholdt PRO-mikrofon med kabel"
      bullets={["Shure Beta 58A, industristandarden", "XLR-kabel inkluderet", "Perfekt til sang og taler", "Tilslut direkte til vores højtalere", `${prisKr("haandholdt_mikrofon_pro")}/weekend`]}
    />
  );
}
