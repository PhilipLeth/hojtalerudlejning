"use client";

import { useEffect, useState } from "react";
import { type Locale, t } from "@/lib/i18n";

const SPEAKER_IDS = ["thumpgo", "party", "soundboks", "festival"];

/** Fredag i indeværende uge — eller næste fredag hvis weekenden er i gang. */
function comingWeekend(): { from: string; to: string } {
  const now = new Date();
  const daysToFri = (5 - now.getDay() + 7) % 7;
  const fri = new Date(now);
  fri.setDate(now.getDate() + daysToFri);
  const mon = new Date(fri);
  mon.setDate(fri.getDate() + 3);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { from: iso(fri), to: iso(mon) };
}

/**
 * Ærlig scarcity-ticker: viser hvor mange anlæg der reelt er ledige til den
 * kommende weekend ud fra /api/availability. Viser intet før data er hentet,
 * så vi aldrig påstår noget, lageret ikke kan bakke op.
 */
export default function WeekendUrgency({ locale = "da" }: { locale?: Locale }) {
  const s = t[locale].hero;
  const [available, setAvailable] = useState<number | null>(null);

  useEffect(() => {
    const { from, to } = comingWeekend();
    fetch(`/api/availability?from=${from}&to=${to}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !data.inventory || !data.booked) return;
        const blocked: Array<{ products: string[] }> = data.blocked_dates || [];
        const allBlocked = blocked.some((b) => !b.products || b.products.length === 0);
        const blockedIds = new Set(blocked.flatMap((b) => b.products || []));
        let count = 0;
        for (const id of SPEAKER_IDS) {
          if (allBlocked || blockedIds.has(id)) continue;
          count += Math.max(0, (data.inventory[id] || 0) - (data.booked[id] || 0));
        }
        setAvailable(count);
      })
      .catch(() => {
        // Ingen data → ingen påstand
      });
  }, []);

  if (available === null) return null;

  const text =
    available === 0
      ? s.urgencySoldOut
      : available <= 3
        ? s.urgencyFew.replace("{n}", String(available))
        : s.urgencyAvailable;

  return (
    <span className="inline-flex items-center gap-1.5 text-orange-300">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
      </span>
      {text}
    </span>
  );
}
