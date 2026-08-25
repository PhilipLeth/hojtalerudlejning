import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Udendørspakke | Soundboks, ekstra batteri og lyskæde | 995 kr | Lejhøjtaler.dk",
  description:
    "Udendørspakke: Soundboks 4, ekstra batteri og 10 m lyskæde for 995 kr — spar 140 kr. Fest i baggård, park eller på stranden helt uden strøm. Lejes i København.",
  keywords: ["fest uden strøm", "soundboks leje", "havefest lyd", "polterabend højtaler", "batteri højtaler leje"],
  alternates: { canonical: "https://lejhojtaler.dk/udendorspakke" },
  openGraph: {
    title: "Udendørspakke | Soundboks, ekstra batteri og lyskæde | 995 kr | Lejhøjtaler.dk",
    description: "Soundboks 4, ekstra batteri og 10 m lyskæde. Baggård, strand eller park — spar 140 kr.",
    url: "https://lejhojtaler.dk/udendorspakke",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function UdendorspakkePage() {
  return (
    <ProductLanding
      slug="udendorspakke"
      name="Udendørspakke"
      price={995}
      headline="Udendørspakken — hele festen uden en stikkontakt"
      sub="Soundboks 4, ekstra batteri og 10 m lyskæde. Baggård, strand eller park — spar 140 kr."
      image="/images/product-soundboks.webp"
      imageAlt="Udendørspakke med Soundboks 4, ekstra batteri og lyskæde"
      productId="pakke_udendors"
      faqPhrase="udendørspakken"
      capacity={{ level: 2, label: "op til 50 pers." }}
      bullets={[
        "Soundboks 4 — kraftig bas, batteridrevet, Bluetooth",
        "Ekstra batteri: to batterier holder til en hel aften og nat",
        "10 m lyskæde, så der også er lys når solen går ned",
        "Ingen strøm, ingen forlængerledninger, ingen kabler over græsset",
        "Spar 140 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Havefest, polterabend eller vielse i haven?</h2>
          <p className="mb-6 text-white/50">
            Det er den samme udfordring hver gang: der er ingen stikkontakt, og festen skal holde til efter midnat. To batterier gør, at anlægget ikke går ud midt i det hele.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/havefest"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Lyd til havefest
            </Link>
            <Link
              href="/polterabend"
              className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35"
            >
              Lyd til polterabend
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
