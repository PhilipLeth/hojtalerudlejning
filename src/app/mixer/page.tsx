import { Metadata } from "next";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { LocationKicker } from "@/components/PhoneLink";

/**
 * /mixer — de to mixere.
 *
 * Egen side frem for en linje på mikrofonsiden, fordi "lej mixer" er en
 * selvstændig søgning, og fordi valget mellem de to kræver en forklaring:
 * det er effekterne, ikke kanalerne, folk reelt vælger den store for.
 *
 * Produktfotos mangler endnu — CategoryProductGrid viser navnet i en neutral
 * flade i stedet for at låne et andet produkts billede.
 */
export const metadata: Metadata = {
  title: "Lej Mixer København | 4-kanals og Yamaha m. effekter | Lejhøjtaler.dk",
  description:
    "Lej mixer i København. Simpel 4-kanals minimixer 295 kr, Yamaha-mixer med indbyggede effekter 395 kr. Til flere mikrofoner og musik i samme højtaler.",
  keywords: [
    "lej mixer",
    "mixer udlejning københavn",
    "lydmixer leje",
    "yamaha mixer leje",
    "mixer til band",
    "mixerpult leje",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/mixer" },
  openGraph: {
    title: "Lej Mixer København | Fra 295 kr | Lejhøjtaler.dk",
    description:
      "4-kanals minimixer eller Yamaha med indbyggede effekter. Samler mikrofoner og musik i én højtaler.",
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
            Når mere end én ting skal i højtaleren på samme tid — to mikrofoner
            og musik, eller et helt band.
          </p>
          <a
            href="#mixere"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Se de to mixere
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Valget står ikke på kanaler — det står på om der bliver sunget */}
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-4">
          <h2 className="mb-2 text-center text-3xl font-bold">Lille eller stor?</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            Det afhænger af, om der bliver sunget.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-1 text-lg font-semibold text-white">Mixer lille</h3>
              <p className="mb-3 text-2xl font-bold text-brand-400">295 kr</p>
              <p className="text-sm text-white/50">
                Simpel 4-kanals minimixer. Samler to mikrofoner og en musikkilde,
                så du kan skrue på hver for sig. Til talen med baggrundsmusik,
                receptionen og generalforsamlingen — dér hvor det bare skal virke.
              </p>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-1 text-lg font-semibold text-white">Mixer stor</h3>
              <p className="mb-3 text-2xl font-bold text-brand-400">395 kr</p>
              <p className="text-sm text-white/50">
                Yamaha med indbyggede effekter. Flere kanaler til band og kor —
                men det er rumklangen, der er grunden til at vælge den. Den får en
                stemme til at lyde som til en koncert frem for som en højtaler i
                et lokale.
              </p>
            </div>
          </div>
        </section>

        <section id="mixere" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-2 text-center text-3xl font-bold">Book en mixer</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            Prisen er for hele lejeperioden — 1 til 5 dage koster det samme.
          </p>
          <CategoryProductGrid
            items={[
              { id: "mixer_stor", tag: "Med effekter" },
              { id: "mixer_lille" },
            ]}
          />
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Mangler du mikrofoner eller højtalere?</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              En mixer er mellemleddet — den skal have noget at samle og noget at
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
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}
