import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lej Lærred 160 cm København | 195 kr | Lejhøjtaler.dk",
  description:
    "Lej et 160 cm lærred på stativ i København for 195 kr. Passer til alle vores projektorer — stilles op på et minut. Book online.",
  keywords: ["lej lærred", "projektor lærred leje", "lærred til projektor københavn"],
  alternates: {
    canonical: "https://lejhojtaler.dk/laerred-160",
    languages: localeAlternates("/laerred-160"),
  },
  openGraph: {
    title: "Lej Lærred 160 cm København | 195 kr",
    description:
      "Lej et 160 cm lærred på stativ i København for 195 kr. Passer til alle vores projektorer — stilles op på et minut. Book online.",
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
      image="/images/product-laerred-v2.webp"
      imageAlt="Projektorlærred 160 cm på stativ til leje"
      productId="laerred_160"
      faqPhrase="et 160 cm lærred"
      bullets={["160 cm bredt lærred", "Stabilt trefods-stativ", "Sat op på 2 minutter", "Kombinér med projektor fra 495 kr", "Hent fredag, aflever mandag"]}
    />
  );
}
