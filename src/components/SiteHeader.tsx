"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PhoneLink from "@/components/PhoneLink";
import OpeningHoursButton from "@/components/OpeningHoursButton";

/**
 * Fælles header på alle sider (undtagen admin): LejHøjtaler-logo/navn der
 * altid linker til forsiden + tydeligt telefonnummer og klikbare åbningstider.
 * Ligger i normal flow under den fixed TopBar (spacer via pt).
 */
export default function SiteHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const isEn = pathname?.startsWith("/en");

  return (
    <header className="relative z-30 pt-9">
      {/* pr-16 indtil xl: burger-knappen ligger fixed i højre side (top-12 right-4)
          og må ikke dække telefonnummeret. Fra xl er indholdet centreret fri af den. */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 pr-16 xl:pr-4">
        <Link
          href={isEn ? "/en" : "/"}
          className="group flex items-center gap-2"
          aria-label={isEn ? "LejHøjtaler.dk — back to front page" : "LejHøjtaler.dk — til forsiden"}
        >
          <span className="text-xl font-bold tracking-tight sm:text-2xl">
            <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent transition group-hover:from-brand-300 group-hover:to-brand-400">
              LejHøjtaler
            </span>
            <span className="text-white/35">.dk</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <OpeningHoursButton locale={isEn ? "en" : "da"} />
          <PhoneLink
            className="flex shrink-0 items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-400 transition hover:bg-brand-500 hover:text-black"
            prefix={isEn ? "Call" : "Ring"}
            prefixClassName="hidden sm:inline"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </PhoneLink>
        </div>
      </div>
    </header>
  );
}
