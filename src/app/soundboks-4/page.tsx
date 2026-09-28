import { prisKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import SoundboksAltPopup from "@/components/SoundboksAltPopup";
import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lej en Soundboks i København | Soundboks 4 fra ${prisKr("soundboks")} | Lejhøjtaler.dk`,
  description:
    `Lej en Soundboks i København, Soundboks 4 fra ${prisKr("soundboks")} for en hel weekend. Batteridrevet med kraftig bas, intet depositum. Book online, betal ved afhentning.`,
  keywords: ["lej soundboks", "lej en soundboks", "soundboks leje", "leje af soundboks", "soundboks udlejning københavn", "lej soundbox"],
  alternates: {
    canonical: "https://lejhojtaler.dk/soundboks-4",
    languages: localeAlternates("/soundboks-4"),
  },
  openGraph: {
    images: ogImages("/images/product-soundboks-v2.webp"),
    title: `Lej en Soundboks i København | Fra ${prisKr("soundboks")}`,
    description: `Lej en Soundboks i København fra ${prisKr("soundboks")}/weekend. Intet depositum. Book online.`,
    url: "https://lejhojtaler.dk/soundboks-4",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Soundboks4Page() {
  return (
    <>
      <SoundboksAltPopup />
      <ProductLanding
        slug="soundboks-4"
        name="Soundboks 4"
        headline="Lej en Soundboks i København"
        sub="Soundboks 4, batteridrevet med kraftig bas, ingen strøm nødvendig. Intet depositum: du betaler først, når du henter."
        weekendAvailability
        imageAlt="Soundboks 4 til leje i København"
        productId="soundboks"
        faqExtra={[
          {
            q: "Skal jeg betale depositum for at leje en Soundboks?",
            a: "Nej. Vi opkræver hverken depositum eller kaution, du betaler kun lejen. Du hæfter for udstyret fra afhentning til aflevering, men du skal ikke lægge penge ud.",
          },
          {
            q: "Hvor længe holder batteriet på en Soundboks 4?",
            a: "Regn med op til 12 timers spilletid ved festlydstyrke, rigeligt til en hel aften uden stikkontakt. Opladeren følger med, så lejer du hen over weekenden, kan du lade op til næste dag.",
          },
          {
            q: "Spiller en Soundboks højt nok til min fest?",
            a: "Ja, Soundboks 4 dækker op til 50 personer, også udendørs. Skal I være flere, eller vil du have mere bund, er Mellem højtalerpakke med subwoofer eller Festpakke 150 det rigtige valg. Og spiller du udendørs om natten, så vis hensyn til naboerne, det er dig, der er vært.",
          },
        ]}
        bullets={[
          "Batteridrevet - tag den med overalt",
          "Kraftig bas til udendørs fest",
          "Bluetooth + AUX",
          "Oplader og kabler inkluderet",
          "Hent fredag, aflever mandag",
        ]}
      >
        {/* Batteriet er et tilvalg på Soundboksen, ikke et produkt for sig på /lydanlaeg (28. sept 2026) */}
        <section className="mx-auto max-w-3xl px-4 pb-16">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-400">Tilvalg</p>
          <h2 className="mb-2 text-2xl font-bold">Ekstra batteri til en længere fest</h2>
          <p className="mb-6 max-w-xl text-sm text-white/50">
            Skift batteriet, når det første er ved at løbe tør, og spil videre uden stikkontakt. Vælg det i bookingen, eller book det her.
          </p>
          <CategoryProductGrid items={[{ id: "batteri" }]} />
        </section>
        <section className="mx-auto max-w-3xl px-4 pb-16">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-3 text-2xl font-bold">Billigere alternativ?</h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Mackie Thump GO er lettere og billigere - perfekt hvis du ikke behøver Soundboks-bas.
            </p>
            <Link
              href="/mackie-thump-go"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              Se Mackie Thump GO – <LivePrice productId="thumpgo" prefix="" suffix=" kr" />
            </Link>
          </div>
        </section>
      </ProductLanding>
    </>
  );
}
