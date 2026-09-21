import { prisKr, rabatKr } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Soundboks-pakken med lys | Soundboks 4 + lysbar | ${prisKr("pakke_soundboks_lys")} | Lejhøjtaler.dk`,
  description:
    `Soundboks-pakken med lys: Soundboks 4 og lysbar for ${prisKr("pakke_soundboks_lys")}, spar ${rabatKr("pakke_soundboks_lys")}. Batteridrevet lyd og festlys til op til 50 personer. Lejes i København.`,
  keywords: ["soundboks med lys leje", "soundboks pakke", "lej soundboks og festlys", "batterihøjtaler og lys københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/soundboks-pakke-lys",
    languages: localeAlternates("/soundboks-pakke-lys"),
  },
  openGraph: {
    images: ogImages("/images/product-soundboks-v2.webp"),
    title: `Soundboks-pakken med lys | ${prisKr("pakke_soundboks_lys")}`,
    description: `Soundboks 4 + lysbar. Batteridrevet lyd og lys til festen, spar ${rabatKr("pakke_soundboks_lys")}.`,
    url: "https://lejhojtaler.dk/soundboks-pakke-lys",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="soundboks-pakke-lys"
      name="Soundboks-pakken med lys"
      headline="Soundboks-pakken med lys, lyd uden stik, lys der gør det til en fest"
      sub={`Soundboks 4 + lysbar med 2 farvede lamper og centereffekt. Bassen kører på batteri, lyset kræver en stikkontakt, spar ${rabatKr("pakke_soundboks_lys")}.`}
      imageAlt="Soundboks-pakken med lys: Soundboks 4 og lysbar"
      productId="pakke_soundboks_lys"
      faqPhrase="Soundboks-pakken med lys"
      capacity={{ level: 2, label: "op til 50 pers." }}
      bullets={[
        "Soundboks 4, kraftig bas, batteridrevet, Bluetooth",
        "Lysbar: 2 farvede LED-lamper + centereffekt på stativ",
        "Lyset kræver strøm, tænk det med, hvis I er udenfor",
        "Oplader, AUX-kabel og alle lyskabler med",
        `Spar ${rabatKr("pakke_soundboks_lys")} vs. at leje delene enkeltvis`,
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Helt uden strøm?</h2>
          <p className="mb-6 text-white/50">
            Skal både lyd og lys køre uden stikkontakt, så tag Udendørspakken med ekstra batteri og lyskæde i stedet, den er bygget til baggård, park og strand.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/udendorspakke" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Se Udendørspakken
            </Link>
            <Link href="/soundboks-4" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              Se Soundboks 4 alene
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
