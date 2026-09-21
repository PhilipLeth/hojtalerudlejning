import { prisKr, rabatKr } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lysshow-pakken | Lys, discokugle og røg | ${prisKr("pakke_lysshow")} | Lejhøjtaler.dk`,
  description:
    `Lysshow-pakken: lysbar, discokugle 40 cm og røgmaskine for ${prisKr("pakke_lysshow")}, spar ${rabatKr("pakke_lysshow")}. Røgen gør lysstrålerne synlige, så det ligner et show. Lejes i København.`,
  keywords: ["lysshow leje", "lej lys og røg til fest", "discokugle og røgmaskine leje", "festlys pakke københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/lysshow-pakke",
    languages: localeAlternates("/lysshow-pakke"),
  },
  openGraph: {
    images: ogImages("/images/product-lys-v4.webp"),
    title: `Lysshow-pakken | Lys, discokugle og røg | ${prisKr("pakke_lysshow")}`,
    description: `Lysbar, discokugle og røgmaskine. Strålerne bliver synlige i luften, spar ${rabatKr("pakke_lysshow")}.`,
    url: "https://lejhojtaler.dk/lysshow-pakke",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="lysshow-pakke"
      name="Lysshow"
      headline="Lysshow-pakken, lyset bliver synligt i luften"
      sub={`Lysbar, discokugle 40 cm og røgmaskine. Uden røg ser man farvede pletter på væggen; med røg bliver strålerne til et show, spar ${rabatKr("pakke_lysshow")}.`}
      image="/images/product-lys-v4-white.webp"
      imageAlt="Lysshow-pakken med lysbar, discokugle og røgmaskine"
      productId="pakke_lysshow"
      faqPhrase="lysshow-pakken"
      capacity={{ level: 2, label: "op til 60 pers." }}
      bullets={[
        "Lysbar: 2 farvede LED-lamper + centereffekt på stativ",
        "Discokugle 40 cm med motor og spot",
        "Røgmaskine inkl. røgvæske, strålerne bliver synlige",
        "Alle stativer og kabler med",
        `Spar ${rabatKr("pakke_lysshow")} vs. at leje delene enkeltvis`,
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Må der bruges røg, hvor I holder fest?</h2>
          <p className="mb-6 text-white/50">
            Spørg udlejeren eller kig efter røgalarmer, før I booker. I lejede lokaler med alarm er Lysshow stort med low fog det sikre valg, røgen lægger sig på gulvet i stedet for at fylde rummet.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/lysshow-stor" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Se Lysshow stort
            </Link>
            <Link href="/lysshow" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              Alle lysshows
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
