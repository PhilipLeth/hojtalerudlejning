/**
 * Visualisér lysudstyr i kundens lokale (samme mønster som furniture-projektet).
 * Uden GEMINI_API_KEY returneres scenen uændret + en anbefalet pakke.
 */
import { addons, rentalProducts } from "../../src/lib/products";
import { LYS_AI_ANBEFALING, rensLysIds, type LysAiId } from "../../src/lib/lysAi";
import { geminiEditImage, tilB64 } from "./_lib/geminiImage";

interface Env {
  BOOKINGS: KVNamespace;
  MEDIA?: R2Bucket;
  GEMINI_API_KEY?: string;
  ASSETS?: Fetcher;
}

const MAX_BYTES = 2_000_000;
const MAX_PR_DAG = 8;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

function produkt(id: LysAiId) {
  const r = rentalProducts.find((p) => p.id === id);
  if (r) return { id, name: r.name_da, desc: r.desc_da, image: r.image, page: r.page };
  const a = addons.find((p) => p.id === id);
  if (a) return { id, name: a.da.label, desc: a.da.desc, image: a.image, page: a.page };
  return null;
}

async function hentRef(env: Env, requestUrl: string, sti: string | null): Promise<{ bytes: ArrayBuffer; mime: string } | null> {
  if (!sti?.startsWith("/")) return null;
  try {
    const url = new URL(sti, requestUrl);
    const res = env.ASSETS ? await env.ASSETS.fetch(new Request(url)) : await fetch(url);
    if (!res.ok) return null;
    return { bytes: await res.arrayBuffer(), mime: res.headers.get("Content-Type") ?? "image/jpeg" };
  } catch {
    return null;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const ip = context.request.headers.get("cf-connecting-ip") || "ukendt";
  const dag = new Date().toISOString().slice(0, 10);
  const loftKey = `lys_ai_${dag}_${ip}`;
  const brugt = Number((await context.env.BOOKINGS.get(loftKey)) ?? "0");
  if (brugt >= MAX_PR_DAG) return json({ error: "Prøv igen i morgen. Der er et loft på AI-forsøg pr. dag." }, 429);

  const form = await context.request.formData();
  const fil = form.get("scene");
  if (!(fil instanceof File) || fil.size < 100 || fil.size > MAX_BYTES) {
    return json({ error: "Upload et foto af lokalet (jpg/png/webp, max 2 MB)." }, 400);
  }
  const mime = fil.type || "image/jpeg";
  if (!/^image\/(jpeg|png|webp)$/.test(mime)) return json({ error: "Kun jpg, png eller webp." }, 400);

  const auto = String(form.get("auto") ?? "") === "1";
  const rawIds = form.get("productIds");
  let ids: LysAiId[] = LYS_AI_ANBEFALING;
  if (!auto && typeof rawIds === "string") {
    try {
      ids = rensLysIds(JSON.parse(rawIds));
    } catch {
      ids = LYS_AI_ANBEFALING;
    }
  }

  const sceneBytes = await fil.arrayBuffer();
  const produkter = ids.map(produkt).filter((p): p is NonNullable<typeof p> => !!p);
  const refs: Array<{ bytes: ArrayBuffer; mime: string }> = [];
  for (const p of produkter) {
    const ref = await hentRef(context.env, context.request.url, p.image);
    if (ref) refs.push(ref);
  }

  const linjer = produkter.map((p) => `- "${p.name}": ${p.desc}`);
  const prompt = [
    "Edit the FIRST attached photo (the customer's venue or room).",
    "Insert ONLY these rental lighting products so they look hired and set up for an event:",
    ...linjer,
    "The following attached images after the photo are product references. Match them faithfully.",
    "Rules:",
    "- Keep the room, people and camera angle unchanged.",
    "- Place fairy lights along ceiling or walls. Place uplights on the floor washing walls. Place LED effects where a DJ or dance floor would be.",
    "- Realistic scale, matching lighting, natural contact shadows.",
    "- Do not add people, text, watermarks or extra equipment.",
    "Return only the edited photograph.",
  ].join("\n");

  const resultat = await geminiEditImage({
    apiKey: context.env.GEMINI_API_KEY,
    prompt,
    scene: { bytes: sceneBytes, mime },
    refs,
  });
  if (!resultat.ok) return json({ error: resultat.fejl }, 502);

  await context.env.BOOKINGS.put(loftKey, String(brugt + 1), { expirationTtl: 60 * 60 * 48 });

  const outBytes = "demo" in resultat && resultat.demo ? sceneBytes : resultat.bytes;
  const outMime = "demo" in resultat && resultat.demo ? mime : resultat.mime;
  console.log("[lys-ai] visualiseret", { ids, demo: "demo" in resultat && resultat.demo, refs: refs.length });

  return json({
    demo: "demo" in resultat && resultat.demo,
    productIds: ids,
    products: produkter,
    image: `data:${outMime};base64,${tilB64(outBytes)}`,
  });
};
