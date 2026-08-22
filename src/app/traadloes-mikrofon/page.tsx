import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import UpsellBox from "@/components/UpsellBox";

export const metadata: Metadata = {
  title: "Lej Trådløs Mikrofon København | Fra 295 kr | Lejhøjtaler.dk",
  description:
    "Lej trådløs mikrofon i København fra 295 kr/weekend. Professionel trådløs håndholdt mikrofon til taler og events. Betal ved afhentning.",
  keywords: [
    "lej trådløs mikrofon",
    "mikrofon udlejning",
    "trådløs mikrofon leje",
    "mikrofon til tale",
    "mikrofon til event",
    "lej mikrofon københavn",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/traadloes-mikrofon" },
  openGraph: {
    title: "Lej Trådløs Mikrofon København | Fra 295 kr",
    description:
      "Lej trådløs mikrofon i København fra 295 kr. Professionel håndholdt mikrofon til taler og events. Book online.",
    url: "https://lejhojtaler.dk/traadloes-mikrofon",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function TraadloesMikrofonPage() {
  return (
    <ProductLanding
      slug="traadloes-mikrofon"
      name="Trådløs mikrofon"
      price={295}
      headline="Lej trådløs mikrofon"
      sub="Professionel trådløs håndholdt mikrofon til taler, bryllup og events."
      image="/images/product-mikrofon.webp"
      imageAlt="Trådløs mikrofon til leje i København"
      productId="traadloes_mikrofon"
      bookLabel="Book mikrofon nu"
      faqPhrase="en trådløs mikrofon"
      bullets={[
        "Trådløs håndholdt mikrofon",
        "Modtager inkluderet",
        "Batterier medfølger",
        "Kabel til højtaler/mixer inkl.",
        "Betal ved afhentning – betal kun lejen",
        "Hent fredag, aflever mandag",
      ]}
    >
      <UpsellBox
        title="Kombiner med headset og højtalere"
        text="Mikrofonen er perfekt sammen med et headset og højtalere. Skab den fulde lydoplevelse til dit event."
        links={[
          { href: "/headset-mikrofon", label: "Se headset – 345 kr" },
          { href: "/lej-hojtaler", label: "Se højtalere – fra 395 kr" },
        ]}
      />
    </ProductLanding>
  );
}
