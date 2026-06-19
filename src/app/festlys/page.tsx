import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Lej Festlys og Røgmaskine København | Lejhøjtaler.dk",
  description:
    "Lej festlys og røgmaskine i København. Lysbar fra 500 kr, røgmaskine fra 250 kr. Ingen depositum. Kombiner med lyd til komplet festpakke fra 1.100 kr.",
  keywords: [
    "lej festlys københavn",
    "festlys udlejning",
    "lysbar til fest",
    "røgmaskine leje",
    "lej lys til fest",
    "festlys og røg",
    "LED lysbar leje",
    "festbelysning leje",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/festlys" },
  openGraph: {
    title: "Lej Festlys og Røgmaskine København | Lejhøjtaler.dk",
    description:
      "Lysbar fra 500 kr, røgmaskine fra 250 kr. Ingen depositum. Book online.",
    url: "https://lejhojtaler.dk/festlys",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function FestlysPage() {
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
        name: "Festlys",
        item: "https://lejhojtaler.dk/festlys",
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
            Lej festlys og røgmaskine
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              i København
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Lysbar fra 500 kr. · Røgmaskine fra 250 kr.
          </p>
          <a
            href="/#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book festlys nu
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Product cards */}
        <section className="mx-auto max-w-4xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Lys og røg til din fest
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
            Skab den perfekte stemning med professionelt festlys og røgmaskine.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Lysbar */}
            <div className="glass rounded-2xl p-8">
              <div className="mb-4 overflow-hidden rounded-xl">
                <Image
                  src="/images/product-lys.png"
                  alt="LED-lysbar til fest"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white">Lysbar</h3>
              <p className="mt-1 text-sm text-white/50">
                LED-lysbar med farveeffekter · Lydreaktiv · Nem opsætning
              </p>
              <p className="mt-4 text-3xl font-bold text-brand-400">
                500 kr<span className="text-lg font-normal text-white/40">/weekend</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/60">
                <li>• Professionelle farveeffekter</li>
                <li>• Reagerer på musikken</li>
                <li>• Nem opsætning – plug and play</li>
              </ul>
            </div>

            {/* Røgmaskine */}
            <div className="glass rounded-2xl p-8">
              <div className="mb-4 overflow-hidden rounded-xl">
                <Image
                  src="/images/product-rog.png"
                  alt="Røgmaskine til fest"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white">Røgmaskine</h3>
              <p className="mt-1 text-sm text-white/50">
                Inkl. røgvæske · Fjernbetjening · Klar på 5 min.
              </p>
              <p className="mt-4 text-3xl font-bold text-brand-400">
                250 kr<span className="text-lg font-normal text-white/40">/weekend</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/60">
                <li>• Røgvæske inkluderet</li>
                <li>• Fjernbetjening medfølger</li>
                <li>• Varmer op på 5 minutter</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Upsell */}
        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Kombiner med lyd – komplet festpakke fra 1.100 kr
            </h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Lej højtalere, lys og røgmaskine samlet. Alt hvad du skal bruge til den perfekte fest.
            </p>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-lg font-bold text-white">Party-højtaler</p>
                <p className="text-xl font-bold text-brand-400">399 kr</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-lg font-bold text-white">Lysbar</p>
                <p className="text-xl font-bold text-brand-400">500 kr</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-lg font-bold text-white">Røgmaskine</p>
                <p className="text-xl font-bold text-brand-400">250 kr</p>
              </div>
            </div>
            <Link
              href="/lej-hojtaler"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Se højtalerpakker
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* Final CTA */}
        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Klar til at lyse festen op?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online på 2 minutter. Hent fredag i København K, aflever mandag.
          </p>
          <a
            href="/#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book festlys nu
          </a>
        </section>

        <Footer />
      </main>
    </>
  );
}
