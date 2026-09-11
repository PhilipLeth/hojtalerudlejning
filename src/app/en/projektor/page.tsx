import { Metadata } from "next";
import UpsellBox from "@/components/UpsellBox";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Projector Rental Copenhagen | 495 DKK | Lejhøjtaler.dk",
  description:
    "Rent a Full HD projector in Copenhagen for 495 DKK. For presentations, meetings and movie nights — HDMI cable and remote control included. Book online.",
  keywords: ["projector rental copenhagen", "projector hire", "projector for presentation rental", "rent projector for event denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/projektor",
    languages: localeAlternates("/projektor"),
  },
  openGraph: {
    title: "Projector rental Copenhagen | 495 DKK",
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
      price={495}
      headline="Rent a projector in Copenhagen"
      sub="Full HD projector for presentations and film. HDMI — ready in 5 minutes."
      image="/images/product-projektor.webp"
      imageAlt="Projector for rent in Copenhagen"
      productId="projektor"
      bookLabel="Book the projector"
      faqPhrase="a projector"
      bullets={[
        "Full HD resolution",
        "HDMI cable included",
        "Remote control included",
        "Easy setup — ready in 5 minutes",
        "Pay on pickup",
        "Collect Friday, return Monday",
      ]}
    >
      <UpsellBox
        locale="en"
        title="Add a screen and a microphone"
        text="A projector belongs with a screen — not an LED display. Add the 160 cm screen and a wireless microphone and the presentation is complete."
        links={[
          { href: "/en?product=laerred_160#book", label: "Book the 160 cm screen", priceId: "laerred_160" },
          { href: "/en/traadloes-mikrofon", label: "See the wireless microphone", priceId: "traadloes_mikrofon", fra: true },
        ]}
      />
    </ProductLanding>
  );
}
