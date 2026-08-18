/** Platform-landing: sælger SaaS'en til butikker og linker til demoen. */

import Link from "next/link";

const TRIN = [
  {
    titel: "Kunden tager et billede",
    tekst: "Af sin have, terrasse eller stue — direkte fra telefonen, uden login eller app-installation.",
  },
  {
    titel: "Dine møbler sættes ind",
    tekst: "En AI-billedmodel indsætter produkter fra dit katalog fotorealistisk — korrekt skala, lys og skygger — og laver flere opstillinger at vælge imellem.",
  },
  {
    titel: "Du får en varm forespørgsel",
    tekst: "Kunden sender sin favorit som tilbudsforespørgsel med navn, mail og telefon — billedet følger med, klar til dit tilbud.",
  },
];

export default function Forside() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-skov">furniture-viz</p>
      <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
        Lad kunderne se dine møbler hjemme hos dem selv — før de køber.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-blaek/70">
        En lille web-app med dit brand og dit katalog. Kunden fotograferer sin have, ser dine møbler stå i den og
        sender sin favorit som tilbudsforespørgsel. Du lukker handlen.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/t/demo"
          className="rounded-full bg-skov px-6 py-3 font-semibold text-white shadow hover:opacity-90"
        >
          Prøv demoen →
        </Link>
        <a
          href="mailto:philipleth@gmail.com?subject=furniture-viz%20til%20min%20butik"
          className="rounded-full border border-skov/30 px-6 py-3 font-semibold text-skov hover:bg-skov/5"
        >
          Bliv butik på platformen
        </a>
      </div>

      <ol className="mt-16 grid gap-6 sm:grid-cols-3">
        {TRIN.map((trin, i) => (
          <li key={trin.titel} className="rounded-2xl bg-white p-6 shadow-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-skov text-sm font-bold text-white">
              {i + 1}
            </span>
            <h2 className="mt-4 font-semibold">{trin.titel}</h2>
            <p className="mt-2 text-sm text-blaek/70">{trin.tekst}</p>
          </li>
        ))}
      </ol>

      <section className="mt-16 rounded-2xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold">For butikken</h2>
        <ul className="mt-4 space-y-2 text-sm text-blaek/80">
          <li>• Eget link (fx <code className="rounded bg-creme px-1">/t/din-butik</code>) og QR-kode til butikken</li>
          <li>• Selvbetjent katalog: produkter, fotos, mål og vejledende priser</li>
          <li>• Forespørgsler på mail med kundens billede — svar direkte til kunden</li>
          <li>• Ingen installation, ingen servere — kør i gang på en dag</li>
        </ul>
        <p className="mt-4 text-sm text-blaek/60">
          Butiks-login: <Link href="/admin" className="underline">/admin</Link>
        </p>
      </section>

      <footer className="mt-16 text-xs text-blaek/50">furniture-viz · visualisering af møbler i kundens egne billeder</footer>
    </main>
  );
}
