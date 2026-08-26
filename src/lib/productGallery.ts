/* GENERERET FIL — ret den ikke i hånden.
 *
 * Skrives af scripts/product-images/generate.mjs ud fra gallery/scenes.json og
 * de billeder, der faktisk ligger i public/images/gallery/. Kør scriptet igen
 * efter en ny generering:
 *
 *   node scripts/product-images/generate.mjs --manifest
 *
 * Alle billeder her er AI-genererede med vores egne produktfotos som reference.
 * De vises med en mærkat i galleriet — se ProductGallery.tsx og
 * produktgalleri.test.tsx, som fejler hvis mærkaten forsvinder.
 */

export interface GalleryImage {
  /** 1600px WebP */
  src: string;
  /** 400px WebP til gitteret */
  thumb: string;
  /** Scene-id fra gallery/scenes.json */
  scene: string;
  /** Billedforhold, fx "16:9" — bruges til at reservere pladsen før billedet er hentet */
  ratio: string;
  titel_da: string;
  titel_en: string;
  alt_da: string;
  alt_en: string;
  caption_da: string;
  caption_en: string;
}

export const PRODUCT_GALLERY: Record<string, GalleryImage[]> = {

};

/** Galleriet for et produkt — tom liste hvis der ikke er genereret nogen endnu. */
export function galleryFor(productId: string): GalleryImage[] {
  return PRODUCT_GALLERY[productId] ?? [];
}

/** Bredde/højde-forhold som et tal, til CSS aspect-ratio. */
export function ratioTal(ratio: string): number {
  const [b, h] = ratio.split(":").map(Number);
  return b && h ? b / h : 1;
}
