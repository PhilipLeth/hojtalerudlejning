import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lysshow-pakken | Lys, discokugle og røg | 1.495 kr | Lejhøjtaler.dk",
  description:
    "Lysshow-pakken: lys-pakke, discokugle 40 cm og røgmaskine for 1.495 kr — spar 190 kr. Røgen gør lysstrålerne synlige, så det ligner et show. Lejes i København.",
  keywords: ["lysshow leje", "lej lys og røg til fest", "discokugle og røgmaskine leje", "festlys pakke københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/lysshow-pakke",
    languages: localeAlternates("/lysshow-pakke"),
  },
  openGraph: {
    title: "Lysshow-pakken | Lys, discokugle og røg | 1.495 kr",
    description: "Lys-pakke, discokugle og røgmaskine. Strålerne bliver synlige i luften — spar 190 kr.",
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
      price={1495}
      headline="Lysshow-pakken — lyset bliver synligt i luften"
      sub="Lys-pakke, discokugle 40 cm og røgmaskine. Uden røg ser man farvede pletter på væggen; med røg bliver strålerne til et show — spar 190 kr."
      image="/images/product-lys.webp"
      imageAlt="Lysshow-pakken med lys-pakke, discokugle og røgmaskine"
      productId="pakke_lysshow"
      faqPhrase="lysshow-pakken"
      capacity={{ level: 2, label: "op til 60 pers." }}
      bullets={[
        "Lys-pakke: 2 farvede LED-lamper + centereffekt på stativ",
        "Discokugle 40 cm med motor og spot",
        "Røgmaskine inkl. røgvæske — strålerne bliver synlige",
        "Alle stativer og kabler med",
        "Spar 190 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Må der bruges røg, hvor I holder fest?</h2>
          <p className="mb-6 text-white/50">
            Spørg udlejeren eller kig efter røgalarmer, før I booker. I lejede lokaler med alarm er Lysshow stort med low fog det sikre valg — røgen lægger sig på gulvet i stedet for at fylde rummet.
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
