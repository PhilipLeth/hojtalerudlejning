/** Tenant-indstillinger: brand, notifikationer, grænser, skift adgangskode. */

import type { Env } from "../../../_lib/respond";
import { json, fejl } from "../../../_lib/respond";
import { validSlug, validEmail, validHexColor, trimTo } from "../../../_lib/validate";
import { getTenant, saveTenant, toSettings } from "../../../_lib/tenants";
import { requireTenantAdmin, hashSecret, randomSalt } from "../../../_lib/auth";
import { monthKey, parseCount } from "../../../_lib/limits";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!validSlug(slug)) return fejl("Ugyldig butik", 400);
  const afvist = await requireTenantAdmin(context.env, context.request, slug);
  if (afvist) return afvist;

  const tenant = await getTenant(context.env.DATA, slug);
  if (!tenant) return fejl("Butikken findes ikke", 404);

  const brugt = parseCount(await context.env.DATA.get(`usage:${slug}:${monthKey(new Date())}`));
  return json({ settings: toSettings(tenant), usedThisMonth: brugt, aiActive: !!context.env.GEMINI_API_KEY });
};

interface SettingsBody {
  name?: unknown;
  brandColor?: unknown;
  welcomeText?: unknown;
  notifyEmail?: unknown;
  variantsPerGeneration?: unknown;
  maxProductsPerScene?: unknown;
  monthlyGenerationLimit?: unknown;
  newSecret?: unknown;
}

function heltal(v: unknown, min: number, max: number): number | null {
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) return null;
  return v;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!validSlug(slug)) return fejl("Ugyldig butik", 400);
  const afvist = await requireTenantAdmin(context.env, context.request, slug);
  if (afvist) return afvist;

  const tenant = await getTenant(context.env.DATA, slug);
  if (!tenant) return fejl("Butikken findes ikke", 404);

  let body: SettingsBody;
  try {
    body = (await context.request.json()) as SettingsBody;
  } catch {
    return fejl("Body skal være JSON", 400);
  }

  if (body.name !== undefined) {
    const navn = trimTo(body.name, 80);
    if (!navn) return fejl("Butiksnavn må ikke være tomt", 400);
    tenant.name = navn;
  }
  if (body.brandColor !== undefined) {
    if (!validHexColor(body.brandColor)) return fejl("Brandfarve skal være en hex-farve, fx #2f6b46", 400);
    tenant.brandColor = body.brandColor;
  }
  if (body.welcomeText !== undefined) tenant.welcomeText = trimTo(body.welcomeText, 300);
  if (body.notifyEmail !== undefined) {
    const mail = trimTo(body.notifyEmail, 200);
    if (mail && !validEmail(mail)) return fejl("Ugyldig notifikations-e-mail", 400);
    tenant.notifyEmail = mail;
  }
  if (body.variantsPerGeneration !== undefined) {
    const n = heltal(body.variantsPerGeneration, 1, 3);
    if (n === null) return fejl("Varianter pr. generering skal være 1-3", 400);
    tenant.variantsPerGeneration = n;
  }
  if (body.maxProductsPerScene !== undefined) {
    const n = heltal(body.maxProductsPerScene, 1, 8);
    if (n === null) return fejl("Maks produkter pr. billede skal være 1-8", 400);
    tenant.maxProductsPerScene = n;
  }
  if (body.monthlyGenerationLimit !== undefined) {
    const n = heltal(body.monthlyGenerationLimit, 0, 100_000);
    if (n === null) return fejl("Månedsgrænsen skal være et tal", 400);
    tenant.monthlyGenerationLimit = n;
  }
  if (body.newSecret !== undefined) {
    const ny = typeof body.newSecret === "string" ? body.newSecret : "";
    if (ny.length < 8 || ny.length > 128) return fejl("Ny adgangskode skal være mindst 8 tegn", 400);
    tenant.adminSalt = randomSalt();
    tenant.adminHash = await hashSecret(ny, tenant.adminSalt);
  }

  await saveTenant(context.env.DATA, tenant);
  return json({ ok: true, settings: toSettings(tenant) });
};
