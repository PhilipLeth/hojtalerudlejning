import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import SoundboksAltPopup from "@/components/SoundboksAltPopup";
import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lej en Soundboks i København | Soundboks 4 fra 695 kr | Lejhøjtaler.dk",
  description:
    "Lej en Soundboks i København — Soundboks 4 fra 695 kr for en hel weekend. Batteridrevet med kraftig bas, intet depositum. Book online, betal ved afhentning.",
  keywords: ["lej soundboks", "lej en soundboks", "soundboks leje", "leje af soundboks", "soundboks udlejning københavn", "lej soundbox"],
  alternates: {
    canonical: "https://lejhojtaler.dk/soundboks-4",
    languages: localeAlternates("/soundboks-4"),
  },
  openGraph: {
    title: "Lej en Soundboks i København | Fra 695 kr",
    description: "Lej en Soundboks i København fra 695 kr/weekend. Intet depositum. Book online.",
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
        price={695}
        headline="Lej en Soundboks i København"
        sub="Soundboks 4 — batteridrevet med kraftig bas, ingen strøm nødvendig. Intet depositum: du betaler først, når du henter."
        weekendAvailability
        image="/images/product-soundboks.webp"
        imageAlt="Soundboks 4 til leje i København"
        productId="soundboks"
        faqExtra={[
          {
            q: "Skal jeg betale depositum for at leje en Soundboks?",
            a: "Nej. Vi opkræver hverken depositum eller kaution — du betaler kun lejen. Du hæfter for udstyret fra afhentning til aflevering, men du skal ikke lægge penge ud.",
          },
          {
            q: "Hvor længe holder batteriet på en Soundboks 4?",
            a: "Regn med op til 12 timers spilletid ved festlydstyrke — rigeligt til en hel aften uden stikkontakt. Opladeren følger med, så lejer du hen over weekenden, kan du lade op til næste dag.",
          },
          {
            q: "Spiller en Soundboks højt nok til min fest?",
            a: "Ja — Soundboks 4 dækker op til 50 personer, også udendørs. Skal I være flere, eller vil du have mere bund, er den store højtalerpakke med subwoofer eller Festpakke 150 det rigtige valg. Og spiller du udendørs om natten, så vis hensyn til naboerne — det er dig, der er vært.",
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
