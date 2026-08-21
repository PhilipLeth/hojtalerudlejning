import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import SiteText from "@/components/SiteText";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";

export const metadata: Metadata = {
  title:
    "Billigste Højtalerudlejning København | Fra 395 kr | Lejhøjtaler.dk",
  description:
    "Københavns billigste højtalerudlejning fra 395 kr/weekend. Lej højtalere, PA-anlæg, lys og røgmaskine. Afhentning i København S eller levering. Book online på 2 min.",
  keywords: [
    "billigste højtalerudlejning københavn",
    "billig højtaler leje københavn",
    "lej højtaler københavn billigt",
    "højtalerudlejning københavn pris",
    "lydudlejning københavn billig",
    "PA anlæg udlejning københavn",
    "højtaler til fest københavn",
    "festudstyr leje københavn",
    "lej lydanlæg københavn",
    "soundboks alternativ københavn",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/kobenhavn" },
  openGraph: {
    title: "Billigste Højtalerudlejning København | Fra 395 kr",
    description:
      "Københavns billigste højtalerudlejning fra 395 kr/weekend. PA-anlæg, lys og røgmaskine til leje. Book online.",
    url: "https://lejhojtaler.dk/kobenhavn",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function KobenhavnPage() {
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
        name: "København",
        item: "https://lejhojtaler.dk/kobenhavn",
      },
    ],
  };

  // LocalBusiness-markup bygges af indstillingerne — se LocalBusinessJsonLd

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <LocalBusinessJsonLd
        extra={{
          name: "Lejhøjtaler.dk",
          description:
            "Københavns billigste højtalerudlejning. Lej højtalere, PA-anlæg, lys og røgmaskine fra 395 kr/weekend.",
          url: "https://lejhojtaler.dk/kobenhavn",
        }}
      />

      {/* Hero */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div
          className="fixed inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url(/images/hero.webp)" }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            K&oslash;benhavn S &middot; Fra 395 kr/weekend
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Billigste h&oslash;jtalerudlejning
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              i K&oslash;benhavn
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Professionel lyd til din fest fra 395 kr.
            <br />
            Afhent i K&oslash;benhavn S eller f&aring; det leveret.
          </p>
          <a
            href="/#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book h&oslash;jtaler nu
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Pricing comparison */}
        <section className="mx-auto max-w-4xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Sammenlign priser p&aring; h&oslash;jtalerudlejning i K&oslash;benhavn
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
            Vi tilbyder K&oslash;benhavns laveste priser p&aring; professionelt lydudstyr. Ingen skjulte gebyrer — du betaler f&oslash;rst ved afhentning.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Lille pakke */}
            <div className="glass rounded-2xl p-8">
              <div className="mb-4 overflow-hidden rounded-xl">
                <Image
                  src="/images/product-party.webp"
                  alt="Lille højtalerpakke til fest i København"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white">
                Lille h&oslash;jtalerpakke
              </h3>
              <p className="mt-1 text-sm text-white/50">
                2&times; 10&quot; Alto TS410 &middot; 12 kg total &middot; Kabler inkluderet
              </p>
              <p className="mt-4 text-3xl font-bold text-brand-400">
                395 kr<span className="text-lg font-normal text-white/40">/weekend</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/60">
                <li>&bull; Perfekt til lejlighed, g&aring;rdhave, privat fest</li>
                <li>&bull; Passer i taske &ndash; nem at tage p&aring; cyklen</li>
                <li>&bull; Hent fredag, aflever mandag</li>
              </ul>
            </div>

            {/* Stor pakke */}
            <div className="glass rounded-2xl p-8">
              <div className="mb-4 overflow-hidden rounded-xl">
                <Image
                  src="/images/product-festival.webp"
                  alt="Stor højtalerpakke til fest i København"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white">
                Stor h&oslash;jtalerpakke
              </h3>
              <p className="mt-1 text-sm text-white/50">
                2&times; 12&quot; EV ZLX-12BT &middot; Bluetooth &middot; Kabler inkluderet
              </p>
              <p className="mt-4 text-3xl font-bold text-brand-400">
                495 kr<span className="text-lg font-normal text-white/40">/weekend</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/60">
                <li>&bull; Til st&oslash;rre rum, fester og udend&oslash;rs events</li>
                <li>&bull; Kraftig, klar lyd med Bluetooth</li>
                <li>&bull; Hent fredag, aflever mandag</li>
              </ul>
            </div>
          </div>

          {/* Addons */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-lg font-bold text-white">Festlys</p>
              <p className="text-2xl font-bold text-brand-400">495 kr</p>
              <p className="mt-1 text-xs text-white/40">LED-lysbar med effekter</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-lg font-bold text-white">R&oslash;gmaskine</p>
              <p className="text-2xl font-bold text-brand-400">245 kr</p>
              <p className="mt-1 text-xs text-white/40">Inkl. r&oslash;gv&aelig;ske</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-lg font-bold text-white">H&oslash;jtalerstativer</p>
              <p className="text-2xl font-bold text-brand-400">95 kr</p>
              <p className="mt-1 text-xs text-white/40">Par af professionelle stativer</p>
            </div>
          </div>
        </section>

        {/* Why cheapest */}
        <section className="mx-auto max-w-4xl px-4 pb-24">
          <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            Derfor er vi K&oslash;benhavns billigste
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Betal ved afhentning</h3>
              <p className="mt-2 text-sm text-white/50">
                Du betaler kun lejen. Ingen skjulte gebyrer eller depositum.
              </p>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Kabler inkluderet</h3>
              <p className="mt-2 text-sm text-white/50">
                Alt hvad du skal bruge er med. Tilslut og spil.
              </p>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">K&oslash;benhavn S</h3>
              <p className="mt-2 text-sm text-white/50">
                Afhentning p&aring; Amager. Eller billig levering i hele K&oslash;benhavn — kun 495 kr inkl. ops&aelig;tning og afhentning.
              </p>
            </div>
          </div>
        </section>

        {/* Soundboks comparison */}
        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Bedre end en Soundboks &ndash; og billigere
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="pb-3 text-white/40">&nbsp;</th>
                    <th className="pb-3 font-semibold text-brand-400">Lejh&oslash;jtaler.dk</th>
                    <th className="pb-3 font-semibold text-white/60">Soundboks leje</th>
                  </tr>
                </thead>
                <tbody className="text-white/60">
                  <tr className="border-b border-white/5">
                    <td className="py-3">Pris/weekend</td>
                    <td className="py-3 font-semibold text-brand-400">Fra 395 kr</td>
                    <td className="py-3">500-800 kr</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3">Lyd</td>
                    <td className="py-3">Professionel PA-lyd</td>
                    <td className="py-3">Bluetooth-h&oslash;jtaler</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3">Str&oslash;m</td>
                    <td className="py-3">Stikkontakt (uafbrudt)</td>
                    <td className="py-3">Batteri (l&oslash;ber ud)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3">Depositum</td>
                    <td className="py-3 font-semibold text-brand-400">Ingen</td>
                    <td className="py-3">Ofte 1.000+ kr</td>
                  </tr>
                  <tr>
                    <td className="py-3">Kabler</td>
                    <td className="py-3 font-semibold text-brand-400">Inkluderet</td>
                    <td className="py-3">Kun Bluetooth</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Area coverage */}
        <section className="mx-auto max-w-4xl px-4 pb-24">
          <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            Vi d&aelig;kker hele K&oslash;benhavn
          </h2>
          <div className="glass rounded-2xl p-8">
            <div className="grid gap-4 sm:grid-cols-2 text-sm text-white/60">
              <div>
                <h3 className="mb-2 font-semibold text-white">Afhentning (gratis)</h3>
                <p><SiteText>{"{{afhentningsadresse}}"}</SiteText></p>
                <p className="mt-1 text-white/40"><SiteText>{"{{aabningstider}}"}</SiteText></p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-white">Billig levering (495 kr inkl. ops&aelig;tning)</h3>
                <p>Hele Stork&oslash;benhavn: Indre By, &Oslash;sterbro, N&oslash;rrebro, Vesterbro, Frederiksberg, Amager, Valby, Vanl&oslash;se, Br&oslash;nsh&oslash;j</p>
                <p className="mt-1 text-white/40">Vi bringer udstyret ud, s&aelig;tter det op og henter det igen — alt inkluderet i prisen</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <FaqSection items={CATEGORY_FAQ["kobenhavn"]} />

        <Testimonials />

        {/* Final CTA */}
        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Klar til K&oslash;benhavns billigste festlyd?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online p&aring; 2 minutter. Hent fredag i K&oslash;benhavn S, aflever mandag. Fra 395 kr/weekend.
          </p>
          <a
            href="/#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book h&oslash;jtaler nu
          </a>
        </section>

        <Footer />
      </main>
    </>
  );
}
