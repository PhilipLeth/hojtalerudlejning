import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import UpsellBox from "@/components/UpsellBox";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Fog Machine Rental Copenhagen | 595 DKK | Lejhøjtaler.dk",
  description:
    "Rent a smoke machine in Copenhagen for 595 DKK per weekend. Fog fluid and remote control included, warms up in 5 minutes. Makes your party lights visible. Pay on pickup.",
  keywords: [
    "fog machine rental copenhagen",
    "smoke machine rental copenhagen",
    "smoke machine hire denmark",
    "party fog machine rental",
    "event fog machine copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/roegmaskine",
    languages: localeAlternates("/roegmaskine"),
  },
  openGraph: {
    title: "Fog Machine Rental Copenhagen | 595 DKK",
    description:
      "Smoke machine incl. fog fluid and remote control. 595 DKK per weekend. Book online.",
    url: "https://lejhojtaler.dk/en/roegmaskine",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/roegmaskine"
      name="Fog machine"
      price={595}
      headline="Rent a fog machine in Copenhagen"
      sub="Fog fluid and remote control included, and it sets up in minutes."
      image="/images/product-rog.webp"
      imageAlt="Fog machine for rent in Copenhagen"
      productId="rog"
      bookLabel="Book the fog machine now"
      faqPhrase="a fog machine"
      bullets={[
        "Fog fluid included — ready to use",
        "Remote control included — run the fog from the sofa",
        "Easy setup — warms up in 5 minutes",
        "Pay on pickup — you only pay the rental",
        "Collect Friday, return Monday",
      ]}
    >
      <UpsellBox
        locale="en"
        title="Add sound and light"
        text="The fog machine is what makes light beams visible. Together with speakers and party lights it turns a room into a dancefloor."
        links={[
          { href: "/en", label: "See speakers", startpris: true },
          { href: "/en/festlys", label: "See party lights", priceId: "lys", fra: true },
        ]}
      />
    </ProductLanding>
  );
}
