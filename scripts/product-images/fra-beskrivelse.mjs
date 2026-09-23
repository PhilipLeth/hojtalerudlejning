#!/usr/bin/env node
/**
 * Katalogfoto ud fra en BESKRIVELSE, når der ikke er et referencefoto.
 *
 * generate.mjs bygger sin prompt af vores egne produktfotos og nægter at køre
 * uden mindst ét — med rette: en højtaler uden reference bliver til en opdigtet
 * kasse med et volapyk-logo på grillen.
 *
 * Men den regel spærrede også for de varer, hvor der ikke ER noget at digte.
 * En hvid firevejs-stikdåse er en hvid firevejs-stikdåse, og arket navngiver
 * den præcise model. Leverandørens eget foto kan ikke hentes herfra
 * (netværkspolitikken afviser jemogfix.dk), så beskrivelsen er referencen.
 *
 * Reglen, der bliver stående: intet mærke, intet logo, ingen tekst i billedet.
 * Vi viser formen på den vare, kunden får, ikke en bestemt producents kasse.
 *
 *   node scripts/product-images/fra-beskrivelse.mjs            # plan + estimat
 *   node scripts/product-images/fra-beskrivelse.mjs --apply
 *   node scripts/product-images/fra-beskrivelse.mjs --apply --only slushice
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HER = dirname(fileURLToPath(import.meta.url));
const ROD = resolve(HER, "..", "..");
const CONFIG = join(ROD, "gallery", "scenes.json");
const RAA_DIR = join(ROD, "gallery", "raw", "katalogfoto");
const UD_DIR = join(ROD, "public", "images");

/**
 * Hvad der skal stå på den hvide baggrund.
 *
 * `motiv` er den eneste frie tekst — resten af prompten er husstilen, som den
 * står i docs/_internal/produktbilleder-styleguide.md: hvid sømløs baggrund,
 * softboks fra venstre, diskret kontaktskygge, trekvart forfra.
 *
 * Beskrivelserne er arkets egne modelnavne oversat til form og farve. De
 * nævner ikke mærket, og prompten forbyder logoer — vi viser varen, ikke
 * producentens emballage.
 */
const OPGAVER = [
  {
    id: "kabeltromle",
    fil: "product-kabeltromle-white.webp",
    motiv:
      "an orange plastic cable reel drum on a black folding stand, wound with black mains cable, " +
      "with four Danish mains sockets set into the side of the drum and a carrying handle on top. " +
      "The sockets are the Danish/European type: a round recessed cup with two round pin holes, " +
      "never the British rectangular three-pin type",
  },
  {
    id: "kabeltromle_jord",
    fil: "product-kabeltromle-jord-white.webp",
    motiv:
      "a large orange plastic cable reel drum on a black metal frame with a carrying handle, wound with " +
      "thick black three-core mains cable, with four Danish earthed sockets set into the side of the " +
      "drum. The sockets are the Danish/European type: a round recessed cup with two round pin holes " +
      "and a small earth pin, never the British rectangular three-pin type",
  },
  {
    id: "stikdaase",
    fil: "product-stikdaase-white.webp",
    motiv:
      "a slim white four-way power strip with a short white mains lead coiled loosely beside it, the " +
      "four sockets in a row along the top face, no switch. The sockets are the Danish/European type: " +
      "each one a round recessed cup with two round pin holes, never the British rectangular " +
      "three-pin type",
  },
  {
    id: "stikdaase_jord",
    fil: "product-stikdaase-jord-white.webp",
    motiv:
      "a slim black five-way earthed power strip with a black mains lead coiled loosely beside it, the " +
      "five sockets in a row along the top face. The sockets are the Danish earthed type: each one a " +
      "round recessed cup with two round pin holes and a small round earth pin at the bottom of the " +
      "cup, never the British rectangular three-pin type",
  },
  {
    id: "omformer_udendors",
    fil: "product-omformer-white.webp",
    motiv:
      "a single small white mains plug adapter standing upright, shown large and centred. It is the " +
      "Danish hybrid earthed type: two round pins and an earth contact, never the British rectangular " +
      "three-pin type",
  },
  {
    id: "slushice",
    fil: "product-slushice-white.webp",
    motiv:
      "a commercial twin-bowl slush machine: two clear transparent bowls side by side on a stainless " +
      "steel base, one bowl filled with red slush and one with blue, each bowl with a visible auger and " +
      "a black tap at the front, brushed steel body, no text or branding anywhere",
  },
  {
    id: "fadoel",
    fil: "product-fadoel-white.webp",
    motiv:
      "a compact stainless steel draught beer dispenser: a brushed steel cooling unit with a chrome " +
      "beer tap and black handle on top, a coiled beer line and a small grey CO2 cylinder standing " +
      "beside it, plain and unbranded",
  },
];

