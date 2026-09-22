import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";

/**
 * Fadølsanlægget er en forespørgselsvare, se /slushicemaskine for hvorfor.
 * Fustage, mærke og antal haner afhænger af arrangementet, og det kan ikke
 * stå som én weekendpris i Frederiks ark.
 */
export const metadata: Metadata = {
  title: "Lej fadølsanlæg København | Pris på forespørgsel | Lejhøjtaler.dk",
  description:
    "Fadølsanlæg med køling, hane og kulsyre til firmafesten, sommerfesten eller receptionen i København. Skriv dato og antal, så får du en pris samme dag.",
  keywords: ["lej fadølsanlæg", "fadølsanlæg udlejning københavn", "fustage og anlæg leje"],
  alternates: {
    canonical: "https://lejhojtaler.dk/fadoelsanlaeg",
    languages: localeAlternates("/fadoelsanlaeg"),
  },
  openGraph: {
    images: ogImages(),
    title: "Lej fadølsanlæg København | Pris på forespørgsel",
    description:
      "Fadølsanlæg med køling, hane og kulsyre. Skriv dato og antal, så får du en pris samme dag.",
    url: "https://lejhojtaler.dk/fadoelsanlaeg",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="fadoelsanlaeg"
      name="Fadølsanlæg"
      headline="Lej fadølsanlæg i København"
      sub="Anlæg med køling, hane og kulsyre. Fustage og mærke aftaler vi, når vi kender antallet."
      imageAlt="Fadølsanlæg med køling og hane til leje i København"
      productId="fadoel"
      bullets={[
        "Køleanlæg med hane, klar til fustage",
        "Kulsyre og slanger følger med",
        "Fustage og mærke aftales efter antal gæster",
        "Gennemgang ved levering, så I selv kan tappe",
        "Kan leveres sammen med lyd og lys til samme fest",
      ]}
    />
  );
}
