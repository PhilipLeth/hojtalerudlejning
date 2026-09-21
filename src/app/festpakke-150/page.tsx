import { prisKr, rabatKr } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Festpakke 150 | Lyd, bas, lys og røg til 150 gæster | ${prisKr("pakke_fest_150")} | Lejhøjtaler.dk`,
  description:
    `Festpakke 150: 2× EV 12\" højtalere, 12\" subwoofer, stativer, lysbar og røgmaskine for ${prisKr("pakke_fest_150")}, spar ${rabatKr("pakke_fest_150")}. Lyd og lys til op til 150 gæster i København. Levering og opsætning kan tilvælges.`,
  keywords: ["festpakke 150 personer", "lydanlæg 150 personer", "lej lyd og lys til fest", "anlæg til stor fest", "højtalere og sub leje"],
  alternates: {
    canonical: "https://lejhojtaler.dk/festpakke-150",
    languages: localeAlternates("/festpakke-150"),
  },
  openGraph: {
    images: ogImages("/images/product-pakke-fest-150-v2.webp"),
    title: `Festpakke 150 | Lyd, bas, lys og røg til 150 gæster | ${prisKr("pakke_fest_150")}`,
    description: `2× EV 12\" + subwoofer + stativer + lys + røg. Alt til festen, spar ${rabatKr("pakke_fest_150")}.`,
    url: "https://lejhojtaler.dk/festpakke-150",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Festpakke150Page() {
  return (
    <ProductLanding
      slug="festpakke-150"
      name="Festpakke 150"
      headline="Festpakke 150, når dansegulvet skal fungere"
      sub={`2× EV 12&quot; højtalere, subwoofer, stativer, lysbar og røgmaskine. Til op til 150 gæster, spar ${rabatKr("pakke_fest_150")}.`}
      image="/images/product-pakke-fest-150-v2-white.webp"
      imageAlt="Festpakke 150: to EV 12&quot; højtalere på stativer, 12&quot; subwoofer, lysbar og røgmaskine"
      productId="pakke_fest_150"
      capacity={{ level: 3, label: "100-150 pers." }}
      bullets={[
        "2× EV 12\" aktive højtalere på stativer, lyden op i øjenhøjde",
        "12\" subwoofer: det er bassen der får folk til at blive på gulvet",
        "Lysbar: 2 farvede lamper + centereffekt",
        "Røgmaskine med væske, uden røg kan man ikke se lyset",
        "Alle kabler, Bluetooth og strøm med i kassen",
        `Spar ${rabatKr("pakke_fest_150")} vs. at leje delene enkeltvis`,
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Skal vi stille det op?</h2>
          <p className="mb-6 text-white/50">
            To højtalere på stativer, en subwoofer, lys og en røgmaskine fylder en bil, og det tager en halv time at
            rigge til første gang. Vi kører ud, sætter op klar til brug og henter igen: 795 kr begge veje. Vælges i
            bookingen.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/lydanlaeg"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Se hele stigen
            </Link>
            <Link
              href="/festpakke-250"
              className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35"
            >
              Flere end 150 gæster?
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
