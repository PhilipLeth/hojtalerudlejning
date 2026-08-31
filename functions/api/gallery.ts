/**
 * Produktgalleriet fra admin.
 *
 * Frederik trykker "Generér" på et produkt i /admin/produkter, og denne
 * funktion bygger prompten (src/lib/galleryPrompt.ts — samme kode som
 * scriptet), henter produktfotoene og kalder Gemini. Billedet sendes RÅT
 * tilbage til browseren og gemmes ingen steder.
 *
 * Det er med vilje: et billede, der ikke bliver godkendt, skal ikke ligge og
 * fylde i R2 og skal ikke kunne nå ud på en produktside ved et uheld. Browseren
 * viser forslaget, komprimerer det til WebP hvis det bliver godkendt, og
 * uploader det gennem /api/upload — samme vej som alle andre admin-billeder.
 * Først derefter skrives det i manifestet og bliver synligt for kunderne.
 *
 * GET  /api/gallery                    offentligt manifest (kunden)
 * POST /api/gallery {action:"generate"}  admin — laver et forslag
 * POST /api/gallery {action:"publish"}   admin — sætter et godkendt billede ind
 * POST /api/gallery {action:"remove"}    admin — fjerner et billede igen
 */

import { requireAdmin } from "./_lib/adminAuth";
import { CATALOG_KEY } from "./_lib/channels";
import {
  GALLERY_SCENER,
  GALLERY_SPEC,
  byggPrompt,
  fladtKatalog,
  sceneMedId,
  scenerFor,
  type Katalog,
} from "../../src/lib/galleryPrompt";
import {
  addons as defaultAddons,
  rentalProducts as defaultRentals,
  speakers as defaultSpeakers,
} from "../../src/lib/products";
import { PRODUCT_GALLERY } from "../../src/lib/productGallery";
import { erAktiv } from "../../src/lib/galleryStatus";

interface Env {
  BOOKINGS: KVNamespace;
  MEDIA: R2Bucket;
  ADMIN_SECRET?: string;
  GEMINI_API_KEY?: string;
}

const MANIFEST_KEY = "gallery_manifest";

/**
 * Loft over hvor mange billeder der må genereres på en måned.
 *
 * Knappen koster rigtige penge pr. tryk, og der er ingen kvittering før
 * regningen. 250 billeder ≈ 33 $ — rigeligt til at lave hele kataloget om én
 * gang, og lavt nok til at en løbsk klikker eller et stjålet admin-token ikke
 * kan bruge en måned af budgettet på en eftermiddag.
 */
const MAANEDSLOFT = 250;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

export interface GalleryEntry {
  src: string;
  thumb: string;
  scene: string;
  ratio: string;
  titel_da: string;
  titel_en: string;
  alt_da: string;
  alt_en: string;
  caption_da: string;
  caption_en: string;
  /** Hvem der godkendte det, og hvornår — så et billede kan spores tilbage */
  updatedBy?: string;
  updatedAt?: string;
  /**
   * Vises billedet for kunderne? Intet vises, før nogen har slået det til.
   *
   * De 77 fra bulk-kørslen ligger som filer i repoet, men de er kandidater,
   * ikke galleri: kundesiden viser kun manifestets aktive poster. Slår man et
   * billede fra, bliver posten stående med aktiv: false, så det kan slås til
   * igen uden at lave det om.
   */
  aktiv?: boolean;
  /** Gravsten fra før toggle'n — læses som aktiv: false. Skrives ikke længere. */
  fjernet?: boolean;
  /**
   * Billedteksten er skrevet i hånden i admin — ikke fyldt ud fra skabelonen.
   *
   * Uden flaget ville "Lav om" skrive skabelonens tekst hen over den, Frederik
   * lige havde rettet: et nyt billede skal ikke koste en rettet tekst.
   */
  egenTekst?: boolean;
}

/** Længste billedtekst — den står under billedet i lightboxen, ikke i en artikel. */
const MAKS_TEKST = 200;

type Manifest = Record<string, GalleryEntry[]>;

/** Manifestet holdes i scenernes rækkefølge, ikke i den rækkefølge de blev lavet */
function sceneOrden(_scene: string, _liste: GalleryEntry[]) {
  const orden = GALLERY_SCENER.map((s) => s.id);
  return (a: GalleryEntry, b: GalleryEntry) => orden.indexOf(a.scene) - orden.indexOf(b.scene);
}

function svar(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors });
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

