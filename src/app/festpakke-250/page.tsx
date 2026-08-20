import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Festpakke 250 | Dobbelt anlæg til 250 gæster | 2.295 kr | Lejhøjtaler.dk",
  description:
    "Festpakke 250: 4× EV 12\" højtalere, 2× 12\" subwoofer, stativer, lys og røgmaskine for 2.295 kr — spar 225 kr. Anlæg til sal, gård eller hal med op til 250 gæster i København.",
  keywords: ["lydanlæg 250 personer", "anlæg til stor fest", "pa anlæg til firmafest", "lej lydanlæg til sal", "festpakke 200 personer"],
  alternates: { canonical: "https://lejhojtaler.dk/festpakke-250" },
  openGraph: {
    title: "Festpakke 250 | Dobbelt anlæg til 250 gæster | 2.295 kr",
    description: "4× EV 12\" + 2 subwoofere + lys + røg. Til sal, gård eller hal — spar 225 kr.",
    url: "https://lejhojtaler.dk/festpakke-250",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Festpakke250Page() {
  return (
    <ProductLanding
      slug="festpakke-250"
      name="Festpakke 250"
      price={2295}
      headline="Festpakke 250 — anlægget til salen"
      sub="4× EV 12&quot; højtalere, 2 subwoofere, stativer, lys og røg. Til op til 250 gæster — spar 225 kr."
      image="/images/product-pakke-fest-250.webp"
      imageAlt="Festpakke 250: fire EV 12&quot; højtalere på stativer, to 12&quot; subwoofere, lys-pakke og røgmaskine"
      productId="pakke_fest_250"
      capacity={{ level: 3, label: "150-250 pers." }}
      bullets={[
        "4× EV 12\" aktive højtalere — to i hver ende, så lyden dækker bredden",
        "2× 12\" subwoofer holder bunden i et stort rum",
        "2 sæt stativer, alle kabler og strøm",
        "Lys-pakke og røgmaskine med",
        "Spar 225 kr vs. at leje delene enkeltvis",
        "Levering og opsætning anbefales — det er en bil fuld af grej",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Flere end 250 gæster?</h2>
          <p className="mb-6 text-white/50">
            Så skal der større tops og 18&quot; subs til, og det skaffer vi til dagen. Skriv hvor mange I er, hvor det
            foregår og hvad der skal ske — så får du en pris med levering, opsætning og en tekniker der bliver på stedet.
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
              className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35"
            >
              Se hele stigen
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
