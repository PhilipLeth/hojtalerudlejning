"use client";

import { useEffect, useState } from "react";
import {
  speakers as defaultSpeakers,
  addons as defaultAddons,
  cheapestSpeakerPrice,
  type Speaker,
  type Addon,
} from "./products";

export interface Catalog {
  speakers: Speaker[];
  addons: Addon[];
  /** Cheapest visible speaker price (hero, sticky bar, meta) */
  startPrice: number;
}

interface CatalogResponse {
  speakers?: Speaker[] | null;
  addons?: Addon[] | null;
}

function visible<T extends { hidden?: boolean }>(list: T[]): T[] {
  return list.filter((p) => !p.hidden);
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
    startPrice: cheapestSpeakerPrice(),
  }));

  useEffect(() => {
    let cancelled = false;

    const apply = (data: CatalogResponse) => {
      if (cancelled) return;
      const speakers =
        Array.isArray(data.speakers) && data.speakers.length
          ? visible(data.speakers)
          : visible(defaultSpeakers);
      const addons =
        Array.isArray(data.addons) && data.addons.length
          ? visible(data.addons)
          : visible(defaultAddons);
      setCatalog({ speakers, addons, startPrice: cheapestSpeakerPrice(speakers) });
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
