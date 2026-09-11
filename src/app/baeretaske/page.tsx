import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lej Bæretaske til Højtalere | 95 kr | Lejhøjtaler.dk",
  description:
    "Lej en polstret bæretaske til den lille højtalerpakke for 95 kr. Sikker transport på cykel, i bus eller bil — højtalere og kabler samlet ét sted. Lejes i København.",
  keywords: ["bæretaske højtaler leje", "taske til højtalere", "højtaler på cykel", "transport af højtalere"],
  alternates: {
    canonical: "https://lejhojtaler.dk/baeretaske",
    languages: localeAlternates("/baeretaske"),
  },
  openGraph: {
    title: "Lej Bæretaske | 95 kr",
    description: "Polstret sportstaske til sikker transport på cykel eller i bil.",
    url: "https://lejhojtaler.dk/baeretaske",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="baeretaske"
      name="Bæretaske"
      price={95}
      headline="Lej bæretaske til højtalerne"
      sub="Polstret sportstaske, hvor den lille højtalerpakke og alle kablerne er samlet — så du kan hente på cykel."
      image="/images/product-taske-v2.webp"
      imageAlt="Polstret bæretaske til højtalere"
      productId="taske"
      bookLabel="Book bæretaske nu"
      faqPhrase="en bæretaske"
      bullets={[
        "Polstret — højtalerne får ikke stød på cykelstien",
        "Plads til 2× Alto 10\" højtalere og alle kabler",
        "Skulderrem og håndtag",
        "Passer i en cykelkurv, en ladcykel eller på bagsædet",
        "Inkluderet i Studenterpakken",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Henter du på cykel?</h2>
          <p className="mb-6 text-white/50">
            Den lille højtalerpakke vejer 12 kg og passer i tasken. Tag den med i bookingen, så står højtalerne pakket og klar, når du kommer.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/hojtalerpakke-lille" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Se Lille højtalerpakke
            </Link>
            <Link href="/lej-hojtaler" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              Alle højtalere
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
