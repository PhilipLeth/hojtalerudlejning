"use client";

import Link from "next/link";
import { bookHref } from "@/lib/bookUrl";
import { isBundleProduct } from "@/lib/products";
import { useProducts } from "@/lib/useProducts";

/** Forside produktgrid — sorteret efter popularitet. Bundles (Fest-klar) bor i BundleGrid. */
const GRID: Array<{
  id: string;
  href: string;
  name: string;
  price: number;
  image: string;
  tag?: string;
}> = [
  { id: "soundboks", href: "/soundboks-4", name: "Soundboks 4", price: 600, image: "/images/product-soundboks.png", tag: "Populær" },
  { id: "thumpgo", href: "/mackie-thump-go", name: "Mackie Thump GO", price: 350, image: "/images/product-thumpgo.png", tag: "Batteri" },
  { id: "party", href: "/hojtalerpakke-lille", name: "Højtalerpakke lille", price: 399, image: "/images/product-party.png" },
  { id: "festival", href: "/hojtalerpakke-normal", name: "Højtalerpakke normal", price: 700, image: "/images/product-festival.png" },
  { id: "lys", href: "/festlys", name: "Lysbar", price: 500, image: "/images/product-lys.png" },
  { id: "rog", href: "/roegmaskine", name: "Røgmaskine", price: 250, image: "/images/product-rog.png" },
  { id: "discokugle", href: "/discokugle", name: "Discokugle", price: 250, image: "/images/product-discokugle.png" },
  { id: "lyskaeder", href: "/lyskaeder", name: "Lyskæder", price: 200, image: "/images/product-lyskaeder.png" },
  { id: "projektor", href: "/projektor", name: "Projektor", price: 500, image: "/images/product-projektor.png" },
];

export default function ProductGrid() {
  const { speakers, addons, rentalProducts } = useProducts();

  const gridIds = new Set(GRID.map((g) => g.id));

  const extraFromCatalog = [
    ...speakers
      .filter((s) => !gridIds.has(s.id))
      .map((s) => ({
        id: s.id,
        href: bookHref(s.id),
        name: s.da.name,
        price: s.price,
        image: s.product,
      })),
    ...rentalProducts
      .filter((r) => !gridIds.has(r.id) && !isBundleProduct(r))
      .map((r) => ({
        id: r.id,
        href: bookHref(r.id),
        name: r.name_da,
        price: r.price,
        image: r.image,
      })),
  ];

  const allProducts = [...GRID, ...extraFromCatalog];

  const priceFor = (id: string, fallback: number) => {
    const sp = speakers.find((s) => s.id === id);
    if (sp) return sp.price;
    const ad = addons.find((a) => a.id === id);
    if (ad) return ad.price;
    const rental = rentalProducts.find((p) => p.id === id);
    if (rental) return rental.price;
    return fallback;
  };
  const nameFor = (id: string, fallback: string) => {
    const sp = speakers.find((s) => s.id === id);
    if (sp) return sp.da.name;
    const ad = addons.find((a) => a.id === id);
    if (ad) return ad.da.label;
    const rental = rentalProducts.find((p) => p.id === id);
    if (rental) return rental.name_da;
    return fallback;
  };
  const imageFor = (id: string, fallback: string) => {
    const sp = speakers.find((s) => s.id === id);
    if (sp) return sp.product;
    const ad = addons.find((a) => a.id === id);
    if (ad?.image) return ad.image;
    const rental = rentalProducts.find((p) => p.id === id);
    if (rental) return rental.image;
    return fallback;
  };
  const contentsFor = (id: string): string[] => {
    const sp = speakers.find((s) => s.id === id);
    if (sp?.contents?.length) return sp.contents;
    const ad = addons.find((a) => a.id === id);
    if (ad?.contents?.length) return ad.contents;
    const rental = rentalProducts.find((p) => p.id === id);
    if (rental?.contents?.length) return rental.contents;
    return [];
  };

  return (
    <section id="produkter" className="relative z-20 mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <h2 className="mb-2 text-center text-3xl font-bold sm:text-4xl">Produkter</h2>
      <p className="mx-auto mb-10 max-w-lg text-center text-white/50">
        Vælg produkt og book online — én pris for op til 5 dages leje.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {allProducts.map((p) => {
          const price = priceFor(p.id, p.price);
          const name = nameFor(p.id, p.name);
          const image = imageFor(p.id, p.image);
          const contents = contentsFor(p.id);
          return (
            <article
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-brand-500/40"
            >
              <Link href={p.href} className="relative block h-52 overflow-hidden bg-[#0d0c12] p-6">
                {p.tag && (
                  <span className="absolute left-4 top-4 z-20 rounded-full bg-brand-500 px-2.5 py-0.5 text-[11px] font-bold text-black">
                    {p.tag}
                  </span>
                )}
                <img
                  src={image}
                  alt={name}
                  className="mx-auto h-40 w-full object-contain transition duration-300 group-hover:scale-105 group-hover:opacity-20"
                />
                {contents.length > 0 && (
                  <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center bg-[#0d0c12]/75 px-5 opacity-0 transition duration-300 group-hover:opacity-100">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-400">
                      Inkluderet
                    </p>
                    <ul className="space-y-1">
                      {contents.map((item) => (
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
                <h3 className="text-lg font-semibold text-white">{name}</h3>
                <p className="mt-1 text-xl font-bold text-brand-400">
                  {price} kr<span className="text-sm font-normal text-white/40">/weekend</span>
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/book?product=${p.id}`}
                    className="flex-1 rounded-full bg-brand-500 py-3 text-center text-sm font-semibold text-black transition hover:bg-brand-400 active:scale-[0.98]"
                  >
                    Book
                  </Link>
                  {!p.href.startsWith("/book") && (
                    <Link
                      href={p.href}
                      className="flex-1 rounded-full border border-white/15 py-3 text-center text-sm font-semibold text-white/70 transition hover:border-brand-500/40 hover:text-brand-400"
                    >
                      Info
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
