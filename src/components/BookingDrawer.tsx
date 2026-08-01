"use client";

import { useCallback, useEffect, useState } from "react";
import { type Locale } from "@/lib/i18n";
import BookingFlow from "@/components/BookingFlow";

/**
 * Booking i en drawer: åbner ved #book (alle "Book"-knapper) og ved
 * /?product=ID#book fra produktsider/annoncer. Ingen anker-scroll — siden
 * bliver hvor den er, og flowet scroller stabilt i sit eget panel.
 */
export default function BookingDrawer({ locale = "da" }: { locale?: Locale }) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    // ryd hash + product-param så et nyt klik på #book åbner igen
    const url = new URL(window.location.href);
    url.hash = "";
    url.searchParams.delete("product");
    window.history.replaceState(null, "", url.pathname + url.search);
  }, []);

  useEffect(() => {
    const shouldOpen = () =>
      window.location.hash === "#book" ||
      new URLSearchParams(window.location.search).has("product");

    if (shouldOpen()) setOpen(true);

    const onHash = () => {
      if (window.location.hash === "#book") setOpen(true);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Lås baggrundsscroll når draweren er åben
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      document.getElementById("booking-drawer-scroll")?.scrollTo({ top: 0 });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Luk med Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={locale === "en" ? "Book equipment" : "Book udstyr"}
        className={`absolute right-0 top-0 flex h-full w-full flex-col bg-[#0b0a10] shadow-2xl transition-transform duration-300 ease-out sm:max-w-lg sm:border-l sm:border-white/10 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sticky header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-lg font-bold">
            <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
              {locale === "en" ? "Book equipment" : "Book udstyr"}
            </span>
          </p>
          <div className="flex items-center gap-3">
            <a
              href="tel:+4550150731"
              className="hidden items-center gap-1.5 text-sm font-semibold text-brand-400 transition hover:text-brand-300 sm:flex"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              50 15 07 31
            </a>
            <button
              onClick={close}
              aria-label={locale === "en" ? "Close" : "Luk"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollbart indhold */}
        <div id="booking-drawer-scroll" className="flex-1 overflow-y-auto overscroll-contain">
          <BookingFlow locale={locale} variant="drawer" />
        </div>
      </div>
    </div>
  );
}
