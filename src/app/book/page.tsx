import type { Metadata } from "next";
import BookingFlow from "@/components/BookingFlow";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Book udstyr | Lejhøjtaler.dk",
  description: "Book højtaler, lys og AV til leje i København. Vælg dato og tilvalg — betal ved afhentning.",
  robots: { index: false, follow: true },
};

/**
 * Dedicated booking page — always works in every browser.
 * Deep link: /book?product=pakke_fest_klar_plus
 */
export default function BookPage() {
  return (
    <main className="min-h-screen bg-[#07060b]">
      <div className="mx-auto max-w-lg px-4 pb-8 pt-6">
        <a href="/" className="mb-4 inline-block text-sm text-white/40 transition hover:text-brand-400">
          ← Til forsiden
        </a>
        <BookingFlow locale="da" variant="inline" />
      </div>
      <Footer />
    </main>
  );
}
