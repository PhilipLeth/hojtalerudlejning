import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Mackie Thump GO København | Fra 350 kr | Lejhøjtaler.dk",
  description:
    "Lej Mackie Thump GO i København fra 350 kr/weekend. Batteridrevet 8\" højtaler med Bluetooth. Ingen strøm nødvendig. Book online.",
  keywords: ["mackie thump go leje", "batterihøjtaler leje", "lej mackie go", "mobil højtaler københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/mackie-thump-go" },
  openGraph: {
    title: "Lej Mackie Thump GO København | Fra 350 kr",
    description: "Batteridrevet 8\" højtaler fra 350 kr/weekend. Book online.",
    url: "https://lejhojtaler.dk/mackie-thump-go",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function MackieThumpGoPage() {
  return (
    <ProductLanding
      slug="mackie-thump-go"
      name="Mackie Thump GO"
      price={350}
      headline="Lej Mackie Thump GO i København"
      sub={'Batteridrevet 8" højtaler - park, strand, baggård. Ingen strøm nødvendig.'}
      image="/images/product-thumpgo.svg"
      imageAlt="Mackie Thump GO batterihøjtaler til leje"
      productId="thumpgo"
      bullets={[
        '8" batterihøjtaler med Bluetooth',
        "Op til 12 timers batteri",
        "Kun 10 kg - klar til cyklen",
        "Oplader og AUX inkluderet",
        "Hent fredag, aflever mandag",
      ]}
    />
  );
}
