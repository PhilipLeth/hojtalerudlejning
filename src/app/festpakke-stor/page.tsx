import { prisKr, rabatKr } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Festpakke 30-50 | Højtalere + lysbar til 30-50 gæster | ${prisKr("pakke_fest_stor")} | Lejhøjtaler.dk`,
  description:
    `Festpakke 30-50: 2× EV 12\" højtalere + lysbar for ${prisKr("pakke_fest_stor")}, spar ${rabatKr("pakke_fest_stor")}. Lyd og lys til 30-50 gæster. Levering og opsætning kan tilvælges. Book online.`,
  keywords: ["stor festpakke", "lej festpakke", "højtaler og lys leje", "fest 100 personer lyd", "festpakke københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/festpakke-stor",
    languages: localeAlternates("/festpakke-stor"),
  },
  openGraph: {
    images: ogImages("/images/product-pakke-fest-stor.webp"),
    title: `Festpakke 30-50 | Højtalere + lysbar til 30-50 gæster | ${prisKr("pakke_fest_stor")}`,
    description: `2× EV 12\" højtalere + lysbar, lyd og lys til 30-50 gæster. Spar ${rabatKr("pakke_fest_stor")}.`,
    url: "https://lejhojtaler.dk/festpakke-stor",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function FestpakkeStorPage() {
  return (
    <ProductLanding
      slug="festpakke-stor"
      name="Festpakke 30-50"
      headline="Festpakke 30-50, lyd og lys til 30-50 gæster"
      sub={`2× EV 12&quot; højtalere + lysbar. Fuld fest, spar ${rabatKr("pakke_fest_stor")}.`}
      imageAlt="Festpakke 30-50 med store EV højtalere og lysbar"
      productId="pakke_fest_stor"
      faqPhrase="Festpakke 30-50"
      bullets={[
        "2× EV 12\" aktive højtalere med Bluetooth (30-50 gæster)",
        `Stativer kan tilkøbes (${rabatKr("pakke_fest_stor")}), lyden op i øjenhøjde`,
        "Lysbar: 2 farvede lamper + centereffekt",
        `Spar ${rabatKr("pakke_fest_stor")} vs. at leje delene enkeltvis`,
        "Levering og opsætning kan tilvælges i booking",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Mindre fest?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Festpakke 0-30: kompakt Alto-sæt + lysbar, til op til 30 gæster for{" "}
            <LivePrice productId="pakke_fest_lille" prefix="" suffix=" kr" />.
          </p>
          <Link
            href="/festpakke-lille"
            className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
          >
            Se Festpakke 0-30 – <LivePrice productId="pakke_fest_lille" prefix="" suffix=" kr" />
          </Link>
        </div>
      </section>
    </ProductLanding>
  );
}
