/** Kataloget som admin ser det: alt, også det skjulte.
 *
 * useProducts() er kundens udgave — den filtrerer skjulte produkter væk. Admin
 * skal se dem alle: et produkt kan være skjult på siden og stadig stå på hylden
 * og være ude til en fest. Delt af /admin/produkter (som redigerer kataloget) og
 * /admin/lager (som sætter antal), så de to sider viser samme liste i samme
 * rækkefølge med samme navne.
 */

import { useCallback, useEffect, useState } from "react";
import {
  speakers as defaultSpeakers,
  addons as defaultAddons,
  rentalProducts as defaultRentals,
  type Addon,
  type RentalProduct,
  type Speaker,
} from "./products";

export interface AdminCatalog {
  speakers: Speaker[];
  addons: Addon[];
  rentalProducts: RentalProduct[];
  /** true når kataloget kommer fra KV (redigeret i admin), false = koden */
  isCustom: boolean;
}

export const DEFAULT_ADMIN_CATALOG: AdminCatalog = {
  speakers: defaultSpeakers,
  addons: defaultAddons,
  rentalProducts: defaultRentals,
  isCustom: false,
};

/**
 * Hent kataloget. Er intet gemt i KV, er standardkataloget fra koden svaret —
 * det er også det kunden får, så admin ser det samme.
 */
export async function loadAdminCatalog(): Promise<AdminCatalog> {
  const res = await fetch("/api/products");
  const data = await res.json();
  if (Array.isArray(data.speakers) && data.speakers.length) {
    return {
      speakers: data.speakers,
      addons: Array.isArray(data.addons) && data.addons.length ? data.addons : defaultAddons,
      rentalProducts:
        Array.isArray(data.rentalProducts) && data.rentalProducts.length
          ? data.rentalProducts
          : defaultRentals,
      isCustom: true,
    };
  }
  return DEFAULT_ADMIN_CATALOG;
}

export interface AdminCatalogState extends AdminCatalog {
  loading: boolean;
  error: string;
  reload: () => void;
}

export function useAdminCatalog(): AdminCatalogState {
  const [catalog, setCatalog] = useState<AdminCatalog>(DEFAULT_ADMIN_CATALOG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(() => {
    setLoading(true);
    loadAdminCatalog()
      .then((c) => {
        setCatalog(c);
        setError("");
      })
      .catch(() => setError("Kunne ikke hente produkter — viser standard-kataloget"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(reload, [reload]);

  return { ...catalog, loading, error, reload };
}
