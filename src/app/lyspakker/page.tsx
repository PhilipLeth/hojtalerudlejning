import { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import { KATEGORI_PAKKER, bundleListPrice, rentalProducts, type RentalProduct } from "@/lib/products";
import { bookHref } from "@/lib/bookUrl";
import { thumbSrcSet } from "@/lib/imageSrcSet";
import { localeAlternates } from "@/lib/hreflang";

/**
 * Landingssiden for lyspakkerne — det for lys, som /lydanlaeg er for lyd.
 *
 * Siden rendrer fra KATEGORI_PAKKER["/lyspakker"] og kataloget, så priser,
 * navne og "spar"-beløb aldrig kan drive fra bookingen. Kortene er skrevet
 * efter anledningen, ikke efter grejet: den der søger "lys til festtelt"
 * skal kunne genkende sin egen fest i overskriften.
 */

export const metadata: Metadata = {
  title: "Lej lys til festen — færdige lyspakker fra 695 kr | Lejhøjtaler.dk",
  description:
    "Lysudlejning i København: færdige lyspakker til teenagefest, festtelt, bryllup og dansegulv fra 695 kr. Alt er plug and play — hent selv, eller få det leveret.",
  keywords: [
    "lysudlejning",
    "lej festlys",
    "lys til fest leje",
    "lyspakke leje",
    "diskolys leje københavn",
    "lys til bryllup leje",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/lyspakker",
    languages: localeAlternates("/lyspakker"),
  },
  openGraph: {
    title: "Lej lys til festen — færdige lyspakker fra 695 kr",
    description:
      "Seks færdige lyspakker efter anledning: teenagefest, festtelt, bryllup, dansegulv — eller hele lokalet. Plug and play, uden tekniker.",
    url: "https://lejhojtaler.dk/lyspakker",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

function kr(n: number) {
  return n.toLocaleString("da-DK");
}

/** Anledningen øverst på kortet — det er den, folk søger på, ikke grejet. */
const KICKER: Record<string, string> = {
  "pakke_festtelt": "Festtelt & have",
  "pakke_diskolys": "Dansegulvet",
  "pakke_teenagefest": "Teenagefest",
  "pakke_stemningslys": "Hele lokalet",
  "pakke_bryllupslys": "Bryllup",
  "pakke_diskotek": "Lokale med røgalarm",
};

function Kort({ p, fremhaevet }: { p: RentalProduct; fremhaevet: boolean }) {
  const spar = bundleListPrice(p) - p.price;
  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-6 transition ${
        fremhaevet
          ? "border-brand-500/60 bg-brand-500/[0.07]"
          : "border-white/10 bg-white/[0.03] hover:border-white/25"
      }`}
    >
      {fremhaevet && (
        <span className="absolute -top-3 left-6 rounded-full bg-brand-500 px-3 py-0.5 text-xs font-bold text-black">
          Mest booket
        </span>
      )}
      <img
        loading="lazy"
        decoding="async"
        src={p.image}
        srcSet={thumbSrcSet(p.image)}
        sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
        alt={`${p.name_da} — ${(p.contents ?? []).join(", ")}`}
        className="mb-4 h-44 w-full rounded-xl object-contain"
      />
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">{KICKER[p.id]}</p>
      <h3 className="mt-1 text-2xl font-bold">{p.name_da}</h3>
      <p className="mt-2 flex-1 text-sm text-white/60">{p.bundle?.usecase_da ?? p.desc_da}</p>

      <ul className="mt-4 space-y-1 text-sm text-white/50">
        {(p.contents ?? []).map((c) => (
          <li key={c}>· {c}</li>
        ))}
      </ul>

      <p className="mt-4 text-3xl font-bold">
        {kr(p.price)} kr
        <span className="ml-1 text-sm font-normal text-white/40">/ weekend</span>
      </p>
      {spar > 0 && <p className="mt-1 text-xs font-semibold text-brand-400">Spar {kr(spar)} kr vs. delene enkeltvis</p>}

      <div className="mt-5 flex gap-2">
        <Link
          href={bookHref(p.id)}
          className={`flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition ${
            fremhaevet ? "bg-brand-500 text-black hover:bg-brand-400" : "border border-white/20 hover:border-white/40"
          }`}
        >
          Book nu
        </Link>
        {p.page && (
          <Link
            href={p.page}
            className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/70 transition hover:border-white/35"
          >
            Se pakken
          </Link>
        )}
      </div>
    </article>
  );
}

export default function LyspakkerPage() {
  const pakker = KATEGORI_PAKKER["/lyspakker"]
    .map((id) => rentalProducts.find((p) => p.id === id)!)
    .filter((p) => p && !p.hidden)
    .sort((a, b) => a.price - b.price);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: "https://lejhojtaler.dk" },
      { "@type": "ListItem", position: 2, name: "Lyspakker", item: "https://lejhojtaler.dk/lyspakker" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="relative px-4 pb-10 pt-24 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-400">
          København · Lysudlejning
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold sm:text-5xl">
          Lys til festen — pakket efter anledningen
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-white/60">
          Du skal ikke vide hvad en uplight er. Sig hvad du holder — teenagefest, telt i haven, bryllup eller bare et
          dansegulv — så er lyset sat sammen på forhånd. Alt er plug and play på almindelig strøm.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pakker.map((p) => (
            <Kort key={p.id} p={p} fremhaevet={p.id === "pakke_stemningslys"} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Må der bruges røg?</h2>
          <p className="mb-6 text-white/50">
            Så bliver lyset en anden liga: strålerne bliver synlige i luften, og effekterne ligner et show. Lysshow-pakkerne
            har røgmaskinen med — men tjek lokalets røgalarm først. Er røg forbudt, er Diskotek-pakken bygget til netop det.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/lysshow"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Se Lysshow med røg
            </Link>
            <Link
              href="/festlys"
              className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35"
            >
              Lej delene enkeltvis
            </Link>
          </div>
        </div>
      </section>

      <FaqSection items={CATEGORY_FAQ["lyspakker"]} />

      <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Klar til at lyse festen op?</h2>
        <p className="mx-auto mt-4 max-w-md text-white/50">
          Book online på 2 minutter. Hent gratis i København S, eller få det leveret og sat op.
        </p>
        <a
          href="/?product=lys#book"
          className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
        >
          Book lys nu
        </a>
      </section>

      <Footer />
    </>
  );
}
