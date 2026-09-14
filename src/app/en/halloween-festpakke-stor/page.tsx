import type { Metadata } from "next";
import HalloweenProduct from "@/components/HalloweenProduct";
import { rentalProducts } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

const product = rentalProducts.find(p => p.id === "halloween_stor")!;

export const metadata: Metadata = {
  title: "The Midnight Club | Halloween party rental Copenhagen",
  description: product.desc_en,
  alternates: { canonical: "https://lejhojtaler.dk/en/halloween-festpakke-stor", languages: localeAlternates("/halloween-festpakke-stor") },
  openGraph: {
    title: "The Midnight Club | Halloween party rental Copenhagen",
    description: product.desc_en,
    url: "https://lejhojtaler.dk/en/halloween-festpakke-stor",
    images: ["/images/halloween-hero.webp"],
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return <HalloweenProduct productId="halloween_stor" locale="en" />;
}
