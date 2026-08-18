/** Admin-login: adgangskode → session-token. PLATFORM_SECRET virker som master. */

import type { Env } from "../../../_lib/respond";
import { json, fejl } from "../../../_lib/respond";
import { validSlug } from "../../../_lib/validate";
import { getTenant } from "../../../_lib/tenants";
import { createSession, verifySecret } from "../../../_lib/auth";
import { checkAndCount, clientIp, hourKey, ipHash } from "../../../_lib/limits";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!validSlug(slug)) return fejl("Ugyldig butik", 400);

  // Brute force-værn: 10 forsøg pr. IP pr. time
  const nøgle = `rl:login:${await ipHash(clientIp(context.request))}:${hourKey(new Date())}`;
  if (!(await checkAndCount(context.env.DATA, nøgle, 10, 1, 60 * 60 * 2))) {
    return fejl("For mange loginforsøg — vent en time", 429);
  }

  let body: { secret?: unknown };
  try {
    body = (await context.request.json()) as { secret?: unknown };
  } catch {
    return fejl("Body skal være JSON", 400);
  }
  const secret = typeof body.secret === "string" ? body.secret : "";
  if (!secret || secret.length > 256) return fejl("Skriv adgangskoden", 400);

  const tenant = await getTenant(context.env.DATA, slug);
  if (!tenant) return fejl("Butikken findes ikke", 404);

  const master = !!context.env.PLATFORM_SECRET && secret === context.env.PLATFORM_SECRET;
  if (!master && !(await verifySecret(tenant, secret))) {
    return fejl("Forkert adgangskode", 401);
  }

  const token = await createSession(context.env.DATA, slug);
  return json({ token, tenantName: tenant.name });
};
