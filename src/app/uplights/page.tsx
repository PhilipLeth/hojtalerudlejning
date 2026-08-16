import { Metadata } from "next";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { LocationKicker } from "@/components/PhoneLink";

export const metadata: Metadata = {
  title: "Lej Uplights København | Fra 125 kr | Lejhøjtaler.dk",
  description:
    "Lej uplights i København fra 125 kr/stk eller 395 kr for 4-pak. Simple LED uplights på gulv — plug and play til bryllup, konfirmation og fest. Betal ved afhentning.",
  keywords: [
    "lej uplights københavn",
    "uplight udlejning",
    "uplights til fest",
    "uplight bryllup",
    "LED uplight leje",
    "uplights leje billigt",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/uplights" },
  openGraph: {
    title: "Lej Uplights København | Fra 125 kr",
    description:
      "Simple LED uplights på gulv — 125 kr/stk eller 395 kr for 4-pak. Book online.",
    url: "https://lejhojtaler.dk/uplights",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function UplightsPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: "https://lejhojtaler.dk" },
      { "@type": "ListItem", position: 2, name: "Uplights", item: "https://lejhojtaler.dk/uplights" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div
          className="fixed inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url(/images/hero.webp)" }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            <LocationKicker extra="Betal ved afhentning" />
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Lej uplights i København
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              fra 125 kr.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Simple LED uplights på gulv — sæt dem i hjørnerne og få farvet lys op ad væggene. Plug and play.
          </p>
          <a
            href="/?product=uplight_4#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book uplights nu
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <section id="produkter" className="mx-auto max-w-4xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">Vælg antal uplights</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
            Enkelt uplight til små rum — eller 4-pak til festlokale, bryllup og konfirmation.
            Sluk loftlyset og lad uplights klare stemningen.
          </p>
          <CategoryProductGrid
            items={[
              { id: "uplight" },
              { id: "uplight_4", tag: "Spar 105,-" },
            ]}
          />
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Kombiner med lyd og røg</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Uplights giver stemning — højtalere og røgmaskine giver festen. Book det hele samlet.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/lej-hojtaler"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                Se højtalerpakker
              </Link>
              <Link
                href="/roegmaskine"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                Se røgmaskine – 245 kr
              </Link>
            </div>
          </div>
        </section>

        <Testimonials />

        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Klar til at lyse lokalet op?</h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online på 2 minutter. Hent fredag i København K, aflever mandag.
          </p>
          <a
            href="/?product=uplight#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book uplights nu
          </a>
        </section>

        <Footer />
      </main>
    </>
  );
}
