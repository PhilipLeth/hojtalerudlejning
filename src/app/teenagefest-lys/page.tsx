import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Teenagefest-lys | 945 kr | Lejhøjtaler.dk",
  description: "Diskolyseffekt, discokugle og farvet lyskæde — kælderen bliver en klub for 945 kr. Spar 140 kr. Lejes i København.",
  keywords: ["lys til teenagefest", "18 års fødselsdag fest lys", "diskolys til fødselsdag", "fest i kælderen lys"],
  alternates: {
    canonical: "https://lejhojtaler.dk/teenagefest-lys",
    languages: localeAlternates("/teenagefest-lys"),
  },
  openGraph: {
    title: "Teenagefest-lys | 945 kr | Lejhøjtaler.dk",
    description: "Diskolyseffekt, discokugle og 10 m farvet lyskæde. Sluk loftslyset, tænd pakken — spar 140 kr.",
    url: "https://lejhojtaler.dk/teenagefest-lys",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Side() {
  return (
    <ProductLanding
      slug="teenagefest-lys"
      name="Teenagefest-lys"
      price={945}
      headline="Teenagefest-lys — kælderen bliver en klub"
      sub="Diskolyseffekt, discokugle og 10 m farvet lyskæde. Sluk loftslyset, tænd pakken — spar 140 kr."
      image="/images/product-pakke-teenagefest.webp"
      imageAlt="Teenagefest-lys: discokugle, LED-lyseffekt og farvet lyskæde"
      productId="pakke_teenagefest"
      faqPhrase="teenagefest-lys"
      capacity={{ level: 1, label: "kælderen eller garagen" }}
      bullets={[
        "LED-par-lys med farveeffekter — automatisk, ingen styring",
        "Discokugle 30 cm med motor og spot",
        "10 m farvet lyskæde til væg eller loft",
        "Alt kører på almindelige stikkontakter",
        "Spar 140 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Skal der også musik til?</h2>
          <p className="mb-6 text-white/50">
            Lyden til en teenagefest er som regel en Soundboks — den er batteridrevet, spiller højt og kan bæres ned ad kældertrappen i én hånd.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/soundboks-4" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Lej en Soundboks
            </Link>
            <Link href="/festlys" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Alt om festlys
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
