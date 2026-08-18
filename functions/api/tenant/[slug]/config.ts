/** Offentlig tenant-config + aktive produkter — det slutkunde-appen starter med. */

import type { Env } from "../../_lib/respond";
import { json, fejl } from "../../_lib/respond";
import { validSlug } from "../../_lib/validate";
import { getTenant, getProducts, toPublic } from "../../_lib/tenants";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!validSlug(slug)) return fejl("Ugyldig butik", 400);

  const tenant = await getTenant(context.env.DATA, slug);
  if (!tenant) return fejl("Butikken findes ikke", 404);

  const produkter = (await getProducts(context.env.DATA, slug)).filter((p) => p.active);
  return json(
    { tenant: toPublic(tenant), products: produkter },
    200,
    { "Cache-Control": "public, max-age=60" },
  );
};
