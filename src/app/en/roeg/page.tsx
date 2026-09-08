import { Metadata } from "next";
import LivePrice from "@/components/LivePrice";
import { prisDkk } from "@/lib/products";
import Link from "next/link";
import GoogleReviews from "@/components/GoogleReviews";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { LocationKicker } from "@/components/PhoneLink";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Fog & Low Fog Machine Rental Copenhagen | Fog floor with ice | Lejhøjtaler.dk",
  description:
    `Rent fog for your party in Copenhagen: a classic fog machine from ${prisDkk("rog")} including fluid, or a low fog machine that lays a carpet of fog on the floor for the first dance. Pay on pickup.`,
  keywords: [
    "fog machine rental copenhagen",
    "smoke machine rental copenhagen",
    "low fog machine hire copenhagen",
    "dancing on clouds wedding copenhagen",
    "dry ice effect rental denmark",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/roeg",
    languages: localeAlternates("/roeg"),
  },
  openGraph: {
    title: "Fog & Low Fog Machine Rental Copenhagen | Lejhøjtaler.dk",
    description: `Classic fog machine from ${prisDkk("rog")} including fluid. Book online.`,
    url: "https://lejhojtaler.dk/en/roeg",
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
      { "@type": "ListItem", position: 2, name: "Fog", item: "https://lejhojtaler.dk/en/roeg" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="relative flex min-h-[55vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
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
            Rent fog for the party
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              <LivePrice productId="rog" prefix="from " suffix=" DKK" />
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            A classic fog machine that fills the room and makes the light show ten
            times better. Fluid and remote included — ready in 5 minutes.
          </p>
          <a
            href="#products"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            See the fog machines
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <section id="products" className="mx-auto max-w-4xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">Choose your fog machine</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
            The classic fog machine fills the room and makes the light show ten
            times better. The low fog machine lays a carpet of fog along the floor
            — the &quot;dancing on clouds&quot; effect from weddings and music videos.
          </p>

          <CategoryProductGrid
            locale="en"
            items={[{ id: "rog", href: "/roegmaskine" }, { id: "low_fog", tag: "New" }]}
          />
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Fog is best with light and sound</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Combine it with a light bar and a speaker package, and the party lands exactly right.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/en/festlys"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                See party lights
              </Link>
              <Link
                href="/en/lej-hojtaler"
                className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
              >
                See speakers
              </Link>
            </div>
          </div>
        </section>

        <FaqSection items={CATEGORY_FAQ["en-roeg"]} title="Frequently asked questions" />

        <GoogleReviews locale="en" />
        <Footer locale="en" />
      </main>
    </>
  );
}
