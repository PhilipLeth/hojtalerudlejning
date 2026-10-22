"use client";

import { useEffect, useState } from "react";
import { kommendePeriodePriser, periodeTekst, type PeriodePris } from "@/lib/periodePriser";
import type { Locale } from "@/lib/i18n";

/**
 * "Halloween-pris 30. okt.–1. nov.: 395 kr." under prisen på produktsiden, så
 * kunden ser tallet før kurven gør det.
 *
 * Siderne er statiske og bygges én gang; derfor regnes "er perioden stadig
 * aktuel" først i browseren, så noten forsvinder af sig selv dagen efter —
 * uden et nyt deploy, og uden hydreringsfejl.
 */
export default function PeriodePrisNote({
  productId,
  locale = "da",
  className = "",
}: {
  productId: string;
  locale?: Locale;
  className?: string;
}) {
  const [liste, setListe] = useState<Array<{ pris: number; periode: PeriodePris }>>([]);
  useEffect(() => {
    setListe(kommendePeriodePriser(productId));
  }, [productId]);
  if (!liste.length) return null;
  return (
    <p className={`text-sm font-semibold text-amber-400 ${className}`} data-testid="periodepris-note">
      {liste.map(({ pris, periode }) => (
        <span key={periode.id} className="block">
          {locale === "en"
            ? `${periode.label_en} ${periodeTekst(periode, "en")}: ${pris} DKK`
            : `${periode.label_da} ${periodeTekst(periode, "da")}: ${pris} kr.`}
        </span>
      ))}
    </p>
  );
}
