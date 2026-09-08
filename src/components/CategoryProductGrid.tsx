"use client";

import Link from "next/link";
import { useProducts } from "@/lib/useProducts";
import { thumbSrcSet, GRID_IMAGE_SIZES } from "@/lib/imageSrcSet";
import { localizedHref } from "@/lib/enPages";
import { bookHref } from "@/lib/bookUrl";
import { contentsFor } from "@/lib/contentsEn";
import type { Locale } from "@/lib/i18n";

/**
 * Kortets faste tekster. Navne og beskrivelser findes allerede på begge sprog
 * i kataloget; kun kortets egne ord stod hårdkodet på dansk, og det var det,
 * der spærrede for en engelsk kategoriside.
 *
 * `contents` findes kun på dansk — pakkelisten er tekniske ord ("2× farvede
 * LED-lamper"), som er læsbare på begge sprog. Samme afvejning som i
 * productFaq.ts, hvor de engelske svar også citerer den danske pakkeliste.
 */
const COPY = {
  da: { included: "Inkluderet", currency: "kr", perWeekend: "/weekend", book: "Book", info: "Info" },
  en: { included: "Included", currency: "DKK", perWeekend: "/weekend", book: "Book", info: "Details" },
} as const;

export interface CategoryItem {
  /** Produkt-id i kataloget (speaker, addon eller rentalProduct) */
  id: string;
  /** Link — produktside hvis den findes, ellers /?product=ID#book */
  href?: string;
  tag?: string;
}

/**
 * Produktsiden på det rigtige sprog — eller ingen "Info"-knap.
 *
 * Katalogets `page` er altid den danske sti. Uden localizedHref sendte et
 * engelsk kort kunden ind i dansk tekst; findes siden ikke på engelsk, beholdes
 * den danske, jf. enPages.ts.
 */
function enSti(sti: string | undefined, locale: Locale): string | undefined {
  if (!sti) return undefined;
  if (sti.includes("#book") || sti.startsWith("/book")) return undefined;
  return localizedHref(sti, locale);
}

/** Kort-grid til kategorisider — navn/pris/billede/beskrivelse læses live fra kataloget. */
export default function CategoryProductGrid({
  items,
  category,
  locale = "da",
}: {
  items?: CategoryItem[];
  /** Alternativ: vis alle rentalProducts i en kategori */
  category?: string;
  /** Sprog — styrer kortets tekster og hvor "Info" fører hen. */
  locale?: Locale;
}) {
  const { speakers, addons, rentalProducts } = useProducts();
  const c = COPY[locale];

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
        name: sp[locale].name,
        desc: sp[locale].desc,
        price: sp.price,
        image: sp.product,
        contents: contentsFor(sp.contents, locale),
        href: bookHref(sp.id, locale),
        page: enSti(sp.page ?? item.href, locale),
      };
    }
    const ad = addons.find((p) => p.id === item.id);
    if (ad) {
      return {
        ...item,
        name: ad[locale].label,
        desc: ad[locale].desc,
        price: ad.price,
        image: ad.image,
        contents: contentsFor(ad.contents, locale),
        href: bookHref(ad.id, locale),
        page: enSti(ad.page ?? item.href, locale),
      };
    }
    const r = rentalProducts.find((p) => p.id === item.id);
    if (r) {
      return {
        ...item,
        name: locale === "en" ? r.name_en : r.name_da,
        desc: (locale === "en" ? r.desc_en : r.desc_da) ?? "",
        price: r.price,
        image: r.image,
        contents: contentsFor(r.contents, locale),
        href: bookHref(r.id, locale),
        page: enSti(r.page ?? item.href, locale),
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
              {/* Nogle varer har endnu ikke et produktfoto. Før faldt de
                  tilbage på lys-pakkens billede, så en mixer blev vist som en
                  lyseffekt — et forkert billede er værre end intet. Nu står
                  navnet i stedet, indtil fotoet findes. */}
              {p.image ? (
                <img loading="lazy" decoding="async"
                  src={p.image}
                  srcSet={thumbSrcSet(p.image)}
                  sizes={GRID_IMAGE_SIZES}
                  alt={p.name}
                  className="mx-auto h-40 w-full object-contain transition duration-300 group-hover:scale-105 group-hover:opacity-20"
                />
              ) : (
                <div className="mx-auto flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 transition duration-300 group-hover:opacity-20">
                  <span className="text-center text-sm font-medium text-white/40">{p.name}</span>
                </div>
              )}
              {p.contents.length > 0 && (
                <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center bg-[#0d0c12]/75 px-5 opacity-0 transition duration-300 group-hover:opacity-100">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-400">
                    {c.included}
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
                  {p.price} {c.currency}<span className="ml-1 text-xs font-normal text-white/40">{c.perWeekend}</span>
                </p>
                <div className="flex gap-2">
                  <Link
                    href={p.href!}
                    className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-400 active:scale-95"
                  >
                    {c.book}
                  </Link>
                  {p.page && (
                    <Link
                      href={p.page}
                      className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:border-brand-500/40 hover:text-brand-400"
                    >
                      {c.info}
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
