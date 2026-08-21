import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Stor festpakke | Højtalere + lys til 100 pers. | 895 kr | Lejhøjtaler.dk",
  description:
    "Stor festpakke: 2× EV 12\" højtalere + lys-pakke for 895 kr — spar 95 kr. Lyd og lys til op til 100 personer. Levering og opsætning kan tilvælges. Book online.",
  keywords: ["stor festpakke", "lej festpakke", "højtaler og lys leje", "fest 100 personer lyd", "festpakke københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/festpakke-stor" },
  openGraph: {
    title: "Stor festpakke | Højtalere + lys til 100 pers. | 895 kr",
    description: "2× EV 12\" højtalere + lys-pakke — lyd og lys til op til 100 pers. Spar 95 kr.",
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
      price={895}
      headline="Stor festpakke — lyd og lys til 100 pers."
      sub="2× EV 12&quot; højtalere + lys-pakke. Fuld fest — spar 95 kr."
      image="/images/product-pakke-fest-stor.webp"
      imageAlt="Stor festpakke med store EV højtalere og lys-pakke"
      productId="pakke_fest_stor"
      faqPhrase="den store festpakke"
      bullets={[
        "2× EV 12\" aktive højtalere med Bluetooth (op til 100 pers.)",
        "Stativer kan tilkøbes (100 kr) — lyden op i øjenhøjde",
        "Lys-pakke: 2 farvede lamper + centereffekt",
        "Spar 95 kr vs. at leje delene enkeltvis",
        "Levering og opsætning kan tilvælges i booking",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Mindre fest?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Lille festpakke: kompakt Alto-sæt + enkelt lyseffekt — til op til 40 personer for 495 kr.
          </p>
          <Link
            href="/festpakke-lille"
            className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
          >
            Se Lille festpakke – 495 kr
          </Link>
        </div>
      </section>
    </ProductLanding>
  );
}
