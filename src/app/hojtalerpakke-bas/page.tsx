import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Stor Højtalerpakke med Bas København | 695 kr | Lejhøjtaler.dk",
  description:
    "Lej stor højtalerpakke med subwoofer i København for 695 kr/weekend. 2× 12\" EV højtalere + 12\" aktiv bas — tryk på dansegulvet. Spar 95 kr. Book online.",
  keywords: ["lej højtalere med bas", "lej pa anlæg med subwoofer", "stort lydanlæg leje", "højtalerudlejning københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/hojtalerpakke-bas" },
  openGraph: {
    title: "Lej Stor Højtalerpakke med Bas | 695 kr",
    description: "2× 12\" EV højtalere + aktiv subwoofer for 695 kr/weekend. Book online.",
    url: "https://lejhojtaler.dk/hojtalerpakke-bas",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function HojtalerpakkeBasPage() {
  return (
    <ProductLanding
      slug="hojtalerpakke-bas"
      name="Stor højtalerpakke + bas"
      price={695}
      headline="Lej stor højtalerpakke med bas i København"
      sub={'To kraftige 12" EV-højtalere plus aktiv subwoofer — tryk på dansegulvet. Spar 95 kr. mod at leje delene hver for sig.'}
      image="/images/product-festival-bas.png"
      imageAlt="Stor højtalerpakke med subwoofer til leje i København"
      productId="festival_bas"
      capacity={{ level: 3, label: "50-100 pers." }}
      bullets={[
        '2× 12" EV aktive højtalere',
        '12" aktiv subwoofer med topstang',
        
        "Stativer og alle kabler inkl.",
        "Bluetooth",
        "Hent fredag, aflever mandag",
      ]}
    />
  );
}
