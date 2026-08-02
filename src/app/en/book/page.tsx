import type { Metadata } from "next";
import BookingFlow from "@/components/BookingFlow";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Book equipment | Lejhøjtaler.dk",
  description: "Book speakers, lights and AV for rent in Copenhagen.",
  robots: { index: false, follow: true },
};

export default function BookPageEn() {
  return (
    <main className="min-h-screen bg-[#07060b]">
      <div className="mx-auto max-w-lg px-4 pb-8 pt-6">
        <a href="/en" className="mb-4 inline-block text-sm text-white/40 transition hover:text-brand-400">
          ← Back to home
        </a>
        <BookingFlow locale="en" variant="inline" />
      </div>
      <Footer />
    </main>
  );
}
