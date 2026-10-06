import type { Metadata } from "next";
import { localeAlternates } from "@/lib/hreflang";
import TilbudSide from "@/components/TilbudSide";

/** Kundens tilbud. Hvert tilbud er personligt, så siden skal ikke i Google. */
export const metadata: Metadata = {
  title: "Dit tilbud | Lejhøjtaler.dk",
  description: "Jeres tilbud på lyd, lys og tekniker fra Lejhøjtaler.dk. Book og betal direkte fra tilbuddet.",
  alternates: { canonical: "https://lejhojtaler.dk/tilbud", languages: localeAlternates("/tilbud") },
  robots: { index: false, follow: false },
};

export default function TilbudPage() {
  return <TilbudSide locale="da" />;
}
