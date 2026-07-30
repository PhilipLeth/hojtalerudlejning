import { Metadata } from "next";
import Link from "next/link";
import SpeakerCompare from "@/components/SpeakerCompare";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Lej Højtalere København | Fra 350 kr/weekend | Lejhøjtaler.dk",
  description:
    "Lej højtalere i København fra 350 kr/weekend. Batterihøjtalere (Mackie Thump GO, Soundboks 4) og PA-pakker. Ingen depositum, kabler inkluderet. Book online.",
  keywords: [
    "lej højtalere københavn",
    "lej højtaler",
    "højtaler udlejning",
    "højtalere til fest",
    "lej lydanlæg",
    "højtaler leje pris",
    "festhøjtalere",
    "lej højtaler billigt",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/lej-hojtaler" },
  openGraph: {
    title: "Lej Højtalere København | Fra 350 kr/weekend",
    description:
      "Lej højtalere i København fra 350 kr/weekend. Batterihøjtalere og PA-pakker. Ingen depositum. Book online.",
    url: "https://lejhojtaler.dk/lej-hojtaler",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function LejHojtalerPage() {
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
        name: "Lej Højtalere",
        item: "https://lejhojtaler.dk/lej-hojtaler",
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
            Lej højtalere
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              i København
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Batterihøjtalere og PA-pakker fra 350 kr — ingen depositum, betal ved afhentning.
          </p>
          <a
            href="/#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book højtaler nu
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <SpeakerCompare bookLinks="booking" />

        {/* USP section */}
        <section className="mx-auto max-w-4xl px-4 pb-24">
          <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            Alt er inkluderet
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Ingen depositum</h3>
              <p className="mt-2 text-sm text-white/50">
                Du betaler kun lejen. Ingen skjulte gebyrer eller depositum.
              </p>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Kabler inkluderet</h3>
              <p className="mt-2 text-sm text-white/50">
                Alt hvad du skal bruge er med. Tilslut og spil.
              </p>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Bæretaske medfølger</h3>
              <p className="mt-2 text-sm text-white/50">
                Party-pakken passer i en bæretaske. Nem transport.
              </p>
            </div>
          </div>
        </section>

        {/* Cross-sell */}
        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Tilføj lys eller røg til din fest
            </h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Gør festen komplet med festlys og røgmaskine. Kombiner og spar.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/festlys"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                Se festlys – fra 500 kr
              </Link>
              <Link
                href="/roegmaskine"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                Se røgmaskine – fra 250 kr
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* Final CTA */}
        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Klar til at leje højtalere?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online på 2 minutter. Hent fredag i København K, aflever mandag. Fra 350 kr/weekend.
          </p>
          <a
            href="/#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book højtaler nu
          </a>
        </section>

        <Footer />
      </main>
    </>
  );
}
