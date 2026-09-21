"use client";
import { whiteProductImage } from "./whiteProductImages";

import { useEffect, useState } from "react";
import {
  speakers as defaultSpeakers,
  addons as defaultAddons,
  rentalProducts as defaultRentals,
  cheapestSpeakerPrice,
  refreshBundlePrices,
  DELIVERY_ADDON_IDS,
  LEGACY_DELIVERY_IDS,
  RETIRED_ADDON_IDS,
  SAMMENLAGTE_IDER,
  type DeliveryAddonId,
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
  return list.filter((p) => !p.hidden).map(p => JSON.parse(JSON.stringify(p).replace(/ — /g, ", ").replace(/—/g, "")) as T).map(p => ({...p,
    ...("image" in p && typeof p.image === "string" ? {image:whiteProductImage(p.image)} : {}),
    ...("product" in p && typeof p.product === "string" ? {product:whiteProductImage(p.product)} : {}),
  }));
}

/** Keep admin catalog, but add any new default rentals (e.g. festpakker) missing in KV. */
function mergeRentals(fromKv: RentalProduct[]): RentalProduct[] {
  // Sammenlagte varer må ikke komme tilbage gennem et gammelt KV-katalog:
  // så stod den trådløse mikrofon igen to gange, med hver sin pris.
  fromKv = fromKv.filter((p) => !(p.id in SAMMENLAGTE_IDER));
  const ids = new Set(fromKv.map((p) => p.id));
  const missing = defaultRentals.filter((d) => !ids.has(d.id));
  const merged = fromKv.map((p) => {
    const d = defaultRentals.find((x) => x.id === p.id);
    let next = p;
    if (!next.contents?.length && d?.contents?.length) {
      next = { ...next, contents: d.contents };
    } else if (d?.contents?.length && next.contents?.length) {
      // Hovedtelefoner kom med pulten efter kataloget blev gemt i KV.
      const hp = "DJ-hovedtelefoner · Fun Generation HP 5";
      if (d.contents.includes(hp) && !next.contents.includes(hp)) {
        next = { ...next, contents: [...next.contents, hp] };
      }
    }
    // Bundle-meta fra defaults hvis KV mangler dem (ældre katalog)
    if (!next.bundle?.parts?.length && d?.bundle?.parts?.length) {
      next = { ...next, bundle: d.bundle, page: next.page ?? d.page };
    }
    // Halloween-pakkerne har custom stemningsfotos — et KV-katalog med hvide
    // studieversioner må ikke vinde over de billeder koden peger på.
    if (d?.image && next.id.startsWith("halloween_")) {
      next = { ...next, image: d.image };
    }
    return next;
  });
  return missing.length ? [...missing, ...merged] : merged;
}

/** Eksporteret til test, se mergeAddons */
export const mergeAddonsForTest = (fromKv: Addon[]): Addon[] => mergeAddons(fromKv);

/** Strip de gamle kørsels-tilvalg, sync priser/tekster på de nuværende,
 *  og tilføj tilvalg der er kommet til i koden efter kataloget blev gemt.
 *  Kørslen (495 én vej / 795 begge veje) styres fra koden, så et gammelt
 *  KV-katalog aldrig kan sende en booking af sted med forkert leveringspris. */
function mergeAddons(fromKv: Addon[]): Addon[] {
  const merged = fromKv
    .filter((a) => !LEGACY_DELIVERY_IDS.includes(a.id)) // erstattet af levering_ud / afhentning_retur / levering_begge
    .filter((a) => !RETIRED_ADDON_IDS.includes(a.id)) // fx lydmand_4t, timerne er antal nu
    .map((a) => {
      const d = defaultAddons.find((x) => x.id === a.id);
      if (DELIVERY_ADDON_IDS.includes(a.id as DeliveryAddonId) && d) {
        return { ...a, price: d.price, image: null, da: d.da, en: d.en };
      }
      let next = a;
      if (!next.contents?.length && d?.contents?.length) {
        next = { ...next, contents: d.contents };
      }
      // Intern-flaget styres fra koden, et gammelt KV-katalog må ikke
      // sende faktureringsgebyret ud i kundens bookingflow.
      if (d?.intern && !next.intern) {
        next = { ...next, intern: true };
      }
      // En ydelse (lydmand) styres fra koden: enheden, teksterne og siden.
      // Beskrivelsen ændrede sig, da timerne blev til antal, og et KV-katalog
      // gemt før det må ikke bede kunden skrive timer i kommentaren.
      if (d?.ydelse) {
        next = { ...next, ...(d.id === "dj_musikafvikler" ? {price:d.price,image:d.image,contents:d.contents} : {}), ydelse: true, priceUnit: d.priceUnit, page: d.page, da: d.da, en: d.en };
      }
      return next;
    });
  // Nye tilvalg tilføjet i koden (fx subwoofer) skal også dukke op selvom
  // kataloget i KV blev gemt før, samme princip som mergeRentals.
  const ids = new Set(merged.map((a) => a.id));
  const missing = defaultAddons.filter((d) => !ids.has(d.id));
  return missing.length ? [...merged, ...missing] : merged;
}

function mergeSpeakers(fromKv: Speaker[]): Speaker[] {
  // festival_bas var en opfundet combo-SKU, kun subwoofer + festival findes fysisk
  return fromKv
    .filter((s) => s.id !== "festival_bas")
    .map((s) => {
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
      const pricedRentals = refreshBundlePrices(rentalProducts, [...speakers, ...addons, ...rentalProducts]);
      setCatalog({ speakers, addons, rentalProducts: pricedRentals, startPrice: cheapestSpeakerPrice(speakers) });
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
