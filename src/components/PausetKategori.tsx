import Link from "next/link";
import { PhoneText } from "@/components/PhoneLink";

/**
 * Beskeden på en kategoriside, hvis produkter er sat på pause.
 *
 * Siderne bliver liggende — de har deres plads i Google, og pausen kan rulles
 * tilbage — men de skal sige det højt frem for at vise et tomt grid og lade
 * kunden gætte. Beskeden peger videre til det, vi rent faktisk udlejer:
 * højtalere, lys og røg. Se PAUSEDE_PRODUKTER i src/lib/products.ts.
 */
export default function PausetKategori({
  hvad,
  detalje,
}: {
  /** Hvad der er på pause, midt i en sætning: "karaoke", "projektor og lærred" */
  hvad: string;
  /** Én sætning mere, hvis kategorien har brug for den */
  detalje?: string;
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
          På pause
        </p>
        <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
          Vi udlejer ikke {hvad} lige nu
        </h2>
        <p className="mx-auto max-w-md text-white/60">
          Vi har samlet udlejningen om det, vi er bedst til: højtalere, festlys og røg.
          {detalje ? ` ${detalje}` : ""}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/lej-hojtaler"
            className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400"
          >
            Se højtalere og pakker
          </Link>
          <Link
            href="/festlys"
            className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:border-brand-500/40 hover:text-white"
          >
            Se festlys
          </Link>
          <Link
            href="/roeg"
            className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:border-brand-500/40 hover:text-white"
          >
            Se røgmaskiner
          </Link>
        </div>
        <p className="mt-6 text-sm text-white/40">
          Er du i tvivl om hvad der skal til, så ring: <PhoneText />
        </p>
      </div>
    </section>
  );
}
