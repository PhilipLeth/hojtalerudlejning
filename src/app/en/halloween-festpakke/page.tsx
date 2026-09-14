import type { Metadata } from "next";
import HalloweenProduct from "@/components/HalloweenProduct";
import { rentalProducts } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

const product = rentalProducts.find(p => p.id === "halloween_lille")!;

export const metadata: Metadata = {
  title: "Monster Party | Halloween party rental Copenhagen",
  description: product.desc_en,
  alternates: { canonical: "https://lejhojtaler.dk/en/halloween-festpakke", languages: localeAlternates("/halloween-festpakke") },
  openGraph: {
    title: "Monster Party | Halloween party rental Copenhagen",
    description: product.desc_en,
    url: "https://lejhojtaler.dk/en/halloween-festpakke",
    images: ["/images/halloween-hero.webp"],
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return <HalloweenProduct productId="halloween_lille" locale="en" />;
}
