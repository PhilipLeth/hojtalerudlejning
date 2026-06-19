import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Soundboks Alternativ København | Bedre Lyd, Lavere Pris | Lejhøjtaler.dk",
  description:
    "Soundboks-alternativ i København fra 399 kr. Bedre lyd end Soundboks, ingen depositum, kabler inkluderet. Professionelt PA-anlæg i stedet for batteri-højtaler.",
  keywords: [
    "soundboks alternativ",
    "soundboks alternativ leje",
    "lej soundboks alternativ",
    "bedre end soundboks",
    "billigere end soundboks",
    "soundboks vs PA anlæg",
    "soundboks leje københavn",
    "alternativ til soundboks",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/soundboks-alternativ" },
  openGraph: {
    title: "Soundboks Alternativ København | Bedre Lyd, Lavere Pris",
    description:
      "Bedre lyd end Soundboks fra 399 kr. Ingen depositum. Book online.",
    url: "https://lejhojtaler.dk/soundboks-alternativ",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function SoundboksAlternativPage() {
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
        name: "Soundboks Alternativ",
        item: "https://lejhojtaler.dk/soundboks-alternativ",
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
            København · Fra 399 kr/weekend
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Soundboks-alternativ
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              bedre lyd, lavere pris
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Fra 399 kr. i stedet for 5.000+ kr.
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
        {/* Comparison table */}
        <section className="mx-auto max-w-3xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Soundboks vs. Lejhøjtaler.dk
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
            Se hvorfor vores Party-højtaler er det smartere valg til din fest.
          </p>

          <div className="glass rounded-2xl p-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="pb-3 text-white/40">&nbsp;</th>
                    <th className="pb-3 font-semibold text-brand-400">Lejhøjtaler.dk</th>
                    <th className="pb-3 font-semibold text-white/60">Soundboks</th>
                  </tr>
                </thead>
                <tbody className="text-white/60">
                  <tr className="border-b border-white/5">
                    <td className="py-3 font-medium text-white/80">Pris</td>
                    <td className="py-3 font-semibold text-brand-400">Fra 399 kr/weekend</td>
                    <td className="py-3">5.000+ kr at købe</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 font-medium text-white/80">Leje-pris</td>
                    <td className="py-3 font-semibold text-brand-400">399 kr/weekend</td>
                    <td className="py-3">500–800 kr/weekend</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 font-medium text-white/80">Lydkvalitet</td>
                    <td className="py-3">Professionel PA-lyd</td>
                    <td className="py-3">Bluetooth-højtaler</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 font-medium text-white/80">Portabilitet</td>
                    <td className="py-3">12 kg total – passer i taske</td>
                    <td className="py-3">15 kg – ingen taske</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 font-medium text-white/80">Strøm</td>
                    <td className="py-3">Stikkontakt (uafbrudt lyd)</td>
                    <td className="py-3">Batteri (løber ud)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 font-medium text-white/80">Depositum</td>
                    <td className="py-3 font-semibold text-brand-400">Ingen</td>
                    <td className="py-3">Ofte 1.000+ kr</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-white/80">Kabler</td>
                    <td className="py-3 font-semibold text-brand-400">Inkluderet</td>
                    <td className="py-3">Kun Bluetooth</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Why switch */}
        <section className="mx-auto max-w-4xl px-4 pb-24">
          <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            Hvorfor vælge os frem for Soundboks?
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Bedre lydkvalitet</h3>
              <p className="mt-2 text-sm text-white/50">
                Professionelle PA-højtalere giver klarere, stærkere lyd end en Bluetooth-boks.
              </p>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Billigere</h3>
              <p className="mt-2 text-sm text-white/50">
                Fra 399 kr/weekend mod 500–800 kr for Soundboks-leje. Ingen depositum.
              </p>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Uafbrudt lyd</h3>
              <p className="mt-2 text-sm text-white/50">
                Stikkontakt = ingen batterier der løber ud midt i festen.
              </p>
            </div>
          </div>
        </section>

        {/* Product preview */}
        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8">
            <div className="grid gap-6 sm:grid-cols-2 items-center">
              <div className="overflow-hidden rounded-xl">
                <Image
                  src="/images/product-party.png"
                  alt="Party-højtaler – Soundboks-alternativ"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-white">Party-pakke</h3>
                <p className="mb-4 text-sm text-white/50">
                  2× 10&quot; Alto TS410 · 12 kg total · Kabler inkluderet
                </p>
                <p className="mb-4 text-3xl font-bold text-brand-400">
                  399 kr<span className="text-lg font-normal text-white/40">/weekend</span>
                </p>
                <a
                  href="/#book"
                  className="inline-block rounded-full bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400 active:scale-95"
                >
                  Book nu
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* Final CTA */}
        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Klar til bedre lyd end Soundboks?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online på 2 minutter. Hent fredag i København K, aflever mandag. Fra 399 kr/weekend.
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
