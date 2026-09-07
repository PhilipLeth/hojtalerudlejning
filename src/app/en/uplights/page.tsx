import { Metadata } from "next";
import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import GoogleReviews from "@/components/GoogleReviews";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import { buildProductFaq } from "@/lib/productFaq";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { LocationKicker } from "@/components/PhoneLink";
import { localeAlternates } from "@/lib/hreflang";
import { catalogPrice, prisTekst } from "@/lib/products";

/** Rabatten på 4-pakken er fire enkelte minus pakken — slås op, skrives ikke. */
const SPAR_UPLIGHT_4 = `Save ${prisTekst(4 * catalogPrice("uplight") - catalogPrice("uplight_4"))} DKK`;

export const metadata: Metadata = {
  title: "Uplighting Rental Copenhagen | From 125 DKK | Lejhøjtaler.dk",
  description:
    "Rent uplights in Copenhagen from 125 DKK each, or 395 DKK for a 4-pack. Simple LED floor uplights — plug and play for weddings, confirmations and parties. Pay on pickup.",
  keywords: [
    "uplighting rental copenhagen",
    "uplight rental copenhagen",
    "wedding uplighting hire copenhagen",
    "led uplight rental denmark",
    "venue lighting rental copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/uplights",
    languages: localeAlternates("/uplights"),
  },
  openGraph: {
    title: "Uplighting Rental Copenhagen | From 125 DKK",
    description:
      "Simple LED floor uplights — 125 DKK each or 395 DKK for a 4-pack. Book online.",
    url: "https://lejhojtaler.dk/en/uplights",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://lejhojtaler.dk/en" },
      { "@type": "ListItem", position: 2, name: "Uplights", item: "https://lejhojtaler.dk/en/uplights" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div
          className="fixed inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url(/images/hero.webp)" }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            <LocationKicker locale="en" extra="Pay on pickup" />
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Uplighting rental in Copenhagen
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              from 125 DKK
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Simple LED uplights that stand on the floor — put them in the corners and
            wash the walls in colour. Plug and play.
          </p>
          <a
            href="/en?product=uplight_4#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book uplights now
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <section id="products" className="mx-auto max-w-4xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">Choose how many</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
            A single uplight for a small room — or the 4-pack for a venue, a wedding
            or a confirmation. Turn off the ceiling light and let the uplights do the work.
          </p>
          <CategoryProductGrid
            locale="en"
            items={[
              { id: "uplight" },
              { id: "uplight_4", tag: SPAR_UPLIGHT_4 },
            ]}
          />
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Add sound and fog</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Uplights set the mood — speakers and a fog machine make it a party.
              Book it all in one go.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/en"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                See speaker packages
              </Link>
              <Link
                href="/en/roegmaskine"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                See the fog machine – <LivePrice productId="rog" prefix="" suffix=" DKK" />
              </Link>
            </div>
          </div>
        </section>

        <FaqSection
          items={buildProductFaq({
            locale: "en",
            name: "Uplights",
            price: 125,
            productId: "uplight",
            phrase: "an uplight",
          })}
          title="Frequently asked questions about uplights"
        />

        <GoogleReviews locale="en" />

        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to light up the room?</h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online in 2 minutes. Collect on Friday in Copenhagen S, return Monday.
          </p>
          <a
            href="/en?product=uplight#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book uplights now
          </a>
        </section>

        <Footer locale="en" />
      </main>
    </>
  );
}
