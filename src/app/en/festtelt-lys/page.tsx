import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Party tent lights Copenhagen | 695 DKK | Lejhøjtaler.dk",
  description: "Two strings of fairy lights and four uplights — tent and garden lit for 695 DKK. Save 90 DKK. Rental in Copenhagen.",
  keywords: ["party tent lighting rental", "fairy lights rental copenhagen", "garden party lights"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/festtelt-lys",
    languages: localeAlternates("/festtelt-lys"),
  },
  openGraph: {
    title: "Party tent lights Copenhagen | 695 DKK | Lejhøjtaler.dk",
    description: "20 m of fairy lights (warm white + coloured) and 4 LED uplights. From canteen tent to garden party — save 90 DKK.",
    url: "https://lejhojtaler.dk/en/festtelt-lys",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/festtelt-lys"
      name="Party tent lights"
      price={695}
      headline="Party tent lights — tent and garden lit up"
      sub="20 m of fairy lights (warm white + coloured) and 4 LED uplights. From canteen tent to garden party — save 90 DKK."
      image="/images/product-lyskaeder.webp"
      imageAlt="Party tent lights"
      productId="pakke_festtelt"
      faqPhrase="party tent lights"
      capacity={{ level: 2, label: "a party tent or garden" }}
      bullets={[
        "10 m warm white string for the cosy light above the tables",
        "10 m coloured string for the party",
        "4 LED uplights for canvas, hedge or house wall",
        "Everything handles a Danish summer evening under cover",
        "Save 90 DKK vs renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Does the party continue after dark?</h2>
          <p className="mb-6 text-white/50">
            A disco ball in the tent does more than you expect — it gathers the dancefloor once the fairy lights have done the rest.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/festlys" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              All party lights
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
