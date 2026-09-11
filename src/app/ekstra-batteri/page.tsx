import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lej Ekstra Batteri til Batterihøjtaler | 145 kr | Lejhøjtaler.dk",
  description:
    "Lej et ekstra batteri til Mackie Thump GO eller Soundboks for 145 kr. Dobbelt spilletid uden strøm — til havefest, strand og studenterkørsel. Lejes i København.",
  keywords: ["ekstra batteri højtaler leje", "soundboks ekstra batteri", "thump go batteri leje", "batterihøjtaler hele natten"],
  alternates: {
    canonical: "https://lejhojtaler.dk/ekstra-batteri",
    languages: localeAlternates("/ekstra-batteri"),
  },
  openGraph: {
    title: "Lej Ekstra Batteri | 145 kr",
    description: "Ekstra batteri til batterihøjtaler — dobbelt spilletid uden strøm.",
    url: "https://lejhojtaler.dk/ekstra-batteri",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="ekstra-batteri"
      name="Ekstra batteri"
      price={145}
      headline="Lej ekstra batteri"
      sub="Et ekstra batteri til Mackie Thump GO eller Soundboks 4 — så festen ikke slutter, når det første løber tørt."
      image="/images/product-thumpgo.webp"
      imageAlt="Ekstra batteri til batterihøjtaler"
      productId="batteri"
      bookLabel="Book ekstra batteri nu"
      faqPhrase="et ekstra batteri"
      bullets={[
        "Passer til Mackie Thump GO og Soundboks 4",
        "Dobbelt spilletid — typisk 20+ timer i alt ved festlydstyrke",
        "Skiftes på et halvt minut uden værktøj",
        "Leveres fuldt opladet sammen med højtaleren",
        "Inkluderet i Udendørspakken og Studenterpakken",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Hvor længe holder ét batteri?</h2>
          <p className="mb-6 text-white/50">
            Ved almindelig festlydstyrke holder Soundboks 4 omkring 40 timer på lav og 10-12 timer på høj; Thump GO omkring 12 timer. Skal der spilles højt fra eftermiddag til nat, er det ekstra batteri det, der redder aftenen.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/udendorspakke" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Se Udendørspakken
            </Link>
            <Link href="/soundboks-4" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              Se Soundboks 4
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
