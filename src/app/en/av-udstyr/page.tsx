import type { Metadata } from "next";
import Link from "next/link";
import { localeAlternates } from "@/lib/hreflang";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Equipment rental Copenhagen | Lighting, mics and speakers",
  description: "Hire lighting, microphones and speakers in Copenhagen for meetings and parties. One price covers up to five days. Book online.",
  alternates: { canonical: "https://lejhojtaler.dk/en/av-udstyr", languages: localeAlternates("/av-udstyr") },
};

export default function Page() {
  return (
    <main className="bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Equipment rental · Copenhagen</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold sm:text-6xl">Lighting, mics and speakers. Book online.</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">For the meeting, the conference and the party: sound, microphones and lighting, booked online. Every price covers up to five days and includes VAT.</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a href="#lighting" className="rounded-full border border-transparent bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400">See lighting</a>
        </div>
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
        <CategoryProductGrid tone="light" locale="en" items={[{id:"festival"},{id:"party"},{id:"mikrofon"},{id:"headset"},{id:"mixer_stor"}]} />
      </section>
      <Footer locale="en" />
    </main>
  );
}
