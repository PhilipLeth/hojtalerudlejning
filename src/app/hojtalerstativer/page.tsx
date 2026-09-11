import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lej Højtalerstativer København | 100 kr | Lejhøjtaler.dk",
  description:
    "Lej 2 professionelle højtalerstativer i København for 100 kr. Løfter højtalerne op i øjenhøjde, så lyden når hele rummet. Passer til alle vores højtalerpakker.",
  keywords: ["lej højtalerstativer", "højtalerstativ leje københavn", "stativ til højtaler", "pa stativer leje"],
  alternates: {
    canonical: "https://lejhojtaler.dk/hojtalerstativer",
    languages: localeAlternates("/hojtalerstativer"),
  },
  openGraph: {
    title: "Lej Højtalerstativer | 100 kr",
    description: "2 professionelle stativer — løfter lyden op i øjenhøjde. Passer til alle vores højtalere.",
    url: "https://lejhojtaler.dk/hojtalerstativer",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="hojtalerstativer"
      name="Højtalerstativer"
      price={100}
      headline="Lej højtalerstativer"
      sub="2 professionelle stativer, der løfter højtalerne op i øjenhøjde — så lyden går over hovederne i stedet for ind i ryggen på første række."
      image="/images/product-stativer.webp"
      imageAlt="To professionelle højtalerstativer til leje"
      productId="stativer"
      bookLabel="Book stativer nu"
      faqPhrase="højtalerstativer"
      bullets={[
        "2 stativer med justerbar højde (op til ca. 2 m)",
        "Passer til Alto 10\" og EV 12\" — alle vores højtalerpakker",
        "Trefod med sikring, står stabilt på gulv og græs",
        "Vælges som tilvalg i bookingen sammen med højtalerne",
        "Inkluderet i Højtalerpakke 100 og festpakkerne fra 150 gæster",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Hvornår skal højtalerne op på stativ?</h2>
          <p className="mb-6 text-white/50">
            Står højtalerne på gulvet, dæmper de forreste gæster lyden for resten. Med 30 personer eller flere i rummet gør stativerne mere for lyden end en ekstra højtaler ville.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/lej-hojtaler" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Se højtalerpakker
            </Link>
            <Link href="/subwoofer" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              Se subwoofer
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
