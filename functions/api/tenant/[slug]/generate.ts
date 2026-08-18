/**
 * Kør AI-generering: kundens foto + valgte produkter → 1-3 varianter i R2.
 * Grænser håndhæves FØR der bruges penge: rate limit pr. IP og månedsgrænse
 * pr. tenant (tæller billeder, ikke klik). Demo-mode (ingen nøgle) er gratis
 * og tæller ikke.
 */

import type { Variant } from "../../../../shared/types";
import type { Env } from "../../_lib/respond";
import { json, fejl } from "../../_lib/respond";
import { validSlug, validMediaId } from "../../_lib/validate";
import { getTenant, getProducts } from "../../_lib/tenants";
import { randomId } from "../../_lib/id";
import { checkAndCount, clientIp, hourKey, ipHash, monthKey, parseCount } from "../../_lib/limits";
import { ARRANGEMENT_HINTS, DEFAULT_MODEL, generateOne, type ProductRef } from "../../_lib/ai";

interface GenerateBody {
  sceneId?: unknown;
  productIds?: unknown;
  hintIndex?: unknown;
}

const MIME_TIL_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** Hent produktreference-billeder — R2 for /media/-stier, statics via ASSETS. */
async function hentRefs(
  env: Env & { ASSETS?: Fetcher },
  requestUrl: string,
  billedstier: string[],
): Promise<ProductRef[]> {
  const refs: ProductRef[] = [];
  for (const sti of billedstier.slice(0, 6)) {
    if (sti.toLowerCase().endsWith(".svg")) continue; // billedmodellen tager ikke SVG — beskrivelsen bærer produktet
    try {
      if (sti.startsWith("/media/")) {
        const obj = await env.MEDIA.get(sti.slice("/media/".length));
        if (obj) refs.push({ bytes: await obj.arrayBuffer(), mime: obj.httpMetadata?.contentType ?? "image/jpeg" });
      } else if (sti.startsWith("/")) {
        const url = new URL(sti, requestUrl);
        const res = env.ASSETS ? await env.ASSETS.fetch(new Request(url)) : await fetch(url);
        if (res.ok) {
          refs.push({ bytes: await res.arrayBuffer(), mime: res.headers.get("Content-Type") ?? "image/jpeg" });
        }
      }
    } catch {
      // En manglende reference må ikke vælte genereringen — prompten har beskrivelsen
    }
  }
  return refs;
}

export const onRequestPost: PagesFunction<Env & { ASSETS?: Fetcher }> = async (context) => {
  const slug = context.params.slug as string;
  if (!validSlug(slug)) return fejl("Ugyldig butik", 400);

  const tenant = await getTenant(context.env.DATA, slug);
  if (!tenant) return fejl("Butikken findes ikke", 404);

  let body: GenerateBody;
  try {
    body = (await context.request.json()) as GenerateBody;
  } catch {
    return fejl("Body skal være JSON", 400);
  }

  if (!validMediaId(body.sceneId)) return fejl("Ugyldigt sceneId", 400);
  if (!Array.isArray(body.productIds) || body.productIds.some((p) => typeof p !== "string")) {
    return fejl("productIds skal være en liste af id'er", 400);
  }

  const katalog = (await getProducts(context.env.DATA, slug)).filter((p) => p.active);
  const valgteIds = [...new Set(body.productIds as string[])];
  const produkter = katalog.filter((p) => valgteIds.includes(p.id)).slice(0, tenant.maxProductsPerScene);
  if (produkter.length === 0) return fejl("Vælg mindst ét produkt", 400);

  const scene = await context.env.MEDIA.get(`t/${slug}/scenes/${body.sceneId}`);
  if (!scene) return fejl("Fotoet blev ikke fundet — prøv at uploade igen", 404);

  // Ét bestemt hint = regenerering af én variant; ellers tenant-antal parallelt
  const enkeltHint =
    typeof body.hintIndex === "number" && body.hintIndex >= 0 && body.hintIndex < ARRANGEMENT_HINTS.length
      ? body.hintIndex
      : null;
  const antal = enkeltHint !== null ? 1 : Math.min(Math.max(tenant.variantsPerGeneration, 1), ARRANGEMENT_HINTS.length);

  const apiKey = context.env.GEMINI_API_KEY;
  const demo = !apiKey;

  if (!demo) {
    // Grænser tæller billeder — og tjekkes før der bruges penge
    const nu = new Date();
    const ipNoegle = `rl:${await ipHash(clientIp(context.request))}:${hourKey(nu)}`;
    const ipGraense = parseCount(context.env.RATE_LIMIT_HOUR ?? null) || 12;
    if (!(await checkAndCount(context.env.DATA, ipNoegle, ipGraense, antal, 60 * 60 * 2))) {
      return fejl("Du har prøvet mange gange den seneste time — vent lidt og prøv igen", 429);
    }
    const brugNoegle = `usage:${slug}:${monthKey(nu)}`;
    if (!(await checkAndCount(context.env.DATA, brugNoegle, tenant.monthlyGenerationLimit, antal))) {
      return fejl("Butikkens månedlige genereringer er brugt op — kontakt butikken", 429);
    }
  }

  const sceneBytes = await scene.arrayBuffer();
  const sceneMime = scene.httpMetadata?.contentType ?? "image/jpeg";
  const refs = demo ? [] : await hentRefs(context.env, context.request.url, produkter.map((p) => p.images[0]).filter(Boolean));
  const model = tenant.aiModel || context.env.GEMINI_MODEL || DEFAULT_MODEL;

  // Demo: ét "resultat" (scenen selv) — klienten viser DEMO-mærkat
  if (demo) {
    const variant: Variant = {
      id: body.sceneId,
      url: `/media/t/${slug}/scenes/${body.sceneId}`,
      demo: true,
      hintIndex: enkeltHint ?? 0,
    };
    return json({ variants: [variant], demo: true });
  }

  const hints = enkeltHint !== null ? [enkeltHint] : Array.from({ length: antal }, (_, i) => i);
  const resultater = await Promise.all(
    hints.map((h) =>
      generateOne({ sceneBytes, sceneMime, productRefs: refs, products: produkter, hintIndex: h, model, apiKey }),
    ),
  );

  const varianter: Variant[] = [];
  const fejlbeskeder: string[] = [];
  for (let i = 0; i < resultater.length; i++) {
    const r = resultater[i];
    if (!r.ok) {
      fejlbeskeder.push(r.fejl);
      continue;
    }
    if ("demo" in r) continue; // kan ikke ske her (apiKey er sat), men holder typerne ærlige
    const ext = MIME_TIL_EXT[r.mime] ?? "png";
    const id = `${randomId()}.${ext}`;
    await context.env.MEDIA.put(`t/${slug}/gen/${id}`, r.bytes, { httpMetadata: { contentType: r.mime } });
    varianter.push({ id, url: `/media/t/${slug}/gen/${id}`, hintIndex: hints[i] });
  }

  if (varianter.length === 0) {
    console.log("[generate]", slug, "alle kald fejlede:", fejlbeskeder.join(" | "));
    return fejl("Genereringen fejlede — prøv igen om lidt", 502);
  }

  return json({ variants: varianter });
};
