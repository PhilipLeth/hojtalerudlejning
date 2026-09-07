import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import UpsellBox from "@/components/UpsellBox";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Wireless Microphone Rental Copenhagen | 295 DKK | Lejhøjtaler.dk",
  description:
    "Rent a wireless handheld microphone in Copenhagen for 295 DKK per weekend. Receiver, batteries and cable included — plugs straight into our speakers. Pay on pickup.",
  keywords: [
    "wireless microphone rental copenhagen",
    "microphone rental copenhagen",
    "rent a microphone copenhagen",
    "handheld mic hire copenhagen",
    "microphone for speeches rental",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/traadloes-mikrofon",
    languages: localeAlternates("/traadloes-mikrofon"),
  },
  openGraph: {
    title: "Wireless Microphone Rental Copenhagen | 295 DKK",
    description:
      "Wireless handheld microphone for speeches, weddings and events. Receiver and cables included. Book online.",
    url: "https://lejhojtaler.dk/en/traadloes-mikrofon",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/traadloes-mikrofon"
      name="Wireless microphone"
      price={295}
      headline="Rent a wireless microphone in Copenhagen"
      sub="Wireless handheld microphone for speeches, weddings and events."
      image="/images/product-mikrofon.webp"
      imageAlt="Wireless microphone for rent in Copenhagen"
      productId="traadloes_mikrofon"
      bookLabel="Book the microphone now"
      faqPhrase="a wireless microphone"
      bullets={[
        "Wireless handheld microphone",
        "Receiver included",
        "Batteries included",
        "Cable to speaker or mixer included",
        "Pay on pickup — you only pay the rental",
        "Collect Friday, return Monday",
      ]}
    >
      <UpsellBox
        locale="en"
        title="Add a headset and speakers"
        text="A headset keeps the speaker's hands free while a wireless mic goes round the room for questions. The speaker has to come too — a microphone amplifies nothing on its own."
        links={[
          { href: "/en/headset-mikrofon", label: "See the headset", priceId: "headset" },
          { href: "/en", label: "See speakers", startpris: true },
        ]}
      />
    </ProductLanding>
  );
}
