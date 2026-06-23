import { Metadata } from "next";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import AVBookingWizard from "@/components/AVBookingWizard";

export const metadata: Metadata = {
  title: "Lej AV-udstyr København | Projektor, Skærm, Mikrofon | Lejhøjtaler.dk",
  description:
    "Lej AV-udstyr i København. Projektor fra 500 kr, storskærm fra 600 kr, trådløs mikrofon fra 300 kr. Perfekt til præsentationer, konferencer og events.",
  keywords: [
    "lej av-udstyr",
    "av udstyr udlejning",
    "lej projektor",
    "lej skærm",
    "lej mikrofon",
    "av-udstyr til event",
    "præsentationsudstyr leje",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/av-udstyr" },
  openGraph: {
    title: "Lej AV-udstyr København | Projektor, Skærm, Mikrofon | Lejhøjtaler.dk",
    description:
      "Projektor fra 500 kr, storskærm fra 600 kr, trådløs mikrofon fra 300 kr. Book online.",
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
          style={{ backgroundImage: "url(/images/hero.png)" }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            København · Ingen depositum
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Lej AV-udstyr
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              til dit event
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Fortæl os om dit event — vi sammensætter den perfekte pakke
            med projektor, skærm, mikrofon og mere.
          </p>
          <a
            href="#av-book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Sammensæt din pakke
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* AV Booking Wizard */}
        <AVBookingWizard />

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
              href="/"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Se højtalerpakker
            </a>
          </div>
        </section>

        <Testimonials />
        <Footer />
      </main>
    </>
  );
}
