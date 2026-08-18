/**
 * Klient-side nedskalering før upload: maks 1600 px, JPEG ~85 %.
 * Sparer båndbredde og AI-tokens, håndterer EXIF-rotation og fjerner
 * metadata (billedet gen-enkodes).
 */

const MAX_PX = 1600;

async function tilBitmap(fil: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(fil, { imageOrientation: "from-image" });
  } catch {
    // Ældre Safari: fald tilbage til <img> (browseren roterer selv ved decode)
    const url = URL.createObjectURL(fil);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

export async function nedskaler(fil: File): Promise<Blob> {
  const kilde = await tilBitmap(fil);
  const b = "width" in kilde ? { w: kilde.width, h: kilde.height } : { w: 0, h: 0 };
  const skala = Math.min(1, MAX_PX / Math.max(b.w, b.h));
  const w = Math.max(1, Math.round(b.w * skala));
  const h = Math.max(1, Math.round(b.h * skala));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas er ikke tilgængelig");
  ctx.drawImage(kilde as CanvasImageSource, 0, 0, w, h);
  if ("close" in kilde) kilde.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("Kunne ikke behandle billedet");
  return blob;
}
