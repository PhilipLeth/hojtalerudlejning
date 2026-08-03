"use client";

import Link from "next/link";
import { useProducts } from "@/lib/useProducts";

export interface CategoryItem {
  /** Produkt-id i kataloget (speaker, addon eller rentalProduct) */
  id: string;
  /** Link — produktside hvis den findes, ellers /?product=ID#book */
  href?: string;
  tag?: string;
}

/** Kort-grid til kategorisider — navn/pris/billede/beskrivelse læses live fra kataloget. */
export default function CategoryProductGrid({
  items,
  category,
}: {
  items?: CategoryItem[];
  /** Alternativ: vis alle rentalProducts i en kategori */
  category?: string;
}) {
  const { speakers, addons, rentalProducts } = useProducts();

  const resolved = (
    items ??
    rentalProducts
      .filter((r) => r.category === category)
      .map((r) => ({ id: r.id, href: undefined as string | undefined, tag: undefined }))
  ).map((item) => {
    const sp = speakers.find((p) => p.id === item.id);
    if (sp) {
      return {
        ...item,
        name: sp.da.name,
        desc: sp.da.desc,
        price: sp.price,
        image: sp.product,
        contents: sp.contents ?? [],
        href: `/?product=${sp.id}#book`,
        page: sp.page ?? (item.href && !item.href.includes("#book") && !item.href.startsWith("/book") ? item.href : undefined),
      };
    }
    const ad = addons.find((p) => p.id === item.id);
    if (ad) {
      return {
        ...item,
        name: ad.da.label,
        desc: ad.da.desc,
        price: ad.price,
        image: ad.image ?? "/images/product-lys.png",
        contents: ad.contents ?? [],
        href: `/?product=${ad.id}#book`,
        page: ad.page ?? (item.href && !item.href.includes("#book") && !item.href.startsWith("/book") ? item.href : undefined),
      };
    }
    const r = rentalProducts.find((p) => p.id === item.id);
    if (r) {
      return {
        ...item,
        name: r.name_da,
        desc: r.desc_da ?? "",
        price: r.price,
        image: r.image,
        contents: r.contents ?? [],
        href: `/?product=${r.id}#book`,
        page: r.page ?? (item.href && !item.href.includes("#book") && !item.href.startsWith("/book") ? item.href : undefined),
      };
    }
    return null;
  });

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {resolved.map((p) =>
        p ? (
          <article
            key={p.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-brand-500/40"
          >
            <Link href={p.page ?? p.href!} className="relative block overflow-hidden bg-[#0d0c12] p-6">
              {p.tag && (
                <span className="absolute left-4 top-4 z-20 rounded-full bg-brand-500 px-2.5 py-0.5 text-[11px] font-bold text-black">
                  {p.tag}
                </span>
              )}
              <img
                src={p.image}
                alt={p.name}
                className="mx-auto h-40 w-full object-contain transition duration-300 group-hover:scale-105 group-hover:opacity-20"
              />
              {p.contents.length > 0 && (
                <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center bg-[#0d0c12]/75 px-5 opacity-0 transition duration-300 group-hover:opacity-100">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-400">
                    Inkluderet
                  </p>
                  <ul className="space-y-1">
                    {p.contents.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-white/90">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-xl font-semibold text-white">{p.name}</h3>
              <p className="mt-1 flex-1 text-sm text-white/40">{p.desc}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-2xl font-bold text-brand-400">
                  {p.price} kr<span className="ml-1 text-xs font-normal text-white/40">/weekend</span>
                </p>
                <div className="flex gap-2">
                  <Link
                    href={p.href!}
                    className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-400 active:scale-95"
                  >
                    Book
                  </Link>
                  {p.page && (
                    <Link
                      href={p.page}
                      className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:border-brand-500/40 hover:text-brand-400"
                    >
                      Info
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </article>
        ) : null
      )}
    </div>
  );
}
