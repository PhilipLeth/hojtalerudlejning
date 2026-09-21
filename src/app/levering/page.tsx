import type { Metadata } from "next";
import Link from "next/link";
import { localeAlternates } from "@/lib/hreflang";
import Footer from "@/components/Footer";
import LivePrice from "@/components/LivePrice";
import PickupSummary from "@/components/PickupSummary";
import PhoneLink from "@/components/PhoneLink";

export const metadata: Metadata = {
  title: "Levering og afhentning | Lyd og lys i København | Lejhøjtaler.dk",
  description:
    "Hent selv på Amager, eller få udstyret leveret og sat op i hele København. Se hvad levering koster, hvad opsætning dækker, og hvordan du vælger det i bookingen.",
  keywords: ["levering af lydanlæg", "lydanlæg leveret og sat op", "opsætning af anlæg københavn", "afhentning lydudstyr"],
  alternates: { canonical: "https://lejhojtaler.dk/levering", languages: localeAlternates("/levering") },
};

export default function LeveringPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="mx-auto max-w-4xl px-5 pt-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Levering · København</p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Hent selv, eller lad os køre det ud</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          Du kan hente udstyret hos os og aflevere det igen efter festen — det koster ikke noget. Har du ikke bil, eller
          skal I ikke bruge tid på at stille op, kører vi ud i hele København og sætter det op, så det er klar til brug.
        </p>
        <PickupSummary className="mt-4 text-sm text-slate-500" />
      </section>

      <section className="mx-auto mt-12 max-w-4xl px-5">
        <h2 className="text-2xl font-bold">Tre måder at få udstyret på</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold">Du henter selv</h3>
            <p className="mt-2 text-sm text-slate-600">
              Du henter hos os og afleverer igen efter festen. Det meste kan være i en almindelig bil, og de mindre
              ting kan køres på cykel.
            </p>
            <p className="mt-3 font-semibold">Gratis</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold">Vi leverer og sætter op</h3>
            <p className="mt-2 text-sm text-slate-600">
              Vi kører ud, stiller op og tilslutter, så der bare skal tændes. Du afleverer selv bagefter.
            </p>
            <p className="mt-3 font-semibold">
              <LivePrice productId="levering_ud" prefix="" />
            </p>
          </div>
          <div className="rounded-xl border-2 border-brand-600 p-5">
            <h3 className="font-semibold">Begge veje</h3>
            <p className="mt-2 text-sm text-slate-600">
              Vi leverer, sætter op og henter det hele igen efter festen. Du skal ikke selv køre nogen af vejene.
            </p>
            <p className="mt-3 font-semibold">
              <LivePrice productId="levering_begge" prefix="" />
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Skal vi kun hente igen bagefter, fordi du selv kan hente, men ikke aflevere, koster den tur{" "}
          <LivePrice productId="afhentning_retur" prefix="" />. Alle tre valg ligger i bookingen under &quot;Levering og
          afhentning&quot;, og du skriver adressen, når du vælger dem.
        </p>
      </section>

      <section className="mx-auto mt-16 max-w-4xl px-5">
        <h2 className="text-2xl font-bold">Hvad opsætning dækker</h2>
        <ul className="mt-5 space-y-3 text-slate-600">
          <li className="border-b border-slate-200 pb-3">
            Vi stiller højtalere, stativer og lys op, hvor I vil have dem, og trækker kablerne.
          </li>
          <li className="border-b border-slate-200 pb-3">
            Vi tilslutter og tester lyden, så I kan spille musik med det samme fra telefon eller computer.
          </li>
          <li className="border-b border-slate-200 pb-3">
            Vi viser jer, hvordan mikrofonen og lyset styres, inden vi kører igen.
          </li>
          <li>
            Skal nogen blive og styre lyden under festen, er det en lydmand — se{" "}
            <Link href="/lydmand" className="font-semibold text-brand-600">
              lydmand
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="mx-auto mt-16 max-w-4xl px-5">
        <h2 className="text-2xl font-bold">Område og tidspunkt</h2>
        <p className="mt-4 text-slate-600">
          Vi kører ud i hele København. Ligger festen længere ude, så ring til os på{" "}
          <PhoneLink className="font-semibold text-brand-600" />, før du booker, så siger vi, om vi kan nå det, og hvad
          turen koster. Tidspunktet aftaler vi, når bookingen er inde — skriv gerne i bookingen, hvornår I skal bruge
          det, og hvornår festen slutter.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/#book" className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white">
            Book med levering
          </Link>
          <Link href="/priser" className="self-center font-semibold text-brand-600">
            Se alle priser →
          </Link>
        </div>
        <p className="mt-10 pb-16 text-sm text-slate-500">
          Reglerne for lejeperiode, aflysning og ansvar står i{" "}
          <Link href="/lejevilkaar" className="font-semibold text-brand-600">
            lejevilkårene
          </Link>
          .
        </p>
      </section>

      <Footer />
    </main>
  );
}
