"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import EventInquiryForm from "@/components/EventInquiryForm";
import PhoneLink from "@/components/PhoneLink";

/**
 * Forespørgsel i en drawer — modstykket til BookingDrawer.
 *
 * Bookingdraweren er til den der ved hvad han vil have. Den her er til den der
 * har et arrangement og ikke ved hvilke varenumre det består af. Den skal kunne
 * åbnes hvor som helst, for spørgsmålet opstår midt på en produktside lige så
 * ofte som på /erhverv.
 *
 * Åbner på #foresp (virker på enhver side), på #tilbud (så alle de eksisterende
 * "Få et tilbud"-links åbner den i stedet for at hoppe til /erhverv) og på
 * ?forespoergsel=1. Links beholder deres rigtige href, så de stadig virker uden
 * JavaScript — der ligger den samme formular som en sektion på /erhverv.
 */

const HASHES = ["#foresp", "#tilbud"];

/** Sider hvor fanen ville være i vejen frem for til hjælp */
function skjultPaa(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/accounting") ||
    pathname === "/book" ||
    pathname === "/en/book"
  );
}

function skalAabneFraUrl(): boolean {
  if (typeof window === "undefined") return false;
  if (HASHES.includes(window.location.hash)) return true;
  return new URLSearchParams(window.location.search).has("forespoergsel");
}

export default function InquiryDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const skjult = skjultPaa(pathname);

  const close = useCallback(() => {
    setOpen(false);
    const url = new URL(window.location.href);
    if (HASHES.includes(url.hash)) url.hash = "";
    url.searchParams.delete("forespoergsel");
    window.history.replaceState(null, "", url.pathname + url.search);
  }, []);

  // URL'en må gerne åbne den: #foresp hvor som helst, #tilbud fra de gamle links
  useEffect(() => {
    const synk = () => {
      if (skalAabneFraUrl()) setOpen(true);
    };
    synk();
    window.addEventListener("hashchange", synk);
    window.addEventListener("popstate", synk);
    return () => {
      window.removeEventListener("hashchange", synk);
      window.removeEventListener("popstate", synk);
    };
  }, []);

  useEffect(() => {
    if (skalAabneFraUrl()) setOpen(true);
  }, [pathname]);

  /**
   * Et klik på et hvilket som helst "Få et tilbud"-link åbner draweren frem for
   * at sende folk til en anden side. Href'en bliver stående, så linket stadig
   * fører til formularen på /erhverv hvis JavaScript ikke kører.
   */
  useEffect(() => {
    if (skjult) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (!href) return;
      if (HASHES.some((h) => href.endsWith(h))) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [skjult]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
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

  if (skjult) return null;

  return (
    <>
      {/* Fanen sidder under kurv-fanen, så de to ikke ligger oven i hinanden */}
      <button
        onClick={() => setOpen(true)}
        data-testid="foresp-fane"
        aria-label="Spørg om et arrangement"
        className={`fixed right-0 top-1/2 z-30 translate-y-16 rounded-l-2xl border border-r-0 border-white/15 bg-[#141220]/95 px-2.5 py-4 text-white/80 shadow-[0_2px_16px_rgba(0,0,0,0.4)] backdrop-blur transition hover:text-white ${
          open ? "translate-x-full" : "translate-x-0"
        }`}
      >
        <span className="flex flex-col items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="text-[11px] font-semibold [writing-mode:vertical-rl]">Spørg om et event</span>
        </span>
      </button>

      <div
        className={`fixed inset-0 z-50 duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
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
          aria-label="Forespørgsel på arrangement"
          className={`absolute right-0 top-0 flex h-full w-full flex-col bg-[#0b0a10] shadow-2xl transition-transform duration-300 ease-out sm:max-w-lg sm:border-l sm:border-white/10 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-lg font-bold">
              <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
                Spørg om et arrangement
              </span>
            </p>
            <div className="flex items-center gap-3">
              <PhoneLink className="hidden text-sm font-semibold text-brand-400 transition hover:text-brand-300 sm:block" prefix="Ring" />
              <button
                onClick={close}
                aria-label="Luk"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
            <p className="mb-5 text-sm text-white/50">
              Skal du bare bruge en højttaler, er det hurtigere at booke direkte. Skal der sørges for lyd, mikrofoner og
              lys til et helt arrangement, så fortæl hvad der skal ske — du får en pris med levering og opsætning.
            </p>
            {open && <EventInquiryForm />}
          </div>
        </div>
      </div>
    </>
  );
}
