import { Metadata } from "next";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Lej Lysshow København | Fra 800 kr | Lejhøjtaler.dk",
  description:
    "Lej lysshow i København fra 800 kr/weekend. Komplet lysshow med 2x moving head og DMX-controller. Forudprogrammerede shows. Ingen depositum.",
  keywords: [
    "lej lysshow",
    "lysshow udlejning",
    "moving head leje",
    "lysshow til fest",
    "professionelt lysshow",
    "DMX lysshow leje",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/lysshow" },
  openGraph: {
    title: "Lej Lysshow København | Fra 800 kr",
    description:
      "Lej lysshow i København fra 800 kr. 2x moving head + DMX-controller. Book online.",
    url: "https://lejhojtaler.dk/lysshow",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function LysshowPage() {
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
        name: "Lysshow",
        item: "https://lejhojtaler.dk/lysshow",
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
            København · Ingen depositum
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Lej lysshow i København
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              fra 800 kr.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            2x moving head + DMX-controller. Forudprogrammerede shows — ingen teknik nødvendig.
          </p>
          <a
            href="/#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book lysshow nu
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Product detail */}
        <section className="mx-auto max-w-4xl px-4 py-24">
          <div className="grid gap-8 sm:grid-cols-2 items-center">
            <div className="overflow-hidden rounded-2xl">
              <img
                src="/images/product-lysshow.png"
                alt="Lysshow-pakke til leje i København"
                width={600}
                height={400}
                className="w-full object-cover"
              />
            </div>
            <div>
              <h2 className="mb-4 text-3xl font-bold">Lysshow-pakke</h2>
              <p className="mb-6 text-3xl font-bold text-brand-400">
                800 kr<span className="text-lg font-normal text-white/40">/weekend</span>
              </p>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>2x moving head med farver og gobos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>DMX-controller inkluderet</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>Forudprogrammerede shows</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>Stativer og alle kabler inkl.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>Ingen teknik nødvendig — plug and play</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>Hent fredag, aflever mandag</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Upsell */}
        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Kombiner med røg og lyd
            </h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Lysshowet er perfekt sammen med røgmaskine og højtalere. Skab den fulde festoplevelse.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/roegmaskine"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                Se røgmaskine – 250 kr
              </Link>
              <Link
                href="/lej-hojtaler"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                Se højtalere – fra 399 kr
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* Final CTA */}
        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Klar til lysshow på dansegulvet?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online på 2 minutter. Hent fredag i København K, aflever mandag. Kun 800 kr/weekend.
          </p>
          <a
            href="/#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book lysshow nu
          </a>
        </section>

        <Footer />
      </main>
    </>
  );
}
