#!/usr/bin/env node
/**
 * Stemningsbillede til heroen på en produktside.
 *
 * Produktsiderne havde alle det samme generiske baggrundsbillede (hero.webp)
 * bag overskriften. Philip, 28. sept 2026: "lav et eksempel hvor vi bruger et
 * genereret stemningsbillede i hero på festpakke-stor".
 *
 * Referencerne er vores EGNE produktfotos, så modellen komponerer det grej,
 * kunden får — ikke en opdigtet lysbar med fire lamper. Stilen og forbuddene
 * er de samme som produktgalleriets (gallery/scenes.json → stil).
 *
 * Billedet er bredt (16:9) og holdes roligt og mørkt foroven i midten, fordi
 * overskriften og prisen står oven på det. Nævn ALDRIG overskriften i
 * prompten: "so headline text can sit on top" fik modellen til at skrive
 * "PARTY UDLEJNING COPENHAGEN" ind i billedet.
 *
 *   node scripts/product-images/hero-stemning.mjs                  # plan + pris
 *   node scripts/product-images/hero-stemning.mjs --apply --only pakke_fest_stor
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HER = dirname(fileURLToPath(import.meta.url));
const ROD = resolve(HER, "..", "..");
const CFG = JSON.parse(readFileSync(join(ROD, "gallery", "scenes.json"), "utf8"));
const RAA = join(ROD, "gallery", "raw", "hero");
const UD = join(ROD, "public", "images", "hero");

const OPGAVER = [
  {
    id: "pakke_fest_stor",
    fil: "festpakke-stor.webp",
    referencer: ["product-festival-v2-white.webp", "product-lys-v4-white.webp"],
    scene:
      "A private party in full swing late in the evening in a Copenhagen flat with white-painted walls, " +
      "a wooden floor and tall windows, dark outside. Two black 12-inch loudspeakers (the first reference, " +
      "reproduced faithfully) stand on black tripod stands at the left and right edges of the frame. Between " +
      "them, towards the back, one light bar on a tripod stand (the second reference, reproduced faithfully: " +
      "exactly two round coloured LED lamps and one centre effect on a short horizontal bar) throws blue, " +
      "magenta and amber light across the ceiling and the walls. A handful of guests dance in the lower third " +
      "of the frame, seen from behind or in soft focus, faces turned away. The upper centre of the image is " +
      "calm, uncluttered and fairly dark, just wall and ceiling with coloured light on them. Each speaker " +
      "appears exactly once. Absolutely no words, letters, titles or captions anywhere in the picture. " +
      "Wide 16:9 composition.",
  },
];

function noegle() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  for (const sti of [join(ROD, ".dev.vars")]) {
    if (!existsSync(sti)) continue;
    for (const l of readFileSync(sti, "utf8").split("\n")) {
      const m = l.trim().match(/^GEMINI_API_KEY\s*=\s*"?([^"]+)"?$/);
      if (m) return m[1];
    }
  }
  throw new Error("GEMINI_API_KEY mangler (miljø eller .dev.vars)");
}

function billede(json) {
  const stak = [json];
  while (stak.length) {
    const n = stak.pop();
    if (n && typeof n === "object") {
      if (typeof n.data === "string" && n.data.length > 1000) return n.data;
      for (const v of Object.values(n)) if (v && typeof v === "object") stak.push(v);
    }
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const kun = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
  const opgaver = OPGAVER.filter((o) => !kun || o.id === kun);
  console.log(`${CFG.spec.model}: ${opgaver.length} × ${CFG.spec.usd_per_image} $`);
  if (!args.includes("--apply")) {
    for (const o of opgaver) console.log(`\n── ${o.id} → /images/hero/${o.fil}\n${o.scene}`);
    return;
  }
  mkdirSync(RAA, { recursive: true });
  mkdirSync(UD, { recursive: true });
  const sharp = (await import("sharp")).default;
  for (const o of opgaver) {
    const prompt = `${o.scene} ${CFG.stil.faelles} ${CFG.stil.forbudt}`;
    const input = [{ type: "text", text: prompt }];
    for (const r of o.referencer) {
      input.push({ type: "image", mime_type: "image/webp", data: readFileSync(join(ROD, "public", "images", r)).toString("base64") });
    }
    const svar = await fetch(CFG.spec.endpoint, {
      method: "POST",
      headers: { "x-goog-api-key": noegle(), "Content-Type": "application/json", "Api-Revision": CFG.spec.api_revision },
      body: JSON.stringify({ model: CFG.spec.model, input, response_format: { type: "image", aspect_ratio: "16:9", image_size: CFG.spec.image_size } }),
    });
    if (!svar.ok) throw new Error(`${svar.status} — ${(await svar.text()).slice(0, 400)}`);
    const b64 = billede(await svar.json());
    if (!b64) throw new Error("intet billede i svaret");
    const raa = Buffer.from(b64, "base64");
    writeFileSync(join(RAA, `${o.id}.png`), raa);
    await sharp(raa).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 78 }).toFile(join(UD, o.fil));
    await sharp(raa).resize({ width: 800 }).webp({ quality: 72 }).toFile(join(UD, o.fil.replace(/\.webp$/, "-800.webp")));
    console.log(`✓ ${o.id} → /images/hero/${o.fil}`);
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
