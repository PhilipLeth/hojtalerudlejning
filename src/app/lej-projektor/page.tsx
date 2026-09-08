import { Metadata } from "next";
import BundleGrid from "@/components/BundleGrid";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import Footer from "@/components/Footer";
import GoogleReviews from "@/components/GoogleReviews";
import { LocationKicker } from "@/components/PhoneLink";

/**
 * /lej-projektor — kategorisiden for projektor, lærred og skærm.
 *
 * Siden var en ren beskedside under pausen fra august til 8. september 2026.
 * Den sælger igen — og den er vigtig: "lej storskærm"-søgningerne alene giver
 * ~350 visninger om måneden på position 8-16 i Google.
 */
export const metadata: Metadata = {
  title: "Lej projektor og storskærm i København | Fra 195 kr | Lejhøjtaler.dk",
  description:
    "Lej projektor, lærred og storskærm i København. Projektor fra 495 kr, 55\" skærm fra 595 kr og lærred fra 195 kr. Til møde, konference og filmaften. Book online.",
  keywords: [
    "lej projektor",
    "projektor udlejning københavn",
    "lej storskærm",
    "leje af storskærm",
    "lej lærred",
    "storskærm til event",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/lej-projektor" },
  openGraph: {
    title: "Lej projektor og storskærm i København | Fra 195 kr",
    description:
      "Projektor fra 495 kr, 55\" storskærm fra 595 kr og lærred fra 195 kr. Book online.",
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

      <section className="relative flex min-h-[55vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div className="fixed inset-0 bg-cover bg-center opacity-55" style={{ backgroundImage: "url(/images/hero.webp)" }} />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            <LocationKicker extra="Betal ved afhentning" />
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Lej projektor og storskærm
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              i København
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Skærm eller projektor? Skærmen skal bare have strøm og et HDMI-kabel.
            Projektoren giver et større billede, men vil helst have mørke.
          </p>
          <a
            href="#billede"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Se priser
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <section id="billede" className="mx-auto max-w-6xl px-4 pt-16 pb-16">
          <h2 className="mb-2 text-center text-3xl font-bold">Billede</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            Til et møde med op til tyve mennesker er en skærm på stativ det nemmeste.
            Skal hele salen kunne se med — eller skal det være filmaften — er
            projektor og lærred vejen.
          </p>
          <CategoryProductGrid
            items={[
              { id: "skaerm_55", href: "/skaerm", tag: "Nemmest" },
              { id: "skaerm_32", href: "/skaerm-32" },
              { id: "projektor", href: "/projektor" },
              { id: "projektor_pro", href: "/projektor-pro", tag: "Skarp i dagslys" },
              { id: "laerred_160", href: "/laerred-160" },
            ]}
          />
        </section>

        <BundleGrid
          ids={["pakke_filmaften"]}
          eyebrow="Pakke"
          title="Filmaften i baghaven"
          subtitle="Projektor, lærred og højtalere sat sammen — billigere end delene hver for sig."
        />

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Skal der også holdes tale?</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Billedet er kun den halve historie. Mikrofon og højtalere til mødet
              eller konferencen står på AV-siden — også som færdige pakker.
            </p>
            <a
              href="/av-udstyr"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Se AV-udstyr og mikrofoner
            </a>
          </div>
        </section>

        <GoogleReviews />
        <Footer />
      </main>
    </>
  );
}
