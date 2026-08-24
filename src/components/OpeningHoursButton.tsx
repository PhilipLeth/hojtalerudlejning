"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/useSiteSettings";
import {
  formatAfterHoursShort,
  formatDateLine,
  formatDayLine,
  formatRange,
  hoursForDate,
  openDays,
  upcomingExceptions,
} from "@/lib/openingHours";

/**
 * Klikbar "Åbningstider" i headeren. Tiderne stod kun i footeren og på
 * forsiden, så på alle andre sider skulle man scrolle helt ned for at se dem.
 * Knappen folder en lille boks ud med dagens status, ugens åbne dage og de
 * særlige datoer — samme levende tider fra /admin/indstillinger som resten
 * af sitet.
 */
export default function OpeningHoursButton({ locale }: { locale: Locale }) {
  const { hours } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  // Luk ved klik udenfor og på Escape — som man forventer af en lille popover
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const dage = openDays(hours);
  if (dage.length === 0) return null;

  // Samme dags-kilde som footeren, så "i dag" aldrig er uenig med resten af sitet
  const iDag = new Date().toISOString().slice(0, 10);
  const idagTider = hoursForDate(hours, iDag);
  const særlige = upcomingExceptions(hours, iDag, 60);
  const gebyr = formatAfterHoursShort(hours, locale);

  const label = locale === "da" ? "Åbningstider" : "Opening hours";
  const idagLinje = idagTider.closed
    ? locale === "da"
      ? "I dag: lukket"
      : "Today: closed"
    : `${locale === "da" ? "I dag" : "Today"}: ${formatRange(idagTider, locale)}`;

  return (
    <div ref={wrapper} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={label}
        className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition md:px-4 ${
          open
            ? "border-white/25 bg-white/10 text-white"
            : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white"
        }`}
      >
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
        </svg>
        <span className="hidden md:inline">{label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-2xl border border-white/10 bg-[#0d0d14]/95 p-5 text-left shadow-xl shadow-black/40 backdrop-blur-xl">
          <p className="mb-3 text-sm font-semibold text-white">{label}</p>
          <p
            className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              idagTider.closed ? "bg-white/5 text-white/50" : "bg-brand-500/15 text-brand-300"
            }`}
          >
            {idagLinje}
          </p>
          <ul className="space-y-1.5 text-sm text-white/70">
            {dage.map((d) => (
              <li key={d.day}>{formatDayLine(d, locale)}</li>
            ))}
          </ul>
          {særlige.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-white/10 pt-3 text-sm text-brand-300/90">
              {særlige.map((e) => (
                <li key={e.date}>
                  {formatDateLine(hours, e.date, locale)}
                  {e.note ? ` · ${e.note}` : ""}
                </li>
              ))}
            </ul>
          )}
          {(hours.other || gebyr) && (
            <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-white/40">
              {hours.other && <p>{hours.other}</p>}
              {gebyr && <p>{gebyr}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
