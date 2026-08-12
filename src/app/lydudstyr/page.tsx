import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Lej PA-anlæg og Lydudstyr København | Lejhøjtaler.dk",
  description:
    "Lej PA-anlæg og professionelt lydudstyr i København fra 395 kr/weekend. Festival-pakke med 2 højtalere, mixer, mikrofon og stativer. Betal ved afhentning.",
  keywords: [
    "lej PA-anlæg københavn",
    "PA anlæg udlejning",
    "lydudstyr leje",
    "lej lydudstyr",
    "PA system til fest",
    "professionelt lydudstyr leje",
    "mixer og højtalere leje",
    "lydanlæg til event",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/lydudstyr" },
  openGraph: {
    title: "Lej PA-anlæg og Lydudstyr København | Lejhøjtaler.dk",
    description:
      "Professionelt lydudstyr fra 395 kr/weekend. Betal ved afhentning. Book online.",
    url: "https://lejhojtaler.dk/lydudstyr",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function LydudstyrPage() {
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
        name: "Lydudstyr",
        item: "https://lejhojtaler.dk/lydudstyr",
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
            København · Professionelt udstyr
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Lej PA-anlæg og lydudstyr
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              i København
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Professionelt lydudstyr fra 395 kr.
          </p>
          <a
            href="/#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book lydudstyr nu
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Festival detailed view */}
        <section className="mx-auto max-w-4xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Festival-pakke – komplet PA-anlæg
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
            Alt du behøver til professionel lyd ved dit event.
          </p>

          <div className="grid gap-8 sm:grid-cols-2 items-center">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="/images/product-festival.png"
                alt="Festival PA-anlæg med højtalere, mixer og mikrofon"
                width={600}
                height={400}
                className="w-full object-cover"
              />
            </div>
            <div>
              <p className="mb-4 text-3xl font-bold text-brand-400">
                495 kr<span className="text-lg font-normal text-white/40">/weekend</span>
              </p>
              <h3 className="mb-4 text-xl font-bold text-white">Inkluderet i pakken</h3>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>2× 12&quot; EV ZLX-12BT højtalere</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>Mixer med Bluetooth</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>Mikrofon (kablet)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>2× højttalerstativer</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>Alle kabler inkluderet</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">✓</span>
                  <span>Betal ved afhentning</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Budget alternative */}
        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Mindre fest? Prøv Party-pakken
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 items-center">
              <div>
                <p className="mb-4 text-white/50">
                  Til fester med op til 40 gæster er Party-pakken det oplagte valg. To kompakte højtalere i bæretaske – nem transport og stærk lyd.
                </p>
                <p className="text-2xl font-bold text-brand-400">
                  395 kr<span className="text-lg font-normal text-white/40">/weekend</span>
                </p>
              </div>
              <div className="overflow-hidden rounded-xl">
                <Image
                  src="/images/product-party.png"
                  alt="Party-højtalerpakke – budget-alternativ"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* Final CTA */}
        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Klar til professionel lyd?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online på 2 minutter. Hent fredag i København K, aflever mandag. Fra 395 kr/weekend.
          </p>
          <a
            href="/#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book lydudstyr nu
          </a>
        </section>

        <Footer />
      </main>
    </>
  );
}
