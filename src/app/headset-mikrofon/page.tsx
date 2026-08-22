import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import UpsellBox from "@/components/UpsellBox";

export const metadata: Metadata = {
  title: "Lej Headset-Mikrofon København | Fra 345 kr | Lejhøjtaler.dk",
  description:
    "Lej trådløst headset-mikrofon i København fra 345 kr/weekend. Hands-free mikrofon til præsentationer og konferencer. Betal ved afhentning.",
  keywords: [
    "lej headset mikrofon",
    "headset mikrofon udlejning",
    "headset til præsentation",
    "headset mikrofon leje",
    "trådløst headset event",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/headset-mikrofon" },
  openGraph: {
    title: "Lej Headset-Mikrofon København | Fra 345 kr",
    description:
      "Lej trådløst headset-mikrofon i København fra 345 kr/weekend. Hands-free mikrofon til præsentationer og konferencer. Betal ved afhentning.",
    url: "https://lejhojtaler.dk/headset-mikrofon",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function HeadsetMikrofonPage() {
  return (
    <ProductLanding
      slug="headset-mikrofon"
      name="Trådløst headset-mikrofon"
      price={345}
      headline="Lej headset-mikrofon"
      sub="Trådløst headset til præsentationer og konferencer. Hands-free."
      image="/images/product-headset.webp"
      imageAlt="Trådløst headset-mikrofon til leje i København"
      productId="headset"
      bookLabel="Book headset nu"
      faqPhrase="et trådløst headset"
      bullets={[
        "Trådløst headset-mikrofon",
        "Bodypack-sender inkluderet",
        "Modtager og batterier medfølger",
        "Kabel til højtaler/mixer inkl.",
        "Hands-free — perfekt til præsentationer",
        "Hent fredag aflever mandag",
      ]}
    >
      <UpsellBox
        title="Kombiner med mikrofon og projektor"
        text="Headsettet er perfekt sammen med en trådløs mikrofon og projektor. Skab den fulde præsentationsoplevelse."
        links={[
          { href: "/traadloes-mikrofon", label: "Se trådløs mikrofon – fra 295 kr" },
          { href: "/projektor", label: "Se projektor – fra 495 kr" },
        ]}
      />
    </ProductLanding>
  );
}
