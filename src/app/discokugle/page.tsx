import { prisKr } from "@/lib/products";
import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import UpsellBox from "@/components/UpsellBox";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  // Kunderne staver den med k: "diskokugle" gav 104 visninger på 30 dage mod
  // 22 på "discokugle" (Ads-søgetermer, sept 2026). Titel og H1 bruger derfor
  // k-formen, mens c-formen bliver stående i teksten, så begge stavemåder
  // står på siden. Stien er uændret — en redirect ville koste mere end den
  // giver.
  title: `Lej Diskokugle København | Fra ${prisKr("discokugle")} | Lejhøjtaler.dk`,
  description:
    `Lej diskokugle i København fra ${prisKr("discokugle")}/weekend. Roterende discokugle, 30 eller 40 cm, med spot og stativ. Plug-and-play. Betal ved afhentning. Book online.`,
  keywords: [
    "lej diskokugle",
    "diskokugle leje",
    "diskokugle udlejning",
    "lej discokugle",
    "discokugle udlejning",
    "diskokugle til fest",
    "disco kugle leje",
    "spejlkugle leje",
    "stor diskokugle",
    "diskokugle københavn",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/discokugle",
    languages: localeAlternates("/discokugle"),
  },
  openGraph: {
    images: ogImages("/images/product-discokugle-v2.webp"),
    title: `Lej Diskokugle København | Fra ${prisKr("discokugle")}`,
    description:
      `Lej diskokugle i København fra ${prisKr("discokugle")}/weekend. Roterende discokugle med LED-lys og farver. Book online.`,
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
      headline="Lej diskokugle i København"
      sub="Roterende discokugle med LED-lys og farver. Klar på 2 min."
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
      {/*
        Annoncerne lover "diskokugle fra 545 kr" — det er 30 cm-kuglen — og
        guldkuglen havde slet ingen side. Begge står på siden nu, så løftet kan
        indfries her i stedet for at sende kunden videre.
      */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-2 text-2xl font-bold">Alle tre discokugler</h2>
        <p className="mb-8 text-white/50">30 eller 40 cm, sølv eller guld. Motor, stativ og spot er med i dem alle.</p>
        <CategoryProductGrid items={[{ id: "discokugle_30" }, { id: "discokugle" }, { id: "discokugle_guld" }]} />
      </section>
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
