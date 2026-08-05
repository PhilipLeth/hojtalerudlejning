"use client";

import Link from "next/link";
import {
  bundleListPrice,
  isBundleProduct,
  type RentalProduct,
} from "@/lib/products";
import { useProducts } from "@/lib/useProducts";

/**
 * Sammensatte pakker vist som tilbudskort — samme kort som på forsiden.
 * Uden props: alle lyd-pakker (forsiden). Med `ids`: netop de pakker,
 * i den rækkefølge de er angivet (fx karaokepakkerne på /karaoke).
 */
export default function BundleGrid({
  ids,
  eyebrow = "Pakker",
  title = "Klar til festen",
  subtitle = "Lyd og lys der passer perfekt sammen — booket som én pakke med rabat vs. at leje delene enkeltvis. Levering og opsætning kan tilvælges.",
}: {
  ids?: string[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
} = {}) {
  const { rentalProducts } = useProducts();
  const bundles = ids
    ? ids
        .map((id) => rentalProducts.find((p) => p.id === id))
        .filter((p): p is RentalProduct => !!p && isBundleProduct(p))
    : rentalProducts.filter(isBundleProduct).filter((p) => p.category === "lyd");

  if (bundles.length === 0) return null;

  return (
    <section id="pakker" className="relative z-20 mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
        {eyebrow}
      </p>
      <h2 className="mb-2 text-center text-3xl font-bold sm:text-4xl">{title}</h2>
      <p className="mx-auto mb-10 max-w-xl text-center text-white/50">{subtitle}</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {bundles.map((p) => (
          <BundleCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function BundleCard({ product: p }: { product: RentalProduct }) {
  const { speakers, addons, rentalProducts } = useProducts();
  const pageFor = (id: string): string | undefined =>
    speakers.find((x) => x.id === id)?.page ??
    addons.find((x) => x.id === id)?.page ??
    rentalProducts.find((x) => x.id === id)?.page;
  const bundle = p.bundle!;
  const list = bundleListPrice(p);
  const savings = bundle.discount > 0 ? bundle.discount : Math.max(0, list - p.price);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-brand-500/25 bg-gradient-to-br from-brand-500/[0.08] via-white/[0.03] to-transparent transition hover:border-brand-500/50">
      {/* Hele billedfeltet er klikbart → produktside (ellers direkte til booking).
          object-contain så produktet ikke beskæres, og kun en let gradient
          nederst så teksten kan læses uden at mudre billedet til. */}
      <Link
        href={p.page ?? `/?product=${p.id}#book`}
        aria-label={`Se ${p.name_da}`}
        className="relative block h-48 overflow-hidden bg-[#0d0c12] sm:h-56"
      >
        <img
          src={p.image}
          alt={p.name_da}
          className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0d0c12] via-[#0d0c12]/70 to-transparent" />
        {savings > 0 && (
          <span className="absolute right-4 top-4 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-black">
            Spar {savings} kr
          </span>
        )}
        <div className="absolute bottom-4 left-5 right-5">
          <h3 className="text-2xl font-bold text-white">{p.name_da}</h3>
          <p className="mt-1 text-sm text-white/70">{bundle.usecase_da}</p>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        {/* Delene i pakken */}
        <div className="flex flex-wrap items-center gap-2">
          {bundle.parts.map((part, i) => {
            const partPage = pageFor(part.productId);
            const chip = (
              <span className={`rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/85 ${partPage ? "transition hover:border-brand-500/50 hover:text-brand-400" : ""}`}>
                {part.label_da}
                <span className="ml-1.5 text-white/35">{part.price} kr</span>
              </span>
            );
            return (
              <span key={part.productId} className="contents">
                {i > 0 && <span className="text-brand-400/80">+</span>}
                {partPage ? <Link href={partPage}>{chip}</Link> : chip}
              </span>
            );
          })}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
          <div>
            {savings > 0 && (
              <p className="text-sm text-white/40">
                <span className="line-through">{list} kr</span>
                <span className="ml-2 text-brand-400">−{savings} kr rabat</span>
              </p>
            )}
            <p className="text-2xl font-bold text-brand-400">
              {p.price} kr
              <span className="ml-1 text-sm font-normal text-white/40">/weekend</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/?product=${p.id}#book`}
              className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-400 active:scale-[0.98]"
            >
              Book pakke
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
  );
}
