/** Tenant-admin: forespørgselsliste (nyeste først) + statusopdatering. */

import type { QuoteRequest } from "../../../../../shared/types";
import type { Env } from "../../../_lib/respond";
import { json, fejl } from "../../../_lib/respond";
import { validSlug } from "../../../_lib/validate";
import { requireTenantAdmin } from "../../../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!validSlug(slug)) return fejl("Ugyldig butik", 400);
  const afvist = await requireTenantAdmin(context.env, context.request, slug);
  if (afvist) return afvist;

  // KV-list med prefix er kronologisk (ISO-tid i nøglen) — vi vender den om
  const liste = await context.env.DATA.list({ prefix: `req:${slug}:`, limit: 200 });
  const requests: QuoteRequest[] = [];
  for (const key of liste.keys.reverse()) {
    const raw = await context.env.DATA.get(key.name);
    if (!raw) continue;
    try {
      requests.push(JSON.parse(raw) as QuoteRequest);
    } catch {
      // Ulæselig record springes over
    }
    if (requests.length >= 100) break;
  }
  return json({ requests });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!validSlug(slug)) return fejl("Ugyldig butik", 400);
  const afvist = await requireTenantAdmin(context.env, context.request, slug);
  if (afvist) return afvist;

  let body: { id?: unknown; status?: unknown };
  try {
    body = (await context.request.json()) as { id?: unknown; status?: unknown };
  } catch {
    return fejl("Body skal være JSON", 400);
  }
  if (typeof body.id !== "string" || !/^[a-z0-9]{4,20}$/.test(body.id)) return fejl("Ugyldigt id", 400);
  if (body.status !== "ny" && body.status !== "besvaret") return fejl("Status skal være 'ny' eller 'besvaret'", 400);

  const liste = await context.env.DATA.list({ prefix: `req:${slug}:`, limit: 1000 });
  const nøgle = liste.keys.find((k) => k.name.endsWith(`_${body.id}`));
  if (!nøgle) return fejl("Forespørgslen findes ikke", 404);

  const raw = await context.env.DATA.get(nøgle.name);
  if (!raw) return fejl("Forespørgslen findes ikke", 404);
  const req = JSON.parse(raw) as QuoteRequest;
  req.status = body.status;
  await context.env.DATA.put(nøgle.name, JSON.stringify(req));

  return json({ ok: true });
};
