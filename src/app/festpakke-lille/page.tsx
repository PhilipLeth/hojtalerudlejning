import { prisKr, rabatKr } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Festpakke 0-30 | Højtalere + lysbar | ${prisKr("pakke_fest_lille")} | Lejhøjtaler.dk`,
  description:
    `Festpakke 0-30: 2× Alto 10\" højtalere + lysbar for ${prisKr("pakke_fest_lille")}, spar ${rabatKr("pakke_fest_lille")}. Lyd og lys til op til 30 gæster. Levering og opsætning kan tilvælges. Book online.`,
  keywords: ["festpakke", "lej festpakke", "højtaler og lys leje", "lille festpakke københavn", "fest lyd og lys"],
  alternates: {
    canonical: "https://lejhojtaler.dk/festpakke-lille",
    languages: localeAlternates("/festpakke-lille"),
  },
  openGraph: {
    images: ogImages("/images/product-pakke-fest-lille.webp"),
    title: `Festpakke 0-30 | Højtalere + lysbar | ${prisKr("pakke_fest_lille")}`,
    description: `2× Alto 10\" højtalere + lysbar, lyd og lys til op til 30 gæster. Spar ${rabatKr("pakke_fest_lille")}.`,
    url: "https://lejhojtaler.dk/festpakke-lille",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function FestpakkeLillePage() {
  return (
    <ProductLanding
      slug="festpakke-lille"
      name="Festpakke 0-30"
      headline="Festpakke 0-30, lyd og lys"
      sub={`2× Alto 10&quot; højtalere + lysbar. Alt til festen med op til 30 gæster, spar ${rabatKr("pakke_fest_lille")}.`}
      imageAlt="Festpakke 0-30 med Alto højtalere og lysbar"
      productId="pakke_fest_lille"
      faqPhrase="Festpakke 0-30"
      bullets={[
        "2× Alto 10\" højtalere med Bluetooth (op til 30 gæster)",
        "Lysbar: 2 farvede lamper + centereffekt på stativ",
        "Alle kabler inkluderet",
        `Spar ${rabatKr("pakke_fest_lille")} vs. at leje delene enkeltvis`,
        "Levering og opsætning kan tilvælges i booking",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Større fest?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Festpakke 30-50: de store 12&quot; højtalere + lysbar, til 30-50 gæster.
          </p>
          <Link
            href="/festpakke-stor"
            className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
          >
            Se Festpakke 30-50 – <LivePrice productId="pakke_fest_stor" prefix="" suffix=" kr" />
          </Link>
        </div>
      </section>
    </ProductLanding>
  );
}
