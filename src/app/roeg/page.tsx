import { Metadata } from "next";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import CategoryProductGrid from "@/components/CategoryProductGrid";

export const metadata: Metadata = {
  title: "Lej Røgmaskine & Low Fog København | Røggulv med is | Lejhøjtaler.dk",
  description:
    "Lej røg til festen i København: klassisk røgmaskine fra 245 kr inkl. røgvæske. Low fog-maskine (røggulv med is) er på vej. Betal ved afhentning.",
  keywords: [
    "lej røgmaskine",
    "low fog maskine leje",
    "røggulv bryllup",
    "dansen på skyer",
    "heavy fog leje",
    "røgmaskine københavn",
    "low fog københavn",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/roeg" },
  openGraph: {
    title: "Lej Røgmaskine & Low Fog København | Lejhøjtaler.dk",
    description:
      "Klassisk røgmaskine fra 245 kr inkl. røgvæske. Book online.",
    url: "https://lejhojtaler.dk/roeg",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function RoegPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: "https://lejhojtaler.dk" },
      { "@type": "ListItem", position: 2, name: "Røg", item: "https://lejhojtaler.dk/roeg" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero */}
      <section className="relative flex min-h-[55vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div
          className="fixed inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url(/images/hero.png)" }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            København · Betal ved afhentning · Ring 31 13 28 52
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Lej røg til festen
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              fra 245 kr.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Klassisk røgmaskine der fylder rummet og gør lysshowet 10x federe.
            Inkl. røgvæske og fjernbetjening — klar på 5 minutter.
          </p>
          <a
            href="#produkter"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Se røgmaskinerne
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <section id="produkter" className="mx-auto max-w-4xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Vælg din røgmaskine
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
            Den klassiske røgmaskine fylder rummet og gør lysshowet 10x federe.
            Perfekt sammen med lysbar eller discokugle.
          </p>

          <CategoryProductGrid items={[{ id: "rog", href: "/roegmaskine" }]} />
          <p className="mt-8 text-center text-sm text-white/40">
            Low fog-maskine (røggulv med is — &quot;dansen på skyer&quot;) er på vej. Ring 31 13 28 52 og hør nærmere.
          </p>
        </section>

        {/* Upsell */}
        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Røg er bedst med lys og lyd
            </h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Kombiner med lysbar og en højtalerpakke, så festen sidder lige i skabet.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/festlys"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                Se festlys
              </Link>
              <Link
                href="/"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                Se højtalere
              </Link>
            </div>
          </div>
        </section>

        <Testimonials />
        <Footer />
      </main>
    </>
  );
}
