import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import Link from "next/link";
import { localeAlternates } from "@/lib/hreflang";
import { localizedHref } from "@/lib/enPages";
import { rentalProducts } from "@/lib/products";

const product = rentalProducts.find((p) => p.id === "jul_hygge")!;

export const metadata: Metadata = {
  title: "Christmas Hygge package | Office Christmas lunch rental | 785 DKK",
  description: product.desc_en,
  alternates: { canonical: "https://lejhojtaler.dk/en/julehyggen", languages: localeAlternates("/julehyggen") },
  openGraph: {
    title: "Christmas Hygge | 785 DKK",
    description: product.desc_en,
    url: "https://lejhojtaler.dk/en/julehyggen",
    images: [product.image],
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/julehyggen"
      productId="jul_hygge"
      name={product.name_en}
      headline="Christmas Hygge, the small office lunch package"
      price={785}
      sub={product.desc_en}
      image={product.image}
      imageAlt="Mackie Thump GO, warm fairy lights and an LED effect for Christmas hygge"
      bullets={[
        ...product.bundle!.parts.map((part) => part.label_en),
        "No fog — safe for offices with smoke alarms",
        "All cables included. One price for up to 5 rental days.",
      ]}
    >
      <section className="mx-auto max-w-3xl px-5 pb-14 text-center">
        <Link href={localizedHref("/julefrokost", "en")} className="rounded-full border border-amber-300/40 px-6 py-3 text-amber-200 hover:bg-amber-300/10">
          See all Christmas party packages
        </Link>
      </section>
    </ProductLanding>
  );
}
