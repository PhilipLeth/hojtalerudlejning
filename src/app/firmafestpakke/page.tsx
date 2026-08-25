import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Firmafestpakke | Mikrofon, sub, lys og røg | 2.645 kr | Lejhøjtaler.dk",
  description:
    "Firmafestpakke: 2× EV 12\" højtalere på stativer, trådløs mikrofon, 12\" subwoofer, lys-pakke og røgmaskine for 2.645 kr — spar 130 kr. Til julefrokost og firmafest i København.",
  keywords: ["firmafest lyd", "julefrokost anlæg leje", "lyd til firmafest københavn", "mikrofon til tale", "anlæg til julefrokost"],
  alternates: { canonical: "https://lejhojtaler.dk/firmafestpakke" },
  openGraph: {
    title: "Firmafestpakke | Mikrofon, sub, lys og røg | 2.645 kr | Lejhøjtaler.dk",
    description: "Højtalere på stativer, trådløs mikrofon, subwoofer, lys og røg. Til julefrokost og firmafest — spar 130 kr.",
    url: "https://lejhojtaler.dk/firmafestpakke",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function FirmafestpakkePage() {
  return (
    <ProductLanding
      slug="firmafestpakke"
      name="Firmafestpakke"
      price={2645}
      headline="Firmafestpakken — talen først, dansegulvet bagefter"
      sub="Højtalere på stativer, trådløs mikrofon, subwoofer, lys og røg. Til julefrokost og firmafest — spar 130 kr."
      image="/images/product-pakke-fest-stor.webp"
      imageAlt="Firmafestpakke med højtalere, subwoofer, lys og røgmaskine"
      productId="pakke_firmafest"
      faqPhrase="firmafestpakken"
      capacity={{ level: 3, label: "op til 120 pers." }}
      bullets={[
        '2× EV 12" højtalere på stativer',
        "Trådløs mikrofon til velkomst og takketale",
        '12" subwoofer — bassen der får folk op fra bordene',
        "Lys-pakke og røgmaskine, så lokalet ikke bare er oplyst",
        "Alle kabler og Bluetooth med",
        "Spar 130 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Skal I have en faktura?</h2>
          <p className="mb-6 text-white/50">
            Vi sender faktura med EAN eller CVR, og vi kan levere, sætte op og hente igen. Er I flere end 120, eller skal der være mere end to mikrofoner på scenen, laver vi et tilbud i stedet.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/erhverv"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Udlejning til erhverv
            </Link>
            <Link
              href="/lydanlaeg"
              className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35"
            >
              Se hele stigen
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
