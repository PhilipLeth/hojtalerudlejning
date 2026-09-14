import type { Metadata } from "next";
import HalloweenProduct from "@/components/HalloweenProduct";
import { rentalProducts } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

const product = rentalProducts.find(p => p.id === "halloween_stor")!;

export const metadata: Metadata = {
  title: "Midnatsklubben | Halloween-pakke i København",
  description: product.desc_da,
  alternates: { canonical: "https://lejhojtaler.dk/halloween-festpakke-stor", languages: localeAlternates("/halloween-festpakke-stor") },
  openGraph: {
    title: "Midnatsklubben | Halloween-pakke i København",
    description: product.desc_da,
    url: "https://lejhojtaler.dk/halloween-festpakke-stor",
    images: ["/images/halloween-hero.webp"],
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return <HalloweenProduct productId="halloween_stor" locale="da" />;
}
