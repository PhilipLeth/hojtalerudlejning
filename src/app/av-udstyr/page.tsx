import { localeAlternates } from "@/lib/hreflang";
import { Metadata } from "next";
import GoogleReviews from "@/components/GoogleReviews";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import BundleGrid from "@/components/BundleGrid";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { AV_PAKKER } from "@/lib/products";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lej udstyr København | Skærm, lys, mikrofon og højtaler | Lejhøjtaler.dk",
  description:
    "Lej AV-udstyr i København: 55\" storskærm, projektor, lærred, lys, mikrofoner og højtalere. Book pakkerne online, også til panel og Teams/Zoom.",
  keywords: ["lej av-udstyr", "lej storskærm", "lej lys", "lej mikrofon", "lej projektor"],
  alternates: { canonical: "https://lejhojtaler.dk/av-udstyr", languages: localeAlternates("/av-udstyr") },
};

export default function AVUdstyrPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Lej udstyr · København</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold sm:text-6xl">Skærm, lys, mikrofon og højtaler. Book online.</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          Enkeltprodukter og færdige pakker. Panel og Teams/Zoom booker I som pakke, ikke via telefon.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a href="#billede" className="rounded-full border border-transparent bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400">Se skærme og projektor</a>
          <a href="#lys" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">Se lys →</a>
        </div>
      </section>

      <BundleGrid
        ids={AV_PAKKER}
        eyebrow="AV-pakke"
        title="Færdig opsætning"
        subtitle="Book pakken online. Panel og hybridmøde ligger her, ikke som et opkald."
      />

      <section id="billede" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
        <h2 className="mb-2 text-3xl font-bold">Billede</h2>
        <p className="mb-10 max-w-xl text-slate-500">
          55&quot; storskærm på stativ, 32&quot; skærm, projektor og lærred. Skærmen virker i dagslys. Projektor og lærred giver et større billede.
        </p>
        <CategoryProductGrid
          tone="light"
          items={[
            { id: "skaerm_55", href: "/skaerm", tag: "Nemmest" },
            { id: "skaerm_32", href: "/skaerm-32" },
            { id: "projektor", href: "/projektor" },
            { id: "projektor_pro", href: "/projektor-pro", tag: "Skarp i dagslys" },
            { id: "laerred_160", href: "/laerred-160" },
          ]}
        />
      </section>

      <section id="lys" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-16">
        <div className="mb-2 flex flex-wrap items-baseline gap-3">
          <h2 className="text-3xl font-bold">Lys</h2>
          <Link href="/festlys" className="text-sm font-semibold text-brand-600">Se alt lys →</Link>
        </div>
        <p className="mb-10 max-w-xl text-slate-500">
          Fra en enkelt effekt til færdige lyspakker. Book online, og tilvælg levering hvis I vil have det sat op.
        </p>
        <CategoryProductGrid
          tone="light"
          items={[
            { id: "lys", href: "/lys-pakke", tag: "Dansegulv" },
            { id: "pakke_stemningslys", href: "/stemningslys" },
            { id: "uplight_4", href: "/uplights" },
            { id: "discokugle", href: "/discokugle" },
            { id: "lyskaeder", href: "/lyskaeder" },
            { id: "lyseffekt", href: "/enkelt-lyseffekt" },
          ]}
        />
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="mb-2 text-3xl font-bold">Lyd</h2>
        <p className="mb-10 max-w-xl text-slate-500">Højtalere til mødet og festen. Speakerpakken er højtaler og mikrofon i ét.</p>
        <CategoryProductGrid
          tone="light"
          items={[
            { id: "pakke_speaker_mik", tag: "Højtaler + mikrofon" },
            { id: "party", href: "/hojtalerpakke-lille" },
            { id: "festival", href: "/hojtalerpakke-normal" },
            { id: "soundboks", href: "/soundboks-4" },
          ]}
        />
      </section>

      <section id="mikrofoner" className="mx-auto max-w-6xl px-5 pb-16">
        <div className="mb-2 flex flex-wrap items-baseline gap-3">
          <h2 className="text-3xl font-bold">Mikrofoner</h2>
          <Link href="/lej-mikrofon" className="text-sm font-semibold text-brand-600">Se alle mikrofoner →</Link>
        </div>
        <p className="mb-10 max-w-xl text-slate-500">
          Én eller to går direkte i højtaleren. Fire mikrofoner og Teams/Zoom booker I som pakke.
        </p>
        <CategoryProductGrid
          tone="light"
          items={[
            { id: "traadloes_mikrofon_pro", href: "/traadloes-mikrofon-pro", tag: "Bedst til tale" },
            { id: "traadloes_mikrofon", href: "/traadloes-mikrofon" },
            { id: "headset", href: "/headset-mikrofon" },
            { id: "haandholdt_mikrofon", href: "/haandholdt-mikrofon" },
          ]}
        />
      </section>

      <FaqSection items={CATEGORY_FAQ["av-udstyr"]} />
      <GoogleReviews />
      <Footer />
    </main>
  );
}
