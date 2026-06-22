"use client";

import { type Locale, t } from "@/lib/i18n";
import { isSummerSale } from "@/lib/products";

export default function SummerBanner({ locale = "da" }: { locale?: Locale }) {
  if (!isSummerSale()) return null;
  const s = t[locale].summer;

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-center py-2 px-4 text-sm font-bold text-white shadow-lg">
      <span className="animate-pulse inline-block mr-2">&#9728;</span>
      {s.banner}
      <span className="animate-pulse inline-block ml-2">&#9728;</span>
    </div>
  );
}
