import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Stor festpakke | Højtalere + lys til 100 pers. | 1.000 kr | Lejhøjtaler.dk",
  description:
    "Stor festpakke: 2× EV 12\" højtalere med stativer + lys-pakke for 1.000 kr — spar 190 kr. Lyd og lys til op til 100 personer. Levering og opsætning kan tilvælges. Book online.",
  keywords: ["stor festpakke", "lej festpakke", "højtaler og lys leje", "fest 100 personer lyd", "festpakke københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/festpakke-stor" },
  openGraph: {
    title: "Stor festpakke | Højtalere + lys til 100 pers. | 1.000 kr",
    description: "2× EV 12\" højtalere + stativer + lys-pakke — lyd og lys til op til 100 pers. Spar 100 kr.",
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
      name="Stor festpakke"
      price={1000}
      headline="Stor festpakke — lyd og lys til 100 pers."
      sub="2× EV 12&quot; højtalere + stativer + lys-pakke. Fuld fest — spar 190 kr."
      image="/images/product-festival.png"
      imageAlt="Stor festpakke med store EV højtalere og lyseffekt"
      productId="pakke_fest_stor"
      bullets={[
        "2× EV 12\" aktive højtalere med Bluetooth (op til 100 pers.)",
        "2× stativer inkluderet — lyden op i øjenhøjde",
        "Lys-pakke: 2 farvede lamper + centereffekt",
        "Spar 100 kr vs. at leje delene enkeltvis",
        "Levering og opsætning kan tilvælges i booking",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Mindre fest?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Lille festpakke: kompakt Alto-sæt + lys — til op til 40 personer for 500 kr.
          </p>
          <Link
            href="/festpakke-lille"
            className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
          >
            Se Lille festpakke – 790 kr
          </Link>
        </div>
      </section>
    </ProductLanding>
  );
}
