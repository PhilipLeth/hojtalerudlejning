import type { Metadata } from "next";
import HalloweenProduct from "@/components/HalloweenProduct";
import { rentalProducts } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

const product = rentalProducts.find(p => p.id === "halloween_lys")!;

export const metadata: Metadata = {
  title: "The Witching Hour | Halloween party rental Copenhagen",
  description: product.desc_en,
  alternates: { canonical: "https://lejhojtaler.dk/en/halloween-lys", languages: localeAlternates("/halloween-lys") },
  openGraph: {
    title: "The Witching Hour | Halloween party rental Copenhagen",
    description: product.desc_en,
    url: "https://lejhojtaler.dk/en/halloween-lys",
    images: [product.image],
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return <HalloweenProduct productId="halloween_lys" locale="en" />;
}
