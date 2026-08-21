import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Bryllupspakke | Lyd, mikrofon, lys og low fog | 1.695 kr | Lejhøjtaler.dk",
  description:
    "Bryllupspakke: 2× EV 12\" højtalere på stativer, trådløs mikrofon til talerne, lys-pakke, lyskæde og low fog-maskine for 1.695 kr — spar 180 kr. Levering og opsætning kan tilvælges i København.",
  keywords: ["lyd til bryllup", "bryllupspakke leje", "mikrofon til bryllup", "low fog bryllup", "lys til bryllup"],
  alternates: { canonical: "https://lejhojtaler.dk/bryllupspakke" },
  openGraph: {
    title: "Bryllupspakke | Lyd, mikrofon, lys og low fog | 1.695 kr | Lejhøjtaler.dk",
    description: "Højtalere på stativer, trådløs mikrofon, lys, lyskæde og low fog til første dans. Spar 180 kr.",
    url: "https://lejhojtaler.dk/bryllupspakke",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function BryllupspakkePage() {
  return (
    <ProductLanding
      slug="bryllupspakke"
      name="Bryllupspakke"
      price={1695}
      headline="Bryllupspakken — talerne og dansegulvet i ét"
      sub="Højtalere på stativer, trådløs mikrofon, lys, lyskæde og low fog til første dans. Spar 180 kr."
      image="/images/product-lowfog.webp"
      imageAlt="Bryllupspakke med højtalere, mikrofon, lys og low fog"
      productId="pakke_bryllup"
      faqPhrase="bryllupspakken"
      capacity={{ level: 3, label: "op til 100 pers." }}
      bullets={[
        '2× EV 12" højtalere på stativer — taler under middagen, fest bagefter',
        "Trådløs mikrofon, så talerne kan høres helt bagest",
        "Lys-pakke: 2 farvede lamper + centereffekt",
        "10 m lyskæde til teltet eller loftet",
        "Low fog-maskine — \"dansen på skyer\" til første dans",
        "Spar 180 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Skal vi sætte op inden gæsterne kommer?</h2>
          <p className="mb-6 text-white/50">
            På en bryllupsdag er der ikke tid til at rigge et anlæg til. Vi kører ud om formiddagen, sætter op klar til brug og henter igen efter festen — 795 kr begge veje. Vælges i bookingen.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/bryllup"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Alt om lyd til bryllup
            </Link>
            <Link
              href="/lydanlaeg"
              className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35"
            >
              Flere end 100 gæster?
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
