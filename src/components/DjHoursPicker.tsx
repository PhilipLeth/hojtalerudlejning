"use client";
import { DJ_HOUR_RATE, djHoursFromRange, priceDj, type DjHours } from "@/lib/dj";
import type { Locale } from "@/lib/i18n";

export default function DjHoursPicker({
  value,
  onChange,
  locale = "da",
  date = null,
}: {
  value: DjHours;
  onChange: (v: DjHours) => void;
  locale?: Locale;
  date?: Date | null;
}) {
  const en = locale === "en";
  const from = value.from ?? "18:00";
  const to = value.to ?? "21:00";
  const parsed = djHoursFromRange(from, to);
  const quote = parsed ? priceDj(parsed, date) : null;

  function setTime(key: "from" | "to", raw: string) {
    const nextFrom = key === "from" ? raw : from;
    const nextTo = key === "to" ? raw : to;
    const hours = djHoursFromRange(nextFrom, nextTo);
    if (hours) onChange(hours);
    else onChange({ ...value, from: nextFrom, to: nextTo });
  }

  return (
    <fieldset className="my-4 rounded-xl border border-brand-500/30 bg-white p-4">
      <legend className="px-2 font-semibold">{en ? "DJ/music host · start and finish" : "DJ/musikafvikler · start og slut"}</legend>
      <p className="mb-3 text-sm text-slate-600">
        {en
          ? `${DJ_HOUR_RATE.toLocaleString("en-GB")} DKK/hour, always. Delivery, setup and collection included.`
          : `${DJ_HOUR_RATE.toLocaleString("da-DK")} kr/time, altid. Levering, opsætning og nedtagning er med.`}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          {en ? "Starts" : "Start"}
          <input type="time" className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-3" value={from} onChange={(e) => setTime("from", e.target.value)} />
        </label>
        <label className="text-sm">
          {en ? "Ends" : "Slut"}
          <input type="time" className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-3" value={to} onChange={(e) => setTime("to", e.target.value)} />
        </label>
      </div>
      {quote ? (
        <>
          <p className="mt-4 text-xl font-bold text-brand-600">
            {quote.total.toLocaleString(en ? "en-GB" : "da-DK")} {en ? "DKK incl. VAT" : "kr inkl. moms"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {en
              ? `${quote.hours} hours · ${DJ_HOUR_RATE.toLocaleString("en-GB")} DKK/hour`
              : `${quote.hours} timer · ${DJ_HOUR_RATE.toLocaleString("da-DK")} kr/time`}
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm text-red-700">{en ? "Choose at least 3 hours between start and finish." : "Vælg mindst 3 timer mellem start og slut."}</p>
      )}
    </fieldset>
  );
}
