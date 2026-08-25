import { Metadata } from "next";
import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import { catalogDiscount, catalogPartsPrice, prisTekst } from "@/lib/products";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: 'Lej 32" Skærm på Stativ København — udlejes ikke lige nu | Lejhøjtaler.dk',
  description:
    "32 tommer LED-skærm på stativ. Udlejes ikke lige nu — vi har samlet udlejningen om højtalere, festlys og røg i København.",
  keywords: [
    "lej skærm",
    "32 tommer skærm leje",
    "skærm på stativ leje",
    "lille skærm til event",
    "karaoke skærm leje",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/skaerm-32" },
  openGraph: {
    title: 'Lej 32" Skærm på Stativ — udlejes ikke lige nu',
    description:
      "32 tommer LED-skærm på stativ. Udlejes ikke lige nu — vi har samlet udlejningen om højtalere, festlys og røg i København.",
    url: "https://lejhojtaler.dk/skaerm-32",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="skaerm-32"
      name={'32" Skærm'}
      price={395}
      headline={'Lej 32" skærm på stativ'}
      sub={'32" LED-skærm på 3-fod stativ — kompakt, nem at flytte og klar på 5 minutter.'}
      image="/images/product-skaerm-32.webp"
      imageAlt={'32" LED-skærm på 3-fod stativ til leje i København'}
      productId="skaerm_32"
      faqPhrase={'en 32" skærm'}
      bullets={[
        '32" LED-skærm i Full HD',
        "3-fod stativ med justerbar højde",
        "HDMI-kabel og strømkabel medfølger",
        "Fylder lidt — kan være i en almindelig bil",
        "Perfekt til karaoketekster, slides og billedshow",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold">Skal den bruges til karaoke?</h2>
          <p className="mx-auto mb-6 max-w-md text-white/50">
            Så får du den billigere i Karaokepakken sammen med maskine og højtalere —{" "}
            <LivePrice productId="pakke_karaoke" prefix="" suffix=" kr" /> i stedet for{" "}
            {prisTekst(catalogPartsPrice("pakke_karaoke"))} kr.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/pakke-karaoke"
              className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400"
            >
              Se Karaokepakken – spar {catalogDiscount("pakke_karaoke")} kr
            </Link>
            <Link
              href="/skaerm"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Se 55&quot; storskærm
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
