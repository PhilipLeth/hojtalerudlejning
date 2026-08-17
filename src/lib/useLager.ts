/** Lageret: antal pr. produkt og spærrede datoer.
 *
 * Antallene ligger i KV under "inventory" — den nøgle er hele sandheden om
 * lager, og den læses af booking-flowet, udsolgt-oversigten, kalenderen,
 * weekendudsalget og annoncereglerne. Derfor går al skrivning gennem
 * /api/inventory, som fletter felt for felt: to faner kan sætte antal på hver
 * sit produkt uden at overskrive hinanden.
 *
 * Antal gemmes med det samme — modsat produktkataloget, der har en "Gem
 * ændringer"-knap. Et lagertal er ét tal, og det skal kunne rettes uden at
 * publicere hele kataloget forfra.
 */

import { useCallback, useEffect, useState } from "react";

export interface BlockedDate {
  date: string;
  reason: string;
  products: string[];
}

/** Et produkt vi har taget imod flere bookinger på, end vi ejer enheder af */
export interface OverbookHit {
  id: string;
  name: string;
  day: string;
  booked: number;
  owned: number;
  missing: number;
}

export interface LagerState {
  /** productId → antal vi ejer. Mangler et id, har produktet intet lagertal */
  stock: Record<string, number>;
  /** productId → hvor mange vi derudover tager imod, fordi de kan skaffes JIT */
  overbook: Record<string, number>;
  /** Hvad vi allerede har taget imod ud over det ejede — skal skaffes */
  overbooked: OverbookHit[];
  blocked: BlockedDate[];
  loading: boolean;
  saving: boolean;
  error: string;
  /** Sæt (eller ryd med null) et eller flere antal. Optimistisk med rullback. */
  saveStock: (patch: Record<string, number | null>) => Promise<void>;
  /** Samme, for overbooking. 0 og null betyder "ingen overbooking". */
  saveOverbook: (patch: Record<string, number | null>) => Promise<void>;
  blockDate: (date: string, reason: string, products: string[]) => Promise<boolean>;
  unblockDate: (date: string) => Promise<void>;
  reload: () => void;
}

export function useLager(secret: string): LagerState {
  const [stock, setStock] = useState<Record<string, number>>({});
  const [overbook, setOverbook] = useState<Record<string, number>>({});
  const [overbooked, setOverbooked] = useState<OverbookHit[]>([]);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(() => {
    if (!secret) return;
    setLoading(true);
    fetch(`/api/inventory?secret=${encodeURIComponent(secret)}`)
      .then((r) => r.json())
      .then((d: {
        inventory?: Record<string, number>;
        overbook?: Record<string, number>;
        overbooked?: OverbookHit[];
        blocked?: BlockedDate[];
        error?: string;
      }) => {
        if (d.inventory) {
          setStock(d.inventory);
          setOverbook(d.overbook ?? {});
          setOverbooked(Array.isArray(d.overbooked) ? d.overbooked : []);
          setBlocked(Array.isArray(d.blocked) ? d.blocked : []);
          setError("");
        } else {
          setError(d.error || "Kunne ikke hente lagertal");
        }
      })
      .catch(() => setError("Kunne ikke hente lagertal"))
      .finally(() => setLoading(false));
  }, [secret]);

  useEffect(reload, [reload]);

  const post = useCallback(
    async (body: Record<string, unknown>, fejl: string): Promise<boolean> => {
      setSaving(true);
      setError("");
      try {
        const res = await fetch(`/api/inventory?secret=${encodeURIComponent(secret)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) return true;
        const data = await res.json().catch(() => ({}));
        setError(data.error || fejl);
        return false;
      } catch {
        setError("Netværksfejl — ændringen blev ikke gemt");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [secret],
  );

  /** Optimistisk opdatering af et af de to tal-kort, med rullback hvis kaldet fejler */
  const patchMap = (
    setter: React.Dispatch<React.SetStateAction<Record<string, number>>>,
    patch: Record<string, number | null>,
    zeroClears: boolean,
  ) => {
    let before: Record<string, number> = {};
    setter((prev) => {
      before = prev;
      const next = { ...prev };
      for (const [id, value] of Object.entries(patch)) {
        if (value === null || (zeroClears && value === 0)) delete next[id];
        else next[id] = value;
      }
      return next;
    });
    return () => setter(before);
  };

  const saveStock = useCallback(
    async (patch: Record<string, number | null>) => {
      const rollback = patchMap(setStock, patch, false);
      const ok = await post({ action: "set_inventory", inventory: patch }, "Kunne ikke gemme lagertallet");
      if (!ok) rollback();
    },
    [post],
  );

  const saveOverbook = useCallback(
    async (patch: Record<string, number | null>) => {
      const rollback = patchMap(setOverbook, patch, true);
      const ok = await post({ action: "set_inventory", overbook: patch }, "Kunne ikke gemme overbookingen");
      if (!ok) rollback();
    },
    [post],
  );

  const blockDate = useCallback(
    async (date: string, reason: string, products: string[]) => {
      const ok = await post({ action: "block_date", date, reason, products }, "Kunne ikke blokere datoen");
      if (ok) {
        setBlocked((prev) =>
          [...prev.filter((b) => b.date !== date), { date, reason, products }].sort((a, b) =>
            a.date.localeCompare(b.date),
          ),
        );
      }
      return ok;
    },
    [post],
  );

  const unblockDate = useCallback(
    async (date: string) => {
      const ok = await post({ action: "unblock_date", date }, "Kunne ikke fjerne blokeringen");
      if (ok) setBlocked((prev) => prev.filter((b) => b.date !== date));
    },
    [post],
  );

  return {
    stock, overbook, overbooked, blocked, loading, saving, error,
    saveStock, saveOverbook, blockDate, unblockDate, reload,
  };
}
