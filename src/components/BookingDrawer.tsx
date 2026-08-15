"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { type Locale } from "@/lib/i18n";
import BookingFlow from "@/components/BookingFlow";
import PhoneLink from "@/components/PhoneLink";

/** True when URL asks for booking drawer (#book, ?product=, or /book path) */
function shouldOpenFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  if (path === "/book" || path === "/en/book") return true;
  return (
    window.location.hash === "#book" ||
    new URLSearchParams(window.location.search).has("product")
  );
}

/**
 * Booking i en drawer (= kurven). Åbner ved #book, /?product=ID#book og /book.
 * Lytter til Next.js soft-nav (pushState) så Book på forsiden åbner uden reload.
 */
export default function BookingDrawer({ locale: localeProp }: { locale?: Locale }) {
  const pathname = usePathname();
  const locale: Locale = localeProp ?? (pathname?.startsWith("/en") ? "en" : "da");

  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState({ count: 0, total: 0 });
  // Bump when URL changes so BookingFlow can re-preselect product
  const [urlTick, setUrlTick] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
    const url = new URL(window.location.href);
    url.hash = "";
    url.searchParams.delete("product");
    // /book er kun en alias — luk → forsiden uden product-param
    const path =
      url.pathname === "/book" || url.pathname === "/en/book"
        ? url.pathname.startsWith("/en")
          ? "/en"
          : "/"
        : url.pathname;
    window.history.replaceState(null, "", path + url.search);
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      if (shouldOpenFromUrl()) {
        setOpen(true);
        setUrlTick((n) => n + 1);
      }
    };

    syncFromUrl();

    window.addEventListener("hashchange", syncFromUrl);
    window.addEventListener("popstate", syncFromUrl);

    // Next.js <Link> uses pushState/replaceState without hashchange on same path
    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);
    history.pushState = (...args: Parameters<History["pushState"]>) => {
      origPush(...args);
      queueMicrotask(syncFromUrl);
    };
    history.replaceState = (...args: Parameters<History["replaceState"]>) => {
      origReplace(...args);
      queueMicrotask(syncFromUrl);
    };

    return () => {
      window.removeEventListener("hashchange", syncFromUrl);
      window.removeEventListener("popstate", syncFromUrl);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  // Soft-nav mellem sider (fx / → /soundboks-4) — synk hvis URL stadig beder om book
  useEffect(() => {
    if (shouldOpenFromUrl()) {
      setOpen(true);
      setUrlTick((n) => n + 1);
    }
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      document.getElementById("booking-drawer-scroll")?.scrollTo({ top: 0 });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      {/* Gul kurv-fane til højre når der er noget i kurven og draweren er lukket */}
      <button
        onClick={() => setOpen(true)}
        aria-label={locale === "en" ? "Open cart" : "Åbn kurv"}
        className={`fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-2xl bg-brand-500 px-2.5 py-4 text-black shadow-[0_2px_16px_rgba(0,0,0,0.4)] transition-transform duration-300 ${
          !open && summary.count > 0 ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <span className="flex flex-col items-center gap-1.5">
          <span className="relative">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1.5" />
              <circle cx="19" cy="21" r="1.5" />
              <path d="M2.5 3h2l2.7 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L21.5 7H6" />
            </svg>
            <span
              className="absolute -right-2 -top-2 flex min-w-[18px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-brand-400"
              style={{ height: "18px" }}
            >
              {summary.count}
            </span>
          </span>
          <span className="text-[11px] font-bold [writing-mode:vertical-rl]">{summary.total},-</span>
        </span>
      </button>

      <div
        className={`fixed inset-0 z-50 duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{
          visibility: open ? "visible" : "hidden",
          transitionProperty: "opacity, visibility",
          transitionDuration: "300ms",
        }}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={locale === "en" ? "Book equipment" : "Book udstyr"}
          className={`absolute right-0 top-0 flex h-full w-full flex-col bg-[#0b0a10] shadow-2xl transition-transform duration-300 ease-out sm:max-w-lg sm:border-l sm:border-white/10 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-lg font-bold">
              <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
                {locale === "en" ? "Book equipment" : "Book udstyr"}
              </span>
            </p>
            <div className="flex items-center gap-3">
              <PhoneLink className="hidden items-center gap-1.5 text-sm font-semibold text-brand-400 transition hover:text-brand-300 sm:flex">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </PhoneLink>
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

          <div id="booking-drawer-scroll" className="flex-1 overflow-y-auto overscroll-contain">
            <BookingFlow
              locale={locale}
              variant="drawer"
              onSummaryChange={setSummary}
              urlTick={urlTick}
            />
          </div>
        </div>
      </div>
    </>
  );
}
