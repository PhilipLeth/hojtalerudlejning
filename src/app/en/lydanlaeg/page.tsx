import { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import BundleGrid from "@/components/BundleGrid";
import { LADDER_LYD, SPEAKERPAKKER, ladderPrice, prisDkk, type LadderStep } from "@/lib/products";
import { bookHref } from "@/lib/bookUrl";
import { localizedHref } from "@/lib/enPages";
import { localeAlternates } from "@/lib/hreflang";
import { ogImages } from "@/lib/og";

export const metadata: Metadata = {
  title: `PA System Rental Copenhagen, by guest count | From ${prisDkk("party")} | Lejhøjtaler.dk`,
  description:
    `Rent a PA system in Copenhagen by how many guests are coming: up to 30, 30-50 or 50-100 people. Speakers, subwoofer and every cable, from ${prisDkk("party")} per weekend. Microphones and lighting can be added.`,
  keywords: [
    "pa system rental copenhagen",
    "sound system rental copenhagen",
    "pa hire for 100 people",
    "party sound system rental denmark",
    "event sound system rental copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/lydanlaeg",
    languages: localeAlternates("/lydanlaeg"),
  },
  openGraph: {
    images: ogImages(),
    title: "PA System Rental Copenhagen, by guest count",
    description:
      "Choose a system by how many are coming: up to 30, 30-50 or 50-100 guests. Speakers and cables, ready to set up.",
    url: "https://lejhojtaler.dk/en/lydanlaeg",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

function dkk(n: number) {
  return n.toLocaleString("da-DK");
}

function Step({ step, highlighted }: { step: LadderStep; highlighted: boolean }) {
  const pris = ladderPrice(step);
  const byQuote = pris === null;
  const href = byQuote
    ? localizedHref(step.href, "en")
    : step.productId
      ? bookHref(step.productId, "en")
      : localizedHref(step.href, "en");

  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-6 transition ${
        highlighted
          ? "border-brand-500/60 bg-brand-500/[0.07]"
          : "border-white/10 bg-white/[0.03] hover:border-white/25"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-6 rounded-full bg-brand-500 px-3 py-0.5 text-xs font-bold text-black">
          Most booked
        </span>
      )}
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">{step.gaester_en} guests</p>
      <h3 className="mt-1 text-2xl font-bold">{step.navn_en}</h3>
      <p className="mt-2 flex-1 text-sm text-white/60">{step.hvad_en}</p>

      <p className="mt-4 text-3xl font-bold">
        {byQuote ? "By quote" : `${dkk(pris!)} DKK`}
        {!byQuote && <span className="ml-1 text-sm font-normal text-white/40">/ weekend</span>}
      </p>
      <p className="mt-1 text-xs text-white/40">
        {step.koersel === "tilvalg" && "Collect it yourself, or add delivery + setup"}
        {step.koersel === "anbefalet" && "Delivery + setup recommended, 795 kr both ways"}
        {step.koersel === "tilbud" && "Delivery, setup and a technician are part of the quote"}
      </p>

      <div className="mt-5 flex gap-2">
        <Link
          href={href}
          className={`flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition ${
            highlighted
              ? "bg-brand-500 text-black hover:bg-brand-400"
              : "border border-white/20 hover:border-white/40"
          }`}
        >
          {byQuote ? "Get a quote" : "Book now"}
        </Link>
        {!byQuote && (
          <Link
            href={localizedHref(step.href, "en")}
            className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/70 transition hover:border-white/35"
          >
            See the package
          </Link>
        )}
      </div>
    </article>
  );
}

export default function Page() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://lejhojtaler.dk/en" },
      { "@type": "ListItem", position: 2, name: "PA systems", item: "https://lejhojtaler.dk/en/lydanlaeg" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="relative px-4 pb-10 pt-24 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-400">Sound system rental in Copenhagen</p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold sm:text-5xl">
          Choose a system by how many are coming
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-white/60">
          You should not have to guess at inches and watts. Tell us how many guests are coming and the speakers, the
          bass and the cables are already put together. Microphones and lighting you add yourself below.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <h2 className="mb-2 text-2xl font-bold">The system</h2>
        <p className="mb-6 max-w-2xl text-sm text-white/50">
          Speakers, a subwoofer from 50 guests, and every cable. This is the sound on its own, so you can add lighting
          or leave it out.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LADDER_LYD.map((step) => (
            <Step key={step.navn} step={step} highlighted={step.productId === "festival"} />
          ))}
        </div>
      </section>

      {/* Arkets afsnit 1.2: anlæg + mikrofon. Stadig ren lyd, så den hører her. */}
      <BundleGrid
        locale="en"
        ids={SPEAKERPAKKER}
        eyebrow="Is there a speech?"
        title="A system with a microphone"
        subtitle="The same system, with the microphone included. It plugs straight into the speaker, so no mixer is needed in between. Wireless if the speaker needs to move around."
      />

      {/* Festpakkerne har lysbar og røg med og hører derfor i arkets afsnit 3,
          ikke på en lydside. Her er det et link, ikke et kort. */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="mb-2 text-2xl font-bold">Do you want lighting too?</h2>
          <p className="mb-6 max-w-2xl text-sm text-white/60">
            The party packages are the same systems with a light bar and a fog machine in the price, and they cost less
            than hiring the parts separately. If you only want the sound, you are in the right place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/en/lej-hojtaler"
              className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400"
            >
              See the sound and light packages
            </Link>
            <Link
              href="/en/festlys"
              className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:border-brand-500/40 hover:text-white"
            >
              Lighting only
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="mb-2 text-2xl font-bold">For speeches and meetings</h2>
        <p className="mb-6 max-w-2xl text-sm text-white/50">
          If something has to be said, the microphone matters more than the bass. We rent out the sound and the
          microphone, projectors, screens and projector screens are paused, so those you will need elsewhere.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={localizedHref("/pakke-tale-musik", "en")}
            className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:border-brand-500/40 hover:text-white"
          >
            The speech &amp; music package
          </Link>
          <Link
            href="/en/lej-mikrofon"
            className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:border-brand-500/40 hover:text-white"
          >
            See all microphones
          </Link>
          <Link
            href="/en#foresp"
            className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:border-brand-500/40 hover:text-white"
          >
            More than two microphones? Get a quote
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-3 text-lg font-bold">The guest numbers are for indoors</h2>
          <p className="text-sm text-white/60">
            Four walls and a ceiling send the sound back to your guests. Outdoors, with no walls, it disappears, count
            on roughly half the guests per package out there, or go one step up. If you are unsure, call us: we have
            probably seen the venue before, or we can tell from a photo.
          </p>
          <p className="mt-4 text-sm text-white/60">
            Every system can be booked with delivery, setup and collection. From the large speaker package and up we
            recommend it, two 12&quot; speakers and a subwoofer weigh 48 kg and do not come home on a cargo bike.
          </p>
        </div>
      </section>

      <FaqSection items={CATEGORY_FAQ["en-lydanlaeg"]} title="Frequently asked questions" />

      <Footer locale="en" />
    </>
  );
}
