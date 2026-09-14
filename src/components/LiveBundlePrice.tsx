"use client";

import { useProducts } from "@/lib/useProducts";
import { bundleListPrice } from "@/lib/products";
import type { Locale } from "@/lib/i18n";

/** Kategorisidens pris og besparelse læses sammen fra det levende katalog. */
export default function LiveBundlePrice({ productId, locale = "da" }: { productId: string; locale?: Locale }) {
  const { rentalProducts } = useProducts();
  const p = rentalProducts.find(p => p.id === productId);
  if (!p) return null;
  const saving = Math.max(0, bundleListPrice(p) - p.price);
  const kr = (n: number) => n.toLocaleString("da-DK");
  return <>
    <p className="mt-4 text-3xl font-bold">{kr(p.price)} {locale === "en" ? "DKK" : "kr"}<span className="ml-1 text-sm font-normal text-white/40">/ weekend</span></p>
    {saving > 0 && <p className="mt-1 text-xs font-semibold text-brand-400">{locale === "en" ? `Save ${kr(saving)} DKK vs the parts separately` : `Spar ${kr(saving)} kr vs. delene enkeltvis`}</p>}
  </>;
}
