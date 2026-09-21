import { prisKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";
import UpsellBox from "@/components/UpsellBox";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Lej Projektor København | ${prisKr("projektor")} | Lejhøjtaler.dk`,
  description:
    `Lej en Full HD-projektor i København for ${prisKr("projektor")}. Til præsentationer, møder og filmaften, HDMI-kabel og fjernbetjening følger med. Book online.`,
  keywords: [
    "lej projektor",
    "projektor udlejning",
    "projektor til præsentation",
    "projektor leje københavn",
    "lej projektor til event",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/projektor",
    languages: localeAlternates("/projektor"),
  },
  openGraph: {
    images: ogImages("/images/product-projektor.webp"),
    title: `Lej Projektor København | ${prisKr("projektor")}`,
    description:
      `Lej en Full HD-projektor i København for ${prisKr("projektor")}. Til præsentationer, møder og filmaften, HDMI-kabel og fjernbetjening følger med. Book online.`,
    url: "https://lejhojtaler.dk/projektor",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function ProjektorPage() {
  return (
    <ProductLanding
      slug="projektor"
      name="Projektor"
      headline="Lej projektor i København"
      sub="Full HD projektor til præsentationer og film. HDMI, klar på 5 min."
      image="/images/product-projektor-white.webp"
      imageAlt="Projektor til leje i København"
      productId="projektor"
      bookLabel="Book projektor nu"
      faqPhrase="en projektor"
      bullets={[
        "Full HD opløsning",
        "HDMI-kabel inkluderet",
        "Fjernbetjening medfølger",
        "Nem opsætning, klar på 5 min.",
        "Betal ved afhentning",
        "Hent fredag, aflever mandag",
      ]}
    >
      <UpsellBox
        title="Kombiner med lærred og mikrofon"
        text="Projektoren hører sammen med et lærred, ikke en LED-storskærm.
              Tilføj lærred og trådløs mikrofon, så er præsentationen komplet."
        links={[
          { href: "/book?product=laerred_160", label: "Book lærred 160 cm", priceId: "laerred_160" },
          { href: "/traadloes-mikrofon", label: "Se trådløs mikrofon", priceId: "traadloes_mikrofon", fra: true },
        ]}
      />
    </ProductLanding>
  );
}
