"use client";
import { djHoursFromRange, djRates, priceDj, type DjHours } from "@/lib/dj";
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
  const r = djRates(date);

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
          ? `${r.day.toLocaleString("en-GB")} DKK/hour before 23:00, ${r.night.toLocaleString("en-GB")} DKK/hour after. Delivery, setup and collection included.`
          : `${r.day.toLocaleString("da-DK")} kr/time før kl. 23, ${r.night.toLocaleString("da-DK")} kr/time efter. Levering, opsætning og nedtagning er med i prisen.`}
        {r.peak && (
          <span className="mt-1 block text-xs">
            {en
              ? "Christmas party season: 20% higher DJ rate (15 Sep–23 Dec)."
              : "Julefrokost-perioden: 20% højere DJ-pris (15. sep–23. dec)."}
          </span>
        )}
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
              ? `${quote.hours} hours · ${quote.labour.toLocaleString("en-GB")} DKK DJ + ${quote.delivery.toLocaleString("en-GB")} DKK delivery/setup`
              : `${quote.hours} timer · ${quote.labour.toLocaleString("da-DK")} kr DJ + ${quote.delivery.toLocaleString("da-DK")} kr levering/opsætning`}
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm text-red-700">{en ? "Choose at least 3 hours between start and finish." : "Vælg mindst 3 timer mellem start og slut."}</p>
      )}
    </fieldset>
  );
}
