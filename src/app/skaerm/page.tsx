import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";
import UpsellBox from "@/components/UpsellBox";

export const metadata: Metadata = {
  title: "Lej Storskærm København | 595 kr | Lejhøjtaler.dk",
  description:
    "Lej en 55\" LED-storskærm på stativ i København for 595 kr. Justerbar højde, HDMI-kabel med — til møder, konferencer og karaoke. Book online.",
  keywords: [
    "lej storskærm",
    "skærm udlejning",
    "skærm til event",
    "storskærm leje",
    "lej skærm præsentation",
    "skærm til konference",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/skaerm",
    languages: localeAlternates("/skaerm"),
  },
  openGraph: {
    title: "Lej Storskærm København | 595 kr",
    description:
      "Lej en 55\" LED-storskærm på stativ i København for 595 kr. Justerbar højde, HDMI-kabel med — til møder, konferencer og karaoke. Book online.",
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
          { href: "/projektor", label: "Se projektor", priceId: "projektor", fra: true },
          { href: "/traadloes-mikrofon", label: "Se trådløs mikrofon", priceId: "traadloes_mikrofon", fra: true },
        ]}
      />
    </ProductLanding>
  );
}
