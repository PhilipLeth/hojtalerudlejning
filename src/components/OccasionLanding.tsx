import Link from "next/link";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { bookHref } from "@/lib/bookUrl";
import { PhoneText, LivePhoneCopy } from "@/components/PhoneLink";

export interface OccasionTip {
  title: string;
  text: string;
}

export interface OccasionFaq {
  q: string;
  a: string;
}

export interface OccasionLandingProps {
  /** URL-slug uden skråstreg, fx "konfirmation" */
  slug: string;
  /** H1 — skal bære søgeordet, fx "Lyd til konfirmation" */
  headline: string;
  /** Gul del af H1, fx "fra 500 kr." */
  headlinePrice: string;
  /** Kort salgstekst under H1 */
  intro: string;
  /** Anbefalet pakke: id + hvorfor lige den */
  primaryProductId: string;
  primaryName: string;
  primaryPrice: number;
  primaryWhy: string;
  /** Produkter der vises i gridet (anbefalet først) */
  gridItems: Array<{ id: string; href?: string; tag?: string }>;
  /** Praktiske råd til netop denne lejlighed */
  tips: OccasionTip[];
  faq: OccasionFaq[];
  /** Interne links til beslægtede lejligheder */
  related?: Array<{ href: string; label: string }>;
}

/**
 * Landingsside for en lejlighed (konfirmation, bryllup, julefrokost …).
 * Modsat et blogindlæg SÆLGER siden: anbefalet pakke med pris og bookingknap
 * øverst, praktiske råd under, FAQ til long tail.
 */
export default function OccasionLanding({
  slug,
  headline,
  headlinePrice,
  intro,
  primaryProductId,
  primaryName,
  primaryPrice,
  primaryWhy,
  gridItems,
  tips,
  faq,
  related = [],
}: OccasionLandingProps) {
  const book = bookHref(primaryProductId);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: "https://lejhojtaler.dk" },
      { "@type": "ListItem", position: 2, name: headline, item: `https://lejhojtaler.dk/${slug}` },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Hero */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div className="fixed inset-0 bg-cover bg-center opacity-55" style={{ backgroundImage: "url(/images/hero.png)" }} />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            København · Book online på 2 min · Ring <PhoneText />
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {headline}
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              {headlinePrice}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg text-white/60">{intro}</p>
          <a
            href={book}
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book {primaryName} — {primaryPrice} kr
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Anbefaling: pakke, pris, bookingknap */}
        <section className="mx-auto max-w-4xl px-4 py-20 sm:py-24">
          <div className="mb-12 rounded-3xl border border-brand-500/25 bg-gradient-to-br from-brand-500/[0.08] via-white/[0.03] to-transparent p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
              Vores anbefaling
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{primaryName}</h2>
            <p className="mt-3 max-w-xl text-white/60">{primaryWhy}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="text-3xl font-bold text-brand-400">
                {primaryPrice} kr
                <span className="ml-1 text-sm font-normal text-white/40">/weekend</span>
              </span>
              <a
                href={book}
                className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400 active:scale-95"
              >
                Book nu
              </a>
            </div>
          </div>

          <h2 className="mb-4 text-center text-2xl font-bold sm:text-3xl">Populært til {headline.toLowerCase().replace(/^lyd til |^højtaler til /, "")}</h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-white/50">
            Alt kan bookes online — én pris for op til 5 dages leje.
          </p>
          <CategoryProductGrid items={gridItems} />
        </section>

        {/* Praktiske råd */}
        <section className="mx-auto max-w-4xl px-4 pb-20">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">Godt at vide</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {tips.map((t) => (
              <div key={t.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="mb-2 font-semibold text-white">{t.title}</h3>
                <p className="text-sm text-white/50"><LivePhoneCopy text={t.text} /></p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-20">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">Ofte stillede spørgsmål</h2>
          <div className="space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <summary className="cursor-pointer list-none font-semibold text-white marker:hidden">
                  <span className="flex items-start justify-between gap-4">
                    {f.q}
                    <span className="mt-1 shrink-0 text-brand-400 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-white/50"><LivePhoneCopy text={f.a} /></p>
              </details>
            ))}
          </div>
        </section>

        <Testimonials />

        {/* CTA + interne links */}
        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Klar til at booke?</h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online på 2 minutter. Hent i København K eller få det leveret. Betal ved afhentning eller online.
          </p>
          <a
            href={book}
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book {primaryName} — {primaryPrice} kr
          </a>
          {related.length > 0 && (
            <p className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-white/40">
              {related.map((r) => (
                <Link key={r.href} href={r.href} className="transition hover:text-brand-400">
                  {r.label}
                </Link>
              ))}
            </p>
          )}
        </section>

        <Footer />
      </main>
    </>
  );
}
