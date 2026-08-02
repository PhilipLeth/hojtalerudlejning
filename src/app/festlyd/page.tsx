import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Lyd til Fest København | Fra 395 kr | Lejhøjtaler.dk",
  description:
    "Lyd til din fest i København fra 395 kr/weekend. Havefest, fødselsdag eller firmaevent. Betal ved afhentning, kabler inkluderet. Book online på 2 minutter.",
  keywords: [
    "lyd til fest københavn",
    "festlyd leje",
    "lyd til havefest",
    "lyd til fødselsdag",
    "festlyd udlejning",
    "lej lyd til fest",
    "musik til fest udstyr",
    "lyd til event",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/festlyd" },
  openGraph: {
    title: "Lyd til Fest København | Fra 395 kr",
    description:
      "Lyd til din fest i København fra 395 kr. Havefest, fødselsdag eller firmaevent. Book online.",
    url: "https://lejhojtaler.dk/festlyd",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function FestlydPage() {
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
        name: "Festlyd",
        item: "https://lejhojtaler.dk/festlyd",
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
            København · Fra 395 kr/weekend
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Lyd til din fest
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              i København
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Havefest, fødselsdag eller firmaevent – fra 395 kr.
          </p>
          <a
            href="/book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book festlyd nu
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Scenario cards */}
        <section className="mx-auto max-w-4xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Find den rigtige lyd til din fest
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
            Uanset størrelse har vi den rigtige løsning til dig.
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Havefest / fødselsdag */}
            <div className="glass rounded-2xl p-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">Havefest / fødselsdag</h3>
              <p className="mb-4 text-sm text-white/50">
                Op til 40 gæster i lejlighed, gårdhave eller have.
              </p>
              <div className="rounded-xl bg-brand-500/10 p-3 text-center">
                <p className="text-xs font-medium text-brand-400">Anbefalet</p>
                <p className="text-lg font-bold text-white">Party-pakke</p>
                <p className="text-xl font-bold text-brand-400">395 kr</p>
              </div>
            </div>

            {/* Stort event */}
            <div className="glass rounded-2xl p-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">Stort event</h3>
              <p className="mb-4 text-sm text-white/50">
                40–100 gæster. Firmafest, konfirmation eller bryllup.
              </p>
              <div className="rounded-xl bg-brand-500/10 p-3 text-center">
                <p className="text-xs font-medium text-brand-400">Anbefalet</p>
                <p className="text-lg font-bold text-white">Festival-pakke</p>
                <p className="text-xl font-bold text-brand-400">695 kr</p>
              </div>
            </div>

            {/* Komplet fest */}
            <div className="glass rounded-2xl p-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">Komplet fest</h3>
              <p className="mb-4 text-sm text-white/50">
                Lyd, lys og røg – alt hvad du behøver.
              </p>
              <div className="rounded-xl bg-brand-500/10 p-3 text-center">
                <p className="text-xs font-medium text-brand-400">Alt inkluderet</p>
                <p className="text-lg font-bold text-white">Festival + lys + røg</p>
                <p className="text-xl font-bold text-brand-400">1.435 kr</p>
              </div>
            </div>
          </div>
        </section>

        {/* Alt inkluderet checklist */}
        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Alt inkluderet – ingen overraskelser
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <ul className="space-y-3 text-white/60">
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  Kabler inkluderet
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  Betal ved afhentning
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  Bæretaske medfølger (Party)
                </li>
              </ul>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  Hent fredag, aflever mandag
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  Betal ved afhentning
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  Bluetooth på Festival-pakken
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* Final CTA */}
        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Klar til festlyd?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online på 2 minutter. Hent fredag i København K, aflever mandag. Fra 395 kr/weekend.
          </p>
          <a
            href="/book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book festlyd nu
          </a>
        </section>

        <Footer />
      </main>
    </>
  );
}
