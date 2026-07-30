"use client";

import { useProducts } from "@/lib/useProducts";

/** Viser den aktuelle katalogpris for et produkt (admin-redigerbar), med statisk fallback. */
export default function LivePrice({
  productId,
  fallback,
  suffix = " kr.",
  prefix = "fra ",
}: {
  productId: string;
  fallback: number;
  suffix?: string;
  prefix?: string;
}) {
  const { speakers, addons, rentalProducts } = useProducts();
  const price =
    speakers.find((p) => p.id === productId)?.price ??
    addons.find((p) => p.id === productId)?.price ??
    rentalProducts.find((p) => p.id === productId)?.price ??
    fallback;
  return (
    <>
      {prefix}
      {price}
      {suffix}
    </>
  );
}
