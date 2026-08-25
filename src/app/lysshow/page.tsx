import { Metadata } from "next";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import BundleGrid from "@/components/BundleGrid";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { LYSSHOW_PAKKER } from "@/lib/products";
import { LocationKicker } from "@/components/PhoneLink";

/**
 * /lysshow — kategorisiden for lys som helhed.
 *
 * Adressen fandtes i en tændt annoncegruppe, længe før siden gjorde: AG 6
 * pegede på /lysshow, som gav 404, og blev derfor flyttet til /festlys i
 * ads-export/rebuild_lys_lyd_ads.py. Nu hvor siden findes, kan den flyttes
 * tilbage — /festlys handler om enkeltdelene, det her om pakkerne.
 */
export const metadata: Metadata = {
  title: "Lej Lysshow København | Lys, discokugle og røg fra 1.045 kr | Lejhøjtaler.dk",
  description:
    "Lej et færdigt lysshow i København. Lyseffekter, discokugle, uplights og røgmaskine samlet i pakker fra 1.045 kr. Vi leverer og sætter op.",
  keywords: [
    "lej lysshow",
    "lysshow til fest",
    "lys til fest leje",
    "discolys udlejning",
    "lyseffekter leje københavn",
    "uplights leje",
    "røgmaskine og lys",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/lysshow" },
  openGraph: {
    title: "Lej Lysshow København | Fra 1.045 kr | Lejhøjtaler.dk",
    description:
      "Færdige lyspakker med effekter, discokugle, uplights og røg. Book online.",
    url: "https://lejhojtaler.dk/lysshow",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function LysshowPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: "https://lejhojtaler.dk" },
      { "@type": "ListItem", position: 2, name: "Lysshow", item: "https://lejhojtaler.dk/lysshow" },
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
            Lej et lysshow
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              til festen
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Lyseffekter, discokugle og røg der gør strålerne synlige. Færdige
            pakker, så du ikke skal gætte hvad der mangler.
          </p>
          <a
            href="#pakker"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Se lyspakkerne
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <div id="pakker">
          <BundleGrid
            ids={LYSSHOW_PAKKER}
            eyebrow="Lyspakker"
            title="Tre færdige lysshows"
            subtitle="Sat sammen så delene passer til hinanden — og billigere end at leje dem hver for sig."
          />
        </div>

        {/* Hvorfor røg — det spørgsmål der afgør om lysshowet virker */}
        <section className="mx-auto max-w-3xl px-4 pb-16">
          <div className="glass rounded-2xl p-8">
            <h2 className="mb-3 text-2xl font-bold text-white">Røgen er ikke pynt</h2>
            <p className="text-white/60">
              En lysstråle kan kun ses, hvis der er noget i luften at ramme. Uden røg
              får du farvede pletter på væggen. Med røg bliver selve strålen synlig, og
              det er dét, der ligner et show. Er du i tvivl om ét tilvalg, er det den
              her — og skal røgalarmen have fred, er low fog svaret, for den lægger
              røgen som et tæppe på gulvet i stedet for op i luften.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="mb-2 text-center text-3xl font-bold">Enkeltdele</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            Mangler du kun én ting, kan alt lejes hver for sig.
          </p>
          <CategoryProductGrid
            items={[
              { id: "lys", href: "/lys-pakke" },
              { id: "lyseffekt", href: "/enkelt-lyseffekt" },
              { id: "discokugle", href: "/discokugle" },
              { id: "discokugle_30", href: "/discokugle" },
              { id: "uplight_4", href: "/uplights" },
              { id: "uplight", href: "/uplights" },
              { id: "lyskaeder", href: "/lyskaeder" },
              { id: "lyskaeder_farvet", href: "/lyskaeder" },
              { id: "rog", href: "/roegmaskine" },
              { id: "low_fog", href: "/roeg" },
            ]}
          />
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Skal der også være lyd?</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Lys uden musik er en oplyst stue. Vi har højtalerpakker til alt fra
              gårdhaven til festlokalet — og festpakkerne har lyset med.
            </p>
            <a
              href="/lej-hojtaler"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Se højtalerpakker
            </a>
          </div>
        </section>

        <FaqSection items={CATEGORY_FAQ["lysshow"]} />
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}
