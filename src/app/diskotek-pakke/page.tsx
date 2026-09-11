import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Diskotek-pakken | 1.295 kr | Lejhøjtaler.dk",
  description: "Lys-pakke, diskolyseffekt og discokugle — fuldt dansegulv uden røg for 1.295 kr. Spar 190 kr. Lejes i København.",
  keywords: ["diskotekslys leje", "dj lys leje", "diskolys uden røg", "lys til fest i forsamlingshus"],
  alternates: {
    canonical: "https://lejhojtaler.dk/diskotek-pakke",
    languages: localeAlternates("/diskotek-pakke"),
  },
  openGraph: {
    title: "Diskotek-pakken | 1.295 kr | Lejhøjtaler.dk",
    description: "Lysbar på stativ, ekstra lyseffekt og discokugle. Til lokaler med røgalarm — spar 190 kr.",
    url: "https://lejhojtaler.dk/diskotek-pakke",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Side() {
  return (
    <ProductLanding
      slug="diskotek-pakke"
      name="Diskotek-pakken"
      price={1295}
      headline="Diskotek-pakken — fuldt dansegulv uden røg"
      sub="Lysbar på stativ, ekstra lyseffekt og discokugle. Til lokaler med røgalarm — spar 190 kr."
      image="/images/product-pakke-diskotek-taendt-v2.webp"
      imageAlt="Diskotek-pakken tændt: lys-pakke på stativ, discokugle og en ekstra LED-lyseffekt"
      productId="pakke_diskotek"
      faqPhrase="diskotek-pakken"
      capacity={{ level: 2, label: "et helt dansegulv" }}
      bullets={[
        "Lys-pakke: 2 farvede lamper + centereffekt på stativ",
        "Ekstra LED-par-lys til at krydse gulvet",
        "Discokugle 40 cm med motor og spot",
        "Ingen røg — må bruges i lokaler med røgalarm",
        "Spar 190 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Må der gerne bruges røg?</h2>
          <p className="mb-6 text-white/50">
            Så tag Lysshow i stedet — samme kugle, men med røgmaskine, der gør strålerne synlige i luften.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/lysshow" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Se Lysshow med røg
            </Link>
            <Link href="/festlys" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Alt om festlys
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
