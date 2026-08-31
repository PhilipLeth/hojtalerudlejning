"use client";

import { useEffect, useState } from "react";
import { erAktiv } from "@/lib/galleryStatus";
import type { GalleryImage } from "@/lib/productGallery";

/**
 * Galleriet, som kunden ser det: manifestets aktive poster og intet andet.
 *
 * Før viste siden de committede billeder fra bulk-kørslen af sig selv, og
 * 77 billeder gik live uden at nogen havde set dem. Nu er de kun kandidater:
 * et billede vises, når nogen har slået det til i /admin/produkter — også
 * dem der ligger som fil i repoet. Kan API'et ikke nås, vises intet; galleriet
 * er pynt, og siden skal ikke knække med det.
 */
export function useGallery(productId: string): GalleryImage[] {
  const [manifest, setManifest] = useState<Record<string, (GalleryImage & { aktiv?: boolean; fjernet?: boolean })[]> | null>(null);

  useEffect(() => {
    let levende = true;
    fetch("/api/gallery")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        if (levende) setManifest(data as Record<string, GalleryImage[]>);
      })
      .catch(() => {
        // Intet galleri er bedre end en side, der fejler
      });
    return () => {
      levende = false;
    };
  }, []);

  return (manifest?.[productId] ?? []).filter((b) => b.src && erAktiv(b));
}
