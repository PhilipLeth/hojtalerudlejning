/**
 * srcset for the bundled product images.
 *
 * scripts/optimize-images.py emits every product shot twice: the full 1024px
 * file and a 400px companion with a `-400` suffix. Grids paint these into boxes
 * about 160px tall, so the wide file is roughly six times larger than anything
 * ever drawn from it — the narrow one is what should actually be fetched.
 *
 * Returns undefined for anything that is not a bundled image. Products created
 * in /admin carry R2 URLs, which have no companion file; handing the browser a
 * srcset pointing at a 404 would break the image entirely.
 */
export function thumbSrcSet(src: string | null | undefined): string | undefined {
  if (!src || !src.startsWith("/images/") || !src.endsWith(".webp")) return undefined;
  if (src.endsWith("-400.webp")) return undefined;
  return `${src.replace(/\.webp$/, "-400.webp")} 400w, ${src} 1024w`;
}

/**
 * Matches the grid card width: two columns on a phone, a fixed ~320px column
 * once the layout settles. Only meaningful together with thumbSrcSet.
 */
export const GRID_IMAGE_SIZES = "(max-width: 640px) 50vw, 320px";

/** Small avatars and line-item thumbnails in the booking flow. */
export const THUMB_IMAGE_SIZES = "96px";
