/** Klient-nedskalering før AI-upload. Samme mønster som furniture-projektet. */
const MAX_PX = 1600;
const SERVER_TYPER = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_ORIGINAL_BYTES = 8 * 1024 * 1024;

async function tilBitmap(fil: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(fil, { imageOrientation: "from-image" });
  } catch {
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
  const w0 = kilde instanceof HTMLImageElement ? kilde.naturalWidth : kilde.width;
  const h0 = kilde instanceof HTMLImageElement ? kilde.naturalHeight : kilde.height;
  if (!w0 || !h0) throw new Error("Billedet kunne ikke læses. Prøv et andet foto");
  const skala = Math.min(1, MAX_PX / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * skala));
  const h = Math.max(1, Math.round(h0 * skala));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas er ikke tilgængelig");
  ctx.drawImage(kilde as CanvasImageSource, 0, 0, w, h);
  if ("close" in kilde) kilde.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) {
    if (SERVER_TYPER.has(fil.type) && fil.size <= MAX_ORIGINAL_BYTES) return fil;
    throw new Error("Kunne ikke behandle billedet");
  }
  return blob;
}
