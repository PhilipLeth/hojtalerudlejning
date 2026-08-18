import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Filmaften-pakken | Projektor, lærred og højtalere | 995 kr | Lejhøjtaler.dk",
  description:
    "Filmaften-pakken: Full HD projektor, 160 cm lærred på stativ og 2× Alto 10\" højtalere for 995 kr — spar 90 kr. Biograf i gården eller haven. Lejes i København.",
  keywords: ["lej projektor og lærred", "udendørs biograf leje", "projektor til fest", "filmaften udstyr", "lærred leje københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/filmaften" },
  openGraph: {
    title: "Filmaften-pakken | Projektor, lærred og højtalere | 995 kr | Lejhøjtaler.dk",
    description: "Full HD projektor, 160 cm lærred på stativ og to højtalere. Alt til filmaftenen — spar 90 kr.",
    url: "https://lejhojtaler.dk/filmaften",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function FilmaftenPage() {
  return (
    <ProductLanding
      slug="filmaften"
      name="Filmaften-pakken"
      price={995}
      headline="Filmaften-pakken — biograf i gården"
      sub="Full HD projektor, 160 cm lærred på stativ og to højtalere. Alt til filmaftenen — spar 90 kr."
      image="/images/product-projektor.webp"
      imageAlt="Filmaften-pakken med projektor, lærred og højtalere"
      productId="pakke_filmaften"
      capacity={{ level: 2, label: "op til 40 pers." }}
      bullets={[
        "Full HD projektor med HDMI og fjernbetjening",
        "Lærred 160 cm på stativ — står frit, skal ikke hænges op",
        '2× Alto 10" højtalere: en projektors egen lyd rækker ikke',
        "Alle kabler og strøm med",
        "Spar 90 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Skal der ses film udenfor?</h2>
          <p className="mb-6 text-white/50">
            Vent til det er rigtigt mørkt — en Full HD-projektor kan ikke konkurrere med sommeraftenlys. Skal der vises noget i dagslys eller i et stort lokale, tager vi Projektor Pro med 5000 lumen i stedet.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/projektor-pro"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Projektor Pro (5000 lumen)
            </Link>
            <Link
              href="/av-udstyr"
              className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35"
            >
              Alt AV-udstyr
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
