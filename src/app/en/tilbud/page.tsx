import type { Metadata } from "next";
import { localeAlternates } from "@/lib/hreflang";
import TilbudSide from "@/components/TilbudSide";

/** The customer's offer. Each one is personal, so it stays out of search. */
export const metadata: Metadata = {
  title: "Your offer | Lejhøjtaler.dk",
  description: "Your offer for sound, lighting and a technician from Lejhøjtaler.dk. Book and pay straight from the offer.",
  alternates: { canonical: "https://lejhojtaler.dk/en/tilbud", languages: localeAlternates("/tilbud") },
  robots: { index: false, follow: false },
};

export default function TilbudPageEn() {
  return <TilbudSide locale="en" />;
}
