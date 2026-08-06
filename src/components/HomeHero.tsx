"use client";

import WeekendUrgency from "@/components/WeekendUrgency";
import { t } from "@/lib/i18n";

const USPS = [
  { title: "5 dages leje", desc: "Én pris for op til 5 dage" },
  { title: "Billig levering", desc: "Fra 495 kr i hele København" },
  { title: "Alle kabler inkl.", desc: "Klar til plug-and-play" },
];

/** Forside hero: logo + brand + USP'er */
export default function HomeHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-6 sm:pt-8">
      <div
        className="fixed inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url(/images/hero.png)" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/70 via-[#07060b]/50 to-[#07060b]" />
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* H1 bærer hovedkeywordet — brandnavnet er sekundært (folk søger ikke på brandet) */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
            Lej højtalere
          </span>
          <span className="block text-white/90">i København</span>
        </h1>
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-brand-400">
          Lejhøjtaler.dk · Betal ved afhentning
        </p>
        <p className="mx-auto mt-4 max-w-md text-lg text-white/55">
          Højtalere, festlys og AV-udstyr til leje — book online på 2 minutter.
          Hent i København K eller få det leveret.
        </p>

        <a
          href="/#book"
          className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
        >
          Book nu
        </a>

        {/* Live urgency (rigtige lagerdata) + telefon på én linje */}
        <div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-white/50">
          <WeekendUrgency locale="da" />
          <a href="tel:+4531132852" className="inline-flex items-center gap-1 transition hover:text-brand-400">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {t.da.hero.phone}
          </a>
        </div>

        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
          {USPS.map((u) => (
            <div
              key={u.title}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-sm"
            >
              <p className="font-semibold text-brand-400">{u.title}</p>
              <p className="mt-1 text-xs text-white/45">{u.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-white/45">
          {t.da.hero.socialProof}
          <span className="ml-1 text-xs text-white/25">{t.da.hero.socialProofFootnote}</span>
        </p>
      </div>
    </section>
  );
}
