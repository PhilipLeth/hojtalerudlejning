import type { Metadata } from "next";
import HalloweenProduct from "@/components/HalloweenProduct";
import { rentalProducts } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

const product = rentalProducts.find(p => p.id === "halloween_lys")!;

export const metadata: Metadata = {
  title: "Heksetimen | Halloween-pakke i København",
  description: product.desc_da,
  alternates: { canonical: "https://lejhojtaler.dk/halloween-lys", languages: localeAlternates("/halloween-lys") },
  openGraph: {
    title: "Heksetimen | Halloween-pakke i København",
    description: product.desc_da,
    url: "https://lejhojtaler.dk/halloween-lys",
    images: ["/images/halloween-hero.webp"],
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return <HalloweenProduct productId="halloween_lys" locale="da" />;
}
