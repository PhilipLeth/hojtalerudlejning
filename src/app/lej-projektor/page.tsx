import { Metadata } from "next";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { LocationKicker } from "@/components/PhoneLink";

/**
 * /lej-projektor — kategorisiden for projektor, Pro og lærred.
 *
 * Navnet følger /lej-hojtaler og /lej-mikrofon. /projektor og /projektor-pro
 * er produktsider for hver sin maskine; det her er siden, der besvarer
 * spørgsmålet FØR man vælger — hvor lyst er rummet, og skal der lærred til.
 */
export const metadata: Metadata = {
  title: "Lej Projektor København | Alm., Pro 5000 lumen og lærred | Lejhøjtaler.dk",
  description:
    "Lej projektor i København fra 495 kr. Projektor Pro med 5000 lumen til oplyste lokaler 795 kr, lærred 160 cm 195 kr. HDMI og kabler følger med.",
  keywords: [
    "lej projektor",
    "projektor udlejning københavn",
    "projektor leje",
    "lej lærred",
    "projektor til konference",
    "projektor til filmaften",
    "5000 lumen projektor leje",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/lej-projektor" },
  openGraph: {
    title: "Lej Projektor København | Fra 495 kr | Lejhøjtaler.dk",
    description:
      "Almindelig projektor, Pro med 5000 lumen og lærred. HDMI og kabler følger med.",
    url: "https://lejhojtaler.dk/lej-projektor",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function LejProjektorPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: "https://lejhojtaler.dk" },
      { "@type": "ListItem", position: 2, name: "Projektorer", item: "https://lejhojtaler.dk/lej-projektor" },
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
            Lej projektor
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              fra 495 kr
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Almindelig til det mørke rum, Pro med 5000 lumen til det oplyste.
            Lærred hvis væggen ikke duer. HDMI følger med.
          </p>
          <a
            href="#projektorer"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Se projektorerne
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Lumen er det eneste tal der betyder noget, og det er svært at gætte */}
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-4">
          <h2 className="mb-2 text-center text-3xl font-bold">Almindelig eller Pro?</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            Det afhænger af én ting: hvor lyst der er i rummet.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-1 text-lg font-semibold text-white">Almindelig projektor</h3>
              <p className="mb-3 text-2xl font-bold text-brand-400">495 kr</p>
              <p className="text-sm text-white/50">
                3.800 lumen. Til filmaften i stuen, gårdhaven efter mørkets frembrud
                eller mødelokalet med gardinerne for. Billedet er skarpt, når lyset
                er dæmpet.
              </p>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-1 text-lg font-semibold text-white">Projektor Pro</h3>
              <p className="mb-3 text-2xl font-bold text-brand-400">795 kr</p>
              <p className="text-sm text-white/50">
                5.000 lumen. Til konferencen om formiddagen, messestanden og det store
                lærred. Holder billedet synligt, selv når loftslyset er tændt — og
                det er dét, man ikke kan fortryde på dagen.
              </p>
            </div>
          </div>
        </section>

        <section id="projektorer" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-2 text-center text-3xl font-bold">Projektor, lærred og skærm</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            Priserne er for hele lejeperioden — 1 til 5 dage koster det samme.
          </p>
          <CategoryProductGrid
            items={[
              { id: "projektor", href: "/projektor" },
              { id: "projektor_pro", href: "/projektor-pro", tag: "Til oplyste rum" },
              { id: "laerred_160", href: "/laerred-160" },
              { id: "skaerm_55", href: "/skaerm" },
              { id: "skaerm_32", href: "/skaerm-32" },
            ]}
          />
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Skal der være lyd på?</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Lyden fra en projektor er svag — den rækker til et lille mødelokale og
              ikke længere. Skal der vises film eller video med lyd, så lej en
              højtaler til. Det er den detalje, folk oftest opdager for sent.
            </p>
            <a
              href="/av-udstyr"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Se AV-pakker med lyd
            </a>
          </div>
        </section>

        <FaqSection items={CATEGORY_FAQ["lej-projektor"]} />
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}
