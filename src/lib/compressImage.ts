/**
 * Skalér og komprimér et billede i browseren før upload.
 *
 * Uploadede produktbilleder ryger i R2 og serveres rå — der er intet
 * optimeringstrin på vejen ud, ligesom med de statiske billeder i public/images
 * (se scripts/optimize-images.py). Et telefonfoto på 4 MB ville altså blive
 * leveret som 4 MB til hver besøgende, og ramme landingssideoplevelsen præcis
 * som de gamle PNG'er gjorde.
 *
 * En ren størrelsesgrænse ville derimod afvise helt normale telefonfotos. Så:
 * skalér ned og konvertér til WebP her, og lad grænsen være et sikkerhedsnet
 * frem for det brugeren møder.
 */

/** Skal spejle MAX_BYTES i functions/api/upload.ts. */
export const MAX_UPLOAD_BYTES = 1_000_000;

/** Produktbilleder vises højst ~1024 px bredt; 1600 giver plads til beskæring. */
export const MAX_EDGE = 1600;

const QUALITY_STEPS = [0.85, 0.75, 0.65, 0.55];

/**
 * Nye mål der bevarer sideforholdet og holder længste kant under `maxEdge`.
 * Billeder der allerede er mindre skaleres ikke op.
 */
export function targetDimensions(
  width: number,
  height: number,
  maxEdge: number = MAX_EDGE,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export interface CompressResult {
  file: File;
  originalBytes: number;
  bytes: number;
  /** Falsk når billedet ikke kunne afkodes og originalen sendes videre. */
  compressed: boolean;
}

/**
 * Returnerer altid noget uploadbart. Kan browseren ikke afkode formatet — HEIC
 * uden for Safari, SVG, en ødelagt fil — gives originalen tilbage, og
 * størrelsestjekket i ImageField afgør resten.
 */
export async function compressImage(file: File): Promise<CompressResult> {
  const originalBytes = file.size;

  // Allerede lille og i et fornuftigt format: rør den ikke. At genkode et
  // velkomprimeret billede gør det typisk større, ikke mindre.
  if (originalBytes <= 200_000 && file.type !== "image/png") {
    return { file, originalBytes, bytes: originalBytes, compressed: false };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { file, originalBytes, bytes: originalBytes, compressed: false };
  }

  try {
    for (const maxEdge of [MAX_EDGE, 1200, 900]) {
      const { width, height } = targetDimensions(bitmap.width, bitmap.height, maxEdge);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) break;
      ctx.drawImage(bitmap, 0, 0, width, height);

      for (const quality of QUALITY_STEPS) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", quality),
        );
        if (!blob) break;
        if (blob.size <= MAX_UPLOAD_BYTES) {
          const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
          return {
            file: new File([blob], name, { type: "image/webp" }),
            originalBytes,
            bytes: blob.size,
            compressed: true,
          };
        }
      }
    }
  } finally {
    bitmap.close();
  }

  // Kom vi hertil er selv 900 px ved kvalitet 0,55 over grænsen. Det sker
  // reelt kun for meget støjede fotos; originalen gives tilbage så
  // størrelsestjekket kan give brugeren en forståelig fejl.
  return { file, originalBytes, bytes: originalBytes, compressed: false };
}

/** "2,4 MB" / "812 kB" — til beskeder i admin. */
export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1).replace(".", ",")} MB`;
  return `${Math.round(bytes / 1000)} kB`;
}
