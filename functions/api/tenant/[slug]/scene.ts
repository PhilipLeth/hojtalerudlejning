/**
 * Upload af kundens foto (rå bytes i body — bevidst ikke multipart, jf.
 * formData-buggen fra lejhojtaler). Klienten har nedskaleret til maks
 * 1600 px inden upload.
 */

import type { Env } from "../../_lib/respond";
import { json, fejl } from "../../_lib/respond";
import { validSlug, BILLEDTYPER, MAX_UPLOAD_BYTES } from "../../_lib/validate";
import { getTenant } from "../../_lib/tenants";
import { randomId } from "../../_lib/id";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!validSlug(slug)) return fejl("Ugyldig butik", 400);
  if (!(await getTenant(context.env.DATA, slug))) return fejl("Butikken findes ikke", 404);

  const mime = context.request.headers.get("Content-Type")?.split(";")[0].trim() ?? "";
  const ext = BILLEDTYPER[mime];
  if (!ext) return fejl("Send billedet som image/jpeg, image/png eller image/webp", 415);

  const bytes = await context.request.arrayBuffer();
  if (bytes.byteLength === 0) return fejl("Tomt billede", 400);
  if (bytes.byteLength > MAX_UPLOAD_BYTES) return fejl("Billedet er for stort (maks 8 MB)", 413);

  const sceneId = `${randomId()}.${ext}`;
  await context.env.MEDIA.put(`t/${slug}/scenes/${sceneId}`, bytes, {
    httpMetadata: { contentType: mime },
  });

  return json({ sceneId, url: `/media/t/${slug}/scenes/${sceneId}` });
};
