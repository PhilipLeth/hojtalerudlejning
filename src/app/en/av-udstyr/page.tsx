import type { Metadata } from "next";
import Link from "next/link";
import { localeAlternates } from "@/lib/hreflang";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import BundleGrid from "@/components/BundleGrid";
import Footer from "@/components/Footer";
import { AV_PAKKER } from "@/lib/products";

export const metadata: Metadata = {
  title: "AV equipment rental Copenhagen | Screens, lighting, mics and speakers",
  description: "Hire displays, projectors, lighting, microphones and speakers in Copenhagen. Book online for meetings, conferences and presentations.",
  alternates: { canonical: "https://lejhojtaler.dk/en/av-udstyr", languages: localeAlternates("/av-udstyr") },
};

export default function Page() {
  return (
    <main className="bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Equipment rental · Copenhagen</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold sm:text-6xl">Screens, lighting, mics and speakers. Book online.</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">For the meeting, the conference and the party: picture, sound and lighting can be hired separately or as a ready-made package. Every price covers up to five days and includes VAT.</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a href="#screens" className="rounded-full border border-transparent bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400">See screens and projectors</a>
          <a href="#lighting" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">See lighting →</a>
        </div>
      </section>
      <BundleGrid locale="en" ids={AV_PAKKER} eyebrow="AV packages" title="Ready to book" subtitle="Projector, screen, microphone and sound put together in advance — and cheaper than hiring the parts separately." />
      <section id="screens" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
        <h2 className="mb-6 text-3xl font-bold">Screens & projectors</h2>
        <CategoryProductGrid tone="light" locale="en" items={[{id:"skaerm_55",tag:"Easiest"},{id:"skaerm_32"},{id:"projektor"},{id:"projektor_pro",tag:"Sharp in daylight"},{id:"laerred_160"}]} />
      </section>
      <section id="lighting" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-16">
        <div className="mb-6 flex flex-wrap items-baseline gap-3">
          <h2 className="text-3xl font-bold">Lighting</h2>
          <Link href="/en/festlys" className="text-sm font-semibold text-brand-600">All lighting →</Link>
        </div>
        <CategoryProductGrid tone="light" locale="en" items={[{id:"lys",tag:"Dance floor"},{id:"pakke_stemningslys"},{id:"uplight_4"},{id:"discokugle"},{id:"lyskaeder"},{id:"lyseffekt"}]} />
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="mb-6 text-3xl font-bold">Sound & microphones</h2>
        <CategoryProductGrid tone="light" locale="en" items={[{id:"festival"},{id:"party"},{id:"traadloes_mikrofon_pro"},{id:"headset"},{id:"mixer_stor"}]} />
      </section>
      <section id="sourced" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-16">
        <h2 className="mb-2 text-3xl font-bold">We can source these</h2>
        <p className="mb-8 max-w-xl text-slate-500">We do not keep them on the shelf, but we bring them along when we are already driving out with sound and lighting. Send us the date and the numbers for a same-day price.</p>
        <CategoryProductGrid tone="light" locale="en" cols={2} items={[{ id: "slushice" }, { id: "fadoel" }]} />
      </section>
      <Footer locale="en" />
    </main>
  );
}
