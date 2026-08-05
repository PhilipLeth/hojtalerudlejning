"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackPurchase } from "@/lib/analytics";

type State =
  | { kind: "loading" }
  | { kind: "paid"; amount: number | null }
  | { kind: "open" }
  | { kind: "error" };

/** Verificerer Checkout Session-status via server (aldrig kun klient-tillid). */
export default function PaymentResult() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      setState({ kind: "error" });
      return;
    }
    fetch(`/api/stripe/session-status?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "complete" && d.paymentStatus === "paid") {
          setState({ kind: "paid", amount: typeof d.amount === "number" ? d.amount : null });
          // Konvertering sendes FØRST her — når Stripe har bekræftet betalingen.
          // transactionId = booking-id, så GA4 deduplikerer ved genindlæsning.
          trackPurchase({
            transactionId: d.bookingId ?? sessionId,
            value: typeof d.amount === "number" ? d.amount / 100 : 0,
            paymentMethod: "online",
          });
        } else if (d.status === "open") {
          setState({ kind: "open" });
        } else {
          setState({ kind: "error" });
        }
      })
      .catch(() => setState({ kind: "error" }));
  }, []);

  if (state.kind === "loading") {
    return <p className="py-24 text-center text-white/50">Bekræfter din betaling…</p>;
  }

  if (state.kind === "paid") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
          <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold">Betaling gennemført!</h1>
        <p className="mt-3 text-white/60">
          Din booking er betalt{state.amount ? ` (${(state.amount / 100).toFixed(0)} kr)` : ""} og bekræftet.
          Du får en kvittering på e-mail fra Stripe og en bookingbekræftelse fra os.
        </p>
        <div className="glass mt-6 rounded-2xl p-5 text-left text-sm text-white/60">
          <p className="font-semibold text-white/80">Afhentning</p>
          <p className="mt-1">Halvtolv 9, 1. th, 1436 København K — fredag kl. 14-18 (eller efter aftale).</p>
        </div>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-3 font-semibold text-black transition hover:bg-brand-400"
        >
          Til forsiden
        </Link>
      </div>
    );
  }

  if (state.kind === "open") {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold">Betalingen blev ikke gennemført</h1>
        <p className="mt-3 text-white/60">
          Din booking er stadig registreret — du kan betale ved afhentning, eller ringe til os på{" "}
          <a href="tel:+4531132852" className="text-brand-400">31 13 28 52</a>.
        </p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-3 font-semibold text-black transition hover:bg-brand-400">
          Til forsiden
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold">Kunne ikke bekræfte betalingen</h1>
      <p className="mt-3 text-white/60">
        Tjek din e-mail for en kvittering, eller ring til os på{" "}
        <a href="tel:+4531132852" className="text-brand-400">31 13 28 52</a> — så finder vi ud af det.
      </p>
    </div>
  );
}
