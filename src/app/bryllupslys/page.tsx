import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Bryllupslys-pakken | 1.245 kr | Lejhøjtaler.dk",
  description: "Lyskæde, uplights og low fog til brudevalsen — dans på skyer for 1.245 kr. Spar 140 kr. Lejes i København.",
  keywords: ["bryllupslys leje", "low fog bryllup", "brudevals røg på gulvet", "lys til bryllup leje"],
  alternates: {
    canonical: "https://lejhojtaler.dk/bryllupslys",
    languages: localeAlternates("/bryllupslys"),
  },
  openGraph: {
    title: "Bryllupslys-pakken | 1.245 kr | Lejhøjtaler.dk",
    description: "Varmt lys over bordene, uplights på væggene og low fog til brudevalsen — spar 140 kr.",
    url: "https://lejhojtaler.dk/bryllupslys",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Side() {
  return (
    <ProductLanding
      slug="bryllupslys"
      name="Bryllupslys-pakken"
      price={1245}
      headline="Bryllupslys-pakken — dans brudevalsen på skyer"
      sub="Varmt lys over bordene, uplights på væggene og low fog til brudevalsen — spar 140 kr."
      image="/images/product-pakke-bryllupslys-taendt.webp"
      imageAlt="Bryllupslys-pakken tændt: varm hvid lyskæde, fire LED uplights og low fog-maskinen med røggulv"
      productId="pakke_bryllupslys"
      faqPhrase="bryllupslys-pakken"
      capacity={{ level: 2, label: "en lade eller festsal" }}
      bullets={[
        "Low fog-maskinen laver 'dansen på skyer'-effekten fra bryllupsvideoer",
        "10 m varm hvid lyskæde over bordene",
        "4× LED uplight — vælg én farve, og salen følger med",
        "Alt kører på almindelig strøm, ingen tekniker",
        "Spar 140 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Skal lyden med?</h2>
          <p className="mb-6 text-white/50">
            Bryllupspakken har det hele: højtalere, trådløs mikrofon til talerne, lys og low fog — samlet i én booking.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/bryllup" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Se Bryllupspakken med lyd
            </Link>
            <Link href="/roeg" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Alt om røg og low fog
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
