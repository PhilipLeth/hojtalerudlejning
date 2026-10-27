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
      {en ? "Scheduled appointment" : "Fast aftaletid"} · {formatRange(day, locale)} · {en ? "no fee" : "uden gebyr"}
    </label>}
    <label className="flex gap-3 items-center text-sm cursor-pointer">
      <input type="radio" name={`handover-${label}`} checked={outside} onChange={() => onChange("outside")} className="accent-[#ffd600]" />
      {en ? "Another time by arrangement (+DKK 200)" : "Andet tidspunkt efter aftale (+200 kr)"}
    </label>
    {outside && <p className="text-sm text-amber-900">{en ? "DKK 200 for this pickup or return. If both require other times, the total fee is DKK 400. Write your preferred time in the comment; we will confirm it with you." : "200 kr for denne ind- eller udlevering. Skal begge ske på andre tidspunkter, bliver gebyret i alt 400 kr. Skriv dit ønskede tidspunkt i kommentaren, så bekræfter vi aftalen."}</p>}
  </fieldset>;
}
