import { Metadata } from "next";
import GoogleReviews from "@/components/GoogleReviews";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { LocationKicker } from "@/components/PhoneLink";
import { localeAlternates } from "@/lib/hreflang";
import { localizedHref } from "@/lib/enPages";

/**
 * /en/lej-mikrofon — den engelske udgave af mikrofon-kategorisiden.
 *
 * Slug'en er den danske, fordi EN_PAGES parrer sider på præcis den sti; det er
 * hreflang-parret og ikke ordet i URL'en, Google bruger til at forstå, at de to
 * sider er hinandens oversættelse. Titel, brødtekst og keywords er derimod
 * skrevet på engelsk — søgningen er "microphone rental copenhagen".
 */
export const metadata: Metadata = {
  title: "Microphone Rental Copenhagen | Wireless, Headset & Shure from 95 DKK | Lejhøjtaler.dk",
  description:
    "Rent a microphone in Copenhagen. Wireless microphone from 295 DKK, Shure BLX 595 DKK, wireless headset from 345 DKK and wired handheld from 95 DKK. Plugs straight into our speakers.",
  keywords: [
    "microphone rental copenhagen",
    "rent a microphone copenhagen",
    "wireless microphone rental copenhagen",
    "headset microphone rental copenhagen",
    "shure microphone hire copenhagen",
    "microphone rental for speeches",
    "karaoke microphone rental copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/lej-mikrofon",
    languages: localeAlternates("/lej-mikrofon"),
  },
  openGraph: {
    title: "Microphone Rental Copenhagen | From 95 DKK | Lejhøjtaler.dk",
    description:
      "Wireless, headset and wired. Plugs straight into our speakers — no mixer needed.",
    url: "https://lejhojtaler.dk/en/lej-mikrofon",
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
      { "@type": "ListItem", position: 2, name: "Microphones", item: "https://lejhojtaler.dk/en/lej-mikrofon" },
    ],
  };

  const valg = [
    {
      titel: "For speeches at the dinner",
      svar: "A wireless handheld. It gets passed between the speakers, and you can lower it when you are not talking.",
      grej: "Wireless microphone — 295 DKK, or Shure BLX 595 DKK",
    },
    {
      titel: "For the person who talks for a long time",
      svar: "A headset. The teacher or the toastmaster needs both hands and has to move around without the sound rising and falling.",
      grej: "Wireless headset — 345 DKK, PRO 595 DKK",
    },
    {
      titel: "For karaoke and parties",
      svar: "Two wireless ones. Someone always wants to sing along, and one microphone has to move on to the next song.",
      grej: "Two wireless microphones — 295 DKK each",
    },
    {
      titel: "When it stays in one place",
      svar: "Wired. If the microphone is going to stay at the lectern anyway, there is no reason to pay for wireless.",
      grej: "Wired handheld — 95 DKK, Shure 395 DKK",
    },
  ];

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
            Microphone rental
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              from 95 DKK
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Wireless, headset or wired — all of them plug straight into our
            speakers. No mixer needed, every cable included.
          </p>
          <a
            href="#microphones"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            See the microphones
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Valget står sjældent mellem modeller — det står mellem situationer */}
        <section className="mx-auto max-w-5xl px-4 pt-16 pb-4">
          <h2 className="mb-2 text-center text-3xl font-bold">Which one do you need?</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            The question is not which model, but what has to happen.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {valg.map((v) => (
              <div key={v.titel} className="glass rounded-2xl p-6">
                <h3 className="mb-2 text-lg font-semibold text-white">{v.titel}</h3>
                <p className="mb-3 text-sm text-white/50">{v.svar}</p>
                <p className="rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-brand-400">{v.grej}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="microphones" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-2 text-center text-3xl font-bold">All microphones</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            Prices are for the whole rental period — 1 to 5 days costs the same.
          </p>
          <CategoryProductGrid
            locale="en"
            items={[
              { id: "traadloes_mikrofon_pro", href: "/traadloes-mikrofon-pro", tag: "Best for speeches" },
              { id: "traadloes_mikrofon", href: "/traadloes-mikrofon" },
              { id: "headset_pro", href: "/headset-pro" },
              { id: "headset", href: "/headset-mikrofon" },
              { id: "haandholdt_mikrofon_pro", href: "/haandholdt-mikrofon-pro" },
              { id: "haandholdt_mikrofon", href: "/haandholdt-mikrofon" },
            ]}
          />
        </section>

        {/* Mixeren er svaret på "kan vi have to mikrofoner og musik på én gang" */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-2 flex flex-wrap items-baseline justify-center gap-3">
            <h2 className="text-center text-3xl font-bold">More than one microphone at a time?</h2>
            <a href={localizedHref("/mixer", "en")} className="text-sm text-brand-400 hover:underline">
              Small or large mixer? →
            </a>
          </div>
          <p className="mx-auto mb-10 max-w-xl text-center text-white/50">
            One microphone goes straight into the speaker. If two microphones and
            music have to run at the same time, the mixer is what ties it together.
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
            <h2 className="mb-4 text-2xl font-bold text-white">Nothing to play it through?</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              A microphone needs a speaker. Our speaker packages cover everything
              from a courtyard to a rented venue — and they all take a microphone.
            </p>
            <a
              href="/en"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              See speaker packages
            </a>
          </div>
        </section>

        <FaqSection items={CATEGORY_FAQ["en-lej-mikrofon"]} title="Frequently asked questions" />
        <GoogleReviews locale="en" />
        <Footer locale="en" />
      </main>
    </>
  );
}
