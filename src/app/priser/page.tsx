import type { Metadata } from "next";
import Link from "next/link";
import { localeAlternates } from "@/lib/hreflang";
import Footer from "@/components/Footer";
import PriceTable from "@/components/PriceTable";
import PickupSummary from "@/components/PickupSummary";
import { MAX_RENTAL_DAYS } from "@/lib/productFaq";

export const metadata: Metadata = {
  title: "Priser | Lej lyd, lys og AV-udstyr i København | Lejhøjtaler.dk",
  description:
    "Hele prislisten ét sted: højtalere, festpakker, lys, røg, mikrofoner, skærme, lydmand og DJ. Samme pris om du lejer 1 eller 5 dage, og intet depositum.",
  keywords: ["priser leje højtaler", "hvad koster det at leje en soundboks", "prisliste lydudstyr", "leje af lydanlæg pris"],
  alternates: { canonical: "https://lejhojtaler.dk/priser", languages: localeAlternates("/priser") },
};

const vilkaar = [
  {
    title: "Samme pris i 1 til " + MAX_RENTAL_DAYS + " dage",
    body: "Prisen er for hele lejeperioden, ikke pr. dag. De fleste henter fredag og afleverer mandag.",
  },
  {
    title: "Kabler og stativer, der hører til, er med",
    body: "Du skal ikke købe eller medbringe noget selv. Det står på hver produktside, hvad der følger med.",
  },
  {
    title: "Intet depositum",
    body: "Du betaler lejen, ikke en sikkerhed oveni. Til gengæld hæfter du for udstyret, mens du har det.",
  },
  {
    title: "Betal med kort eller ved afhentning",
    body: "Du kan betale online, når du booker, eller når du henter udstyret.",
  },
];

export default function PriserPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="mx-auto max-w-4xl px-5 pt-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Prisliste · København</p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Hvad koster det at leje?</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          Her står hele sortimentet med den pris, du betaler i bookingen — højtalere, færdige festpakker, lys, røg,
          mikrofoner, skærme og bemanding. Priserne er inklusive moms og gælder hele lejeperioden.
        </p>
        <PickupSummary className="mt-4 text-sm text-slate-500" />
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/#book" className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white">
            Se ledige datoer
          </Link>
          <Link href="/levering" className="self-center font-semibold text-brand-600">
            Levering og afhentning →
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-4xl px-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {vilkaar.map((v) => (
            <div key={v.title} className="rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold">{v.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-4xl px-5 pb-16">
        <PriceTable locale="da" />
        <p className="mt-10 text-sm text-slate-500">
          Skal I være flere, end pakkerne rækker til, eller holder I fest et sted, vi ikke kender? Så{" "}
          <Link href="/kontakt" className="font-semibold text-brand-600">
            skriv til os
          </Link>{" "}
          med dato, sted og antal gæster, så får I et samlet tilbud. Vilkårene for leje står i{" "}
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
