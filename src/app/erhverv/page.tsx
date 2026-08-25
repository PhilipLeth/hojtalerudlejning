import type { Metadata } from "next";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import TopBar from "@/components/TopBar";
import PhoneLink from "@/components/PhoneLink";
import EventInquiryForm from "@/components/EventInquiryForm";
import LivePrice from "@/components/LivePrice";
import { prisKr, rentalProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Erhverv — Lyd, lys og AV til professionelle events | Lejhøjtaler.dk",
  description:
    "Professionelt udstyr til firmafester, konferencer og events i København. Højtalere, mikrofoner, festlys og røg til leje — vi leverer og sætter op.",
  // Uden denne arvede siden root-layoutets canonical og pegede dermed på
  // forsiden — altså bad den Google om ikke at indeksere /erhverv. Det er
  // landingssiden for PMax-asset group 08 og AG 32 i søgekampagnen.
  alternates: { canonical: "https://lejhojtaler.dk/erhverv" },
};

const useCases = [
  {
    title: "Firmafest",
    desc: "Kraftig lyd og stemningslys til din firmafest eller julefrokost. Vi leverer og sætter op — I nyder festen.",
    equipment: "Stor højtalerpakke + lys-pakke + røgmaskine",
    icon: "🎉",
  },
  {
    title: "Konference & seminar",
    desc: "Trådløs mikrofon og højtalere på stativer, så taleren kan høres bagest i salen — også uden at hæve stemmen.",
    equipment: "2× 12\" højtalere + Shure trådløs mikrofon + headset",
    icon: "🎤",
  },
  {
    title: "Produktlancering",
    desc: "Imponér gæsterne med professionel lyd og lys. Vi klarer opsætningen.",
    equipment: "Højtalere + lys-pakke + trådløs mikrofon",
    icon: "🚀",
  },
  {
    title: "Sommerfest & team-event",
    desc: "Soundboks til udendørs events uden strøm, eller PA-anlæg til større arrangementer.",
    equipment: "Soundboks Mix (batteridrevet) eller PA-pakke",
    icon: "☀️",
  },
  {
    title: "Workshop & undervisning",
    desc: "Headset-mikrofon og højtalere, så underviseren kan bevæge sig frit og stadig høres i hele lokalet.",
    equipment: "Trådløst headset + 2× højtalere på stativer",
    icon: "📚",
  },
  {
    title: "Pop-up & messe",
    desc: "Kompakt opsætning med lyd og mikrofon til din messestand eller pop-up butik.",
    equipment: "Lille højtalerpakke + trådløs mikrofon",
    icon: "🏪",
  },
];

/**
 * Erhvervspakkerne er katalogets egne pakker — ikke en håndskrevet prisliste.
 *
 * De tre kort lovede "fra 1.145 kr" for stor højtalerpakke + lys + røg (i dag
 * 2.645 kr som Firmafestpakke) og en 75" skærm, vi aldrig har haft. Nu står
 * navn, pris og indhold i products.ts, så en prisstigning følger med.
 */
const packages = ["pakke_firmafest", "pakke_konference", "pakke_konference_150"].map((id) => {
  const p = rentalProducts.find((r) => r.id === id)!;
  return {
    id,
    name: p.name_da,
    items: p.contents ?? [],
    note: p.bundle?.usecase_da ?? "",
  };
});

export default function ErhvervPage() {
  return (
    <main className="min-h-screen bg-[#07060b] text-white">
      <TopBar />

      {/* Hero */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 pt-14 text-center">
        <div
          className="fixed inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url(/images/hero.webp)" }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/60 via-transparent to-[#07060b]/90" />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            Erhverv & Events
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Professionelt udstyr
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              til din virksomhed
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg text-white/60">
            Højtalere, mikrofoner, festlys og røg til firmafester, konferencer og events i København. Vi leverer, sætter op og henter.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#tilbud"
              className="rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
            >
              Få et tilbud
            </a>
            <a
              href="#pakker"
              className="rounded-full border border-white/20 px-8 py-4 text-lg font-medium transition hover:bg-white/5"
            >
              Se pakker
            </a>
            <PhoneLink
              className="rounded-full border border-white/20 px-8 py-4 text-lg font-medium transition hover:bg-white/5"
              prefix="Ring"
            />
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-20">
        <h2 className="mb-4 text-center text-3xl font-bold">
          Vi hjælper med alle typer events
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-white/50">
          Fortæl os om jeres event, og vi sammensætter den perfekte pakke. Her er nogle eksempler:
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((uc) => (
            <div
              key={uc.title}
              className="glass rounded-2xl p-6 transition hover:border-white/20"
            >
              <div className="mb-3 text-3xl">{uc.icon}</div>
              <h3 className="mb-2 text-lg font-semibold">{uc.title}</h3>
              <p className="mb-3 text-sm text-white/50">{uc.desc}</p>
              <p className="rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-brand-400">
                {uc.equipment}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section id="pakker" className="relative z-10 mx-auto max-w-5xl px-4 pb-20">
        <h2 className="mb-4 text-center text-3xl font-bold">
          Populære erhvervspakker
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-white/50">
          Faste priser, ingen overraskelser. Levering og opsætning i København fra {prisKr("levering_ud")}.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="glass rounded-2xl p-6 transition hover:border-white/20"
            >
              <h3 className="mb-1 text-lg font-bold">{pkg.name}</h3>
              <p className="mb-4 text-2xl font-bold text-brand-400">
                <LivePrice productId={pkg.id} prefix="fra " suffix=" kr" />
              </p>
              <ul className="mb-4 space-y-2 text-sm text-white/60">
                {pkg.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-brand-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-white/30">{pkg.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="#tilbud"
            className="inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Få et tilbud på jeres arrangement
          </a>
          <p className="mt-3 text-sm text-white/40">
            Eller ring til os på <PhoneLink className="text-brand-400 hover:underline" /> for en skræddersyet løsning
          </p>
        </div>
      </section>

      {/* Tilbudsformular — det er her et arrangement bliver til en sag */}
      <section id="tilbud" className="relative z-10 mx-auto max-w-3xl px-4 pb-20">
        <h2 className="mb-3 text-center text-3xl font-bold">Fortæl om jeres arrangement</h2>
        <p className="mx-auto mb-8 max-w-xl text-center text-white/50">
          Skal I bare bruge en højttaler, kan I booke direkte. Skal der sørges for lyd, mikrofoner og lys til et helt
          arrangement, er det nemmere at fortælle os hvad der skal ske — så sætter vi det sammen og sender en pris med
          levering og opsætning.
        </p>
        <div className="glass rounded-2xl p-6 sm:p-8">
          <EventInquiryForm />
        </div>
      </section>

      {/* Trust signals */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-3 text-center">
          <div className="glass rounded-2xl p-6">
            <p className="text-3xl font-bold text-brand-400">500+</p>
            <p className="mt-1 text-sm text-white/50">Erhvervsudlejninger</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-3xl font-bold text-brand-400">Samme dag</p>
            <p className="mt-1 text-sm text-white/50">Levering mulig i KBH</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-3xl font-bold text-brand-400">Faktura</p>
            <p className="mt-1 text-sm text-white/50">EAN eller CVR — betal efter arrangementet</p>
          </div>
        </div>
      </section>

      <FaqSection items={CATEGORY_FAQ["erhverv"]} />

      <Footer />
    </main>
  );
}
