"use client";

import { useEffect, useState } from "react";
import {
  speakers as defaultSpeakers,
  addons as defaultAddons,
  rentalProducts as defaultRentals,
  cheapestSpeakerPrice,
  type Speaker,
  type Addon,
  type RentalProduct,
} from "@/lib/products";

export interface Catalog {
  speakers: Speaker[];
  addons: Addon[];
  rentalProducts: RentalProduct[];
  /** Cheapest visible speaker price (hero, sticky bar, meta) */
  startPrice: number;
}

interface CatalogResponse {
  speakers?: Speaker[] | null;
  addons?: Addon[] | null;
  rentalProducts?: RentalProduct[] | null;
}

function visible<T extends { hidden?: boolean }>(list: T[]): T[] {
  return list.filter((p) => !p.hidden);
}

/** Keep admin catalog, but add any new default rentals (e.g. festpakker) missing in KV. */
function mergeRentals(fromKv: RentalProduct[]): RentalProduct[] {
  const ids = new Set(fromKv.map((p) => p.id));
  const missing = defaultRentals.filter((d) => !ids.has(d.id));
  const merged = fromKv.map((p) => {
    const d = defaultRentals.find((x) => x.id === p.id);
    let next = p;
    if (!next.contents?.length && d?.contents?.length) {
      next = { ...next, contents: d.contents };
    }
    // Bundle-meta fra defaults hvis KV mangler dem (ældre katalog)
    if (!next.bundle?.parts?.length && d?.bundle?.parts?.length) {
      next = { ...next, bundle: d.bundle, page: next.page ?? d.page };
    }
    return next;
  });
  return missing.length ? [...missing, ...merged] : merged;
}

/** Sync levering+opsætning pris + strip den gamle 'levering uden opsætning'. */
function mergeAddons(fromKv: Addon[]): Addon[] {
  return fromKv
    .filter((a) => a.id !== "levering") // findes ikke længere — kun levering+opsætning
    .map((a) => {
      const d = defaultAddons.find((x) => x.id === a.id);
      let next = a;
      if (a.id === "levering_opsaetning" && d) {
        next = { ...next, price: d.price, da: d.da, en: d.en };
      }
      if (!next.contents?.length && d?.contents?.length) {
        next = { ...next, contents: d.contents };
      }
      return next;
    });
}

function mergeSpeakers(fromKv: Speaker[]): Speaker[] {
  return fromKv.map((s) => {
    if (s.contents?.length) return s;
    const d = defaultSpeakers.find((x) => x.id === s.id);
    return d?.contents?.length ? { ...s, contents: d.contents } : s;
  });
}

let cached: CatalogResponse | null = null;

/**
 * Live product catalog: starts with the hardcoded defaults (so SSG/first
 * paint always works), then swaps in the admin-edited catalog from
 * /api/products if one has been saved.
 */
export function useProducts(): Catalog {
  const [catalog, setCatalog] = useState<Catalog>(() => ({
    speakers: visible(defaultSpeakers),
    addons: visible(defaultAddons),
    rentalProducts: visible(defaultRentals),
    startPrice: cheapestSpeakerPrice(),
  }));

  useEffect(() => {
    let cancelled = false;

    const apply = (data: CatalogResponse) => {
      if (cancelled) return;
      const speakers =
        Array.isArray(data.speakers) && data.speakers.length
          ? visible(mergeSpeakers(data.speakers))
          : visible(defaultSpeakers);
      const addons =
        Array.isArray(data.addons) && data.addons.length
          ? visible(mergeAddons(data.addons))
          : visible(defaultAddons);
      const rentalProducts =
        Array.isArray(data.rentalProducts) && data.rentalProducts.length
          ? visible(mergeRentals(data.rentalProducts))
          : visible(defaultRentals);
      setCatalog({ speakers, addons, rentalProducts, startPrice: cheapestSpeakerPrice(speakers) });
    };

    if (cached) {
      apply(cached);
      return;
    }

    fetch("/api/products")
      .then((r) => r.json())
      .then((data: CatalogResponse) => {
        cached = data;
        apply(data);
      })
      .catch(() => {
        // Keep defaults on failure
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return catalog;
}
