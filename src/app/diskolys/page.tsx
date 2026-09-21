import { prisKr, rabatKr } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lej diskolys i København | Diskolys-pakken ${prisKr("pakke_diskolys")} | Lejhøjtaler.dk`,
  description: `Lej diskolys i København, pakken med lyseffekt og discokugle giver dansegulvet for ${prisKr("pakke_diskolys")}. Spar ${rabatKr("pakke_diskolys")} vs. delene enkeltvis. Intet depositum.`,
  keywords: ["lej diskolys", "diskolys til fest", "diskokugle leje", "lys til dansegulv", "diskolys sæt"],
  alternates: {
    canonical: "https://lejhojtaler.dk/diskolys",
    languages: localeAlternates("/diskolys"),
  },
  openGraph: {
    images: ogImages("/images/product-pakke-diskolys-taendt-v2.webp"),
    title: `Lej diskolys i København | ${prisKr("pakke_diskolys")}`,
    description: `Diskolyseffekt og discokugle med motor og spot. Den billigste vej til et rigtigt dansegulv, spar ${rabatKr("pakke_diskolys")}.`,
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
      headline="Lej diskolys i København"
      sub={`Diskolys-pakken: lyseffekt og discokugle med motor og spot, dansegulvet i én kasse. Spar ${rabatKr("pakke_diskolys")} vs. delene enkeltvis.`}
      weekendAvailability
      imageAlt="Diskolys-pakken tændt: discokugle på stativ med spot og en LED-lyseffekt i farvet lys"
      productId="pakke_diskolys"
      faqPhrase="diskolys-pakken"
      capacity={{ level: 1, label: "dansegulvet" }}
      bullets={[
        "LED-par-lys med automatiske farveeffekter, ingen styring, bare strøm",
        "Discokugle 40 cm med motor, spot og stativ/ophæng",
        "Fylder mindre end en flyttekasse, cykler nemt hjem",
        "Tilvalg: røgmaskine, der gør strålerne synlige i luften",
        `Spar ${rabatKr("pakke_diskolys")} vs. at leje delene enkeltvis`,
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Mangler der røg?</h2>
          <p className="mb-6 text-white/50">
            Lysstråler er usynlige i ren luft, man ser kun farvede pletter på væggen. En røgmaskine som tilvalg gør strålerne synlige, og så ligner det et diskotek.
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
