import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Fest-klar Plus | Soundboks + lys + opsætning | 1485 kr | Lejhøjtaler.dk",
  description:
    "Fest-klar Plus: Soundboks 4, lys-pakke og levering/opsætning i København for 1485 kr. Spar 100 kr på lyset. Book online.",
  keywords: ["fest klar plus", "soundboks lys", "festpakke københavn", "højtaler lys opsætning"],
  alternates: { canonical: "https://lejhojtaler.dk/fest-klar-plus" },
  openGraph: {
    title: "Fest-klar Plus | Soundboks + lys + opsætning | 1485 kr",
    description: "Soundboks 4 + lys + levering/opsætning. Spar 100 kr på lyset.",
    url: "https://lejhojtaler.dk/fest-klar-plus",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function FestKlarPlusPage() {
  return (
    <ProductLanding
      slug="fest-klar-plus"
      name="Fest-klar Plus"
      price={1485}
      headline="Fest-klar Plus i København"
      sub="Soundboks 4 + lys-pakke + levering og opsætning. Spar 100 kr på lyset."
      image="/images/mood-party.png"
      imageAlt="Fest-klar Plus med Soundboks, lys og opsætning"
      productId="pakke_fest_klar_plus"
      bullets={[
        "Soundboks 4 inkluderet",
        "Lys-pakke inkluderet (spar 100 kr)",
        "Levering + opsætning i København",
        "Vi sætter lyd og lys klar til brug",
        "Afhentning efter festen inkluderet",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Kun lyd?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Fest-klar uden lys — Soundboks + levering og opsætning for 1090 kr.
          </p>
          <Link
            href="/fest-klar"
            className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
          >
            Se Fest-klar – 1090 kr
          </Link>
        </div>
      </section>
    </ProductLanding>
  );
}
