import type { Metadata } from "next";
import Link from "next/link";
import { localeAlternates } from "@/lib/hreflang";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import Footer from "@/components/Footer";
export const metadata: Metadata = {
 title: "AV equipment rental Copenhagen | Screens, projectors and sound",
 description: "Hire displays, projectors, microphones, speakers and uplights in Copenhagen. Book equipment online or request delivery and setup for your event.",
 alternates: { canonical: "https://lejhojtaler.dk/en/av-udstyr", languages: localeAlternates("/av-udstyr") },
};
export default function Page() { return <>
 <main className="mx-auto max-w-6xl px-5 py-16">
  <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">AV equipment · Copenhagen</p>
  <h1 className="mt-4 text-4xl font-bold sm:text-6xl">The equipment behind your event.</h1>
  <p className="mt-6 max-w-2xl text-lg text-slate-600">Screens, projectors, microphones, speakers and lighting. Choose individual items below, or ask us to put together delivery, setup and technical support.</p>
  <Link href="/en/eventloesninger" className="my-8 inline-block rounded-lg bg-brand-500 px-6 py-3 font-semibold text-white">Explore complete event solutions →</Link>
  <section className="py-10"><h2 className="mb-6 text-3xl font-bold">Screens & projectors</h2><CategoryProductGrid locale="en" items={[{id:"skaerm_55"},{id:"skaerm_32"},{id:"projektor"},{id:"projektor_pro"},{id:"laerred_160"}]} /></section>
  <section className="py-10"><h2 className="mb-6 text-3xl font-bold">Sound & microphones</h2><CategoryProductGrid locale="en" items={[{id:"festival"},{id:"party"},{id:"traadloes_mikrofon_pro"},{id:"headset_pro"},{id:"haandholdt_mikrofon"},{id:"mixer_stor"}]} /></section>
  <section className="py-10"><h2 className="mb-6 text-3xl font-bold">Lighting</h2><CategoryProductGrid locale="en" items={[{id:"uplight_4"}]} /></section>
 </main><Footer locale="en" />
 </>; }
