import { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import { LADDER_FEST, type LadderStep } from "@/lib/products";
import { bookHref } from "@/lib/bookUrl";

export const metadata: Metadata = {
  title: "Lydanlæg til leje — pakker efter antal gæster | Lejhøjtaler.dk",
  description:
    "Lej lydanlæg i København efter hvor mange gæster der kommer: 50, 100, 150 eller 250 personer. Færdige pakker med højtalere, sub, lys og røg — levering og opsætning kan tilvælges.",
  keywords: [
    "lej lydanlæg",
    "lydanlæg til fest",
    "pa anlæg leje",
    "musikanlæg til fest leje",
    "lydanlæg 100 personer",
    "lydanlæg 200 personer",
    "anlæg til firmafest",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/lydanlaeg" },
  openGraph: {
    title: "Lydanlæg til leje — pakker efter antal gæster",
    description:
      "Vælg anlæg efter hvor mange der kommer: 50, 100, 150 eller 250 gæster. Færdige pakker, klar til at blive stillet op.",
    url: "https://lejhojtaler.dk/lydanlaeg",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

function kr(n: number) {
  return n.toLocaleString("da-DK");
}

function Trin({ step, fremhaevet }: { step: LadderStep; fremhaevet: boolean }) {
  const erTilbud = step.pris === null;
  const href = erTilbud ? step.href : step.productId ? bookHref(step.productId) : step.href;

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
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">{step.gaester} gæster</p>
      <h3 className="mt-1 text-2xl font-bold">{step.navn}</h3>
      <p className="mt-2 flex-1 text-sm text-white/60">{step.hvad}</p>

      <p className="mt-4 text-3xl font-bold">
        {erTilbud ? "Efter tilbud" : `${kr(step.pris!)} kr`}
        {!erTilbud && <span className="ml-1 text-sm font-normal text-white/40">/ weekend</span>}
      </p>
      <p className="mt-1 text-xs text-white/40">
        {step.koersel === "tilvalg" && "Hent selv, eller tilvælg levering + opsætning"}
        {step.koersel === "anbefalet" && "Levering + opsætning anbefales — 795 kr begge veje"}
        {step.koersel === "tilbud" && "Levering, opsætning og tekniker er med i tilbuddet"}
      </p>

      <div className="mt-5 flex gap-2">
        <Link
          href={href}
          className={`flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition ${
            fremhaevet
              ? "bg-brand-500 text-black hover:bg-brand-400"
              : "border border-white/20 hover:border-white/40"
          }`}
        >
          {erTilbud ? "Få et tilbud" : "Book nu"}
        </Link>
        {!erTilbud && (
          <Link
            href={step.href}
            className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/70 transition hover:border-white/35"
          >
            Se pakken
          </Link>
        )}
      </div>
    </article>
  );
}

export default function LydanlaegPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: "https://lejhojtaler.dk" },
      { "@type": "ListItem", position: 2, name: "Lydanlæg", item: "https://lejhojtaler.dk/lydanlaeg" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="relative px-4 pb-10 pt-24 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-400">København · Lyd til events</p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold sm:text-5xl">
          Vælg anlæg efter hvor mange der kommer
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-white/60">
          Du skal ikke gætte på tommer og watt. Sig hvor mange gæster der kommer, så er pakken sat sammen på forhånd —
          højtalere, bas, stativer, lys og kabler i ét.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <h2 className="mb-6 text-2xl font-bold">Til fest</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LADDER_FEST.map((step) => (
            <Trin key={step.navn} step={step} fremhaevet={step.productId === "pakke_fest_150"} />
          ))}
        </div>
      </section>

      {/* Konference-stigen er væk: alle tre trin havde projektor eller skærm
          med, og det udlejer vi ikke lige nu. Lyden til en tale kan vi stadig,
          og det er den, afsnittet lover — hverken mere eller mindre. */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-2 text-2xl font-bold">Til taler og møder</h2>
        <p className="mb-6 max-w-2xl text-sm text-white/50">
          Skal der siges noget, er mikrofonen vigtigere end bassen. Vi udlejer lyden og mikrofonen —
          projektor, lærred og skærm er på pause, så dem skal du have et andet sted fra.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/pakke-tale-musik"
            className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400"
          >
            Tale &amp; musik-pakken
          </Link>
          <Link
            href="/lej-mikrofon"
            className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:border-brand-500/40 hover:text-white"
          >
            Se alle mikrofoner
          </Link>
          <Link
            href="/erhverv#tilbud"
            className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:border-brand-500/40 hover:text-white"
          >
            Flere end to mikrofoner? Få et tilbud
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-3 text-lg font-bold">Gæstetallene gælder indendørs</h2>
          <p className="text-sm text-white/60">
            Fire vægge og et loft sender lyden tilbage til gæsterne. Udendørs uden vægge forsvinder den — regn dér med
            cirka det halve antal gæster pr. pakke, eller gå ét trin op. Er du i tvivl, så ring: vi har set stedet før,
            eller også kan vi se det på et billede.
          </p>
          <p className="mt-4 text-sm text-white/60">
            Alle pakker kan bookes med levering, opsætning og afhentning. Fra Festpakke 150 og op anbefaler vi det —
            fire højtalere og en subwoofer kommer ikke hjem på en ladcykel.
          </p>
        </div>
      </section>

      <FaqSection items={CATEGORY_FAQ["lydanlaeg"]} />

      <Footer />
    </>
  );
}
