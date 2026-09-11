import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Large Light Show Rental Copenhagen | Lights, uplights, disco ball and low fog | 1,995 DKK | Lejhøjtaler.dk",
  description:
    "Large light show: light package, four uplights, disco ball and low fog machine for 1,995 DKK — save 285 DKK. Uplights paint the walls, low fog lays a carpet of fog without triggering the smoke alarm. Rent in Copenhagen.",
  keywords: ["large light show rental copenhagen", "uplights and low fog hire", "party lighting for large venue copenhagen", "low fog machine rental denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/lysshow-stor",
    languages: localeAlternates("/lysshow-stor"),
  },
  openGraph: {
    title: "Large light show | Lights, uplights, disco ball and low fog | 1,995 DKK",
    description: "Light package, four uplights, disco ball and low fog. The whole room changes — save 285 DKK.",
    url: "https://lejhojtaler.dk/en/lysshow-stor",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/lysshow-stor"
      name="Light show large"
      price={1995}
      headline="Large light show — the whole room changes"
      sub="Light package, four uplights, 40 cm disco ball and low fog machine. For the big party or the rented venue with fluorescent ceiling lights — save 285 DKK."
      image="/images/product-uplight-4.webp"
      imageAlt="Large light show with uplights, light package, disco ball and low fog"
      productId="pakke_lysshow_stor"
      faqPhrase="the large light show"
      capacity={{ level: 3, label: "up to 150 people" }}
      bullets={[
        "Light package: 2 coloured LED lamps + centre effect for the dancefloor",
        "4× LED uplights — paint walls and corners in the colour you choose",
        "40 cm disco ball with motor and spotlight",
        "Low fog machine: a carpet of fog instead of fog in the whole room — the smoke alarm stays quiet",
        "All stands and cables included",
        "Save 285 DKK compared to renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Need sound as well?</h2>
          <p className="mb-6 text-white/50">
            The large light show pairs with the large speaker packages. Choose a system by number of guests, or take a party package where sound and lights are already combined.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/lydanlaeg" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Choose a system by guests
            </Link>
            <Link href="/en/festpakke-150" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              See Party package 150
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
