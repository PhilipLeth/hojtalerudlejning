import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lej diskolys i København | Diskolys-pakken 845 kr | Lejhøjtaler.dk",
  description: "Lej diskolys i København — pakken med lyseffekt og discokugle giver dansegulvet for 845 kr. Spar 145 kr vs. delene enkeltvis. Intet depositum.",
  keywords: ["lej diskolys", "diskolys til fest", "diskokugle leje", "lys til dansegulv", "diskolys sæt"],
  alternates: {
    canonical: "https://lejhojtaler.dk/diskolys",
    languages: localeAlternates("/diskolys"),
  },
  openGraph: {
    title: "Lej diskolys i København | 845 kr",
    description: "Diskolyseffekt og discokugle med motor og spot. Den billigste vej til et rigtigt dansegulv — spar 145 kr.",
    url: "https://lejhojtaler.dk/diskolys",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Side() {
  return (
    <ProductLanding
      slug="diskolys"
      name="Diskolys-pakken"
      price={845}
      headline="Lej diskolys i København"
      sub="Diskolys-pakken: lyseffekt og discokugle med motor og spot — dansegulvet i én kasse. Spar 145 kr vs. delene enkeltvis."
      weekendAvailability
      image="/images/product-pakke-diskolys.webp"
      imageAlt="Diskolys-pakken: discokugle med motor og spot samt LED-lyseffekt"
      productId="pakke_diskolys"
      faqPhrase="diskolys-pakken"
      capacity={{ level: 1, label: "dansegulvet" }}
      bullets={[
        "LED-par-lys med automatiske farveeffekter — ingen styring, bare strøm",
        "Discokugle 40 cm med motor, spot og stativ/ophæng",
        "Fylder mindre end en flyttekasse — cykler nemt hjem",
        "Tilvalg: røgmaskine, der gør strålerne synlige i luften",
        "Spar 145 kr vs. at leje delene enkeltvis",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Mangler der røg?</h2>
          <p className="mb-6 text-white/50">
            Lysstråler er usynlige i ren luft — man ser kun farvede pletter på væggen. En røgmaskine som tilvalg gør strålerne synlige, og så ligner det et diskotek.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/roeg" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Røg gør lyset synligt
            </Link>
            <Link href="/lysshow" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Se Lysshow-pakken med røg
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
