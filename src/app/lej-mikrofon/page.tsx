import { Metadata } from "next";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { LocationKicker } from "@/components/PhoneLink";

/**
 * /lej-mikrofon — kategorisiden for mikrofoner.
 *
 * Navnet følger /lej-hojtaler, fordi det er sådan folk søger: "lej mikrofon",
 * ikke "mikrofoner". Mikrofonerne lå før kun spredt på /av-udstyr sammen med
 * projektorer og skærme, hvor den, der leder efter en mikrofon til en tale,
 * ikke ville kigge.
 */
export const metadata: Metadata = {
  title: "Lej Mikrofon København | Trådløs, headset og Shure fra 95 kr | Lejhøjtaler.dk",
  description:
    "Lej mikrofon i København. Trådløs mikrofon fra 295 kr, Shure BLX 595 kr, trådløst headset fra 345 kr og håndholdt med kabel fra 95 kr. Passer direkte i vores højtalere.",
  keywords: [
    "lej mikrofon",
    "mikrofon udlejning københavn",
    "trådløs mikrofon leje",
    "headset mikrofon leje",
    "shure mikrofon leje",
    "mikrofon til tale",
    "mikrofon til karaoke",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/lej-mikrofon" },
  openGraph: {
    title: "Lej Mikrofon København | Fra 95 kr | Lejhøjtaler.dk",
    description:
      "Trådløs, headset og håndholdt. Passer direkte i vores højtalere — ingen mixer nødvendig.",
    url: "https://lejhojtaler.dk/lej-mikrofon",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function LejMikrofonPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: "https://lejhojtaler.dk" },
      { "@type": "ListItem", position: 2, name: "Mikrofoner", item: "https://lejhojtaler.dk/lej-mikrofon" },
    ],
  };

  const valg = [
    {
      titel: "Til taler ved middagen",
      svar: "Håndholdt trådløs. Den bliver sendt rundt mellem talerne, og man kan holde den ned, når man ikke taler.",
      grej: "Trådløs mikrofon — 295 kr, eller Shure BLX 595 kr",
    },
    {
      titel: "Til den der taler længe",
      svar: "Headset. Underviseren eller toastmasteren skal kunne bruge hænderne og gå rundt, uden at lyden svinger.",
      grej: "Trådløst headset — 345 kr, PRO 595 kr",
    },
    {
      titel: "Til karaoke og fest",
      svar: "To trådløse. Der er altid en, der skal synge med, og en mikrofon, der skal videre til næste sang.",
      grej: "To trådløse mikrofoner — 295 kr stykket",
    },
    {
      titel: "Når den står ét sted",
      svar: "Kabel. Skal mikrofonen alligevel blive ved talerstolen, er der ingen grund til at betale for trådløs.",
      grej: "Håndholdt med kabel — 95 kr, Shure 395 kr",
    },
  ];

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
            Lej mikrofon
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              fra 95 kr
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Trådløs, headset eller kabel — alle går direkte i vores højtalere.
            Ingen mixer nødvendig, alle kabler følger med.
          </p>
          <a
            href="#mikrofoner"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Se mikrofonerne
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Valget står sjældent mellem modeller — det står mellem situationer */}
        <section className="mx-auto max-w-5xl px-4 pt-16 pb-4">
          <h2 className="mb-2 text-center text-3xl font-bold">Hvilken skal du bruge?</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            Spørgsmålet er ikke hvilken model, men hvad der skal ske.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {valg.map((v) => (
              <div key={v.titel} className="glass rounded-2xl p-6">
                <h3 className="mb-2 text-lg font-semibold text-white">{v.titel}</h3>
                <p className="mb-3 text-sm text-white/50">{v.svar}</p>
                <p className="rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-brand-400">{v.grej}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="mikrofoner" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-2 text-center text-3xl font-bold">Alle mikrofoner</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            Priserne er for hele lejeperioden — 1 til 5 dage koster det samme.
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

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Mangler du noget at spille i?</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Mikrofonen skal have en højtaler. Speakerpakken er stor højtalerpakke
              plus mikrofon i ét — til arrangementet hvor der både skal spilles og tales.
            </p>
            <a
              href="/lej-hojtaler"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Se højtalerpakker
            </a>
          </div>
        </section>

        <FaqSection items={CATEGORY_FAQ["lej-mikrofon"]} />
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}
