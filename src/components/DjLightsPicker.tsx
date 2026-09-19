"use client";
import Link from "next/link";
import { useProducts } from "@/lib/useProducts";
import { DJ_LIGHT_IDS } from "@/lib/dj";
import { localizedHref } from "@/lib/enPages";
import type { Locale } from "@/lib/i18n";

/** Valgfrit lys til DJ-bookingen. Stor DJ-pakke har allerede lys-pakke. */
export default function DjLightsPicker({
  value,
  onChange,
  locale = "da",
  hidden = false,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  locale?: Locale;
  hidden?: boolean;
}) {
  const en = locale === "en";
  const { addons } = useProducts();
  if (hidden) return null;
  return (
    <fieldset className="my-4 rounded-xl border border-slate-200 bg-white p-4">
      <legend className="px-2 font-semibold">{en ? "Add lighting" : "Tilføj lys"}</legend>
      <div className="space-y-2">
        <label className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${value === null ? "border-brand-600 bg-blue-50" : "border-slate-200"}`}>
          <input type="radio" name="djLight" checked={value === null} onChange={() => onChange(null)} />
          <span className="flex-1 text-sm">{en ? "No extra lights" : "Uden ekstra lys"}</span>
        </label>
        {DJ_LIGHT_IDS.map((id) => {
          const a = addons.find((x) => x.id === id);
          return a ? (
            <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${value === id ? "border-brand-600 bg-blue-50" : "border-slate-200"}`}>
              <input type="radio" name="djLight" checked={value === id} onChange={() => onChange(id)} />
              <span className="flex-1 text-sm">
                {en ? a.en.label : a.da.label}
                <small className="block text-slate-500">{en ? a.en.desc : a.da.desc}</small>
              </span>
              <strong className="text-sm">
                {a.price.toLocaleString(en ? "en-GB" : "da-DK")} {en ? "DKK" : "kr"}
              </strong>
            </label>
          ) : null;
        })}
      </div>
      <p className="mt-3 text-sm">
        <Link href={localizedHref("/lys-ai", locale)} className="text-brand-700 underline">
          {en ? "Unsure about the lights? Try them in a photo of the room." : "Usikker på lyset? Prøv det på et foto af lokalet."}
        </Link>
      </p>
    </fieldset>
  );
}
