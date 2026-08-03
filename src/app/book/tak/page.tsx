import type { Metadata } from "next";
import Footer from "@/components/Footer";
import PaymentResult from "@/components/PaymentResult";

export const metadata: Metadata = {
  title: "Tak for din booking | Lejhøjtaler.dk",
  robots: { index: false, follow: false },
};

/** Return-side efter Stripe Checkout — verificerer betalingen server-side. */
export default function TakPage() {
  return (
    <main className="min-h-screen bg-[#07060b]">
      <div className="mx-auto max-w-lg px-4 pb-16 pt-10">
        <PaymentResult />
      </div>
      <Footer />
    </main>
  );
}
