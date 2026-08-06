import type { Metadata } from "next";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Erhverv — Lyd, lys og AV til professionelle events | Lejhøjtaler.dk",
  description:
    "Professionelt udstyr til firmafester, konferencer, præsentationer og events i København. Højtalere, skærme, projektorer og mikrofoner til leje.",
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
    desc: "Skærm eller projektor med trådløs mikrofon og højtaler, så alle kan høre og se præsentationen.",
    equipment: "55\" skærm + trådløs mikrofon + højtalere",
    icon: "🎤",
  },
  {
    title: "Produktlancering",
    desc: "Imponér gæsterne med professionel lyd, lys og storskærm. Vi klarer opsætningen.",
    equipment: "Højtalere + lys + projektor + mikrofon",
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
    desc: "Projektor eller skærm med headset-mikrofon, så underviseren kan bevæge sig frit.",
    equipment: "55\" skærm + headset-mikrofon + højtalere",
    icon: "📚",
  },
  {
    title: "Pop-up & messe",
    desc: "Kompakt opsætning med skærm, lyd og mikrofon til din messestand eller pop-up butik.",
    equipment: "55\" skærm + lille højtalerpakke + mikrofon",
    icon: "🏪",
  },
];

const packages = [
  {
    name: "Firmafest-pakke",
    price: "fra 1.145",
    items: ["Stor højtalerpakke (2× 12\" EV)", "Lys-pakke (2 LED + centereffekt)", "Røgmaskine", "Alle kabler"],
    note: "Op til 100 gæster",
  },
  {
    name: "Konference-pakke",
    price: "fra 1.195",
    items: ["55\" skærm med stativ", "Trådløs mikrofon", "Lille højtalerpakke (2× 10\")", "HDMI + alle kabler"],
    note: "Op til 50 deltagere",
  },
];

export default function ErhvervPage() {
  return (
    <main className="min-h-screen bg-[#07060b] text-white">
      <TopBar />

      {/* Hero */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 pt-14 text-center">
        <div
          className="fixed inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url(/images/hero.png)" }}
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
            Højtalere, skærme, projektorer og mikrofoner til firmafester, konferencer og events i København. Vi leverer, sætter op og henter.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#pakker"
              className="rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
            >
              Se pakker
            </a>
            <a
              href="tel:+4531132852"
              className="rounded-full border border-white/20 px-8 py-4 text-lg font-medium transition hover:bg-white/5"
            >
              Ring 31 13 28 52
            </a>
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
          Faste priser, ingen overraskelser. Levering og opsætning i København fra 495 kr.
        </p>
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="glass rounded-2xl p-6 transition hover:border-white/20"
            >
              <h3 className="mb-1 text-lg font-bold">{pkg.name}</h3>
              <p className="mb-4 text-2xl font-bold text-brand-400">
                {pkg.price} kr
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
            href="/#book"
            className="inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book erhvervspakke
          </a>
          <p className="mt-3 text-sm text-white/40">
            Eller ring til os på <a href="tel:+4531132852" className="text-brand-400 hover:underline">31 13 28 52</a> for en skræddersyet løsning
          </p>
        </div>
      </section>

      {/* Trust signals */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-3 text-center">
          <div className="glass rounded-2xl p-6">
            <p className="text-3xl font-bold text-brand-400">1.000+</p>
            <p className="mt-1 text-sm text-white/50">Udlejninger*</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-3xl font-bold text-brand-400">Samme dag</p>
            <p className="mt-1 text-sm text-white/50">Levering mulig i KBH</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-3xl font-bold text-brand-400">Betal ved afhentning</p>
            <p className="mt-1 text-sm text-white/50">Eller sikkert online med kort</p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-white/25">
          *Fra Frederiks tidligere udlejningsvirksomhed
        </p>
      </section>

      <Footer />
    </main>
  );
}
