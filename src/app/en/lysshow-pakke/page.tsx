import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Light Show Package Rental Copenhagen | Lights, disco ball and fog | 1,495 DKK | Lejhøjtaler.dk",
  description:
    "Light show package: light package, 40 cm disco ball and fog machine for 1,495 DKK — save 190 DKK. The fog makes the beams visible, so it looks like a show. Rent in Copenhagen.",
  keywords: ["light show rental copenhagen", "party lights and fog machine rental", "disco ball and fog hire copenhagen", "party lighting package denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/lysshow-pakke",
    languages: localeAlternates("/lysshow-pakke"),
  },
  openGraph: {
    title: "Light show package | Lights, disco ball and fog | 1,495 DKK",
    description: "Light package, disco ball and fog machine. The beams become visible in the air — save 190 DKK.",
    url: "https://lejhojtaler.dk/en/lysshow-pakke",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/lysshow-pakke"
      name="Light show"
      price={1495}
      headline="Light show package — the beams become visible"
      sub="Light package, 40 cm disco ball and fog machine. Without fog you see coloured dots on the wall; with fog the beams turn into a show — save 190 DKK."
      image="/images/product-lys-v2.webp"
      imageAlt="Light show package with light package, disco ball and fog machine"
      productId="pakke_lysshow"
      faqPhrase="the light show package"
      capacity={{ level: 2, label: "up to 60 people" }}
      bullets={[
        "Light package: 2 coloured LED lamps + centre effect on a stand",
        "40 cm disco ball with motor and spotlight",
        "Fog machine incl. fluid — makes the beams visible",
        "All stands and cables included",
        "Save 190 DKK compared to renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Is fog allowed at your venue?</h2>
          <p className="mb-6 text-white/50">
            Ask the landlord or look for smoke alarms before you book. In rented venues with alarms, the large light show with low fog is the safe choice — the fog stays on the floor instead of filling the room.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/lysshow-stor" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              See the large light show
            </Link>
            <Link href="/en/lysshow" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              All light shows
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
