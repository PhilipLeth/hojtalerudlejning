import { Metadata } from "next";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import BundleGrid from "@/components/BundleGrid";
import PausetKategori from "@/components/PausetKategori";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { AV_PAKKER } from "@/lib/products";
import { LocationKicker } from "@/components/PhoneLink";

/**
 * /av-udstyr efter pausen.
 *
 * Projektor, skærm og lærred er taget ud af sortimentet (se PAUSEDE_PRODUKTER
 * i src/lib/products.ts), og siden er derfor skåret ned til det, den stadig
 * kan levere: mikrofoner og lyd til mødet. Den siger selv, at billedet er på
 * pause — ellers ville den, der kom efter en projektor, lede forgæves.
 */
export const metadata: Metadata = {
  title: "Lej AV-udstyr København | Mikrofoner og lyd til møder | Lejhøjtaler.dk",
  description:
    "Lej mikrofon og lyd til møder og konferencer i København. Trådløs mikrofon fra 295 kr, headset fra 345 kr og højtalere med mikrofon fra 1.045 kr. Projektor, skærm og lærred er på pause.",
  keywords: [
    "lej av-udstyr",
    "av udstyr udlejning",
    "lej mikrofon",
    "mikrofon til konference",
    "lyd til møde leje",
    "av-udstyr til event",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/av-udstyr" },
  openGraph: {
    title: "Lej AV-udstyr København | Mikrofoner og lyd til møder | Lejhøjtaler.dk",
    description:
      "Trådløs mikrofon fra 295 kr, headset fra 345 kr og højtalere med mikrofon. Book online.",
    url: "https://lejhojtaler.dk/av-udstyr",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function AVUdstyrPage() {
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
        name: "AV-udstyr",
        item: "https://lejhojtaler.dk/av-udstyr",
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
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
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
            Lej AV-udstyr
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              til dit event
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Mikrofon og lyd til talen, mødet og konferencen. Projektor, skærm og
            lærred udlejer vi ikke lige nu.
          </p>
          <a
            href="#mikrofoner"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Se mikrofoner
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Pakkerne først. Siden havde før hverken pakker eller produktlinks —
            alt AV-udstyr kunne kun findes gennem menuen, og da menuen blev
            kortet ned, ville det have været usynligt. */}
        <BundleGrid
          ids={AV_PAKKER}
          eyebrow="AV-pakke"
          title="Færdig opsætning"
          subtitle="Højtalere og trådløs mikrofon sat sammen til talen — billigere end delene hver for sig."
        />

        {/* Højtalere hørte ikke til her før, og det var forkert: et møde
            uden lyd er lige så ubrugeligt som et uden billede, og
            Speakerpakken har mikrofonen med. */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="mb-2 text-center text-3xl font-bold">Lyd til mødet</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            Et lokale med mere end tyve mennesker kræver forstærkning — en stemme
            rækker ikke bagest i salen. Speakerpakken er højtaler og mikrofon i ét.
          </p>
          <CategoryProductGrid
            items={[
              { id: "pakke_speaker_mik", tag: "Højtaler + mikrofon" },
              { id: "party", href: "/hojtalerpakke-lille" },
              { id: "festival", href: "/hojtalerpakke-normal" },
              { id: "soundboks", href: "/soundboks-4" },
            ]}
          />
        </section>

        <section id="mikrofoner" className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-2 flex flex-wrap items-baseline justify-center gap-3">
            <h2 className="text-center text-3xl font-bold">Mikrofoner</h2>
            <a href="/lej-mikrofon" className="text-sm text-brand-400 hover:underline">
              Se alle mikrofoner →
            </a>
          </div>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            Alle går direkte i højtaleren — der skal ikke en mixer imellem.
          </p>
          <CategoryProductGrid
            items={[
              { id: "traadloes_mikrofon_pro", href: "/traadloes-mikrofon-pro", tag: "Bedst til tale" },
              { id: "traadloes_mikrofon", href: "/traadloes-mikrofon" },
              { id: "headset_pro", href: "/headset-pro" },
              { id: "headset", href: "/headset-mikrofon" },
              { id: "haandholdt_mikrofon_pro", href: "/haandholdt-mikrofon-pro" },
              { id: "haandholdt_mikrofon", href: "/haandholdt-mikrofon" },
            ]}
          />
        </section>

        <PausetKategori
          hvad="projektor, skærm og lærred"
          detalje="Billedet er på pause, lyden er ikke: mikrofoner og højtalere til mødet står klar."
        />

        {/* Upsell */}
        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Brug for højtalere til festen?
            </h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Vi har også professionelle højtalere og festudstyr til leje.
              Kombiner med AV-udstyr for det komplette setup.
            </p>
            <a
              href="/lydanlaeg"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Se højtalerpakker
            </a>
          </div>
        </section>

        <FaqSection items={CATEGORY_FAQ["av-udstyr"]} />

        <Testimonials />
        <Footer />
      </main>
    </>
  );
}
