import { Metadata } from "next";
import Link from "next/link";
import LivePrice, { LiveStartPrice } from "@/components/LivePrice";
import GoogleReviews from "@/components/GoogleReviews";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import { buildProductFaq } from "@/lib/productFaq";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { LocationKicker } from "@/components/PhoneLink";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Fairy Light Rental Copenhagen | From 195 DKK | Lejhøjtaler.dk",
  description:
    "Rent fairy lights in Copenhagen from 195 DKK per weekend. 10 m string lights in warm white or colour — for garden parties, weddings and birthdays. Pay on pickup.",
  keywords: [
    "fairy lights rental copenhagen",
    "string lights hire copenhagen",
    "wedding lighting rental copenhagen",
    "garden party lighting rental",
    "festoon lights rental denmark",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/lyskaeder",
    languages: localeAlternates("/lyskaeder"),
  },
  openGraph: {
    title: "Fairy Light Rental Copenhagen | From 195 DKK",
    description:
      "10 m of fairy lights — warm white or coloured. From 195 DKK per weekend. Book online.",
    url: "https://lejhojtaler.dk/en/lyskaeder",
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
      { "@type": "ListItem", position: 2, name: "Fairy lights", item: "https://lejhojtaler.dk/en/lyskaeder" },
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
            Fairy light rental in Copenhagen
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              from 195 DKK
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            10 m string lights — choose warm white or coloured bulbs. Right for any party.
          </p>
          <a
            href="/en?product=lyskaeder#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book fairy lights now
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <section id="products" className="mx-auto max-w-4xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">Choose your string</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
            Two versions — both 10 m, with a power supply and cable ties for hanging.
            Made for garden parties, weddings and birthdays.
          </p>
          <CategoryProductGrid locale="en" items={[{ id: "lyskaeder" }, { id: "lyskaeder_farvet" }]} />
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Add sound and light</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Fairy lights work beautifully next to speakers and a disco ball. Book
              the whole party in one go.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/en"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                See speakers – <LiveStartPrice prefix="from " suffix=" DKK" />
              </Link>
              <Link
                href="/en/discokugle"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                See the disco ball – <LivePrice productId="discokugle" prefix="" suffix=" DKK" />
              </Link>
            </div>
          </div>
        </section>

        <FaqSection
          items={buildProductFaq({
            locale: "en",
            name: "Fairy lights",
            price: 195,
            productId: "lyskaeder",
            phrase: "fairy lights",
          })}
          title="Frequently asked questions about fairy lights"
        />

        <GoogleReviews locale="en" />

        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to set the mood?</h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online in 2 minutes. Collect on Friday in Copenhagen S, return Monday.
          </p>
          <a
            href="/en?product=lyskaeder#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book fairy lights now
          </a>
        </section>

        <Footer locale="en" />
      </main>
    </>
  );
}
