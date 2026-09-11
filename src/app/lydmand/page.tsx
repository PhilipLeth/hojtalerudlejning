import { Metadata } from "next";
import BundleGrid from "@/components/BundleGrid";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";
import { LYDMAND_PAKKER } from "@/lib/products";

export const metadata: Metadata = {
  title: "Lej Lydmand København | AV-tekniker 1.000 kr/time | Lejhøjtaler.dk",
  description:
    "Lej en lydmand til festen eller firmaeventet i København — 1.000 kr pr. time inkl. moms. AV-teknikeren sætter op, laver lydprøve og styrer lyd og mikrofoner, mens I holder fest.",
  keywords: [
    "lej lydmand københavn",
    "lydmand til fest",
    "av-tekniker leje",
    "lydtekniker til fest",
    "lydmand pris",
    "tekniker til firmafest",
    "lydmand bryllup",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/lydmand",
    languages: localeAlternates("/lydmand"),
  },
  openGraph: {
    title: "Lej Lydmand København | 1.000 kr/time",
    description:
      "AV-tekniker på stedet: sætter op, laver lydprøve og styrer lyden under festen. 1.000 kr pr. time. Book online.",
    url: "https://lejhojtaler.dk/lydmand",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function LydmandPage() {
  return (
    <ProductLanding
      slug="lydmand"
      name="Lydmand"
      price={1000}
      priceUnit="/time"
      headline="Lej en lydmand til festen"
      sub="En AV-tekniker, der sætter op, laver lydprøve og styrer lyden — så I kan holde fest i stedet for at stå ved mixeren."
      image="/images/product-lydmand.webp"
      imageAlt="Lydmand: mixer, hovedtelefoner og mikrofon"
      productId="lydmand"
      bookLabel="Book lydmand nu"
      ctaText="Vælg lydmanden som tilvalg til dit anlæg, eller tag en af pakkerne hvor han er med. Prisen er"
      faqMode="extraOnly"
      bullets={[
        "AV-tekniker på stedet — sætter op og laver lydprøve før gæsterne kommer",
        "Styrer lyd, mikrofoner og musik under festen: taler, playlister, DJ eller band",
        "Passer også lys og røg, hvis det er med",
        "Afregnes pr. time — vælg 4 timer som én vare, når han skal være der hele aftenen",
        "I pakkerne med lydmand er levering, opsætning og afhentning med",
      ]}
      faqExtra={[
        {
          q: "Hvad laver lydmanden på dagen?",
          a: "Han sætter anlægget op, tester det og laver lydprøve med jer, før gæsterne kommer. Under festen styrer han lyd, mikrofoner og musik — taler, playlister, DJ eller band — og han pakker ned igen, når I er færdige.",
        },
        {
          q: "Hvad koster en lydmand?",
          a: "1.000 kr pr. time inkl. moms. Vælger du lydmanden som tilvalg i bookingen, tæller det som én time — skriv i kommentaren hvor mange timer I skal bruge, så retter vi ordren, før I betaler. Skal han være der hele aftenen, er 4 timer som én vare billigst, og den ligger i pakkerne herunder.",
        },
        {
          q: "Skal jeg selv hente udstyret, når jeg har en lydmand med?",
          a: "Nej. I pakkerne med lydmand er levering, opsætning og afhentning altid med i prisen — lydmanden kommer med grejet, sætter op og tager det med hjem igen. Vælger du lydmanden som tilvalg til et anlæg, du selv henter, sætter han op hos jer, men kører ikke udstyret.",
        },
        {
          q: "Kan lydmanden også styre lys og røg?",
          a: "Ja. Han er AV-tekniker, så lys-pakke, røgmaskine og mikrofoner passer han sammen med lyden. Sig til i kommentaren, hvad der skal ske, så er han forberedt.",
        },
        {
          q: "Hvor langt ud kører I?",
          a: "Vi kører i hele København og omegn. Ligger festen længere væk, så skriv til os, så finder vi en pris på kørslen.",
        },
      ]}
    >
      <BundleGrid
        ids={LYDMAND_PAKKER}
        eyebrow="Pakker med lydmand"
        title="Anlæg, tekniker og kørsel i én pris"
        subtitle="Vi kommer med grejet, sætter op, styrer lyden i 4 timer og henter det igen. Levering, opsætning og afhentning er med i alle tre."
      />
    </ProductLanding>
  );
}
