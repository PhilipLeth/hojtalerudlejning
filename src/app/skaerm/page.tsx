import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import UpsellBox from "@/components/UpsellBox";

export const metadata: Metadata = {
  title: "Lej Storskærm København | Fra 595 kr | Lejhøjtaler.dk",
  description:
    "Lej 55\" LED-storskærm i København fra 595 kr/weekend. Skærm på 3-fod stativ til præsentationer og events. Fungerer i dagslys. Betal ved afhentning.",
  keywords: [
    "lej storskærm",
    "skærm udlejning",
    "skærm til event",
    "storskærm leje",
    "lej skærm præsentation",
    "skærm til konference",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/skaerm" },
  openGraph: {
    title: "Lej Storskærm København | Fra 595 kr",
    description:
      "Lej 55\" LED-storskærm i København fra 595 kr/weekend. 3-fod stativ inkluderet. Book online.",
    url: "https://lejhojtaler.dk/skaerm",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function SkaermPage() {
  return (
    <ProductLanding
      slug="skaerm"
      name="Storskærm"
      price={595}
      headline="Lej storskærm i København"
      sub='55" LED-skærm på 3-fod stativ. Fungerer i dagslys — skarpere end projektor.'
      image="/images/product-skaerm.webp"
      imageAlt="Storskærm til leje i København"
      productId="skaerm_55"
      bookLabel="Book storskærm nu"
      faqPhrase='en 55" storskærm'
      bullets={[
        '55" LED-skærm',
        "3-fod stativ inkluderet",
        "HDMI-kabel medfølger",
        "Fungerer perfekt i dagslys",
        "Betal ved afhentning",
        "Hent fredag, aflever mandag",
      ]}
    >
      <UpsellBox
        title="Kombiner med projektor og mikrofon"
        text="Storskærmen er perfekt sammen med en projektor eller trådløs mikrofon til præsentationer og events."
        links={[
          { href: "/projektor", label: "Se projektor – fra 495 kr" },
          { href: "/traadloes-mikrofon", label: "Se trådløs mikrofon – fra 295 kr" },
        ]}
      />
    </ProductLanding>
  );
}
