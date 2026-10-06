import type { Metadata } from "next";
import TilbehoerSide from "@/components/TilbehoerSide";
import { localeAlternates } from "@/lib/hreflang";
import { ogImages } from "@/lib/og";

export const metadata: Metadata = {
  title: "Lej tilbehør København | Stativer, røgvæske og forlængerledninger | Lejhøjtaler.dk",
  description:
    "Lej tilbehør i København: højtalerstativer, mikrofonstativ, lysstativ, DJ-stativer, røg-, sne- og boblevæske, kabeltromler og stikdåser. Fast pris for op til fem dage, book online.",
  keywords: ["lej tilbehør", "lej højtalerstativer", "lej mikrofonstativ", "lej lysstativ", "røgvæske", "lej kabeltromle", "lej forlængerledning"],
  alternates: { canonical: "https://lejhojtaler.dk/tilbehoer", languages: localeAlternates("/tilbehoer") },
  openGraph: {
    title: "Lej tilbehør København | Stativer, væsker og strøm",
    description: "Højtaler-, mikrofon-, lys- og DJ-stativer, væsker og strøm. Book online.",
    url: "https://lejhojtaler.dk/tilbehoer",
    images: ogImages("/images/product-kabeltromle-white.webp"),
  },
};

export default function Page() {
  return <TilbehoerSide locale="da" />;
}
