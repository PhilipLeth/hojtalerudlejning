"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

/**
 * Adressefelt med autofuldførelse fra DAWA (Danmarks Adressers Web API).
 *
 * Kunden skal ikke stave sig igennem "Vermlandsgade" — tre bogstaver og et
 * klik giver en rigtig, eksisterende adresse, som chaufføren kan finde. API'et
 * er Dataforsyningens officielle adresseregister: gratis, uden nøgle, og det
 * kender kun adresser der findes.
 *
 * Fejler opslaget (offline, API nede), er feltet et almindeligt tekstfelt —
 * autofuldførelsen er en hjælp, aldrig en betingelse for at kunne bestille.
 */

interface Forslag {
  tekst: string;
}

/** Eget flag frem for suggestions.length: en tom liste skal også lukke listen */
export default function AdresseInput({
  value,
  onChange,
  placeholder,
  invalid = false,
  locale = "da",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Rød kant når adressen mangler — samme udtryk som resten af formularen */
  invalid?: boolean;
  locale?: Locale;
  className?: string;
}) {
  const [forslag, setForslag] = useState<Forslag[]>([]);
  const [åben, setÅben] = useState(false);
  const [markeret, setMarkeret] = useState(-1);
  /** Sat når kunden lige har valgt fra listen — det valg skal ikke straks slås op igen */
  const valgtNu = useRef(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rod = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (valgtNu.current) {
      valgtNu.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      setForslag([]);
      setÅben(false);
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.dataforsyningen.dk/adresser/autocomplete?q=${encodeURIComponent(q)}&per_side=6&fuzzy=`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as Array<{ tekst?: string }>;
        const liste = data
          .map((d) => ({ tekst: String(d.tekst ?? "") }))
          .filter((f) => f.tekst);
        setForslag(liste);
        setÅben(liste.length > 0);
        setMarkeret(-1);
      } catch {
        // Uden net eller med API'et nede skriver kunden bare adressen selv
      }
    }, 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [value]);

  // Klik udenfor lukker listen
  useEffect(() => {
    function lukVedKlikUdenfor(e: MouseEvent) {
      if (rod.current && !rod.current.contains(e.target as Node)) setÅben(false);
    }
    document.addEventListener("mousedown", lukVedKlikUdenfor);
    return () => document.removeEventListener("mousedown", lukVedKlikUdenfor);
  }, []);

  function vælg(tekst: string) {
    valgtNu.current = true;
    onChange(tekst);
    setForslag([]);
    setÅben(false);
    setMarkeret(-1);
  }

  function tastatur(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!åben || forslag.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMarkeret((i) => (i + 1) % forslag.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMarkeret((i) => (i <= 0 ? forslag.length - 1 : i - 1));
    } else if (e.key === "Enter" && markeret >= 0) {
      e.preventDefault();
      vælg(forslag[markeret].tekst);
    } else if (e.key === "Escape") {
      setÅben(false);
    }
  }

  return (
    <div ref={rod} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={åben}
        aria-autocomplete="list"
        aria-controls="adresse-forslag"
        autoComplete="street-address"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={tastatur}
        onFocus={() => forslag.length > 0 && setÅben(true)}
        className={
          className ??
          `w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 ${
            invalid
              ? "border-red-400/60 focus:border-red-400 focus:ring-red-400"
              : "border-brand-500/30 focus:border-brand-500 focus:ring-brand-500"
          }`
        }
      />
      {åben && (
        <ul
          id="adresse-forslag"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-white/15 bg-[#16141b] shadow-xl"
        >
          {forslag.map((f, i) => (
            <li key={f.tekst} role="option" aria-selected={i === markeret}>
              <button
                type="button"
                onMouseDown={(e) => {
                  // mousedown, ikke click: click kommer efter blur, hvor listen kan være lukket
                  e.preventDefault();
                  vælg(f.tekst);
                }}
                className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                  i === markeret ? "bg-brand-500/15 text-white" : "text-white/80 hover:bg-white/5"
                }`}
              >
                {f.tekst}
              </button>
            </li>
          ))}
          <li className="border-t border-white/5 px-4 py-1.5 text-[10px] text-white/25">
            {locale === "en" ? "Address lookup: Danmarks Adresseregister" : "Adresseopslag: Danmarks Adresseregister"}
          </li>
        </ul>
      )}
    </div>
  );
}
