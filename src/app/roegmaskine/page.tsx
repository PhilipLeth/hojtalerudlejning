import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import UpsellBox from "@/components/UpsellBox";

export const metadata: Metadata = {
  title: "Lej Røgmaskine København | Fra 245 kr | Lejhøjtaler.dk",
  description:
    "Lej røgmaskine i København fra 245 kr/weekend. Inkl. røgvæske og fjernbetjening. Betal ved afhentning. Kombiner med lyd og lys til komplet festpakke.",
  keywords: [
    "lej røgmaskine københavn",
    "røgmaskine udlejning",
    "røgmaskine til fest",
    "røgmaskine leje",
    "lej røgmaskine billigt",
    "røgmaskine til event",
    "røg til fest",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/roegmaskine" },
  openGraph: {
    title: "Lej Røgmaskine København | Fra 245 kr",
    description:
      "Lej røgmaskine i København fra 245 kr. Inkl. røgvæske og fjernbetjening. Book online.",
    url: "https://lejhojtaler.dk/roegmaskine",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function RoegmaskinePage() {
  return (
    <ProductLanding
      slug="roegmaskine"
      name="Røgmaskine"
      price={245}
      headline="Lej røgmaskine i København"
      sub="Inkl. røgvæske, fjernbetjening og nem opsætning."
      image="/images/product-rog.webp"
      imageAlt="Røgmaskine til leje i København"
      productId="rog"
      bookLabel="Book røgmaskine nu"
      faqPhrase="en røgmaskine"
      bullets={[
        "Røgvæske inkluderet – klar til brug",
        "Fjernbetjening medfølger – styr røgen fra sofaen",
        "Nem opsætning – varmer op på 5 minutter",
        "Betal ved afhentning – betal kun lejen",
        "Hent fredag, aflever mandag",
      ]}
    >
      <UpsellBox
        title="Kombiner med lyd og lys"
        text="Røgmaskinen er perfekt sammen med højtalere og festlys. Skab den fulde festoplevelse."
        links={[
          { href: "/lej-hojtaler", label: "Se højtalere – fra 395 kr" },
          { href: "/festlys", label: "Se festlys – fra 495 kr" },
        ]}
      />
    </ProductLanding>
  );
}
