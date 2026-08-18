import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Stemningslys-pakken | Uplights, lyskæde og discokugle | 695 kr | Lejhøjtaler.dk",
  description:
    "Stemningslys-pakken: 4 LED uplights, 10 m lyskæde og discokugle for 695 kr — spar 140 kr. Lys der laver et lejet lokale om. Lejes i København.",
  keywords: ["lej festlys", "uplights leje", "diskolys til fest", "lys til lokale leje", "lyskæder og discokugle"],
  alternates: { canonical: "https://lejhojtaler.dk/stemningslys" },
  openGraph: {
    title: "Stemningslys-pakken | Uplights, lyskæde og discokugle | 695 kr | Lejhøjtaler.dk",
    description: "4 LED uplights, 10 m lyskæde og discokugle. Til lokalet med lysstofrør i loftet — spar 140 kr.",
    url: "https://lejhojtaler.dk/stemningslys",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function StemningslysPage() {
  return (
    <ProductLanding
      slug="stemningslys"
      name="Stemningslys-pakken"
      price={695}
      headline="Stemningslys-pakken — lys uden lyd"
      sub="4 LED uplights, 10 m lyskæde og discokugle. Til lokalet med lysstofrør i loftet — spar 140 kr."
      image="/images/product-uplight-4.webp"
      imageAlt="Stemningslys-pakken med uplights, lyskæde og discokugle"
      productId="pakke_stemningslys"
      capacity={{ level: 2, label: "et helt lokale" }}
      bullets={[
        "4× LED uplight — vasker vægge og hjørner i farvet lys",
        "10 m lyskæde til loft, telt eller bardisk",
        "Discokugle med motor og spot til dansegulvet",
        "Plug and play: alt kører på almindelig strøm, ingen DMX-styring",
        "Spar 140 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Har I allerede lyd?</h2>
          <p className="mb-6 text-white/50">
            Så er det her pakken der mangler. Et lejet lokale med lysstofrør i loftet ligner en kantine indtil lyset bliver skiftet ud — fire uplights langs væggene er den billigste forandring der findes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/festlys"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Alt om festlys
            </Link>
            <Link
              href="/roeg"
              className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35"
            >
              Røg gør lyset synligt
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
