import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import UpsellBox from "@/components/UpsellBox";

export const metadata: Metadata = {
  title: "Lej Discokugle København | Fra 595 kr | Lejhøjtaler.dk",
  description:
    "Lej discokugle i København fra 595 kr/weekend. Roterende discokugle med LED-lys og farver. Plug-and-play. Betal ved afhentning. Book online.",
  keywords: [
    "lej discokugle",
    "discokugle udlejning",
    "discokugle til fest",
    "disco kugle leje",
    "discokugle københavn",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/discokugle" },
  openGraph: {
    title: "Lej Discokugle København | Fra 595 kr",
    description:
      "Lej discokugle i København fra 595 kr/weekend. Roterende discokugle med LED-lys og farver. Book online.",
    url: "https://lejhojtaler.dk/discokugle",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function DiscokuglePage() {
  return (
    <ProductLanding
      slug="discokugle"
      name="Discokugle"
      price={595}
      headline="Lej discokugle i København"
      sub="Roterende discokugle med LED-lys og farver. Klar på 2 min."
      image="/images/product-discokugle.webp"
      imageAlt="Discokugle til leje i København"
      productId="discokugle"
      bookLabel="Book discokugle nu"
      faqPhrase="en discokugle"
      bullets={[
        "Roterende med LED-farveeffekter",
        "Plug-and-play med ophæng/stativ",
        "Spotlight inkluderet",
        "Betal ved afhentning",
        "Hent fredag, aflever mandag",
      ]}
    >
      <UpsellBox
        title="Kombiner med røg og lys"
        text="Discokuglen er perfekt sammen med røgmaskine og festlys. Skab den fulde festoplevelse."
        links={[
          { href: "/roegmaskine", label: "Se røgmaskine", priceId: "rog" },
          { href: "/festlys", label: "Se festlys", priceId: "lys", fra: true },
        ]}
      />
    </ProductLanding>
  );
}
