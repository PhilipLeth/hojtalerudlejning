import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lysshow stort | Lys, uplights, discokugle og low fog | 1.995 kr | Lejhøjtaler.dk",
  description:
    "Lysshow stort: lys-pakke, fire uplights, discokugle og low fog-maskine for 1.995 kr — spar 285 kr. Uplights maler væggene, low fog lægger et røggulv uden at vække røgalarmen. Lejes i København.",
  keywords: ["stort lysshow leje", "uplights og low fog leje", "lys til stor fest københavn", "low fog maskine leje", "lys til lejet lokale"],
  alternates: {
    canonical: "https://lejhojtaler.dk/lysshow-stor",
    languages: localeAlternates("/lysshow-stor"),
  },
  openGraph: {
    title: "Lysshow stort | Lys, uplights, discokugle og low fog | 1.995 kr",
    description: "Lys-pakke, fire uplights, discokugle og low fog. Hele rummet skifter karakter — spar 285 kr.",
    url: "https://lejhojtaler.dk/lysshow-stor",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="lysshow-stor"
      name="Lysshow stort"
      price={1995}
      headline="Lysshow stort — hele rummet skifter karakter"
      sub="Lys-pakke, fire uplights, discokugle 40 cm og low fog-maskine. Til den store fest eller det lejede lokale med lysstofrør i loftet — spar 285 kr."
      image="/images/product-uplight-4-v2.webp"
      imageAlt="Lysshow stort med uplights, lys-pakke, discokugle og low fog"
      productId="pakke_lysshow_stor"
      faqPhrase="det store lysshow"
      capacity={{ level: 3, label: "op til 150 pers." }}
      bullets={[
        "Lys-pakke: 2 farvede LED-lamper + centereffekt til dansegulvet",
        "4× LED uplights — maler vægge og hjørner i den farve I vælger",
        "Discokugle 40 cm med motor og spot",
        "Low fog-maskine: røggulv i stedet for røg i hele rummet — røgalarmen får fred",
        "Alle stativer og kabler med",
        "Spar 285 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Skal der også være lyd?</h2>
          <p className="mb-6 text-white/50">
            Det store lysshow passer til de store højtalerpakker. Vælg anlæg efter antal gæster, eller tag en festpakke hvor lyd og lys allerede er sat sammen.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/lydanlaeg" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Vælg anlæg efter gæster
            </Link>
            <Link href="/festpakke-150" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              Se Festpakke 150
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
