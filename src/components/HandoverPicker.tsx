"use client";
import { formatDateLine, formatRange, hoursForDate, type OpeningHours, type TimeSlotId } from "@/lib/openingHours";

export default function HandoverPicker({ hours, date, value, onChange, label, locale }: {
  hours: OpeningHours; date: string; value: TimeSlotId; onChange: (value: TimeSlotId) => void; label: string; locale: "da" | "en";
}) {
  const day = hoursForDate(hours, date);
  const outside = day.closed || value === "outside";
  const en = locale === "en";
  return <fieldset className="rounded-xl border border-white/15 p-4 space-y-3">
    <legend className="px-1 font-semibold">{label}</legend>
    <p className="text-sm text-white/60">{formatDateLine(hours, date, locale)}</p>
    {!day.closed && <label className="flex gap-3 items-center text-sm cursor-pointer">
      <input type="radio" name={`handover-${label}`} checked={!outside} onChange={() => onChange("unknown")} className="accent-[#ffd600]" />
      {en ? "During opening hours" : "I åbningstiden"} · {formatRange(day, locale)} · {en ? "no fee" : "uden gebyr"}
    </label>}
    <label className="flex gap-3 items-center text-sm cursor-pointer">
      <input type="radio" name={`handover-${label}`} checked={outside} onChange={() => onChange("outside")} className="accent-[#ffd600]" />
      {en ? "Outside opening hours by arrangement" : "Uden for åbningstid efter aftale"}
    </label>
    {outside && <p className="text-sm text-amber-900">{en ? "DKK 200 per booking, even if both pickup and return are outside opening hours. Write your preferred time in the comment; we will confirm it with you." : "200 kr pr. booking, også når både afhentning og aflevering er uden for åbningstid. Skriv dit ønskede tidspunkt i kommentaren, så bekræfter vi aftalen."}</p>}
  </fieldset>;
}
