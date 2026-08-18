/** Upload produktfoto (rå bytes) → R2. Returnerer /media-stien til kataloget. */

import type { Env } from "../../../_lib/respond";
import { json, fejl } from "../../../_lib/respond";
import { validSlug, BILLEDTYPER, MAX_UPLOAD_BYTES } from "../../../_lib/validate";
import { requireTenantAdmin } from "../../../_lib/auth";
import { randomId } from "../../../_lib/id";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!validSlug(slug)) return fejl("Ugyldig butik", 400);
  const afvist = await requireTenantAdmin(context.env, context.request, slug);
  if (afvist) return afvist;

  const mime = context.request.headers.get("Content-Type")?.split(";")[0].trim() ?? "";
  const ext = BILLEDTYPER[mime];
  if (!ext) return fejl("Send billedet som image/jpeg, image/png eller image/webp", 415);

  const bytes = await context.request.arrayBuffer();
  if (bytes.byteLength === 0) return fejl("Tomt billede", 400);
  if (bytes.byteLength > MAX_UPLOAD_BYTES) return fejl("Billedet er for stort (maks 8 MB)", 413);

  const id = `${randomId()}.${ext}`;
  const key = `t/${slug}/products/${id}`;
  await context.env.MEDIA.put(key, bytes, { httpMetadata: { contentType: mime } });

  return json({ url: `/media/${key}` });
};
