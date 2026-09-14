import type { Metadata } from "next";
import HalloweenProduct from "@/components/HalloweenProduct";
import { rentalProducts } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

const product = rentalProducts.find(p => p.id === "halloween_lille")!;

export const metadata: Metadata = {
  title: "Monsterfesten | Halloween-pakke i København",
  description: product.desc_da,
  alternates: { canonical: "https://lejhojtaler.dk/halloween-festpakke", languages: localeAlternates("/halloween-festpakke") },
  openGraph: {
    title: "Monsterfesten | Halloween-pakke i København",
    description: product.desc_da,
    url: "https://lejhojtaler.dk/halloween-festpakke",
    images: ["/images/halloween-hero.webp"],
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return <HalloweenProduct productId="halloween_lille" locale="da" />;
}
