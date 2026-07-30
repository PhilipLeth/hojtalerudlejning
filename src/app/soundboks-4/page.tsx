import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import SoundboksAltPopup from "@/components/SoundboksAltPopup";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lej Soundboks 4 København | Fra 595 kr | Lejhøjtaler.dk",
  description:
    "Lej Soundboks 4 i København fra 595 kr/weekend. Batteridrevet højtaler med kraftig bas. Betal ved afhentning. Book online.",
  keywords: ["lej soundboks", "soundboks 4 leje", "soundboks udlejning københavn", "lej soundboks 4"],
  alternates: { canonical: "https://lejhojtaler.dk/soundboks-4" },
  openGraph: {
    title: "Lej Soundboks 4 København | Fra 595 kr",
    description: "Lej Soundboks 4 i København fra 595 kr/weekend. Book online.",
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
        price={595}
        headline="Lej Soundboks 4 i København"
        sub="Batteridrevet højtaler med kraftig bas - ingen strøm nødvendig."
        image="/images/product-soundboks.png"
        imageAlt="Soundboks 4 til leje i København"
        productId="soundboks"
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
              Se Mackie Thump GO – 345 kr
            </Link>
          </div>
        </section>
      </ProductLanding>
    </>
  );
}
