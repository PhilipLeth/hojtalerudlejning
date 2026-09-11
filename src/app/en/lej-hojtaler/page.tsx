import { Metadata } from "next";
import Link from "next/link";
import LivePrice, { LiveStartPrice } from "@/components/LivePrice";
import SpeakerCompare from "@/components/SpeakerCompare";
import BundleGrid from "@/components/BundleGrid";
import { FEST_LADDER_IDS, LYD_LEJLIGHEDSPAKKER, LYDMAND_PAKKER, startPrisDkk } from "@/lib/products";
import GoogleReviews from "@/components/GoogleReviews";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import { LocationKicker } from "@/components/PhoneLink";
import { localeAlternates } from "@/lib/hreflang";

/**
 * /en/lej-hojtaler — højtalerkategorien på engelsk.
 *
 * Den vigtigste af de manglende sider: /en solgte pakkerne, men der fandtes
 * ingen engelsk side, der samlede HELE højtalerudvalget, og menuens "All
 * speakers and packages" sendte derfor engelske kunder ind i dansk tekst.
 */
export const metadata: Metadata = {
  title: `Speaker Rental Copenhagen | From ${startPrisDkk()}/weekend | Lejhøjtaler.dk`,
  description:
    `Rent speakers in Copenhagen from ${startPrisDkk()}/weekend. Battery-powered speakers (Mackie Thump GO, Soundboks 4) and full PA packages. Cables included, pay on pickup. Book online.`,
  keywords: [
    "speaker rental copenhagen",
    "rent speakers copenhagen",
    "pa system rental copenhagen",
    "party speaker hire copenhagen",
    "sound system rental copenhagen",
    "speaker hire denmark",
    "loud speaker rental copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/lej-hojtaler",
    languages: localeAlternates("/lej-hojtaler"),
  },
  openGraph: {
    title: `Speaker Rental Copenhagen | From ${startPrisDkk()}/weekend`,
    description:
      `Battery-powered speakers and PA packages from ${startPrisDkk()}/weekend. Cables included, pay on pickup. Book online.`,
    url: "https://lejhojtaler.dk/en/lej-hojtaler",
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
      { "@type": "ListItem", position: 2, name: "Speaker rental", item: "https://lejhojtaler.dk/en/lej-hojtaler" },
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
            Speaker rental
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              in Copenhagen
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Battery speakers and PA packages{" "}
            <LiveStartPrice prefix="from " suffix=" DKK" /> — book online, pay when you collect.
          </p>
          <a
            href="/en#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book a speaker now
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <BundleGrid
          locale="en"
          ids={FEST_LADDER_IDS}
          title="Choose a system by number of guests"
          subtitle="Tell us how many are coming and the package is already put together — speakers, bass, stands, lights and cables in one."
        />
        <BundleGrid
          locale="en"
          ids={LYD_LEJLIGHEDSPAKKER}
          eyebrow="For the occasion"
          title="Packages built for what you are holding"
          subtitle="The same equipment, combined for what has to happen: speeches at the wedding, bass at the company party, battery when there is no power."
        />
        <BundleGrid
          locale="en"
          ids={LYDMAND_PAKKER}
          eyebrow="With a sound engineer"
          title="We arrive, set up and run the sound"
          subtitle="AV technician for 4 hours, with delivery, setup and collection included. For the party where none of you has to stand at the mixer."
        />

        <SpeakerCompare locale="en" bookLinks="booking" />

        <section className="mx-auto max-w-4xl px-4 pb-24">
          <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">Everything is included</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Pay on pickup</h3>
              <p className="mt-2 text-sm text-white/50">
                You pay the rental and nothing else. No hidden fees — settle when you collect.
              </p>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Cables included</h3>
              <p className="mt-2 text-sm text-white/50">
                Everything you need comes with it. Plug in and play.
              </p>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Carry bag available</h3>
              <p className="mt-2 text-sm text-white/50">
                The small party package fits in a carry bag. Easy to bring home by bike.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Add lights or fog to the party</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Party lights and a fog machine finish the job. Combine them and save.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/en/festlys"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                See party lights – <LivePrice productId="lys" prefix="from " suffix=" DKK" />
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

        <FaqSection items={CATEGORY_FAQ["en-lej-hojtaler"]} title="Frequently asked questions" />

        <GoogleReviews locale="en" />

        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to rent speakers?</h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online in 2 minutes. Collect on Friday in Copenhagen S, return Monday.{" "}
            <LiveStartPrice prefix="From " suffix=" DKK/weekend." />
          </p>
          <a
            href="/en#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book a speaker now
          </a>
        </section>

        <Footer locale="en" />
      </main>
    </>
  );
}
