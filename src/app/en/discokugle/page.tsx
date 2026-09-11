import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import UpsellBox from "@/components/UpsellBox";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Disco Ball Rental Copenhagen | 595 DKK | Lejhøjtaler.dk",
  description:
    "Rent a disco ball in Copenhagen for 595 DKK per weekend. 40 cm rotating mirror ball with motor, LED spotlight and stand — plug and play. Pay on pickup.",
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
    title: "Disco Ball Rental Copenhagen | 595 DKK",
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
      price={595}
      headline="Rent a disco ball in Copenhagen"
      sub="Rotating mirror ball with a motor and coloured LED spotlight. Ready in 2 minutes."
      image="/images/product-discokugle-v2.webp"
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
      <UpsellBox
        locale="en"
        title="Add fog and lights"
        text="The disco ball works best next to a fog machine and party lights — the fog is what makes the beams visible in the air."
        links={[
          { href: "/en/roegmaskine", label: "See the fog machine", priceId: "rog" },
          { href: "/en/festlys", label: "See party lights", priceId: "lys", fra: true },
        ]}
      />
    </ProductLanding>
  );
}
