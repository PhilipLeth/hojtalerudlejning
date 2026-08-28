#!/usr/bin/env node
/**
 * Produktgalleriet: AI-genererede billeder af vores eget grej.
 *
 * Tre scener per produkt (gallery/scenes.json):
 *
 *   komposition  alle dele i pakken stillet op sammen på studiebaggrund
 *   i_brug       oplevelsen — udstyret sat op det sted, det bliver lejet til
 *   opstilling   nærbillede af det, der står klar
 *
 * Referencebillederne er vores egne produktfotos, slået op i kataloget. En
 * pakke er defineret af sine dele i src/lib/products.ts, så prompten følger
 * med af sig selv, når en pakke ændrer indhold. Det er hele pointen: modellen
 * skal komponere det grej vi HAR, ikke en opdigtet højtaler med volapyk-logo.
 *
 * Hvert kald koster penge. Derfor:
 *   - intet sker uden --apply; uden flaget printes planen og et prisestimat
 *   - en fil der findes bliver sprunget over (brug --force for at lave den om)
 *   - de rå svar gemmes i gallery/raw/ (gitignoreret), så en ny beskæring
 *     eller komprimering ikke koster et nyt kald
 *
 * Kræver GEMINI_API_KEY i miljøet eller i .dev.vars. Nøglen hentes på
 * aistudio.google.com → Get API key.
 *
 *   node scripts/product-images/generate.mjs                  # plan + estimat
 *   node scripts/product-images/generate.mjs --prompts        # alle prompts på skrift
 *   node scripts/product-images/generate.mjs --apply
 *   node scripts/product-images/generate.mjs --apply --only pakke_bryllup
 *   node scripts/product-images/generate.mjs --apply --scene i_brug
 *   node scripts/product-images/generate.mjs --manifest       # kun manifestet
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HER = dirname(fileURLToPath(import.meta.url));
const ROD = resolve(HER, "..", "..");
const CONFIG = join(ROD, "gallery", "scenes.json");
const RAA_DIR = join(ROD, "gallery", "raw");
const UD_DIR = join(ROD, "public", "images", "gallery");
const MANIFEST = join(ROD, "src", "lib", "productGallery.ts");

/* ───── katalog ───── */

/**
 * products.ts er TypeScript og har ingen imports, så vites SSR-loader kan læse
 * den direkte. Alternativet — at parse filen med regex eller at vedligeholde en
 * kopi af kataloget her — ville drive fra hinanden ved første prisændring.
 */
async function laesModuler() {
  const { createServer } = await import("vite");
  const server = await createServer({
    configFile: false,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
    // Samme alias som tsconfig, ellers kan galleryPrompt ikke finde "@/lib/products"
    resolve: { alias: { "@": join(ROD, "src") } },
  });
  try {
    return {
      katalog: await server.ssrLoadModule("/src/lib/products.ts"),
      prompt: await server.ssrLoadModule("/src/lib/galleryPrompt.ts"),
    };
  } finally {
    await server.close();
  }
}

/* Kataloget, referencerne og prompten bygges i src/lib/galleryPrompt.ts, så
 * scriptet og knappen i /admin/produkter ikke kan komme til at lave hver sin
 * slags billede af det samme produkt. Her er kun det, terminalen kan og
 * browseren ikke: filer på disken, WebP-komprimering og et manifest.
 */

