import type { Metadata } from "next";
import Link from "next/link";
import { localeAlternates } from "@/lib/hreflang";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import BundleGrid from "@/components/BundleGrid";
import Footer from "@/components/Footer";
import { AV_PAKKER } from "@/lib/products";

export const metadata: Metadata = {
  title: "AV equipment rental Copenhagen | Screens, lighting, mics and speakers",
  description: "Hire displays, projectors, lighting, microphones and speakers in Copenhagen. Book packages online, including panels and Teams/Zoom.",
  alternates: { canonical: "https://lejhojtaler.dk/en/av-udstyr", languages: localeAlternates("/av-udstyr") },
};

export default function Page() {
  return (
    <main className="bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Equipment rental · Copenhagen</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold sm:text-6xl">Screens, lighting, mics and speakers. Book online.</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">Ready-made packages and individual items. Panel and Teams/Zoom setups are booked as packages, not by phone.</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a href="#screens" className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white">See screens and projectors</a>
          <a href="#lighting" className="font-semibold text-brand-600">See lighting →</a>
        </div>
      </section>
      <BundleGrid locale="en" ids={AV_PAKKER} eyebrow="AV packages" title="Ready to book" subtitle="Panel and hybrid-meeting packages are here. VAT included." />
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
      <Footer locale="en" />
    </main>
  );
}
