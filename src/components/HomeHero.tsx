"use client";

import Link from "next/link";

const USPS = [
  { title: "5 dages leje", desc: "Én pris for op til 5 dage" },
  { title: "Billig levering", desc: "500 kr i hele København" },
  { title: "Alle kabler inkl.", desc: "Klar til plug-and-play" },
];

/** Forside hero: logo + brand + USP'er */
export default function HomeHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-16 sm:pt-20">
      <div
        className="fixed inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url(/images/hero.png)" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/70 via-[#07060b]/50 to-[#07060b]" />
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <Link href="/" className="inline-block group">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent transition group-hover:from-brand-300 group-hover:to-brand-400">
              LejHøjtaler
            </span>
            <span className="text-white/35">.dk</span>
          </h1>
        </Link>
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-brand-400">
          København · Ingen depositum
        </p>
        <p className="mx-auto mt-4 max-w-md text-lg text-white/55">
          Lej højtalere, lys og AV — book online på 2 min. Betal ved afhentning.
        </p>

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
      </div>
    </section>
  );
}
