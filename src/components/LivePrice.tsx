"use client";

import { catalogPrice } from "@/lib/products";
import { useProducts } from "@/lib/useProducts";

/**
 * Viser den aktuelle katalogpris for et produkt (admin-redigerbar).
 *
 * Uden `fallback` slås statisk-udgavens tal op i kataloget. Det er med vilje:
 * et tal skrevet i hånden er dét, Google og kunden ser før hydrering, og det
 * var netop de tal, der drev fra kataloget ved prisstigningen.
 */
export default function LivePrice({
  productId,
  fallback,
  suffix = " kr.",
  prefix = "fra ",
}: {
  productId: string;
  fallback?: number;
  suffix?: string;
  prefix?: string;
}) {
  const { speakers, addons, rentalProducts } = useProducts();
  const price =
    speakers.find((p) => p.id === productId)?.price ??
    addons.find((p) => p.id === productId)?.price ??
    rentalProducts.find((p) => p.id === productId)?.price ??
    fallback ??
    catalogPrice(productId);
  return (
    <>
      {prefix}
      {price.toLocaleString("da-DK")}
      {suffix}
    </>
  );
}

/** "fra 395 kr" — billigste højtaler i kataloget, live. Brug den i stedet for et tal. */
export function LiveStartPrice({
  prefix = "fra ",
  suffix = " kr",
}: {
  prefix?: string;
  suffix?: string;
}) {
  const { startPrice } = useProducts();
  return (
    <>
      {prefix}
      {startPrice.toLocaleString("da-DK")}
      {suffix}
    </>
  );
}
