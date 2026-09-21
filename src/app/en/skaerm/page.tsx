import { prisDkk } from "@/lib/products";
import { Metadata } from "next";
import UpsellBox from "@/components/UpsellBox";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Large Screen Rental Copenhagen | ${prisDkk("skaerm_55")} | Lejhøjtaler.dk`,
  description:
    `Rent a 55\" LED display on a stand in Copenhagen for ${prisDkk("skaerm_55")}. Adjustable height, HDMI cable included, for meetings, conferences and karaoke. Book online.`,
  keywords: ["large screen rental copenhagen", "tv screen hire event", "55 inch display rental", "screen for conference copenhagen", "presentation screen rental"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/skaerm",
    languages: localeAlternates("/skaerm"),
  },
  openGraph: {
    images: ogImages("/images/product-skaerm.webp"),
    title: `Large screen rental Copenhagen | ${prisDkk("skaerm_55")}`,
    description: "55\" LED display on a stand. Works in daylight, sharper than a projector.",
    url: "https://lejhojtaler.dk/en/skaerm",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/skaerm"
      name="Large screen"
      headline="Rent a large screen in Copenhagen"
      sub={"55\" LED display on a tripod stand. Works in daylight, sharper than a projector."}
      imageAlt="Large screen for rent in Copenhagen"
      productId="skaerm_55"
      bookLabel="Book the large screen"
      faqPhrase={"a 55\" screen"}
      bullets={[
        "55\" LED display",
        "Tripod stand included",
        "HDMI cable included",
        "Works perfectly in daylight",
        "Pay on pickup",
        "Collect Friday, return Monday",
      ]}
    >
      <UpsellBox
        locale="en"
        title="Add a projector or a microphone"
        text="The large screen pairs well with a projector or a wireless microphone for presentations and events."
        links={[
          { href: "/en/projektor", label: "See the projector", priceId: "projektor", fra: true },
          { href: "/en/traadloes-mikrofon", label: "See the wireless microphone", priceId: "mikrofon", fra: true },
        ]}
      />
    </ProductLanding>
  );
}
