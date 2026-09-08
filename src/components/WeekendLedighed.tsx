"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

/**
 * "Ledig den kommende weekend" på produktsiden.
 *
 * Kunden står med det samme spørgsmål hver gang: kan jeg overhovedet få den
 * på fredag? Svaret ligger allerede i /api/availability — det er samme tal,
 * bookingflowet validerer mod i trin 2 — så her stilles spørgsmålet for den
 * kommende fredag→mandag og besvares med én linje.
 *
 * Fejler opslaget, eller har produktet intet lagertal, vises ingenting:
 * en side uden linjen er korrekt, en linje med et gæt er det ikke.
 */

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function WeekendLedighed({
  productId,
  locale = "da",
}: {
  productId: string;
  locale?: Locale;
}) {
  const [status, setStatus] = useState<"ukendt" | "ledig" | "optaget">("ukendt");
  const [fredagTekst, setFredagTekst] = useState("");

  useEffect(() => {
    const iDag = new Date();
    // 0 hvis i dag ER fredag; lørdag/søndag peger på NÆSTE weekend — den
    // igangværende kan alligevel ikke bookes fra fredag
    const tilFredag = (5 - iDag.getDay() + 7) % 7;
    const fredag = new Date(iDag);
    fredag.setDate(iDag.getDate() + tilFredag);
    const mandag = new Date(fredag);
    mandag.setDate(fredag.getDate() + 3);
    setFredagTekst(
      locale === "en"
        ? `Fri ${fredag.getDate()}/${fredag.getMonth() + 1}`
        : `fre ${fredag.getDate()}/${fredag.getMonth() + 1}`,
    );

    let annulleret = false;
    fetch(`/api/availability?from=${dateKey(fredag)}&to=${dateKey(mandag)}`)
      .then((r) => r.json())
      .then(
        (data: {
          inventory?: Record<string, number>;
          booked?: Record<string, number>;
          blocked_dates?: Array<{ date: string; products: string[] }>;
        }) => {
          if (annulleret) return;
          const total = data.inventory?.[productId];
          // Uden lagertal er der ikke noget ærligt at vise
          if (typeof total !== "number") return;
          const brugt = data.booked?.[productId] ?? 0;
          const blokeret = (data.blocked_dates ?? []).some(
            (b) =>
              b.date >= dateKey(fredag) &&
              b.date < dateKey(mandag) &&
              (b.products.length === 0 || b.products.includes(productId)),
          );
          setStatus(total - brugt > 0 && !blokeret ? "ledig" : "optaget");
        },
      )
      .catch(() => {
        /* uden svar viser vi ingenting */
      });
    return () => {
      annulleret = true;
    };
  }, [productId, locale]);

  if (status === "ukendt") return null;

  if (status === "ledig") {
    return (
      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-400">
        <span className="h-2 w-2 rounded-full bg-green-400" />
        {locale === "en"
          ? `Available this coming weekend (${fredagTekst})`
          : `Ledig den kommende weekend (${fredagTekst})`}
      </p>
    );
  }

  return (
    <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-400/10 px-4 py-1.5 text-sm font-medium text-orange-300">
      <span className="h-2 w-2 rounded-full bg-orange-300" />
      {locale === "en"
        ? "Booked out this coming weekend — other dates are open in the booking"
        : "Optaget den kommende weekend — andre datoer er ledige i bookingen"}
    </p>
  );
}
