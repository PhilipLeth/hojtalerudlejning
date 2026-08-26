"use client";

import { useCallback, useEffect, useState } from "react";
import { galleryFor, ratioTal, type GalleryImage } from "@/lib/productGallery";
import type { Locale } from "@/lib/i18n";

/**
 * Produktet i brug — galleriet på produktsiden.
 *
 * Billederne er genererede (se scripts/product-images/generate.mjs) med vores
 * egne produktfotos som reference, så det er vores grej der står i rummet. Men
 * genereret er ikke fotograferet: et stemningsbillede af en havefest er ikke
 * dokumentation af den vare, kunden lejer. Derfor bærer hvert billede en
 * "Illustration"-mærkat, og alt-teksten siger det samme til dem, der ikke kan
 * se mærkaten. produktgalleri.test.tsx fejler, hvis mærkaten forsvinder.
 *
 * Findes der ingen billeder for produktet, viser komponenten ingenting — et
 * galleri kan bygges op ét produkt ad gangen uden at siderne knækker imens.
 */

const COPY = {
  da: {
    eyebrow: "Galleri",
    titel: (navn: string) => `${navn} i brug`,
    intro: "Sådan står det, når det er sat op. Billederne er illustrationer, lavet ud fra fotos af vores eget udstyr.",
    label: "Illustration",
    labelLang: "Illustration — genereret ud fra fotos af vores eget udstyr",
    luk: "Luk",
    forrige: "Forrige billede",
    naeste: "Næste billede",
    aabn: (alt: string) => `Vis ${alt} i stor størrelse`,
  },
  en: {
    eyebrow: "Gallery",
    titel: (navn: string) => `${navn} in use`,
    intro: "This is how it looks once it is set up. The images are illustrations, made from photos of our own equipment.",
    label: "Illustration",
    labelLang: "Illustration — generated from photos of our own equipment",
    luk: "Close",
    forrige: "Previous image",
    naeste: "Next image",
    aabn: (alt: string) => `Open ${alt} full size`,
  },
} as const;

function tekst(b: GalleryImage, locale: Locale) {
  return locale === "en"
    ? { alt: b.alt_en, caption: b.caption_en, titel: b.titel_en }
    : { alt: b.alt_da, caption: b.caption_da, titel: b.titel_da };
}

export default function ProductGallery({
  productId,
  name,
  locale = "da",
}: {
  productId: string;
  /** Produktnavnet på sidens sprog — bruges i overskriften */
  name: string;
  locale?: Locale;
}) {
  const billeder = galleryFor(productId);
  const c = COPY[locale];
  const [aaben, setAaben] = useState<number | null>(null);

  const luk = useCallback(() => setAaben(null), []);
  const flyt = useCallback(
    (retning: number) =>
      setAaben((i) => (i === null ? null : (i + retning + billeder.length) % billeder.length)),
    [billeder.length],
  );

  // Tastaturet skal kunne det samme som musen: Esc lukker, piletaster bladrer.
  useEffect(() => {
    if (aaben === null) return;
    const tast = (e: KeyboardEvent) => {
      if (e.key === "Escape") luk();
      if (e.key === "ArrowRight") flyt(1);
      if (e.key === "ArrowLeft") flyt(-1);
    };
    document.addEventListener("keydown", tast);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tast);
      document.body.style.overflow = "";
    };
  }, [aaben, luk, flyt]);

  if (billeder.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
        {c.eyebrow}
      </p>
      <h2 className="mb-2 text-center text-3xl font-bold sm:text-4xl">{c.titel(name)}</h2>
      <p className="mx-auto mb-10 max-w-xl text-center text-white/50">{c.intro}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {billeder.map((b, i) => {
          const t = tekst(b, locale);
          // Det brede billede får hele rækken; de firkantede deler den.
          const bredt = ratioTal(b.ratio) > 1.5;
          return (
            <button
              key={b.src}
              type="button"
              onClick={() => setAaben(i)}
              aria-label={c.aabn(t.alt)}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0c12] text-left transition hover:border-brand-500/40 ${
                bredt ? "sm:col-span-2" : ""
              }`}
            >
              <img
                loading="lazy"
                decoding="async"
                src={b.thumb}
                srcSet={`${b.thumb} 400w, ${b.src} 1600w`}
                sizes={bredt ? "(max-width: 640px) 100vw, 1150px" : "(max-width: 640px) 100vw, 570px"}
                alt={`${t.alt} (${c.label.toLowerCase()})`}
                style={{ aspectRatio: String(ratioTal(b.ratio)) }}
                className="w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white/70 backdrop-blur-sm">
                {c.label}
              </span>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-3 pt-10">
                <span className="block text-sm font-semibold text-white">{t.titel}</span>
                <span className="mt-0.5 block text-sm text-white/60">{t.caption}</span>
              </span>
            </button>
          );
        })}
      </div>

      {aaben !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tekst(billeder[aaben], locale).alt}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/92 px-4 py-6 backdrop-blur-sm"
          onClick={luk}
        >
          <button
            type="button"
            onClick={luk}
            aria-label={c.luk}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/70 transition hover:bg-black/80 hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <figure className="max-h-full w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={billeder[aaben].src}
              alt={`${tekst(billeder[aaben], locale).alt} (${c.label.toLowerCase()})`}
              className="mx-auto max-h-[72vh] w-auto rounded-2xl object-contain"
            />
            <figcaption className="mx-auto mt-4 max-w-xl text-center">
              <span className="block text-base font-semibold text-white">
                {tekst(billeder[aaben], locale).titel}
              </span>
              <span className="mt-1 block text-sm text-white/60">
                {tekst(billeder[aaben], locale).caption}
              </span>
              <span className="mt-3 block text-xs text-white/35">{c.labelLang}</span>
            </figcaption>
          </figure>

          {billeder.length > 1 && (
            <div className="mt-5 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => flyt(-1)}
                aria-label={c.forrige}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="text-sm tabular-nums text-white/40">
                {aaben + 1} / {billeder.length}
              </span>
              <button
                type="button"
                onClick={() => flyt(1)}
                aria-label={c.naeste}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
