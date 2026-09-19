"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type Locale } from "@/lib/i18n";
import { bookHref } from "@/lib/bookUrl";
import BookingFlow from "@/components/BookingFlow";
import PhoneLink from "@/components/PhoneLink";

function isBookPath(path: string | null): boolean {
  return path === "/book" || path === "/en/book";
}

/**
 * Legacy #book og /?product= sendes til /book. Checkout er en fuld side.
 */
export default function BookingDrawer({ locale: localeProp }: { locale?: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale: Locale = localeProp ?? (pathname?.startsWith("/en") ? "en" : "da");
  const onBookPage = isBookPath(pathname);

  const [summary, setSummary] = useState({ count: 0, total: 0 });
  const [urlTick, setUrlTick] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hashBook = window.location.hash === "#book";
    const hasProduct = params.has("product");
    const hasKvittering = params.has("kvittering");

    if (onBookPage) {
      setUrlTick((n) => n + 1);
      return;
    }

    if (!hashBook && !hasProduct && !hasKvittering) return;
    const next = new URL(bookHref(params.get("product"), locale), window.location.origin);
    params.forEach((v, k) => {
      if (k !== "product") next.searchParams.set(k, v);
    });
    router.replace(next.pathname + next.search);
  }, [pathname, onBookPage, locale, router]);

  return (
    <>
      <Link
        href={bookHref(null, locale)}
        aria-label={locale === "en" ? "Open cart" : "Åbn kurv"}
        className={`fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-2xl bg-brand-500 px-2.5 py-4 text-black shadow-[0_2px_16px_rgba(0,0,0,0.4)] transition-transform duration-300 ${
          !onBookPage && summary.count > 0 ? "translate-x-0" : "translate-x-full"
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
      </Link>

      <div className={onBookPage ? "relative min-h-screen bg-[#0b0a10] text-white" : "hidden"} aria-hidden={!onBookPage}>
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 pb-2 pt-6">
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
            <Link
              href={locale === "en" ? "/en" : "/"}
              className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              {locale === "en" ? "Continue shopping" : "Fortsæt med at shoppe"}
            </Link>
          </div>
        </div>
        <BookingFlow locale={locale} variant="page" onSummaryChange={setSummary} urlTick={urlTick} />
      </div>
    </>
  );
}
