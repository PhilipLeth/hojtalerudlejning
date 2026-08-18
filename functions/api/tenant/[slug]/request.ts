/**
 * Tilbudsforespørgsel: gem i KV + mail til tenanten (Resend, reply-to kunden).
 * imageId/sceneId valideres mod R2 så klienten ikke kan plante fremmede URL'er.
 */

import type { QuoteRequest } from "../../../../shared/types";
import type { Env } from "../../_lib/respond";
import { json, fejl } from "../../_lib/respond";
import { validSlug, validEmail, validPhone, validMediaId, trimTo } from "../../_lib/validate";
import { getTenant, getProducts } from "../../_lib/tenants";
import { randomId } from "../../_lib/id";
import { checkAndCount, clientIp, hourKey, ipHash } from "../../_lib/limits";
import { sendRequestMail } from "../../_lib/mail";

interface RequestBody {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  productIds?: unknown;
  imageId?: unknown;
  sceneId?: unknown;
}

/** Slå et media-id op i R2 under de tilladte prefixes og returnér URL-stien. */
async function medieUrl(env: Env, slug: string, id: unknown, prefixes: string[]): Promise<string | undefined> {
  if (!validMediaId(id)) return undefined;
  for (const prefix of prefixes) {
    const key = `t/${slug}/${prefix}/${id}`;
    if (await env.MEDIA.head(key)) return `/media/${key}`;
  }
  return undefined;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!validSlug(slug)) return fejl("Ugyldig butik", 400);

  const tenant = await getTenant(context.env.DATA, slug);
  if (!tenant) return fejl("Butikken findes ikke", 404);

  let body: RequestBody;
  try {
    body = (await context.request.json()) as RequestBody;
  } catch {
    return fejl("Body skal være JSON", 400);
  }

  const name = trimTo(body.name, 100);
  if (!name) return fejl("Skriv dit navn", 400);
  if (!validEmail(body.email)) return fejl("Ugyldig e-mailadresse", 400);
  if (!validPhone(body.phone)) return fejl("Ugyldigt telefonnummer", 400);

  // Let værn mod formular-spam
  const nøgle = `rl:req:${await ipHash(clientIp(context.request))}:${hourKey(new Date())}`;
  if (!(await checkAndCount(context.env.DATA, nøgle, 5, 1, 60 * 60 * 2))) {
    return fejl("For mange forespørgsler — prøv igen senere", 429);
  }

  const katalog = await getProducts(context.env.DATA, slug);
  const produktIds = (Array.isArray(body.productIds) ? body.productIds : [])
    .filter((p): p is string => typeof p === "string")
    .filter((id) => katalog.some((p) => p.id === id))
    .slice(0, 10);

  const req: QuoteRequest = {
    id: randomId(10),
    createdAt: new Date().toISOString(),
    name,
    email: body.email as string,
    phone: (body.phone as string).trim(),
    message: trimTo(body.message, 1000) || undefined,
    productIds: produktIds,
    productNames: produktIds.map((id) => katalog.find((p) => p.id === id)?.name ?? id),
    imageUrl: await medieUrl(context.env, slug, body.imageId, ["gen", "scenes"]),
    sceneUrl: await medieUrl(context.env, slug, body.sceneId, ["scenes"]),
    status: "ny",
  };

  await context.env.DATA.put(`req:${slug}:${req.createdAt}_${req.id}`, JSON.stringify(req));

  const origin = new URL(context.request.url).origin;
  const mail = await sendRequestMail(context.env, tenant, req, origin);

  return json({ ok: true, mail });
};
