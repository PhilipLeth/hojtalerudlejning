import { prisDkk } from "@/lib/products";
import { Metadata } from "next";
import UpsellBox from "@/components/UpsellBox";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Projector Rental Copenhagen | ${prisDkk("projektor")} | Lejhøjtaler.dk`,
  description:
    `Rent a Full HD projector in Copenhagen for ${prisDkk("projektor")}. For presentations, meetings and movie nights, HDMI cable and remote control included. Book online.`,
  keywords: ["projector rental copenhagen", "projector hire", "projector for presentation rental", "rent projector for event denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/projektor",
    languages: localeAlternates("/projektor"),
  },
  openGraph: {
    images: ogImages("/images/product-projektor.webp"),
    title: `Projector rental Copenhagen | ${prisDkk("projektor")}`,
    description: "Full HD projector for presentations and film. HDMI cable and remote control included. Book online.",
    url: "https://lejhojtaler.dk/en/projektor",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/projektor"
      name="Projector"
      headline="Rent a projector in Copenhagen"
      sub="Full HD projector for presentations and film. HDMI, ready in 5 minutes."
      imageAlt="Projector for rent in Copenhagen"
      productId="projektor"
      bookLabel="Book the projector"
      faqPhrase="a projector"
      bullets={[
        "Full HD resolution",
        "HDMI cable included",
        "Remote control included",
        "Easy setup, ready in 5 minutes",
        "Pay on pickup",
        "Collect Friday, return Monday",
      ]}
    >
      <UpsellBox
        locale="en"
        title="Add a screen and a microphone"
        text="A projector belongs with a screen, not an LED display. Add the 160 cm screen and a wireless microphone and the presentation is complete."
        links={[
          { href: "/en/book?product=laerred_160", label: "Book the 160 cm screen", priceId: "laerred_160" },
          { href: "/en/traadloes-mikrofon", label: "See the wireless microphone", priceId: "mikrofon", fra: true },
        ]}
      />
    </ProductLanding>
  );
}
