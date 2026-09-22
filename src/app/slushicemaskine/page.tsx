import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";

/**
 * Slushicemaskinen er en forespørgselsvare.
 *
 * Vi ejer den ikke — den skaffes til arrangementet, og prisen afhænger af
 * dato, antal og hvem der kan levere. Derfor ingen weekendpris og ingen
 * bookingknap, se ER_FORESPOERGSEL i products.ts. Siden findes alligevel,
 * fordi kunden, der leder efter slush ice til studenterfesten, i forvejen
 * skal bruge lyd — og ellers spørger et andet sted.
 */
export const metadata: Metadata = {
  title: "Lej slushicemaskine København | Pris på forespørgsel | Lejhøjtaler.dk",
  description:
    "Slushicemaskine til studenterfest, sommerfest og børnefødselsdag i København. To kamre, to smage. Skriv dato og antal, så får du en pris samme dag.",
  keywords: ["lej slushicemaskine", "slush ice maskine leje københavn", "slushmaskine udlejning"],
  alternates: {
    canonical: "https://lejhojtaler.dk/slushicemaskine",
    languages: localeAlternates("/slushicemaskine"),
  },
  openGraph: {
    images: ogImages(),
    title: "Lej slushicemaskine København | Pris på forespørgsel",
    description:
      "Slushicemaskine med to kamre til festen. Skriv dato og antal, så får du en pris samme dag.",
    url: "https://lejhojtaler.dk/slushicemaskine",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="slushicemaskine"
      name="Slushicemaskine"
      headline="Lej slushicemaskine i København"
      sub="To kamre, så der kan køre to smage. Til studenterfesten, sommerfesten og børnefødselsdagen."
      imageAlt="Slushicemaskine med to kamre til leje i København"
      productId="slushice"
      bullets={[
        "Maskine med to kamre, to smage ad gangen",
        "Sirup aftales efter antal gæster",
        "Krus og sugerør kan følge med",
        "Kører på almindelig 230 V",
        "Kan leveres sammen med lyd og lys til samme fest",
      ]}
    />
  );
}
