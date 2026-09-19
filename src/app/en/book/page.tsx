import type { Metadata } from "next";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Book equipment | Lejhøjtaler.dk",
  description: "Choose equipment, dates and extras. Book online in a couple of minutes.",
  alternates: { canonical: "https://lejhojtaler.dk/en/book", languages: localeAlternates("/book") },
  robots: { index: false, follow: true },
};

export default function BookPageEn() {
  return <main id="book" className="sr-only">Book equipment</main>;
}
