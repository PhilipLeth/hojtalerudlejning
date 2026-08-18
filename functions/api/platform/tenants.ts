/**
 * Platform-endpoint (kræver PLATFORM_SECRET): opret og list tenants.
 * Ved oprettelse genereres en engangs-adgangskode, som returneres ÉN gang
 * og udleveres til butikken — kun hashen gemmes.
 */

import type { TenantRecord } from "../../../shared/types";
import type { Env } from "../_lib/respond";
import { json, fejl } from "../_lib/respond";
import { validSlug, validEmail, trimTo } from "../_lib/validate";
import { requirePlatform, hashSecret, randomSalt, sessionToken } from "../_lib/auth";
import { DEFAULTS, getTenant, saveTenant, saveProducts } from "../_lib/tenants";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const afvist = requirePlatform(context.env, context.request);
  if (afvist) return afvist;

  const rawIndex = await context.env.DATA.get("tenants_index");
  const slugs: string[] = rawIndex ? JSON.parse(rawIndex) : [];
  const tenants = [];
  for (const slug of slugs) {
    const t = await getTenant(context.env.DATA, slug);
    if (t) tenants.push({ slug: t.slug, name: t.name, notifyEmail: t.notifyEmail, createdAt: t.createdAt });
  }
  return json({ tenants });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const afvist = requirePlatform(context.env, context.request);
  if (afvist) return afvist;

  let body: { slug?: unknown; name?: unknown; notifyEmail?: unknown };
  try {
    body = (await context.request.json()) as typeof body;
  } catch {
    return fejl("Body skal være JSON", 400);
  }

  if (!validSlug(body.slug)) return fejl("Ugyldigt slug (små bogstaver, tal, bindestreg — 2-31 tegn)", 400);
  const navn = trimTo(body.name, 80);
  if (!navn) return fejl("Butiksnavn mangler", 400);
  const notifyEmail = trimTo(body.notifyEmail, 200);
  if (notifyEmail && !validEmail(notifyEmail)) return fejl("Ugyldig notifikations-e-mail", 400);

  if (await getTenant(context.env.DATA, body.slug)) return fejl("Slug er allerede i brug", 409);

  // Engangs-adgangskode — vises kun i dette svar
  const adgangskode = sessionToken().slice(0, 20);
  const salt = randomSalt();
  const tenant: TenantRecord = {
    slug: body.slug,
    name: navn,
    brandColor: DEFAULTS.brandColor,
    welcomeText: DEFAULTS.welcomeText,
    variantsPerGeneration: DEFAULTS.variantsPerGeneration,
    maxProductsPerScene: DEFAULTS.maxProductsPerScene,
    monthlyGenerationLimit: DEFAULTS.monthlyGenerationLimit,
    notifyEmail,
    adminSalt: salt,
    adminHash: await hashSecret(adgangskode, salt),
    createdAt: new Date().toISOString(),
  };

  await saveTenant(context.env.DATA, tenant);
  await saveProducts(context.env.DATA, tenant.slug, []);

  const rawIndex = await context.env.DATA.get("tenants_index");
  const index: string[] = rawIndex ? JSON.parse(rawIndex) : [];
  if (!index.includes(tenant.slug)) await context.env.DATA.put("tenants_index", JSON.stringify([...index, tenant.slug]));

  return json({
    ok: true,
    tenant: { slug: tenant.slug, name: tenant.name },
    adminSecret: adgangskode,
    adminUrl: `/admin?t=${tenant.slug}`,
    kundeUrl: `/t/${tenant.slug}`,
  });
};
