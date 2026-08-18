/** Tenant-admin: læs/skriv hele produktkataloget som ét blob (à la lejhojtaler). */

import type { Product } from "../../../../../shared/types";
import type { Env } from "../../../_lib/respond";
import { json, fejl } from "../../../_lib/respond";
import { validSlug, badProduct, trimTo } from "../../../_lib/validate";
import { getProducts, getTenant, saveProducts } from "../../../_lib/tenants";
import { requireTenantAdmin } from "../../../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!validSlug(slug)) return fejl("Ugyldig butik", 400);
  const afvist = await requireTenantAdmin(context.env, context.request, slug);
  if (afvist) return afvist;

  return json({ products: await getProducts(context.env.DATA, slug) });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!validSlug(slug)) return fejl("Ugyldig butik", 400);
  const afvist = await requireTenantAdmin(context.env, context.request, slug);
  if (afvist) return afvist;
  if (!(await getTenant(context.env.DATA, slug))) return fejl("Butikken findes ikke", 404);

  let body: { products?: unknown };
  try {
    body = (await context.request.json()) as { products?: unknown };
  } catch {
    return fejl("Body skal være JSON", 400);
  }
  if (!Array.isArray(body.products) || body.products.length > 100) {
    return fejl("products skal være en liste (maks 100)", 400);
  }

  const rene: Product[] = [];
  const setIds = new Set<string>();
  for (const p of body.products) {
    const problem = badProduct(p);
    if (problem) return fejl(problem, 400);
    const prod = p as Product;
    if (setIds.has(prod.id)) return fejl(`Produkt-id "${prod.id}" er brugt to gange`, 400);
    setIds.add(prod.id);
    rene.push({
      id: prod.id,
      name: prod.name.trim(),
      description: prod.description.trim(),
      dimensions: trimTo(prod.dimensions, 100) || undefined,
      priceText: trimTo(prod.priceText, 60) || undefined,
      images: prod.images,
      active: prod.active,
    });
  }

  await saveProducts(context.env.DATA, slug, rene);
  return json({ ok: true, count: rene.length });
};
