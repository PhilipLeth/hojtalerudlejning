import { prisDkk, rabatDkk } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Large Light Show Rental Copenhagen | Lights, uplights, disco ball and low fog | ${prisDkk("pakke_lysshow_stor")} | Lejhøjtaler.dk`,
  description:
    `Large light show: light bar, four uplights, disco ball and low fog machine for ${prisDkk("pakke_lysshow_stor")}, save ${rabatDkk("pakke_lysshow_stor")}. Uplights paint the walls, low fog lays a carpet of fog without triggering the smoke alarm. Rent in Copenhagen.`,
  keywords: ["large light show rental copenhagen", "uplights and low fog hire", "party lighting for large venue copenhagen", "low fog machine rental denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/lysshow-stor",
    languages: localeAlternates("/lysshow-stor"),
  },
  openGraph: {
    images: ogImages("/images/product-uplight-4-v2.webp"),
    title: `Large light show | Lights, uplights, disco ball and low fog | ${prisDkk("pakke_lysshow_stor")}`,
    description: `Light bar, four uplights, disco ball and low fog. The whole room changes, save ${rabatDkk("pakke_lysshow_stor")}.`,
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
      headline="Large light show, the whole room changes"
      sub={`Light bar, four uplights, 40 cm disco ball and low fog machine. For the big party or the rented venue with fluorescent ceiling lights, save ${rabatDkk("pakke_lysshow_stor")}.`}
      image="/images/product-uplight-4-v2-white.webp"
      imageAlt="Large light show with uplights, light bar, disco ball and low fog"
      productId="pakke_lysshow_stor"
      faqPhrase="the large light show"
      capacity={{ level: 3, label: "up to 150 people" }}
      bullets={[
        "Light bar: 2 coloured LED lamps + centre effect for the dancefloor",
        "4× LED uplights, paint walls and corners in the colour you choose",
        "40 cm disco ball with motor and spotlight",
        "Low fog machine: a carpet of fog instead of fog in the whole room, the smoke alarm stays quiet",
        "All stands and cables included",
        `Save ${rabatDkk("pakke_lysshow_stor")} compared to renting the parts separately`,
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Need sound as well?</h2>
          <p className="mb-6 text-white/50">
            The large light show pairs with the medium speaker packages. Choose a system by number of guests, or take a party package where sound and lights are already combined.
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
