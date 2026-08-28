"use client";

import { useEffect, useState } from "react";
import { galleryFor, type GalleryImage } from "@/lib/productGallery";

/**
 * Galleriet for et produkt — fra begge kilder.
 *
 * Der er to veje ind: scriptet, der genererer hele kataloget på én gang og
 * committer WebP-filerne i public/images/gallery (det statiske manifest), og
 * knappen i /admin/produkter, der laver ét billede ad gangen og lægger det i
 * R2 med en post i KV. Samme princip som produktkataloget: koden er
 * udgangspunktet, admin kan overskrive uden et deploy.
 *
 * Et billede fra admin vinder over det statiske for samme scene — ellers ville
 * "Lav om"-knappen ikke ændre noget for kunden.
 */
export function useGallery(productId: string): GalleryImage[] {
  const [fraAdmin, setFraAdmin] = useState<Record<string, GalleryImage[]> | null>(null);

  useEffect(() => {
    let levende = true;
    fetch("/api/gallery")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        if (levende) setFraAdmin(data as Record<string, GalleryImage[]>);
      })
      .catch(() => {
        // Galleriet er pynt. Kan API'et ikke nås, står de statiske billeder alene.
      });
    return () => {
      levende = false;
    };
  }, []);

  const statiske = galleryFor(productId);
  const admin = fraAdmin?.[productId] ?? [];
  if (admin.length === 0) return statiske;

  const perScene = new Map<string, GalleryImage>();
  for (const b of statiske) perScene.set(b.scene, b);
  for (const b of admin) {
    // En gravsten fjerner scenen helt — også den statiske fil bag den
    if ((b as GalleryImage & { fjernet?: boolean }).fjernet) perScene.delete(b.scene);
    else perScene.set(b.scene, b);
  }
  return [...perScene.values()];
}
