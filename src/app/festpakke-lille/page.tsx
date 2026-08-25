import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lille festpakke | Højtalere + lys | 890 kr | Lejhøjtaler.dk",
  description:
    "Lille festpakke: 2× Alto 10\" højtalere + enkelt lyseffekt for 890 kr — spar 100 kr. Lyd og lys til op til 40 personer. Levering og opsætning kan tilvælges. Book online.",
  keywords: ["festpakke", "lej festpakke", "højtaler og lys leje", "lille festpakke københavn", "fest lyd og lys"],
  alternates: {
    canonical: "https://lejhojtaler.dk/festpakke-lille",
    languages: localeAlternates("/festpakke-lille"),
  },
  openGraph: {
    title: "Lille festpakke | Højtalere + lys | 890 kr",
    description: "2× Alto 10\" højtalere + enkelt lyseffekt — lyd og lys til op til 40 pers. Spar 100 kr.",
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
      name="Lille festpakke"
      price={890}
      headline="Lille festpakke — lyd og lys"
      sub="2× Alto 10&quot; højtalere + enkelt lyseffekt. Alt til den lille fest — spar 100 kr."
      image="/images/product-pakke-fest-lille.webp"
      imageAlt="Lille festpakke med Alto højtalere og lyseffekt"
      productId="pakke_fest_lille"
      faqPhrase="den lille festpakke"
      bullets={[
        "2× Alto 10\" højtalere med Bluetooth (op til 40 pers.)",
        "Enkelt lyseffekt: 1 LED-par-lys med farveeffekter (uden stativ)",
        "Alle kabler inkluderet",
        "Spar 100 kr vs. at leje delene enkeltvis",
        "Levering og opsætning kan tilvælges i booking",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Større fest?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Stor festpakke: de store 12&quot; højtalere + fuld lys-pakke — til op til 100 personer.
          </p>
          <Link
            href="/festpakke-stor"
            className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
          >
            Se Stor festpakke – 895 kr
          </Link>
        </div>
      </section>
    </ProductLanding>
  );
}