function stiTilBillede(rel) {
  if (!rel || !rel.startsWith("/images/")) return null;
  const fil = join(ROD, "public", rel.replace(/^\//, ""));
  return existsSync(fil) ? fil : null;
}

/* ───── API ───── */

function hentNoegle() {
  const fra = process.env.GEMINI_API_KEY;
  if (fra) return fra.trim();
  const devVars = join(ROD, ".dev.vars");
  if (existsSync(devVars)) {
    for (const linje of readFileSync(devVars, "utf8").split("\n")) {
      const t = linje.trim();
      if (t.startsWith("GEMINI_API_KEY=")) return t.slice("GEMINI_API_KEY=".length).replace(/^["']|["']$/g, "").trim();
    }
  }
  return null;
}

function mimeFor(sti) {
  if (sti.endsWith(".png")) return "image/png";
  if (sti.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function generer(opgave, cfg, noegle) {
  const input = [{ type: "text", text: opgave.prompt }];
  for (const r of opgave.referencer) {
    const sti = stiTilBillede(r.billede);
    if (!sti) continue;
    input.push({ type: "image", mime_type: mimeFor(sti), data: readFileSync(sti).toString("base64") });
  }

  const svar = await fetch(cfg.spec.endpoint, {
    method: "POST",
    headers: {
      "x-goog-api-key": noegle,
      "Content-Type": "application/json",
      "Api-Revision": cfg.spec.api_revision,
    },
    body: JSON.stringify({
      model: cfg.spec.model,
      input,
      response_format: { type: "image", aspect_ratio: opgave.ratio, image_size: cfg.spec.image_size },
    }),
  });

  if (!svar.ok) {
    const tekst = await svar.text();
    throw new Error(`${svar.status} ${svar.statusText} — ${tekst.slice(0, 400)}`);
  }

  const json = await svar.json();
  const b64 = udtrækBillede(json);
  if (!b64) throw new Error(`intet billede i svaret: ${JSON.stringify(json).slice(0, 400)}`);
  return Buffer.from(b64, "base64");
}

/**
 * Svaret har en output_image-genvej, men ved flertrins-svar ligger billedet
 * inde i steps. Vi leder begge steder frem for at antage den ene form —
 * et fejlet opslag her koster et helt kald om igen.
 */
function udtrækBillede(json) {
  if (json?.output_image?.data) return json.output_image.data;
  const stakke = [json];
  while (stakke.length) {
    const n = stakke.pop();
    if (!n || typeof n !== "object") continue;
    if (typeof n.data === "string" && n.data.length > 1000) return n.data;
    for (const v of Object.values(n)) if (v && typeof v === "object") stakke.push(v);
  }
  return null;
}

/* ───── billedbehandling ───── */

async function skrivWebp(raa, udSti, cfg) {
  const sharp = (await import("sharp")).default;
  mkdirSync(dirname(udSti), { recursive: true });
  const tmp = `${udSti}.part`;
  await sharp(raa).resize({ width: cfg.spec.bredde, withoutEnlargement: true })
    .webp({ quality: cfg.spec.kvalitet }).toFile(tmp);
  renameSync(tmp, udSti);

  const thumb = udSti.replace(/\.webp$/, "-400.webp");
  const tmp2 = `${thumb}.part`;
  await sharp(raa).resize({ width: cfg.spec.thumb_bredde, withoutEnlargement: true })
    .webp({ quality: cfg.spec.thumb_kvalitet }).toFile(tmp2);
  renameSync(tmp2, thumb);
}

/* ───── manifest ───── */

/**
 * Manifestet skrives ud fra de filer, der FINDES på disken — ikke ud fra
 * planen. Så kan galleriet aldrig komme til at pege på et billede, der ikke
 * blev genereret, og en halv kørsel giver et halvt galleri frem for 404'ere.
 */
function skrivManifest(opgaver, cfg) {
  const pr = new Map();
  for (const o of opgaver) {
    if (!existsSync(o.udSti)) continue;
    const rel = "/" + relative(join(ROD, "public"), o.udSti).split("\\").join("/");
    if (!pr.has(o.produkt.id)) pr.set(o.produkt.id, []);
    pr.get(o.produkt.id).push({
      src: rel,
      thumb: rel.replace(/\.webp$/, "-400.webp"),
      scene: o.scene.id,
      ratio: o.ratio,
      titel_da: o.scene.titel_da,
      titel_en: o.scene.titel_en,
      alt_da: o.alt_da,
      alt_en: o.alt_en,
      caption_da: o.caption_da,
      caption_en: o.caption_en,
    });
  }

  const raekker = [...pr.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, billeder]) => `  ${JSON.stringify(id)}: ${JSON.stringify(billeder, null, 2).split("\n").join("\n  ")},`)
    .join("\n");

  const fil = `/* GENERERET FIL — ret den ikke i hånden.
 *
 * Skrives af scripts/product-images/generate.mjs ud fra gallery/scenes.json og
 * de billeder, der faktisk ligger i public/images/gallery/. Kør scriptet igen
 * efter en ny generering:
 *
 *   node scripts/product-images/generate.mjs --manifest
 *
 * Alle billeder her er AI-genererede med vores egne produktfotos som reference.
 * De vises med en mærkat i galleriet — se ProductGallery.tsx og
 * produktgalleri.test.tsx, som fejler hvis mærkaten forsvinder.
 */

export interface GalleryImage {
  /** 1600px WebP */
  src: string;
  /** 400px WebP til gitteret */
  thumb: string;
  /** Scene-id fra gallery/scenes.json */
  scene: string;
  /** Billedforhold, fx "16:9" — bruges til at reservere pladsen før billedet er hentet */
  ratio: string;
  titel_da: string;
  titel_en: string;
  alt_da: string;
  alt_en: string;
  caption_da: string;
  caption_en: string;
}

export const PRODUCT_GALLERY: Record<string, GalleryImage[]> = {
${raekker}
};

/** Galleriet for et produkt — tom liste hvis der ikke er genereret nogen endnu. */
export function galleryFor(productId: string): GalleryImage[] {
  return PRODUCT_GALLERY[productId] ?? [];
}

/** Bredde/højde-forhold som et tal, til CSS aspect-ratio. */
export function ratioTal(ratio: string): number {
  const [b, h] = ratio.split(":").map(Number);
  return b && h ? b / h : 1;
}
`;
  writeFileSync(MANIFEST, fil);
  return [...pr.values()].reduce((n, l) => n + l.length, 0);
}

/* ───── plan ───── */

function byggeplan(cfg, pm, flad, filter) {
  const opgaver = [];
  for (const p of flad.values()) {
    if (p.hidden) continue;
    // Kun produkter med deres egen side. Galleriet bor på produktsiden, og et
    // billede uden en side at stå på er en udgift uden en plads at bruges.
    if (!p.page) continue;
    if (filter.only && !filter.only.includes(p.id)) continue;

    for (const scene of pm.scenerFor(p)) {
      if (filter.scene && scene.id !== filter.scene) continue;
      const bygget = pm.byggPrompt(p, scene, flad);
      if (!bygget) continue; // intet produktfoto at vise modellen
      // Referencer der peger på R2 (/api/image/…) kan kun hentes af knappen i
      // admin, ikke af et script på en bærbar uden netværk til produktionen.
      const lokale = bygget.referencer.filter((r) => stiTilBillede(r.billede));
      if (lokale.length === 0) continue;
      opgaver.push({
        produkt: p,
        scene,
        ...bygget,
        referencer: lokale,
        raaSti: join(RAA_DIR, p.id, `${scene.id}.png`),
        udSti: join(UD_DIR, p.id, `${scene.id}.webp`),
      });
    }
  }
  return opgaver;
}

/* ───── kørsel ───── */

function argv() {
  const a = process.argv.slice(2);
  const har = (f) => a.includes(f);
  const vaerdi = (f) => (a.includes(f) ? a[a.indexOf(f) + 1] : null);
  return {
    apply: har("--apply"),
    force: har("--force"),
    kunManifest: har("--manifest"),
    prompts: har("--prompts"),
    only: vaerdi("--only")?.split(",").map((s) => s.trim()),
    scene: vaerdi("--scene"),
  };
}

async function main() {
  const flag = argv();
  const cfg = JSON.parse(readFileSync(CONFIG, "utf8"));
  const { katalog, prompt: pm } = await laesModuler();
  const flad = pm.fladtKatalog(katalog);
  const opgaver = byggeplan(cfg, pm, flad, flag);
  /**
   * Manifestet skrives ALTID ud fra hele planen, aldrig ud fra --only/--scene.
   *
   * Det gjorde det ikke før: en kørsel med --only traadloes_mikrofon skrev et
   * manifest med ét billede i og slettede de 77 andre posters. Filerne lå der
   * stadig, men galleriet var væk fra alle produktsider indtil næste fulde
   * kørsel. Filtrene hører til på det, der skal GENERERES — ikke på det, der
   * skal skrives ned bagefter.
   */
  const helePlanen = flag.only || flag.scene ? byggeplan(cfg, pm, flad, {}) : opgaver;

  if (flag.kunManifest) {
    const n = skrivManifest(helePlanen, cfg);
    console.log(`Manifest skrevet: ${n} billeder i ${relative(ROD, MANIFEST)}`);
    return;
  }

  const mangler = opgaver.filter((o) => flag.force || !existsSync(o.udSti));
  const findes = opgaver.length - mangler.length;
  const pris = mangler.length * cfg.spec.usd_per_image;

  console.log(`${opgaver.length} billeder i planen — ${findes} findes allerede, ${mangler.length} mangler.`);
  console.log(`Model ${cfg.spec.model} i ${cfg.spec.image_size}: ${mangler.length} × ${cfg.spec.usd_per_image} $ = ${pris.toFixed(2)} $\n`);

  const uden = opgaver.filter((o) => o.mangler.length);
  if (uden.length) {
    console.log("Dele uden produktfoto (udelades af referencerne):");
    for (const o of uden) console.log(`  ${o.produkt.id}/${o.scene.id}: ${o.mangler.join(", ")}`);
    console.log("");
  }
  const skaaret = opgaver.filter((o) => o.skaaret.length);
  if (skaaret.length) {
    console.log(`For mange dele til ${cfg.spec.max_referencer} referencer — disse er skåret fra:`);
    for (const o of skaaret) console.log(`  ${o.produkt.id}/${o.scene.id}: ${o.skaaret.join(", ")}`);
    console.log("");
  }

  if (!flag.apply) {
    const vis = flag.prompts ? mangler : mangler.slice(0, 3);
    console.log(flag.prompts ? "Tør kørsel. Alle prompts:\n" : "Tør kørsel. Første tre prompts (--prompts for alle):\n");
    for (const o of vis) {
      const antal = o.referencer.length === 1 ? "1 reference" : `${o.referencer.length} referencer`;
      console.log(`── ${o.produkt.id} / ${o.scene.id} (${o.ratio}, ${antal}: ${o.referencer.map((r) => r.id).join(", ")})`);
      console.log(o.prompt + "\n");
    }
    console.log("Kør med --apply for at generere.");
    return;
  }

  const noegle = hentNoegle();
  if (!noegle) {
    console.error("Mangler GEMINI_API_KEY i miljøet eller .dev.vars — hentes på aistudio.google.com.");
    process.exit(1);
  }

  let lavet = 0;
  let fejl = 0;
  for (const [i, o] of mangler.entries()) {
    const navn = `${o.produkt.id}/${o.scene.id}`;
    process.stdout.write(`[${i + 1}/${mangler.length}] ${navn} … `);
    try {
      const raa = await generer(o, cfg, noegle);
      mkdirSync(dirname(o.raaSti), { recursive: true });
      writeFileSync(o.raaSti, raa);
      await skrivWebp(raa, o.udSti, cfg);
      lavet++;
      console.log("ok");
    } catch (e) {
      fejl++;
      console.log(`FEJL — ${e.message}`);
    }
  }

  const n = skrivManifest(helePlanen, cfg);
  console.log(`\n${lavet} nye billeder, ${fejl} fejl. Manifest: ${n} billeder.`);
  console.log(`Brugt: ca. ${(lavet * cfg.spec.usd_per_image).toFixed(2)} $`);
  if (fejl) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
