import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import UpsellBox from "@/components/UpsellBox";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Headset Microphone Rental Copenhagen | 345 DKK | Lejhøjtaler.dk",
  description:
    "Rent a wireless headset microphone in Copenhagen for 345 DKK per weekend. Hands-free sound for presentations, conferences and teaching. Receiver and batteries included.",
  keywords: [
    "headset microphone rental copenhagen",
    "wireless headset rental copenhagen",
    "lapel microphone hire copenhagen",
    "microphone rental for presentations",
    "conference microphone rental copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/headset-mikrofon",
    languages: localeAlternates("/headset-mikrofon"),
  },
  openGraph: {
    title: "Headset Microphone Rental Copenhagen | 345 DKK",
    description:
      "Wireless headset microphone for presentations and conferences. Hands-free. Book online.",
    url: "https://lejhojtaler.dk/en/headset-mikrofon",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/headset-mikrofon"
      name="Wireless headset microphone"
      price={345}
      headline="Rent a headset microphone"
      sub="Wireless headset for presentations and conferences. Hands-free."
      image="/images/product-headset.webp"
      imageAlt="Wireless headset microphone for rent in Copenhagen"
      productId="headset"
      bookLabel="Book the headset now"
      faqPhrase="a wireless headset"
      bullets={[
        "Wireless headset microphone",
        "Bodypack transmitter included",
        "Receiver and batteries included",
        "Cable to speaker or mixer included",
        "Hands-free — made for presentations",
        "Collect Friday, return Monday",
      ]}
    >
      <UpsellBox
        locale="en"
        title="Add a microphone and speakers"
        text="The headset keeps the speaker's hands free while a wireless microphone goes round the room for questions. The speaker has to come too — the headset amplifies nothing on its own."
        links={[
          {
            href: "/en/traadloes-mikrofon",
            label: "See the wireless microphone",
            priceId: "traadloes_mikrofon",
            fra: true,
          },
        ]}
      />
    </ProductLanding>
  );
}
