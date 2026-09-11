import { Metadata } from "next";
import UpsellBox from "@/components/UpsellBox";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Large Screen Rental Copenhagen | 595 DKK | Lejhøjtaler.dk",
  description:
    "Rent a 55\" LED display on a stand in Copenhagen for 595 DKK. Adjustable height, HDMI cable included — for meetings, conferences and karaoke. Book online.",
  keywords: ["large screen rental copenhagen", "tv screen hire event", "55 inch display rental", "screen for conference copenhagen", "presentation screen rental"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/skaerm",
    languages: localeAlternates("/skaerm"),
  },
  openGraph: {
    title: "Large screen rental Copenhagen | 595 DKK",
    description: "55\" LED display on a stand. Works in daylight — sharper than a projector.",
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
      price={595}
      headline="Rent a large screen in Copenhagen"
      sub={"55\" LED display on a tripod stand. Works in daylight — sharper than a projector."}
      image="/images/product-skaerm.webp"
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
          { href: "/en/traadloes-mikrofon", label: "See the wireless microphone", priceId: "traadloes_mikrofon", fra: true },
        ]}
      />
    </ProductLanding>
  );
}
