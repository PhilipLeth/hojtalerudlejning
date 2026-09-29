#!/usr/bin/env node
/**
 * Stemningsbilleder i hero — fra terminalen, uden at klikke i admin.
 *
 * Philip, 29. sept 2026: "Det skal være et relevant billede pr. side ... Så må
 * du lave admin om så der er et API du kan kalde, jeg skal ikke sidde og
 * klikke igennem dem." Scriptet kalder billedmodellen direkte med samme prompt
 * og samme referencer som knappen i /admin/stemningsbilleder — listen kommer
 * fra gallery/hero-sider.json, som skrives af heroSider()/heroPrompt() (se
 * src/__tests__/hero-sider-json.test.ts). Resultatet er kodens standard:
 *
 *   public/images/hero/<side>-<hash>.webp (+ -800 til mobil)
 *   src/lib/heroStandard.json            sti → billede
 *
 * Hash i filnavnet: CDN'en cacher /images/* i 30 dage, så et nyt billede SKAL
 * have et nyt navn (se billede-cache-kraever-nyt-navn). Et billede godkendt i
 * admin (KV) vinder stadig over det her.
 *
 *   node scripts/product-images/hero-stemning.mjs                     # plan + pris
 *   node scripts/product-images/hero-stemning.mjs --apply             # alle sider uden eget billede
 *   node scripts/product-images/hero-stemning.mjs --apply --only /discokugle,/festlys
 *   node scripts/product-images/hero-stemning.mjs --apply --only /discokugle --note "tættere på kuglen"
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HER = dirname(fileURLToPath(import.meta.url));
const ROD = resolve(HER, "..", "..");
const CFG = JSON.parse(readFileSync(join(ROD, "gallery", "scenes.json"), "utf8"));
const SIDER = JSON.parse(readFileSync(join(ROD, "gallery", "hero-sider.json"), "utf8"));
const STANDARD_FIL = join(ROD, "src", "lib", "heroStandard.json");
const RAA = join(ROD, "gallery", "raw", "hero");
const UD = join(ROD, "public", "images", "hero");
const SAMTIDIGE = 4;

function noegle() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const sti = join(ROD, ".dev.vars");
  if (existsSync(sti)) {
    for (const l of readFileSync(sti, "utf8").split("\n")) {
      const m = l.trim().match(/^GEMINI_API_KEY\s*=\s*"?([^"]+)"?$/);
      if (m) return m[1];
    }
  }
  throw new Error("GEMINI_API_KEY mangler (miljø eller .dev.vars)");
}

function billede(json) {
  const genvej = json?.output_image?.data;
  if (genvej) return genvej;
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

const slug = (sti) => sti.replace(/^\//, "").replace(/\//g, "-") || "forside";
const mime = (f) => (f.endsWith(".png") ? "image/png" : f.endsWith(".jpg") ? "image/jpeg" : "image/webp");

async function lav(side, note, sharp, key) {
  const ønske = note ? ` The person ordering the image adds: "${note}". Follow it unless it breaks the rules below.` : "";
  const prompt = side.prompt.replace(" Wide 16:9 composition.", ` Wide 16:9 composition.${ønske}`);
  const input = [{ type: "text", text: prompt }];
  for (const ref of side.referencer) {
    const fil = join(ROD, "public", ref.split("?")[0]);
    if (!existsSync(fil)) throw new Error(`reference findes ikke: ${ref}`);
    input.push({ type: "image", mime_type: mime(fil), data: readFileSync(fil).toString("base64") });
  }
  const svar = await fetch(CFG.spec.endpoint, {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json", "Api-Revision": CFG.spec.api_revision },
    body: JSON.stringify({ model: CFG.spec.model, input, response_format: { type: "image", aspect_ratio: "16:9", image_size: CFG.spec.image_size } }),
  });
  if (!svar.ok) throw new Error(`${svar.status} — ${(await svar.text()).slice(0, 300)}`);
  const b64 = billede(await svar.json());
  if (!b64) throw new Error("intet billede i svaret");
  const raa = Buffer.from(b64, "base64");
  writeFileSync(join(RAA, `${slug(side.sti)}.png`), raa);
  const hash = createHash("sha256").update(raa).digest("hex").slice(0, 8);
  const navn = `${slug(side.sti)}-${hash}`;
  await sharp(raa).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 78 }).toFile(join(UD, `${navn}.webp`));
  await sharp(raa).resize({ width: 800 }).webp({ quality: 72 }).toFile(join(UD, `${navn}-800.webp`));
  return `/images/hero/${navn}.webp`;
}

async function main() {
  const args = process.argv.slice(2);
  const val = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : null);
  const kun = val("--only")?.split(",").map((s) => s.trim()).filter(Boolean);
  const note = val("--note")?.trim() || "";
  const standard = JSON.parse(readFileSync(STANDARD_FIL, "utf8"));

  const opgaver = kun ? SIDER.filter((s) => kun.includes(s.sti)) : SIDER.filter((s) => !standard[s.sti]);
  if (kun) for (const k of kun) if (!SIDER.some((s) => s.sti === k)) throw new Error(`ukendt side: ${k}`);
  console.log(`${opgaver.length} sider × ${CFG.spec.usd_per_image} $ = ${(opgaver.length * CFG.spec.usd_per_image).toFixed(2)} $`);
  if (!args.includes("--apply")) {
    for (const s of opgaver) console.log(`  ${s.sti}  (${s.sted}, ${s.referencer.length} ref.)`);
    console.log("Kør med --apply for at generere.");
    return;
  }

  mkdirSync(RAA, { recursive: true });
  mkdirSync(UD, { recursive: true });
  const sharp = (await import("sharp")).default;
  const key = noegle();
  const kø = [...opgaver];
  let fejl = 0;
  await Promise.all(
    Array.from({ length: SAMTIDIGE }, async () => {
      while (kø.length) {
        const side = kø.shift();
        try {
          const src = await lav(side, note, sharp, key);
          // Læs og skriv filen for hvert billede, så en afbrudt kørsel beholder det lavede
          const nu = JSON.parse(readFileSync(STANDARD_FIL, "utf8"));
          nu[side.sti] = src;
          writeFileSync(STANDARD_FIL, JSON.stringify(Object.fromEntries(Object.entries(nu).sort()), null, 2) + "\n");
          console.log(`✓ ${side.sti} → ${src}`);
        } catch (e) {
          fejl++;
          console.error(`✗ ${side.sti}: ${e.message}`);
        }
      }
    }),
  );
  console.log(`${opgaver.length - fejl} lavet, ${fejl} fejl.`);
  if (fejl) process.exit(1);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
