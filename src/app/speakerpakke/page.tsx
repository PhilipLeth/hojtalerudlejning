import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Speakerpakken | Stor højtalerpakke + håndholdt mikrofon | 1.045 kr | Lejhøjtaler.dk",
  description:
    "Speakerpakken: stor højtalerpakke og håndholdt mikrofon med kabel for 1.045 kr — spar 45 kr. Musik og taler til 30-50 gæster, mikrofonen går direkte i højtaleren. Lejes i København.",
  keywords: ["højtaler og mikrofon leje", "lyd til tale og musik", "speakerpakke", "lej anlæg med mikrofon københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/speakerpakke",
    languages: localeAlternates("/speakerpakke"),
  },
  openGraph: {
    title: "Speakerpakken | Højtalere + mikrofon | 1.045 kr",
    description: "Stor højtalerpakke + håndholdt mikrofon. Lyd og taler til 30-50 gæster — spar 45 kr.",
    url: "https://lejhojtaler.dk/speakerpakke",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="speakerpakke"
      name="Speakerpakken"
      price={1045}
      headline="Speakerpakken — musik og taler uden en mixer imellem"
      sub="Stor højtalerpakke + håndholdt mikrofon med kabel. Mikrofonen går direkte i højtaleren — spar 45 kr."
      image="/images/product-festival-v2.webp"
      imageAlt="Speakerpakken med to EV-højtalere og håndholdt mikrofon"
      productId="pakke_speaker_mik"
      faqPhrase="speakerpakken"
      capacity={{ level: 2, label: "30-50 pers." }}
      bullets={[
        "2× EV 12\" højtalere med Bluetooth",
        "Håndholdt mikrofon med kabel — direkte i højtaleren",
        "Ingen mixer at lære — sæt i og tal",
        "Alle kabler med",
        "Spar 45 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Skal taleren kunne gå rundt?</h2>
          <p className="mb-6 text-white/50">
            Så tag Tale & musik-pakken med trådløs mikrofon i stedet. Skal der være flere mikrofoner eller et band, sætter vi en mixer på — se mixerne.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/pakke-tale-musik" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Se Tale & musik-pakken
            </Link>
            <Link href="/mixer" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              Se mixere
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
