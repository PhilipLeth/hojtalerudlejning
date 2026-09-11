import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Ungdomsfest-pakken | Lyd og diskolys | 1.395 kr | Lejhøjtaler.dk",
  description: "Soundboks 4, diskolyseffekt og discokugle i én pakke — lyd og lys til ungdomsfesten for 1.395 kr. Spar 190 kr. Lejes i København, sat op på ti minutter.",
  keywords: ["ungdomsfest pakke", "lyd og lys til ungdomsfest", "18 års fødselsdag fest udstyr", "lej diskolys og højtaler", "fest for unge lys"],
  alternates: {
    canonical: "https://lejhojtaler.dk/ungdomsfest-pakke",
    languages: localeAlternates("/ungdomsfest-pakke"),
  },
  openGraph: {
    title: "Ungdomsfest-pakken | Lyd og diskolys | 1.395 kr | Lejhøjtaler.dk",
    description: "Soundboks 4, diskolyseffekt og discokugle. Sluk loftslyset, tænd pakken — spar 190 kr.",
    url: "https://lejhojtaler.dk/ungdomsfest-pakke",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Side() {
  return (
    <ProductLanding
      slug="ungdomsfest-pakke"
      name="Ungdomsfest-pakken"
      price={1395}
      headline="Ungdomsfest-pakken — lyd og diskolys i én pris"
      sub="Soundboks 4, diskolyseffekt og discokugle 30 cm. Batteridrevet lyd, lys der laver dansegulvet — spar 190 kr."
      image="/images/product-pakke-ungdomsfest-taendt.webp"
      imageAlt="Ungdomsfest-pakken tændt: Soundboks 4, LED-lyseffekt og discokugle med spot i et mørkt rum"
      productId="pakke_ungdomsfest"
      faqPhrase="ungdomsfest-pakken"
      capacity={{ level: 2, label: "op til 50 gæster i kælderen, garagen eller stuen" }}
      bullets={[
        "Soundboks 4 — kraftig bas, Bluetooth og batteri, ingen stikkontakt nødvendig",
        "LED-par-lys med automatiske farveeffekter — plug and play",
        "Discokugle 30 cm med motor og spot — den klassiske prikkede effekt",
        "Røgmaskine og farvet lyskæde kan tilvælges i bookingen",
        "Spar 190 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Bliver I flere end 50?</h2>
          <p className="mb-6 text-white/50">
            Så er det den store ungdomsfest-pakke: to 12&quot; højtalere, lys-pakke på stativ, 40 cm discokugle og røgmaskine — et rigtigt diskotek til forsamlingshuset eller hallen.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/ungdomsfest-pakke-stor" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Stor ungdomsfest-pakke
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
