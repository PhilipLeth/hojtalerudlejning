import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: "Lej Lærred 160 cm København — udlejes ikke lige nu | Lejhøjtaler.dk",
  description:
    "160 cm lærred på stativ. Udlejes ikke lige nu — vi har samlet udlejningen om højtalere, festlys og røg i København.",
  keywords: ["lej lærred", "projektor lærred leje", "lærred til projektor københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/laerred-160" },
  openGraph: {
    title: "Lej Lærred 160 cm København — udlejes ikke lige nu",
    description:
      "160 cm lærred på stativ. Udlejes ikke lige nu — vi har samlet udlejningen om højtalere, festlys og røg i København.",
    url: "https://lejhojtaler.dk/laerred-160",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="laerred-160"
      name="Lærred 160 cm"
      price={195}
      headline="Lej lærred 160 cm"
      sub={'160 cm lærred på stativ — perfekt makker til projektoren.'}
      image="/images/product-laerred.webp"
      imageAlt="Projektorlærred 160 cm på stativ til leje"
      productId="laerred_160"
      faqPhrase="et 160 cm lærred"
      bullets={["160 cm bredt lærred", "Stabilt trefods-stativ", "Sat op på 2 minutter", "Kombinér med projektor fra 495 kr", "Hent fredag, aflever mandag"]}
    />
  );
}
