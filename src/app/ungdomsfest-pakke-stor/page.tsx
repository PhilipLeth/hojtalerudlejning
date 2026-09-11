import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Stor ungdomsfest-pakke | Diskotek til 100 gæster | 2.395 kr | Lejhøjtaler.dk",
  description: "2× 12\" højtalere, lys-pakke, discokugle 40 cm og røgmaskine — et rigtigt diskotek til ungdomsfesten for 2.395 kr. Spar 285 kr. Lejes i København.",
  keywords: ["stor ungdomsfest pakke", "diskotek til fest leje", "lyd og lys til gymnasiefest", "18 års fødselsdag fest udstyr leje", "røgmaskine og discokugle leje"],
  alternates: {
    canonical: "https://lejhojtaler.dk/ungdomsfest-pakke-stor",
    languages: localeAlternates("/ungdomsfest-pakke-stor"),
  },
  openGraph: {
    title: "Stor ungdomsfest-pakke | Diskotek til 100 gæster | 2.395 kr | Lejhøjtaler.dk",
    description: "2× 12\" højtalere, lys-pakke på stativ, discokugle 40 cm og røgmaskine. Et rigtigt diskotek — spar 285 kr.",
    url: "https://lejhojtaler.dk/ungdomsfest-pakke-stor",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Side() {
  return (
    <ProductLanding
      slug="ungdomsfest-pakke-stor"
      name="Stor ungdomsfest-pakke"
      price={2395}
      headline="Stor ungdomsfest-pakke — et rigtigt diskotek"
      sub="To 12&quot; højtalere, lys-pakke på stativ, discokugle 40 cm og røgmaskine. Forsamlingshuset bliver til en klub — spar 285 kr."
      image="/images/product-pakke-ungdomsfest-stor-taendt.webp"
      imageAlt="Stor ungdomsfest-pakke tændt: to 12-tommer højtalere, lys-pakke på stativ, discokugle med spot og røgmaskine"
      productId="pakke_ungdomsfest_stor"
      faqPhrase="den store ungdomsfest-pakke"
      capacity={{ level: 3, label: "op til 100 gæster i forsamlingshus, hal eller lade" }}
      bullets={[
        "2× EV 12\" højtalere — fylder et forsamlingshus, Bluetooth fra telefonen",
        "Lys-pakke: to farvede lamper og centereffekt på stativ",
        "Discokugle 40 cm med motor og spot — prikker over hele rummet",
        "Røgmaskine med væske — det er røgen, der gør lysstrålerne synlige",
        "Subwoofer, stativer og mikrofon kan tilvælges — spar 285 kr vs. delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Mindre fest — eller ingen strøm?</h2>
          <p className="mb-6 text-white/50">
            Til kælderen og garagen er den lille ungdomsfest-pakke nok: Soundboks på batteri, lyseffekt og discokugle for 1.395 kr.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/ungdomsfest-pakke" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Ungdomsfest-pakken
            </Link>
            <Link href="/ungdomsfest" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Alt om lyd og lys til ungdomsfest
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