/* ───── offentligt: manifestet ───── */

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const raw = await context.env.BOOKINGS.get(MANIFEST_KEY);
    return new Response(raw ?? "{}", { status: 200, headers: cors });
  } catch (e) {
    console.error("[gallery] GET fejlede:", e);
    return svar({}, 200); // et galleri er pynt — siden skal ikke knække med det
  }
};

/* ───── katalog ───── */

async function hentKatalog(kv: KVNamespace): Promise<Katalog> {
  try {
    const raw = await kv.get(CATALOG_KEY);
    if (raw) {
      const kat = JSON.parse(raw) as Partial<Katalog>;
      return {
        speakers: kat.speakers?.length ? kat.speakers : defaultSpeakers,
        addons: kat.addons?.length ? kat.addons : defaultAddons,
        rentalProducts: kat.rentalProducts?.length ? kat.rentalProducts : defaultRentals,
      };
    }
  } catch {
    // Et ødelagt KV-katalog må ikke spærre for at lave billeder
  }
  return { speakers: defaultSpeakers, addons: defaultAddons, rentalProducts: defaultRentals };
}

/* ───── forbrug ───── */

function maaned(): string {
  return new Date().toISOString().slice(0, 7);
}

async function forbrug(kv: KVNamespace): Promise<number> {
  const raw = await kv.get(`gallery_forbrug_${maaned()}`);
  return Number(raw) || 0;
}

/* ───── generering ───── */

/**
 * Produktfotoet hentes fra sitet selv. Det dækker begge slags: de statiske
 * /images/… og de /api/image/… som admin har uploadet til R2.
 */
async function hentReference(sti: string, base: URL): Promise<{ mime: string; data: string } | null> {
  try {
    const res = await fetch(new URL(sti, base).toString(), { cf: { cacheTtl: 3600 } } as RequestInit);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > 5_000_000) return null;
    let binaer = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binaer += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return { mime: res.headers.get("Content-Type") || "image/webp", data: btoa(binaer) };
  } catch {
    return null;
  }
}

/** Billedet ligger enten i genvejen eller nede i et trin — vi leder begge steder. */
function udtrækBillede(json: unknown): string | null {
  const genvej = (json as { output_image?: { data?: string } })?.output_image?.data;
  if (genvej) return genvej;
  const stak: unknown[] = [json];
  while (stak.length) {
    const n = stak.pop();
    if (!n || typeof n !== "object") continue;
    const d = (n as { data?: unknown }).data;
    if (typeof d === "string" && d.length > 1000) return d;
    for (const v of Object.values(n as Record<string, unknown>)) {
      if (v && typeof v === "object") stak.push(v);
    }
  }
  return null;
}

