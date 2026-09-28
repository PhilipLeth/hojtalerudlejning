/**
 * Stemningsbilleder i hero — /admin/stemningsbilleder taler med denne.
 *
 *   GET                              offentlig: { sti: src } for det godkendte
 *   POST { action: "generate", sti, note? }   forslag, gemmes INGEN steder
 *   POST { action: "publish", sti, url, note? } godkend: skriv i hero_manifest
 *   POST { action: "fjern", sti }            tilbage til kodens standard
 *
 * Samme arbejdsgang som produktgalleriet: ét billede ad gangen, Philip ser det,
 * og intet bliver synligt før et tryk på "Brug det". Middlewaren læser
 * manifestet og skriver billedet ind i HTML'en (functions/_middleware.ts).
 */
import { requireAdmin } from "./_lib/adminAuth";
import { hentReference, udtrækBillede } from "./_lib/billedModel";
import { GALLERY_SPEC } from "../../src/lib/galleryPrompt";
import { HERO_MANIFEST_KEY, heroPrompt, heroReferencer, heroSider, type HeroEntry } from "../../src/lib/heroBilleder";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET?: string;
  GEMINI_API_KEY?: string;
}

/**
 * Loft pr. måned. Knappen koster 0,13 $ pr. tryk; 120 billeder ≈ 16 $ er nok
 * til at lave alle siderne én gang og nogle om, men ikke til at et løbsk
 * klik eller et stjålet token bruger løs.
 */
export const HERO_MAANEDSLOFT = 120;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};
const svar = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: cors });
const maaned = () => new Date().toISOString().slice(0, 7);

async function manifest(kv: KVNamespace): Promise<Record<string, HeroEntry>> {
  try {
    return ((await kv.get(HERO_MANIFEST_KEY, "json")) as Record<string, HeroEntry> | null) ?? {};
  } catch {
    return {};
  }
}

export const onRequestOptions: PagesFunction = async () => new Response(null, { headers: cors });

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const m = await manifest(context.env.BOOKINGS);
  const ud: Record<string, string> = {};
  for (const [sti, e] of Object.entries(m)) if (e?.src) ud[sti] = e.src;
  const admin = new URL(context.request.url).searchParams.has("fuld");
  return svar(admin ? m : ud);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, cors);
  if (auth instanceof Response) return auth;
  const kv = context.env.BOOKINGS;

  let body: { action?: string; sti?: string; note?: string; url?: string };
  try {
    body = await context.request.json();
  } catch {
    return svar({ error: "Ugyldig JSON" }, 400);
  }
  const side = heroSider().find((s) => s.sti === body.sti);
  if (!side) return svar({ error: `Ukendt side: ${body.sti}` }, 400);

  if (body.action === "publish") {
    if (!body.url || !(body.url.startsWith("/api/image/") || body.url.startsWith("/images/"))) {
      return svar({ error: "Billedet skal ligge på sitet" }, 400);
    }
    const m = await manifest(kv);
    m[side.sti] = { src: body.url, updatedBy: auth.name, updatedAt: new Date().toISOString(), note: body.note?.trim() || undefined };
    await kv.put(HERO_MANIFEST_KEY, JSON.stringify(m));
    return svar({ ok: true, manifest: m });
  }

  if (body.action === "fjern") {
    const m = await manifest(kv);
    delete m[side.sti];
    await kv.put(HERO_MANIFEST_KEY, JSON.stringify(m));
    return svar({ ok: true, manifest: m });
  }

  if (body.action !== "generate") return svar({ error: "Ukendt handling" }, 400);

  const noegle = context.env.GEMINI_API_KEY;
  if (!noegle) {
    return svar({ error: "GEMINI_API_KEY mangler i Cloudflare. Kør: wrangler pages secret put GEMINI_API_KEY --project-name=speaker-rental" }, 503);
  }
  const forbrugKey = `hero_forbrug_${maaned()}`;
  const brugt = Number((await kv.get(forbrugKey)) ?? 0);
  if (brugt >= HERO_MAANEDSLOFT) {
    return svar({ error: `Månedens loft på ${HERO_MAANEDSLOFT} stemningsbilleder er nået. Hæv HERO_MAANEDSLOFT i functions/api/hero.ts, hvis det er med vilje.` }, 429);
  }

  const base = new URL(context.request.url);
  const input: Array<Record<string, string>> = [{ type: "text", text: heroPrompt(side, body.note) }];
  for (const sti of heroReferencer(side)) {
    const billede = await hentReference(sti, base);
    if (billede) input.push({ type: "image", mime_type: billede.mime, data: billede.data });
  }
  if (input.length === 1) return svar({ error: "Kunne ikke hente produktfotoene — så ville modellen digte grejet frit." }, 502);

  let json: unknown;
  try {
    const res = await fetch(GALLERY_SPEC.endpoint, {
      method: "POST",
      headers: { "x-goog-api-key": noegle, "Content-Type": "application/json", "Api-Revision": GALLERY_SPEC.api_revision },
      body: JSON.stringify({
        model: GALLERY_SPEC.model,
        input,
        response_format: { type: "image", aspect_ratio: "16:9", image_size: GALLERY_SPEC.image_size },
      }),
    });
    if (!res.ok) {
      console.error("[hero] Gemini svarede", res.status, (await res.text()).slice(0, 300));
      return svar({ error: `Billedmodellen svarede ${res.status}` }, 502);
    }
    json = await res.json();
  } catch (e) {
    console.error("[hero] kald fejlede:", e);
    return svar({ error: "Kunne ikke nå billedmodellen" }, 502);
  }
  const b64 = udtrækBillede(json);
  if (!b64) return svar({ error: "Der kom intet billede tilbage" }, 502);
  await kv.put(forbrugKey, String(brugt + 1));

  return svar({
    ok: true,
    image: b64,
    mime: "image/jpeg",
    note: body.note?.trim() || null,
    referencer: input.length - 1,
    forbrugt: brugt + 1,
    loft: HERO_MAANEDSLOFT,
    pris_usd: GALLERY_SPEC.usd_per_image,
  });
};
