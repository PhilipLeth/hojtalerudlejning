import { prisDkk } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import UpsellBox from "@/components/UpsellBox";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Disco Ball Rental Copenhagen | ${prisDkk("discokugle")} | Lejhøjtaler.dk`,
  description:
    `Rent a disco ball in Copenhagen for ${prisDkk("discokugle")} per weekend. 40 cm rotating mirror ball with motor, LED spotlight and stand, plug and play. Pay on pickup.`,
  keywords: [
    "disco ball rental copenhagen",
    "mirror ball hire copenhagen",
    "rent disco ball denmark",
    "party lighting rental copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/discokugle",
    languages: localeAlternates("/discokugle"),
  },
  openGraph: {
    images: ogImages("/images/product-discokugle-v2.webp"),
    title: `Disco Ball Rental Copenhagen | ${prisDkk("discokugle")}`,
    description:
      "40 cm rotating disco ball with motor, LED spotlight and stand. Book online.",
    url: "https://lejhojtaler.dk/en/discokugle",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/discokugle"
      name="Disco ball"
      headline="Rent a disco ball in Copenhagen"
      sub="Rotating mirror ball with a motor and coloured LED spotlight. Ready in 2 minutes."
      imageAlt="Disco ball for rent in Copenhagen"
      productId="discokugle"
      bookLabel="Book the disco ball now"
      faqPhrase="a disco ball"
      bullets={[
        "Rotating, with LED colour effects",
        "Plug and play, with hanging kit or stand",
        "Spotlight included",
        "Pay on pickup",
        "Collect Friday, return Monday",
      ]}
    >
      {/*
        The ads promise "disco balls from 545 DKK", which is the 30 cm one, and
        the gold ball had no page at all. Both are on the page now, so the
        promise can actually be booked here.
      */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-2 text-2xl font-bold">All three disco balls</h2>
        <p className="mb-8 text-white/50">30 or 40 cm, silver or gold. Motor, stand and spotlight included in all of them.</p>
        <CategoryProductGrid locale="en" items={[{ id: "discokugle_30" }, { id: "discokugle" }, { id: "discokugle_guld" }]} />
      </section>
      <UpsellBox
        locale="en"
        title="Add fog and lights"
        text="The disco ball works best next to a fog machine and party lights, the fog is what makes the beams visible in the air."
        links={[
          { href: "/en/roegmaskine", label: "See the fog machine", priceId: "rog" },
          { href: "/en/festlys", label: "See party lights", priceId: "lys", fra: true },
        ]}
      />
    </ProductLanding>
  );
}