/* ───── husstilen ───── */

const STIL =
  "isolated on a completely plain seamless white background. Lit softly from the upper left with a " +
  "gentle fill from the right and a subtle neutral contact shadow directly under the object, so it " +
  "sits on the surface rather than floating. Three-quarter front view at product height. The product " +
  "is centred and fills roughly three quarters of the frame, sharp from front to back. Photographic " +
  "and true to life, no HDR look.\n\n" +
  "The frame contains the product and nothing else. Absolutely no studio equipment is visible: no " +
  "softboxes, no light panels, no reflectors, no light stands, no backdrop edges, no corners, no " +
  "table edge, no horizon line — the background is one even white field from edge to edge. No props, " +
  "no hands, no people, no packaging.\n\n" +
  "Nothing is written anywhere: no brand names, no logos, no labels, no printed text, no watermarks. " +
  "The product is shown by its shape and colour alone.";

function hentNoegle() {
  const fra = process.env.GEMINI_API_KEY;
  if (fra) return fra.trim();
  const devVars = join(ROD, ".dev.vars");
  if (existsSync(devVars)) {
    for (const linje of readFileSync(devVars, "utf8").split("\n")) {
      const t = linje.trim();
      if (t.startsWith("GEMINI_API_KEY=")) {
        return t.slice("GEMINI_API_KEY=".length).replace(/^["']|["']$/g, "").trim();
      }
    }
  }
  return null;
}

/** Billedet ligger enten i genvejen eller nede i et trin — vi leder begge steder. */
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

async function generer(prompt, cfg, noegle) {
  const svar = await fetch(cfg.spec.endpoint, {
    method: "POST",
    headers: {
      "x-goog-api-key": noegle,
      "Content-Type": "application/json",
      "Api-Revision": cfg.spec.api_revision,
    },
    body: JSON.stringify({
      model: cfg.spec.model,
      input: [{ type: "text", text: prompt }],
      // Kvadratisk som resten af katalogfotoerne
      response_format: { type: "image", aspect_ratio: "1:1", image_size: cfg.spec.image_size },
    }),
  });
  if (!svar.ok) throw new Error(`${svar.status} ${svar.statusText} — ${(await svar.text()).slice(0, 400)}`);
  const b64 = udtrækBillede(await svar.json());
  if (!b64) throw new Error("intet billede i svaret");
  return Buffer.from(b64, "base64");
}

async function skrivWebp(raa, udSti, cfg) {
  const sharp = (await import("sharp")).default;
  mkdirSync(dirname(udSti), { recursive: true });
  const tmp = `${udSti}.part`;
  await sharp(raa)
    .resize({ width: cfg.spec.bredde, withoutEnlargement: true })
    .webp({ quality: cfg.spec.kvalitet })
    .toFile(tmp);
  renameSync(tmp, udSti);
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const kun = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
  const force = args.includes("--force");

  const cfg = JSON.parse(readFileSync(CONFIG, "utf8"));
  const opgaver = OPGAVER.filter((o) => !kun || o.id === kun).filter(
    (o) => force || !existsSync(join(UD_DIR, o.fil)),
  );

  console.log(`${opgaver.length} billeder at lave.`);
  console.log(`${cfg.spec.model}: ${opgaver.length} × ${cfg.spec.usd_per_image} $ = ${(opgaver.length * cfg.spec.usd_per_image).toFixed(2)} $`);
  if (!apply) {
    for (const o of opgaver) console.log(`\n── ${o.id} → ${o.fil}\n${o.motiv}`);
    console.log("\nKør med --apply for at generere.");
    return;
  }

  const noegle = hentNoegle();
  if (!noegle) {
    console.error("GEMINI_API_KEY mangler i miljøet eller i .dev.vars.");
    process.exit(1);
  }

  let lavet = 0;
  let fejl = 0;
  for (const o of opgaver) {
    const prompt = `A clean catalogue product photo of ${o.motiv}, ${STIL}`;
    try {
      const raa = await generer(prompt, cfg, noegle);
      const raaSti = join(RAA_DIR, `${o.id}.png`);
      mkdirSync(dirname(raaSti), { recursive: true });
      writeFileSync(raaSti, raa);
      await skrivWebp(raa, join(UD_DIR, o.fil), cfg);
      console.log(`✓ ${o.id} → /images/${o.fil}`);
      lavet++;
    } catch (e) {
      console.error(`✗ ${o.id}: ${e.message}`);
      fejl++;
    }
  }
  console.log(`\n${lavet} billeder lavet, ${fejl} fejl.`);
  if (lavet) console.log("Husk at sætte stien i products.ts (image-feltet).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
