import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import Link from "next/link";
import { localeAlternates } from "@/lib/hreflang";
import { rentalProducts } from "@/lib/products";

const product = rentalProducts.find((p) => p.id === "jul_hygge")!;

export const metadata: Metadata = {
  title: "Julehyggen | Lyd og lys til den lille julefrokost | 695 kr",
  description: product.desc_da,
  alternates: { canonical: "https://lejhojtaler.dk/julehyggen", languages: localeAlternates("/julehyggen") },
  openGraph: {
    title: "Julehyggen | 695 kr",
    description: product.desc_da,
    url: "https://lejhojtaler.dk/julehyggen",
    images: [product.image],
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="julehyggen"
      productId="jul_hygge"
      name={product.name_da}
      headline="Julehyggen, din lille julefrokost-pakke"
      price={695}
      sub={product.desc_da}
      image={product.image}
      imageAlt="Mackie Thump GO, varm lyskæde og LED-lyseffekt til julehygge"
      bullets={[
        ...product.bundle!.parts.map((part) => part.label_da),
        "Ingen røg — passer til kontorer med røgalarm",
        "Alle kabler med. Én pris for op til 5 dages leje.",
      ]}
    >
      <section className="mx-auto max-w-3xl px-5 pb-14 text-center">
        <Link href="/julefrokost" className="rounded-full border border-amber-300/40 px-6 py-3 text-amber-200 hover:bg-amber-300/10">
          Se alle julefrokost-pakker
        </Link>
      </section>
    </ProductLanding>
  );
}
