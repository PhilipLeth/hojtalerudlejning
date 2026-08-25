"use client";

/**
 * Søgefelt i headeren.
 *
 * Menuen er bevidst en vej ind og ikke et katalog, så den viser et udvalg.
 * Det er rigtigt for den, der ikke ved hvad han skal have — men den, der ved
 * præcis hvad han leder efter ("lærred", "røgmaskine", "Soundboks"), skulle
 * gætte sig til hvilken kategori det lå under. Søgningen er genvejen udenom.
 *
 * Ligger i en dialog og ikke som et permanent felt i headeren: headeren har
 * kun plads til logo og telefonnummer på en telefon, og telefonnummeret er
 * den vigtigste knap på sitet. Feltet må ikke fortrænge den.
 *
 * Indekset bygges af kataloget via useProducts, så priser og navne følger det,
 * admin har rettet — se searchIndex.ts.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProducts } from "@/lib/useProducts";
import { buildSearchIndex, search, type SearchResult } from "@/lib/searchIndex";
import type { Locale } from "@/lib/i18n";

const COPY = {
  da: {
    open: "Søg efter udstyr",
    placeholder: "Søg efter højtaler, lys, mikrofon…",
    empty: (q: string) => `Ingen træffere på "${q}".`,
    emptyHint: "Prøv fx højtaler, karaoke, røg eller projektor.",
    hint: "Skriv for at søge i hele sortimentet",
    results: "Søgeresultater",
    perWeekend: "kr/weekend",
    page: "Side",
  },
  en: {
    open: "Search for equipment",
    placeholder: "Search for speakers, lights, microphone…",
    empty: (q: string) => `No matches for "${q}".`,
    emptyHint: "Try speaker, karaoke, fog or projector.",
    hint: "Start typing to search the whole range",
    results: "Search results",
    perWeekend: "DKK/weekend",
    page: "Page",
  },
} as const;

export default function SiteSearch({ locale = "da" }: { locale?: Locale }) {
  const c = COPY[locale];
  const router = useRouter();
  const catalog = useProducts();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [aktiv, setAktiv] = useState(0);

  const knap = useRef<HTMLButtonElement>(null);
  const felt = useRef<HTMLInputElement>(null);

  const index = useMemo(() => buildSearchIndex(catalog, locale), [catalog, locale]);
  const resultater = useMemo(() => search(index, query), [index, query]);

  const luk = useCallback(() => {
    setOpen(false);
    setQuery("");
    setAktiv(0);
    // Tastaturbrugeren skal ikke smides tilbage til toppen af siden
    knap.current?.focus();
  }, []);

  // Cmd/Ctrl+K åbner, som i de fleste andre søgefelter folk kender
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    felt.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Nyt søgeord → markeringen tilbage til første træffer
  useEffect(() => setAktiv(0), [query]);

  function onFeltKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      luk();
      return;
    }
    if (resultater.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAktiv((i) => (i + 1) % resultater.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAktiv((i) => (i - 1 + resultater.length) % resultater.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const valgt = resultater[aktiv];
      if (valgt) {
        luk();
        router.push(valgt.href);
      }
    }
  }

  return (
    <>
      <button
        ref={knap}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={c.open}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-brand-500/40 hover:text-brand-400"
      >
        <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 px-4 pt-20 backdrop-blur-sm sm:pt-28"
          onMouseDown={(e) => {
            // Kun klik på selve baggrunden lukker — ikke et klik der startede
            // inde i feltet og slap uden for
            if (e.target === e.currentTarget) luk();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={c.open}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14]/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-white/5 px-4">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 text-white/30">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={felt}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onFeltKey}
                placeholder={c.placeholder}
                aria-label={c.placeholder}
                aria-controls="soegeresultater"
                aria-expanded={resultater.length > 0}
                aria-activedescendant={resultater.length > 0 ? `soegetraef-${aktiv}` : undefined}
                autoComplete="off"
                className="w-full bg-transparent py-4 text-base text-white placeholder:text-white/30 focus:outline-none"
              />
              <button
                type="button"
                onClick={luk}
                aria-label={locale === "en" ? "Close search" : "Luk søgning"}
                className="shrink-0 rounded-lg px-2 py-1 text-xs text-white/40 transition hover:text-white"
              >
                Esc
              </button>
            </div>

            <ul id="soegeresultater" role="listbox" aria-label={c.results} className="max-h-[60vh] overflow-y-auto">
              {resultater.map((r, i) => (
                <li key={r.href} id={`soegetraef-${i}`} role="option" aria-selected={i === aktiv}>
                  <Link
                    href={r.href}
                    onClick={luk}
                    onMouseEnter={() => setAktiv(i)}
                    className={`flex items-center gap-3 px-4 py-3 transition ${
                      i === aktiv ? "bg-brand-500/10" : ""
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white">{r.title}</span>
                      {r.hint && <span className="block truncate text-xs text-white/40">{r.hint}</span>}
                    </span>
                    {r.price != null ? (
                      <span className="shrink-0 text-sm font-bold text-brand-400">
                        {r.price} <span className="text-xs font-normal text-white/40">{c.perWeekend}</span>
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/35">
                        {c.page}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {query.trim().length >= 2 && resultater.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-white/40">
                {c.empty(query.trim())}
                <span className="mt-1 block text-xs text-white/25">{c.emptyHint}</span>
              </p>
            )}

            {query.trim().length < 2 && (
              <p className="px-4 py-6 text-center text-xs text-white/25">{c.hint}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
