import { Metadata } from "next";
import GoogleReviews from "@/components/GoogleReviews";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { LocationKicker } from "@/components/PhoneLink";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Mixer Rental Copenhagen | From 295 DKK | Lejhøjtaler.dk",
  description:
    "Rent an audio mixer in Copenhagen from 295 DKK. A 4-channel mini mixer for two microphones and music, or a Yamaha with built-in effects for bands and choirs. Cables included.",
  keywords: [
    "mixer rental copenhagen",
    "audio mixer hire copenhagen",
    "sound mixer rental denmark",
    "mixing desk rental copenhagen",
    "pa mixer hire",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/mixer",
    languages: localeAlternates("/mixer"),
  },
  openGraph: {
    title: "Mixer Rental Copenhagen | From 295 DKK | Lejhøjtaler.dk",
    description:
      "A 4-channel mini mixer, or a Yamaha with built-in effects. For when more than one thing has to go into the speaker at once.",
    url: "https://lejhojtaler.dk/en/mixer",
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
      { "@type": "ListItem", position: 2, name: "Mixers", item: "https://lejhojtaler.dk/en/mixer" },
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
            Mixer rental
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              from 295 DKK
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            For when more than one thing has to go into the speaker at the same
            time — two microphones and music, or a whole band.
          </p>
          <a
            href="#mixers"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            See the two mixers
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Valget står ikke på kanaler — det står på om der bliver sunget */}
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-4">
          <h2 className="mb-2 text-center text-3xl font-bold">Small or large?</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            It depends on whether anyone is going to sing.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-1 text-lg font-semibold text-white">Small mixer</h3>
              <p className="mb-3 text-2xl font-bold text-brand-400">295 DKK</p>
              <p className="text-sm text-white/50">
                A simple 4-channel mini mixer. It gathers two microphones and one
                music source so you can set each one separately. For the speech
                with background music, the reception and the annual meeting —
                where it just has to work.
              </p>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-1 text-lg font-semibold text-white">Large mixer</h3>
              <p className="mb-3 text-2xl font-bold text-brand-400">395 DKK</p>
              <p className="text-sm text-white/50">
                A Yamaha with built-in effects. More channels for a band or a
                choir — but the reverb is the real reason to choose it. It makes a
                voice sound like a concert rather than a speaker in a room.
              </p>
            </div>
          </div>
        </section>

        <section id="mixers" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-2 text-center text-3xl font-bold">Book a mixer</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            The price covers the whole rental period — 1 to 5 days costs the same.
          </p>
          <CategoryProductGrid
            locale="en"
            items={[
              { id: "mixer_stor", tag: "With effects" },
              { id: "mixer_lille" },
            ]}
          />
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Missing microphones or speakers?</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              A mixer is the middle link — it needs something to gather and
              something to send on to. A single microphone has no use for one.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="/en/lej-mikrofon" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
                See microphones
              </a>
              <a href="/en/lej-hojtaler" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
                See speakers
              </a>
            </div>
          </div>
        </section>

        <FaqSection items={CATEGORY_FAQ["en-mixer"]} title="Frequently asked questions" />
        <GoogleReviews locale="en" />
        <Footer locale="en" />
      </main>
    </>
  );
}
