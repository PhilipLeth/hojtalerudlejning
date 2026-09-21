import { prisDkk } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import UpsellBox from "@/components/UpsellBox";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Party Light Package Rental Copenhagen | ${prisDkk("lys")} | Lejhøjtaler.dk`,
  description:
    `Rent a party light package in Copenhagen for ${prisDkk("lys")} per weekend. 2 coloured LED lamps and a centre effect on a stand, plug and play, ready in minutes. Pay on pickup.`,
  keywords: [
    "party light rental copenhagen",
    "light bar rental copenhagen",
    "led light rental copenhagen",
    "disco light hire copenhagen",
    "event lighting rental copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/lys-pakke",
    languages: localeAlternates("/lys-pakke"),
  },
  openGraph: {
    images: ogImages("/images/product-lys-v4.webp"),
    title: `Party Light Package Rental Copenhagen | ${prisDkk("lys")}`,
    description:
      `2 coloured LED lamps + centre effect on a stand. ${prisDkk("lys")} per weekend. Book online.`,
    url: "https://lejhojtaler.dk/en/lys-pakke",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/lys-pakke"
      name="Light bar"
      headline="Rent a party light package in Copenhagen"
      sub="2 coloured LED lamps and a centre effect on a stand. Ready in a few minutes."
      image="/images/product-lys-v4-white.webp"
      imageAlt="Party light bar for rent in Copenhagen"
      productId="lys"
      bookLabel="Book the light bar now"
      faqPhrase="the light bar"
      bullets={[
        "2× coloured LED lamps",
        "Centre effect included",
        "Stand, power and cables included",
        "Pay on pickup",
        "Collect Friday, return Monday",
      ]}
    >
      <UpsellBox
        locale="en"
        title="Add fog and sound"
        text="Fog makes the light ten times better, the beams only become visible when there is something in the air. Add speakers for the full party package."
        links={[
          { href: "/en/roegmaskine", label: "See the fog machine", priceId: "rog" },
          { href: "/en", label: "See speakers", startpris: true },
        ]}
      />
    </ProductLanding>
  );
}
