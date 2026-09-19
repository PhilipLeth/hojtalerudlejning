"use client";
import { useProducts } from "@/lib/useProducts";
import { DJ_GEAR_GUESTS, DJ_GEAR_IDS } from "@/lib/dj";
import type { Locale } from "@/lib/i18n";

export default function DjGearPicker({
  value,
  onChange,
  locale = "da",
}: {
  value: string;
  onChange: (id: string) => void;
  locale?: Locale;
}) {
  const en = locale === "en";
  const { rentalProducts } = useProducts();
  return (
    <fieldset className="my-4 rounded-xl border border-slate-200 bg-white p-4">
      <legend className="px-2 font-semibold">{en ? "Sound system by guest count" : "Musikanlæg efter antal gæster"}</legend>
      <div className="space-y-2">
        {DJ_GEAR_IDS.map((id) => {
          const p = rentalProducts.find((x) => x.id === id);
          const guests = DJ_GEAR_GUESTS[id];
          return p ? (
            <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${value === id ? "border-brand-600 bg-blue-50" : "border-slate-200"}`}>
              <input type="radio" name="djGear" value={id} checked={value === id} onChange={() => onChange(id)} />
              <span className="flex-1 text-sm">
                {en ? p.name_en : p.name_da}
                <small className="block text-slate-500">{en ? guests.en : guests.da}</small>
              </span>
              <strong className="text-sm">
                {p.price.toLocaleString(en ? "en-GB" : "da-DK")} {en ? "DKK" : "kr"}
              </strong>
            </label>
          ) : null;
        })}
      </div>
      <p className="mt-3 text-xs text-slate-600">
        {en
          ? "All options include the AlphaTheta XDJ all-in-one DJ system, no laptop needed. VAT included."
          : "Alle valg indeholder AlphaTheta XDJ, en all-in-one DJ-pult uden computer. Priser inklusive moms."}
      </p>
    </fieldset>
  );
}
