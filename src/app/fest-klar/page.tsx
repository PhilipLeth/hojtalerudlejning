import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Fest-klar | Soundboks + levering & opsætning | 1090 kr | Lejhøjtaler.dk",
  description:
    "Fest-klar pakke: Soundboks 4 med levering og opsætning i København for 1090 kr. Vi sætter op — I tænder festen. Book online.",
  keywords: ["fest klar", "soundboks levering", "højtaler opsætning københavn", "lej soundboks med opsætning"],
  alternates: { canonical: "https://lejhojtaler.dk/fest-klar" },
  openGraph: {
    title: "Fest-klar | Soundboks + opsætning | 1090 kr",
    description: "Soundboks 4 + levering og opsætning i København. Vi sætter op — I holder festen.",
    url: "https://lejhojtaler.dk/fest-klar",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function FestKlarPage() {
  return (
    <ProductLanding
      slug="fest-klar"
      name="Fest-klar"
      price={1090}
      headline="Fest-klar i København"
      sub="Soundboks 4 + levering og opsætning. Vi sætter op — I tænder festen."
      image="/images/product-soundboks.png"
      imageAlt="Fest-klar pakke med Soundboks og opsætning"
      productId="pakke_fest_klar"
      bullets={[
        "Soundboks 4 inkluderet",
        "Levering + opsætning i København (værdi 495 kr)",
        "Vi sætter alt klar til brug",
        "Afhentning efter festen inkluderet",
        "Betal ved levering / afhentning",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Vil I også have lys?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Fest-klar Plus tilføjer lys-pakke med 100 kr rabat — komplet fest-look.
          </p>
          <Link
            href="/fest-klar-plus"
            className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
          >
            Se Fest-klar Plus – 1485 kr
          </Link>
        </div>
      </section>
    </ProductLanding>
  );
}
