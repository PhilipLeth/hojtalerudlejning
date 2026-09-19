import type { Metadata } from "next";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Book udstyr | Lejhøjtaler.dk",
  description: "Vælg udstyr, datoer og tilvalg. Book online på et par minutter.",
  alternates: { canonical: "https://lejhojtaler.dk/book", languages: localeAlternates("/book") },
  robots: { index: false, follow: true },
};

/** Checkout som fuld side. Selve flowet bor i layout, så kurven overlever navigation. */
export default function BookPage() {
  return <main id="book" className="sr-only">Book udstyr</main>;
}
