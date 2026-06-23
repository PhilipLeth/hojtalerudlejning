import { Metadata } from "next";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Lej Discokugle København | Fra 250 kr | Lejhøjtaler.dk",
  description:
    "Lej discokugle i København fra 250 kr/weekend. Roterende discokugle med LED-lys og farver. Plug-and-play. Ingen depositum. Book online.",
  keywords: [
    "lej discokugle",
    "discokugle udlejning",
    "discokugle til fest",
    "disco kugle leje",
    "discokugle københavn",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/discokugle" },
  openGraph: {
    title: "Lej Discokugle København | Fra 250 kr",
    description:
      "Lej discokugle i København fra 250 kr/weekend. Roterende discokugle med LED-lys og farver. Book online.",
    url: "https://lejhojtaler.dk/discokugle",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function DiscokuglePage() {
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
        name: "Discokugle",
        item: "https://lejhojtaler.dk/discokugle",
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
            Lej discokugle i København
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              fra 250 kr.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Roterende discokugle med LED-lys og farver. Klar på 2 min.
          </p>
          <a
            href="/#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book discokugle nu
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Product detail */}
        <section className="mx-auto max-w-4xl px-4 py-24">
          <div className="grid gap-8 sm:grid-cols-2 items-center">
            <div className="overflow-hidden rounded-2xl">
              <img
                src="/images/product-discokugle.png"
                alt="Discokugle til leje i København"
                width={600}
                height={400}
                className="w-full object-cover"
              />
            </div>
            <div>
              <h2 className="mb-4 text-3xl font-bold">Discokugle</h2>
              <p className="mb-6 text-3xl font-bold text-brand-400">
                250 kr<span className="text-lg font-normal text-white/40">/weekend</span>
              </p>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>Roterende med LED-farveeffekter</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>Plug-and-play med ophæng/stativ</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>Spotlight inkluderet</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>Ingen depositum</span>
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
              Kombiner med røg og lys
            </h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Discokuglen er perfekt sammen med røgmaskine og festlys. Skab den fulde festoplevelse.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/roegmaskine"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                Se røgmaskine – 250 kr
              </Link>
              <Link
                href="/festlys"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                Se festlys – fra 500 kr
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* Final CTA */}
        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Klar til discostemning?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online på 2 minutter. Hent fredag i København K, aflever mandag. Kun 250 kr/weekend.
          </p>
          <a
            href="/#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book discokugle nu
          </a>
        </section>

        <Footer />
      </main>
    </>
  );
}
