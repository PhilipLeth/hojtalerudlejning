"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Weekendudsalget, som kunden ser det.
 *
 * Vises kun når /api/udsalg-aktiv siger ja — og det gør den kun, hvis admin
 * har tændt kontakten i /admin/udsalg OG der faktisk står udstyr tilbage hele
 * den kommende weekend. Ingen kontakt at glemme her: slukker Frederik
 * udsalget, eller bliver det sidste udstyr lejet ud, forsvinder popup'en af
 * sig selv.
 */

interface SaleProduct {
  id: string;
  name: string;
  price: number;
  salePrice: number;
}

interface SaleStatus {
  active: boolean;
  code?: string;
  pct?: number;
  weekend?: { from: string; to: string; days: string[] };
  products?: SaleProduct[];
}

/** Afvisning gemmes pr. weekend, så den kan komme igen næste fredag — men
 *  ikke plage den samme besøgende to gange i samme weekend. */
function dismissKey(from: string): string {
  return `weekend_sale_dismissed_${from}`;
}

function dayLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export default function WeekendSalePopup() {
  const pathname = usePathname();
  const [sale, setSale] = useState<SaleStatus | null>(null);
  const [show, setShow] = useState(false);

  // Ikke i admin, og ikke midt i en booking — der er kunden allerede i gang
  const suppressed = pathname?.startsWith("/admin") || pathname?.startsWith("/book");

  useEffect(() => {
    if (suppressed) return;
    let cancelled = false;
    fetch("/api/udsalg-aktiv")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: SaleStatus | null) => {
        if (cancelled || !d?.active || !d.weekend || !d.products?.length) return;
        if (localStorage.getItem(dismissKey(d.weekend.from))) return;
        setSale(d);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [suppressed]);

  useEffect(() => {
    if (!sale) return;
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, [sale]);

  function dismiss() {
    if (sale?.weekend) localStorage.setItem(dismissKey(sale.weekend.from), "1");
    setShow(false);
  }

  if (!show || !sale?.weekend || !sale.products?.length) return null;

  const { code, pct, weekend, products } = sale;
  // Fire er nok til at vise, at der er noget at vælge imellem
  const vist = products.slice(0, 4);
  const resten = products.length - vist.length;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Weekendudsalg"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#111] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 text-xl leading-none text-white/30 hover:text-white"
          aria-label="Luk"
        >
          &times;
        </button>

        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-400">
          Weekendudsalg
        </p>
        <h2 className="mb-3 text-xl font-bold text-white">
          −{pct}% på det vi har tilbage
        </h2>
        <p className="mb-5 text-sm text-white/50">
          Gælder {dayLabel(weekend.days[0])} til {dayLabel(weekend.days[weekend.days.length - 1])}.
          Kun så længe udstyret står her.
        </p>

        <ul className="mb-5 space-y-1.5">
          {vist.map((p) => (
            <li key={p.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-white/80">{p.name}</span>
              <span className="whitespace-nowrap">
                <span className="text-white/30 line-through">{p.price}</span>{" "}
                <span className="font-bold text-brand-400">{p.salePrice} kr</span>
              </span>
            </li>
          ))}
          {resten > 0 && (
            <li className="pt-1 text-xs text-white/30">
              + {resten} {resten === 1 ? "produkt mere" : "produkter mere"}
            </li>
          )}
        </ul>

        <div className="mb-5 rounded-xl border border-dashed border-brand-500/40 bg-brand-500/5 px-4 py-3 text-center">
          <p className="mb-1 text-xs text-white/40">Brug koden</p>
          <p className="text-lg font-bold uppercase tracking-widest text-brand-400">{code}</p>
        </div>

        <Link
          href="/"
          onClick={dismiss}
          className="inline-block w-full rounded-full bg-brand-500 px-6 py-3 text-center font-semibold text-black transition hover:bg-brand-400"
        >
          Book til weekenden
        </Link>
        <button
          onClick={dismiss}
          className="mt-3 w-full text-sm text-white/40 transition hover:text-white/60"
        >
          Nej tak
        </button>
      </div>
    </div>
  );
}