/* ───── POST ───── */

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, cors);
  if (auth instanceof Response) return auth;

  let body: {
    action?: string;
    productId?: string;
    scene?: string;
    url?: string;
    note?: string;
    caption_da?: string;
    caption_en?: string;
    aktiv?: boolean;
    /**
     * Det billede der rettes — enten en sti på sitet (godkendt eller fra
     * bulk-kørslen) eller et forslag, der endnu kun lever i browseren.
     */
    forrige?: { url?: string; billede?: string; mime?: string };
  };
  try {
    body = await context.request.json();
  } catch {
    return svar({ error: "Ugyldig forespørgsel" }, 400);
  }

  const kv = context.env.BOOKINGS;
  const productId = String(body.productId ?? "");
  const sceneId = String(body.scene ?? "");
  if (!productId) return svar({ error: "Mangler produkt" }, 400);

  /* ── slå til eller fra ── */
  if (body.action === "aktiv") {
    if (typeof body.aktiv !== "boolean") return svar({ error: "Mangler aktiv: true/false" }, 400);
    const manifest: Manifest = JSON.parse((await kv.get(MANIFEST_KEY)) ?? "{}");
    const liste = manifest[productId] ?? [];
    const eksisterende = liste.find((b) => b.scene === sceneId);
    // Et billede fra bulk-kørslen får sin post her, første gang det slås til
    const statisk = (PRODUCT_GALLERY[productId] ?? []).find((b) => b.scene === sceneId);
    if (!eksisterende && !statisk) return svar({ error: "Der er intet billede at slå til" }, 400);
    const grund: GalleryEntry = eksisterende ?? { ...statisk! };
    const entry: GalleryEntry = {
      ...grund,
      aktiv: body.aktiv,
      fjernet: undefined,
      updatedBy: auth.name,
      updatedAt: new Date().toISOString(),
    };
    manifest[productId] = [...liste.filter((b) => b.scene !== sceneId), entry].sort(sceneOrden(sceneId, liste));
    await kv.put(MANIFEST_KEY, JSON.stringify(manifest));
    return svar({ ok: true, billeder: manifest[productId] });
  }

  const katalog = await hentKatalog(kv);
  const flad = fladtKatalog(katalog);
  const produkt = flad.get(productId);
  if (!produkt) return svar({ error: `Ukendt produkt: ${productId}` }, 404);

  /**
   * Katalogfotoet gælder alle produkter; galleriscenerne afhænger af, om
   * produktet er en pakke. Derfor to opslag frem for ét.
   */
  const scene = sceneMedId(sceneId);
  const gyldig = scene && (scene.katalogfoto || scenerFor(produkt).some((s) => s.id === scene.id));
  if (!scene || !gyldig) return svar({ error: `Ukendt scene: ${sceneId}` }, 400);

  const forrigeUrl = typeof body.forrige?.url === "string" ? body.forrige.url : "";
  const forrigeData = typeof body.forrige?.billede === "string" ? body.forrige.billede : "";
  const harForrige =
    (forrigeUrl.startsWith("/api/image/") || forrigeUrl.startsWith("/images/")) ||
    (forrigeData.length > 0 && forrigeData.length < 12_000_000 && /^[A-Za-z0-9+/=]+$/.test(forrigeData));
  const bygget = byggPrompt(
    produkt,
    scene,
    flad,
    typeof body.note === "string" ? body.note : undefined,
    body.action === "generate" && harForrige,
  );
  if (!bygget) {
    return svar({ error: "Produktet har intet foto at vise modellen — upload et produktbillede først." }, 400);
  }

  /* ── ret billedteksten ── */
  if (body.action === "tekst") {
    if (scene.katalogfoto) return svar({ error: "Produktfotoet har ingen billedtekst" }, 400);
    const rens = (v: unknown) =>
      typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, MAKS_TEKST) : "";
    const da = rens(body.caption_da);
    const en = rens(body.caption_en);

    const manifest: Manifest = JSON.parse((await kv.get(MANIFEST_KEY)) ?? "{}");
    const liste = manifest[productId] ?? [];
    const eksisterende = liste.find((b) => b.scene === scene.id);
    const statisk = (PRODUCT_GALLERY[productId] ?? []).find((b) => b.scene === scene.id);
    if (!eksisterende && !statisk) return svar({ error: "Der er intet billede at sætte tekst på" }, 400);

    // Et billede fra bulk-kørslen får sin post her — men slås ikke til af
    // det: at rette en tekst er ikke at udgive billedet.
    const grund: GalleryEntry = eksisterende ?? { ...statisk!, aktiv: false };
    const entry: GalleryEntry = {
      ...grund,
      // Tomt felt = tilbage til skabelonen
      caption_da: da || bygget.caption_da,
      caption_en: en || bygget.caption_en,
      egenTekst: !!(da || en) || undefined,
      updatedBy: auth.name,
      updatedAt: new Date().toISOString(),
    };
    const uden = liste.filter((b) => b.scene !== scene.id);
    const orden = scenerFor(produkt).map((s) => s.id);
    manifest[productId] = [...uden, entry].sort((a, b) => orden.indexOf(a.scene) - orden.indexOf(b.scene));
    await kv.put(MANIFEST_KEY, JSON.stringify(manifest));
    return svar({ ok: true, billeder: manifest[productId] });
  }

  /* ── udgiv et godkendt billede ── */
  if (body.action === "publish") {
    if (scene.katalogfoto) {
      // Katalogfotoet skrives i produktets image-felt af /admin/produkter,
      // ikke i galleriet. Ville det stå begge steder, kunne de nå at være uenige.
      return svar({ error: "Produktfotoet gemmes på produktet, ikke i galleriet" }, 400);
    }
    const url = String(body.url ?? "");
    if (!url.startsWith("/api/image/") && !url.startsWith("/images/")) {
      return svar({ error: "Billedet skal være uploadet først" }, 400);
    }
    const manifest: Manifest = JSON.parse((await kv.get(MANIFEST_KEY)) ?? "{}");
    // En tekst skrevet i hånden følger med over på det nye billede
    const forrige = (manifest[productId] ?? []).find((b) => b.scene === scene.id);
    const entry: GalleryEntry = {
      src: url,
      // "Brug det" er beslutningen — billedet går live med det samme
      aktiv: true,
      // R2-billeder har ingen lille udgave; browseren har allerede skaleret ned
      thumb: url,
      scene: scene.id,
      ratio: bygget.ratio,
      titel_da: bygget.titel_da,
      titel_en: bygget.titel_en,
      alt_da: bygget.alt_da,
      alt_en: bygget.alt_en,
      caption_da: forrige?.egenTekst ? forrige.caption_da : bygget.caption_da,
      caption_en: forrige?.egenTekst ? forrige.caption_en : bygget.caption_en,
      egenTekst: forrige?.egenTekst || undefined,
      updatedBy: auth.name,
      updatedAt: new Date().toISOString(),
    };
    const uden = (manifest[productId] ?? []).filter((b) => b.scene !== scene.id);
    // Rækkefølgen følger scenerne, ikke hvornår de blev lavet
    const orden = scenerFor(produkt).map((s) => s.id);
    manifest[productId] = [...uden, entry].sort((a, b) => orden.indexOf(a.scene) - orden.indexOf(b.scene));
    await kv.put(MANIFEST_KEY, JSON.stringify(manifest));
    return svar({ ok: true, billeder: manifest[productId] });
  }

  /* ── lav et forslag ── */
  if (body.action !== "generate") return svar({ error: "Ukendt handling" }, 400);

  const noegle = context.env.GEMINI_API_KEY;
  if (!noegle) {
    return svar({ error: "GEMINI_API_KEY mangler i Cloudflare. Kør: wrangler pages secret put GEMINI_API_KEY --project-name=speaker-rental" }, 503);
  }

  const brugt = await forbrug(kv);
  if (brugt >= MAANEDSLOFT) {
    return svar({ error: `Månedens loft på ${MAANEDSLOFT} billeder er nået. Hæv MAANEDSLOFT i functions/api/gallery.ts, hvis det er med vilje.` }, 429);
  }

  const base = new URL(context.request.url);
  const input: Array<Record<string, string>> = [{ type: "text", text: bygget.prompt }];
  for (const r of bygget.referencer) {
    const billede = await hentReference(r.billede, base);
    if (billede) input.push({ type: "image", mime_type: billede.mime, data: billede.data });
  }
  if (input.length === 1) {
    return svar({ error: "Kunne ikke hente produktfotoene — så ville modellen digte grejet frit." }, 502);
  }
  // Det forrige billede står SIDST — det der står sidst, vejer tungest, og
  // prompten omtaler det som "the last reference image".
  if (bygget.forrige) {
    const forrige = forrigeData
      ? { mime: body.forrige?.mime?.startsWith("image/") ? body.forrige.mime : "image/jpeg", data: forrigeData }
      : await hentReference(forrigeUrl, base);
    if (!forrige) return svar({ error: "Kunne ikke hente det billede, der skulle rettes" }, 502);
    input.push({ type: "image", mime_type: forrige.mime, data: forrige.data });
  }

  let json: unknown;
  try {
    const res = await fetch(GALLERY_SPEC.endpoint, {
      method: "POST",
      headers: {
        "x-goog-api-key": noegle,
        "Content-Type": "application/json",
        "Api-Revision": GALLERY_SPEC.api_revision,
      },
      body: JSON.stringify({
        model: GALLERY_SPEC.model,
        input,
        response_format: { type: "image", aspect_ratio: bygget.ratio, image_size: GALLERY_SPEC.image_size },
      }),
    });
    if (!res.ok) {
      const tekst = await res.text();
      console.error("[gallery] Gemini svarede", res.status, tekst.slice(0, 300));
      return svar({ error: `Billedmodellen svarede ${res.status}` }, 502);
    }
    json = await res.json();
  } catch (e) {
    console.error("[gallery] kald fejlede:", e);
    return svar({ error: "Kunne ikke nå billedmodellen" }, 502);
  }

  const b64 = udtrækBillede(json);
  if (!b64) return svar({ error: "Der kom intet billede tilbage" }, 502);

  // Tælleren op FØRST når vi ved, at kaldet lykkedes — en fejl skal ikke
  // koste af loftet, men et billede vi ikke bruger skal.
  await kv.put(`gallery_forbrug_${maaned()}`, String(brugt + 1));

  return svar({
    ok: true,
    image: b64,
    mime: "image/jpeg",
    ratio: bygget.ratio,
    prompt: bygget.prompt,
    note: bygget.note ?? null,
    forrige: bygget.forrige,
    titel_da: bygget.titel_da,
    alt_da: bygget.alt_da,
    caption_da: bygget.caption_da,
    skaaret: bygget.skaaret,
    mangler: bygget.mangler,
    forbrugt: brugt + 1,
    loft: MAANEDSLOFT,
    pris_usd: GALLERY_SPEC.usd_per_image,
  });
};
