import { Metadata } from "next";
import GoogleReviews from "@/components/GoogleReviews";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import MixerRange from "@/components/MixerRange";
import { LocationKicker } from "@/components/PhoneLink";
import { localeAlternates } from "@/lib/hreflang";

/** Vælg mixer efter samtidige mikrofoner og musikkilder. */
export const metadata: Metadata = {
  title: "Lej Mixer København | 4, 6 og 8 mikrofonindgange | Lejhøjtaler.dk",
  description:
    "Lej mixer i København. t.mix 1202 FX USB med 6 mikrofonindgange til 395 kr. Lille og stor model på forespørgsel fra 295 kr.",
  keywords: [
    "lej mixer",
    "mixer udlejning københavn",
    "lydmixer leje",
    "t.mix mixer leje",
    "mixer til band",
    "mixerpult leje",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/mixer",
    languages: localeAlternates("/mixer"),
  },
  openGraph: {
    title: "Lej Mixer København | Fra 295 kr | Lejhøjtaler.dk",
    description:
      "Tre mixerklasser med 4, 6 eller 8 mikrofonindgange. t.mix 1202 FX USB med effekter og stereo-USB til møde, panel og band.",
    url: "https://lejhojtaler.dk/mixer",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function MixerPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: "https://lejhojtaler.dk" },
      { "@type": "ListItem", position: 2, name: "Mixer", item: "https://lejhojtaler.dk/mixer" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div className="fixed inset-0 bg-cover bg-center opacity-55" style={{ backgroundImage: "url(/images/hero.webp)" }} />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />
        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            <LocationKicker extra="Betal ved afhentning" />
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Lej mixer
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              fra 295 kr
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Når mere end én ting skal i højtaleren på samme tid, to mikrofoner
            og musik, eller et helt band.
          </p>
          <a
            href="#mixere"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Se de tre mixerklasser
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <MixerRange locale="da" />

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Mangler du mikrofoner eller højtalere?</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              En mixer er mellemleddet, den skal have noget at samle og noget at
              sende videre til. Én mikrofon alene har ikke brug for den.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="/lej-mikrofon" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
                Se mikrofoner
              </a>
              <a href="/lej-hojtaler" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
                Se højtalere
              </a>
            </div>
          </div>
        </section>

        <FaqSection items={CATEGORY_FAQ["mixer"]} />
        <GoogleReviews />
        <Footer />
      </main>
    </>
  );
}
