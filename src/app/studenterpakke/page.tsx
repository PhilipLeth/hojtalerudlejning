import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Studenterpakken | Soundboks, ekstra batteri og taske | 745 kr | Lejhøjtaler.dk",
  description:
    "Studenterpakken: Soundboks 4, ekstra batteri og polstret bæretaske for 745 kr — spar 90 kr. Spiller hele studenterkørslen uden strøm. Lejes i København.",
  keywords: ["studenterkørsel højtaler", "soundboks til studenterkørsel", "lej højtaler studenter", "musik til studentervogn"],
  alternates: { canonical: "https://lejhojtaler.dk/studenterpakke" },
  openGraph: {
    title: "Studenterpakken | Soundboks, ekstra batteri og taske | 745 kr | Lejhøjtaler.dk",
    description: "Soundboks 4, ekstra batteri og polstret bæretaske. Ingen strøm på ladet — spar 90 kr.",
    url: "https://lejhojtaler.dk/studenterpakke",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function StudenterpakkePage() {
  return (
    <ProductLanding
      slug="studenterpakke"
      name="Studenterpakken"
      price={745}
      headline="Studenterpakken — spiller hele vognturen"
      sub="Soundboks 4, ekstra batteri og polstret bæretaske. Ingen strøm på ladet — spar 90 kr."
      image="/images/product-soundboks.webp"
      imageAlt="Studenterpakken med Soundboks 4, ekstra batteri og bæretaske"
      productId="pakke_student"
      faqPhrase="studenterpakken"
      capacity={{ level: 2, label: "op til 50 pers." }}
      bullets={[
        "Soundboks 4 — den der kan høres over motoren",
        "Ekstra batteri, så den holder fra morgen til sidste adresse",
        "Polstret bæretaske: anlægget løftes op og ned hele dagen",
        "Bluetooth — alle kan skifte nummer fra deres telefon",
        "Spar 90 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Husk at spænde den fast</h2>
          <p className="mb-6 text-white/50">
            En Soundboks vejer 11 kg og står ikke stille på et lad. Tag en spændrem eller to med, og stil den ind mod førerhuset. Vi lægger AUX-kabel og oplader i tasken.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/studenterkoersel"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Alt om studenterkørsel
            </Link>
            <Link
              href="/udendorspakke"
              className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35"
            >
              Skal der også være lys?
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
