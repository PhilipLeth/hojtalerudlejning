import { Metadata } from "next";
import GoogleReviews from "@/components/GoogleReviews";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import BundleGrid from "@/components/BundleGrid";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { LYSSHOW_PAKKER } from "@/lib/products";
import { LocationKicker } from "@/components/PhoneLink";
import { localeAlternates } from "@/lib/hreflang";

/**
 * /en/lysshow — de færdige lyspakker på engelsk.
 *
 * /en/festlys sælger enkeltdelene; den her sælger pakkerne. Det er samme
 * arbejdsdeling som på dansk, og den er værd at holde: den, der søger
 * "party light rental copenhagen", vil se priser på dele, mens den, der søger
 * "lighting package for wedding", vil se en færdig løsning.
 */
export const metadata: Metadata = {
  title: "Light Show Rental Copenhagen | Lights, Disco Ball & Fog from 1.045 DKK | Lejhøjtaler.dk",
  description:
    "Rent a complete light show in Copenhagen. Light effects, disco ball, uplights and a fog machine in ready-made packages from 1.045 DKK. We deliver and set it up.",
  keywords: [
    "light show rental copenhagen",
    "lighting package rental copenhagen",
    "event lighting hire copenhagen",
    "wedding lighting rental copenhagen",
    "uplighting rental copenhagen",
    "disco lighting rental denmark",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/lysshow",
    languages: localeAlternates("/lysshow"),
  },
  openGraph: {
    title: "Light Show Rental Copenhagen | From 1.045 DKK | Lejhøjtaler.dk",
    description:
      "Ready-made lighting packages with effects, disco ball, uplights and fog. Book online.",
    url: "https://lejhojtaler.dk/en/lysshow",
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
      { "@type": "ListItem", position: 2, name: "Light show", item: "https://lejhojtaler.dk/en/lysshow" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div className="fixed inset-0 bg-cover bg-center opacity-55" style={{ backgroundImage: "url(/images/hero.webp)" }} />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />
        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            <LocationKicker locale="en" extra="Pay on pickup" />
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Rent a light show
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              for the party
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Light effects, a disco ball and the fog that makes the beams visible.
            Ready-made packages, so you do not have to guess what is missing.
          </p>
          <a
            href="#pakker"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            See the lighting packages
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <div id="pakker">
          <BundleGrid
            locale="en"
            ids={LYSSHOW_PAKKER}
            eyebrow="Lighting packages"
            title="Three ready-made light shows"
            subtitle="Put together so the parts match — and cheaper than renting them one by one."
          />
        </div>

        {/* Hvorfor røg — det spørgsmål der afgør om lysshowet virker */}
        <section className="mx-auto max-w-3xl px-4 pb-16">
          <div className="glass rounded-2xl p-8">
            <h2 className="mb-3 text-2xl font-bold text-white">The fog is not decoration</h2>
            <p className="text-white/60">
              A beam of light can only be seen if there is something in the air for it
              to hit. Without fog you get coloured dots on the wall. With it the beam
              itself becomes visible, and that is what looks like a show. If you are
              unsure about one single add-on, this is the one — and if the smoke alarm
              has to stay quiet, low fog is the answer, because it lays the fog along
              the floor instead of sending it up into the air.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="mb-2 text-center text-3xl font-bold">Individual parts</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            If you are only missing one thing, everything can be rented separately.
          </p>
          <CategoryProductGrid
            locale="en"
            items={[
              { id: "lys", href: "/lys-pakke" },
              { id: "lyseffekt", href: "/enkelt-lyseffekt" },
              { id: "discokugle", href: "/discokugle" },
              { id: "discokugle_30", href: "/discokugle" },
              { id: "uplight_4", href: "/uplights" },
              { id: "uplight", href: "/uplights" },
              { id: "lyskaeder", href: "/lyskaeder" },
              { id: "lyskaeder_farvet", href: "/lyskaeder" },
              { id: "rog", href: "/roegmaskine" },
              { id: "low_fog", href: "/roeg" },
            ]}
          />
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Do you need sound as well?</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Light without music is a well-lit living room. We have speaker packages
              for everything from a courtyard to a rented venue — and the party
              packages come with the lights included.
            </p>
            <a
              href="/en"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              See speaker packages
            </a>
          </div>
        </section>

        <FaqSection items={CATEGORY_FAQ["en-lysshow"]} title="Frequently asked questions" />
        <GoogleReviews locale="en" />
        <Footer locale="en" />
      </main>
    </>
  );
}
