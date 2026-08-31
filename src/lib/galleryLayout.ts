import { GALLERY_SCENER } from "./galleryPrompt";
import { ratioTal, type GalleryImage } from "./productGallery";

/**
 * Rækkefølgen i galleriets gitter på produktsiden.
 *
 * Billederne kommer i scenernes rækkefølge: "Alt det du får" (4:3), "Sådan ser
 * det ud til festen" (16:9), "Tæt på" (4:3). I et gitter med to spalter, hvor
 * det brede tager hele rækken, stod de to små så på hver sin side af det brede
 * — én alene øverst, én alene nederst, med et tomt felt ved siden af hver.
 *
 * Det brede billede er det primære og skal først. De små følger efter, side om
 * side, i scenernes egen rækkefølge. Et billede fra admin kan ligge sidst i
 * listen, fordi det er kommet til senere — det sorteres på plads efter scenen,
 * ikke efter hvornår det blev lavet.
 */
export function erBredt(b: GalleryImage): boolean {
  return ratioTal(b.ratio) > 1.5;
}

export function ordnTilGitter(billeder: GalleryImage[]): GalleryImage[] {
  const plads = (b: GalleryImage) => {
    const i = GALLERY_SCENER.findIndex((s) => s.id === b.scene);
    return i === -1 ? GALLERY_SCENER.length : i;
  };
  return [...billeder].sort((a, b) => {
    const ba = erBredt(a) ? 0 : 1;
    const bb = erBredt(b) ? 0 : 1;
    return ba - bb || plads(a) - plads(b);
  });
}
