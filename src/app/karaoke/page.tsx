import { Metadata } from "next";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import BundleGrid from "@/components/BundleGrid";
import { LocationKicker } from "@/components/PhoneLink";

export const metadata: Metadata = {
  title: "Lej Karaoke København | Maskine, storskærm & lyd | Lejhøjtaler.dk",
  description:
    "Lej karaoke i København: Karaokepakker med maskine, skærm og højtalere fra 1.100 kr — spar op til 485 kr. Singing Machine med 2 trådløse mikrofoner. Book på 2 min.",
  keywords: [
    "lej karaoke",
    "karaoke maskine leje",
    "karaoke anlæg udlejning",
    "karaokemaskine københavn",
    "lej karaoke med skærm",
    "karaoke til fest",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/karaoke" },
  openGraph: {
    title: "Lej Karaoke København | Pakker fra 1.100 kr — spar op til 485 kr",
    description: "Karaokepakker fra 1.100 kr — spar op til 485 kr. Maskine, skærm og højtalere. Book online.",
    url: "https://lejhojtaler.dk/karaoke",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function KaraokePage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: "https://lejhojtaler.dk" },
      { "@type": "ListItem", position: 2, name: "Karaoke", item: "https://lejhojtaler.dk/karaoke" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Hero */}
      <section className="relative flex min-h-[55vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div className="fixed inset-0 bg-cover bg-center opacity-55" style={{ backgroundImage: "url(/images/hero.webp)" }} />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            <LocationKicker extra="Sikker onlinebetaling" />
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Lej karaoke til festen
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              pakker fra 1.100 kr.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Singing Machine med 2 trådløse mikrofoner, skærm til teksterne og festlys.
            Book en pakke og spar op til 485 kr i forhold til enkeltpriserne.
          </p>
          <a
            href="#pakker"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Se karaokepakkerne
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Pakker først — samme tilbudskort som på forsiden, med delene
            listet og "Spar X kr"-badge direkte på kortet */}
        <BundleGrid
          ids={["pakke_karaoke", "pakke_karaoke_fest"]}
          eyebrow="Spar op til 485 kr"
          title="Karaokepakkerne"
          subtitle="Maskine, skærm til teksterne og lyd der kan følge med — samlet til én pris. Markant billigere end at leje delene hver for sig."
        />

        {/* Enkeltdele */}
        <section id="produkter" className="mx-auto max-w-4xl px-4 pb-24">
          <h2 className="mb-4 text-center text-2xl font-bold sm:text-3xl">Eller lej delene enkeltvis</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
            Har du allerede skærm eller højtalere? Så lej bare det du mangler.
          </p>

          <CategoryProductGrid
            items={[
              { id: "karaoke" },
              { id: "skaerm_32", tag: "Ny" },
              { id: "skaerm_55" },
              { id: "festival" },
            ]}
          />
        </section>

        {/* Upsell */}
        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Gør karaoke-aftenen komplet</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Røgmaskine og festlys løfter stemningen, når højskolesangbogen bliver til stadionrock.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/roeg" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
                Se røgmaskiner
              </Link>
              <Link href="/festlys" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
                Se festlys
              </Link>
            </div>
          </div>
        </section>

        <FaqSection items={CATEGORY_FAQ["karaoke"]} />

        <Testimonials />
        <Footer />
      </main>
    </>
  );
}
