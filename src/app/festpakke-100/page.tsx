import { prisKr, rabatKr } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";

/**
 * Arkets største festpakke — og siden 23. september 2026 det øverste trin på
 * stigen med en pris på.
 *
 * Festpakke 150 og 250 var vores egne, sat sammen af dobbelte højtalerpakker
 * og subs, og ingen af dem står i det nye prisark. De er udgået, og over
 * hundrede gæster er nu et tilbud. Det efterlod arkets egen Festpakke 50-100
 * som den største, man kan booke online — og den havde ikke en side at stå på.
 */
export const metadata: Metadata = {
  title: `Festpakke 50-100 | Lyd, bas og lys til 100 gæster | ${prisKr("pakke_fest_100")} | Lejhøjtaler.dk`,
  description:
    `Festpakke 50-100: stor højtalerpakke med subwoofer og to lysbarer for ${prisKr("pakke_fest_100")}, spar ${rabatKr("pakke_fest_100")}. Lyd og lys til op til 100 gæster i København. Levering og opsætning kan tilvælges.`,
  keywords: [
    "festpakke 100 personer",
    "lydanlæg 100 personer",
    "lej lyd og lys til fest",
    "anlæg til stor fest",
    "højtalere og sub leje",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/festpakke-100",
    languages: localeAlternates("/festpakke-100"),
  },
  openGraph: {
    images: ogImages(),
    title: `Festpakke 50-100 | Lyd, bas og lys til 100 gæster | ${prisKr("pakke_fest_100")}`,
    description: `Stor højtalerpakke med subwoofer og to lysbarer. Alt til festen, spar ${rabatKr("pakke_fest_100")}.`,
    url: "https://lejhojtaler.dk/festpakke-100",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Festpakke100Page() {
  return (
    <ProductLanding
      slug="festpakke-100"
      name="Festpakke 50-100"
      headline="Festpakke 50-100, når salen skal fyldes"
      sub={`Stor højtalerpakke med subwoofer og to lysbarer. Til op til 100 gæster, spar ${rabatKr("pakke_fest_100")}.`}
      imageAlt="Festpakke 50-100: stor højtalerpakke med subwoofer og to lysbarer"
      productId="pakke_fest_100"
      capacity={{ level: 3, label: "50-100 pers." }}
      bullets={[
        "Stor højtalerpakke: 2× EV 12\" aktive højtalere og en 12\" subwoofer",
        "To lysbarer, så lyset dækker hele gulvet og ikke kun midten",
        "Bassen er dét, der får folk til at blive stående på dansegulvet",
        "Alle kabler, Bluetooth og strøm med i kassen",
        "Højtalerstativer og røgmaskine kan tilvælges i bookingen",
        `Spar ${rabatKr("pakke_fest_100")} vs. at leje delene enkeltvis`,
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Flere end hundrede gæster?</h2>
          <p className="mb-6 text-white/50">
            Så er det ikke længere en hyldevare. Vi skaffer større tops og subs og sender en tekniker med på dagen —
            skriv dato, antal og sted, så får du en pris, som regel samme dag.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/erhverv#tilbud"
              className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400"
            >
              Få et tilbud
            </Link>
            <Link
              href="/lydanlaeg"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Se hele stigen
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
