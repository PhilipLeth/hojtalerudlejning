import { Metadata } from "next";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import CategoryProductGrid from "@/components/CategoryProductGrid";

export const metadata: Metadata = {
  title: "Lej Lyskæder København | Fra 195 kr | Lejhøjtaler.dk",
  description:
    "Lej lyskæde i København fra 195 kr/weekend. 10m lyskæde — vælg mellem varm hvid eller farvet. Perfekt til havefest, bryllup og fødselsdag. Betal ved afhentning.",
  keywords: [
    "lej lyskæder",
    "lyskæder udlejning",
    "lyskæder til fest",
    "lyskæder bryllup",
    "lyskæder havefest",
    "lyskæder leje københavn",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/lyskaeder" },
  openGraph: {
    title: "Lej Lyskæder København | Fra 195 kr",
    description:
      "Lej lyskæde i København fra 195 kr. 10m lyskæde — varm hvid eller farvet. Book online.",
    url: "https://lejhojtaler.dk/lyskaeder",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function LyskaederPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Forside",
        item: "https://lejhojtaler.dk",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Lyskæder",
        item: "https://lejhojtaler.dk/lyskaeder",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div
          className="fixed inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url(/images/hero.png)" }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            København · Betal ved afhentning · Ring 31 13 28 52
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Lej lyskæder i København
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              fra 195 kr.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            10m lyskæde — vælg mellem almindelig varm hvid eller farvet. Perfekt til enhver fest.
          </p>
          <a
            href="/?product=lyskaeder#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book lyskæder nu
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Produkter — vælg varm hvid eller farvet */}
        <section id="produkter" className="mx-auto max-w-4xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">Vælg din lyskæde</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
            To varianter — begge 10m med strømforsyning og kabelstrips til ophæng.
            Perfekte til havefest, bryllup og fødselsdag.
          </p>
          <CategoryProductGrid items={[{ id: "lyskaeder" }, { id: "lyskaeder_farvet" }]} />
        </section>

        {/* Upsell */}
        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Kombiner med lyd og lys
            </h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Lyskæderne er perfekte sammen med højtalere og discokugle. Skab den fulde festoplevelse.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/lej-hojtaler"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                Se højtalere – fra 395 kr
              </Link>
              <Link
                href="/discokugle"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                Se discokugle – 245 kr
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* Final CTA */}
        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Klar til stemningslys til festen?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online på 2 minutter. Hent fredag i København K, aflever mandag. Kun 195 kr/weekend.
          </p>
          <a
            href="/?product=lyskaeder#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book lyskæder nu
          </a>
        </section>

        <Footer />
      </main>
    </>
  );
}
