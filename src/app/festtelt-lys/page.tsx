import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Festtelt-lys | 695 kr | Lejhøjtaler.dk",
  description: "To lyskæder og fire uplights — teltet og haven lyst op for 695 kr. Spar 90 kr. Lejes i København.",
  keywords: ["lys til festtelt", "lyskæder til telt leje", "party lyskæde udendørs", "lys til havefest"],
  alternates: {
    canonical: "https://lejhojtaler.dk/festtelt-lys",
    languages: localeAlternates("/festtelt-lys"),
  },
  openGraph: {
    title: "Festtelt-lys | 695 kr | Lejhøjtaler.dk",
    description: "20 m lyskæde (varm hvid + farvet) og 4 LED uplights. Fra kantine-telt til havefest — spar 90 kr.",
    url: "https://lejhojtaler.dk/festtelt-lys",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Side() {
  return (
    <ProductLanding
      slug="festtelt-lys"
      name="Festtelt-lys"
      price={695}
      headline="Festtelt-lys — teltet og haven lyst op"
      sub="20 m lyskæde (varm hvid + farvet) og 4 LED uplights. Fra kantine-telt til havefest — spar 90 kr."
      image="/images/product-pakke-festtelt.webp"
      imageAlt="Festtelt-lys tændt: varm hvid lyskæde over en farvet lyskæde og fire LED uplights"
      productId="pakke_festtelt"
      faqPhrase="festtelt-lys"
      capacity={{ level: 2, label: "et festtelt eller en have" }}
      bullets={[
        "10 m varm hvid lyskæde til hyggen over bordene",
        "10 m farvet lyskæde til festen",
        "4× LED uplight til teltdug, hæk eller husmur",
        "Alt tåler en dansk sommeraften under tag",
        "Spar 90 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Holder festen ved efter mørkefald?</h2>
          <p className="mb-6 text-white/50">
            Så gør en discokugle i teltet mere end du tror — den samler dansegulvet, når lyskæderne har gjort resten af arbejdet.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/discokugle" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Lej en discokugle
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
