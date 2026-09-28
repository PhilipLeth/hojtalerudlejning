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
    // v3 (beskrivelse alene) var "utroligt grim". Nu ud fra arkets link.
    id: "lyseffekt_ref",
    fil: "product-lyseffekt-v4-white.webp",
    refUrl: "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/519879.jpg",
    motiv:
      "a small LED beam light effect: a round black housing with a flat circular front face set with " +
      "about fifteen small square lenses glowing blue, mounted in a black U-shaped hanging bracket with " +
      "a knob on the side",
  },
  {
    // Philip: "Sådan ser et Soundboks-batteri ud" (Elgiganten, Soundboks The Battery).
    // Arkets link er hifiklubben; fotoet derfra er det samme batteri.
    id: "batteri_ref",
    fil: "product-soundboks-batteri-v3-white.webp",
    refUrl: "https://images.hifiklubben.com/image/82e215d3-d4fd-44ee-ac52-f528e639f285/pdp_h/soundbatteryboksusbc.jpg",
    motiv:
      "a rechargeable battery for a portable party speaker: a matte black rectangular box, wider than it " +
      "is tall, with a black webbing carry strap looped across the top and a short cable with a round " +
      "DC plug coming out of the top. Plain black surfaces with no logo or embossed name",
  },
  // ── 28. sept 2026: stativerne. Modellerne er arkets indkøbsnavne. ──
  {
    // Arket: Millenium BS-2211B. "1 højtalerstativ skal kun vise et billede af 1 stativ."
    // Bruges også til lysstativet: arkets lysstativ er et almindeligt 3-fodsstativ.
    id: "stativ_enkelt",
    fil: "product-hojtalerstativ-1-white.webp",
    motiv:
      "exactly ONE black steel tripod speaker stand, standing alone and fully extended to about head " +
      "height: three straight splayed legs with rubber feet and three short bracing struts joining the " +
      "legs to a central collar, a single straight 35 mm round pole rising from the collar with one " +
      "height adjustment clamp and a locking knob, and a plain top pole end for a speaker to sit on. " +
      "The whole stand is visible from feet to top. Only one stand, no second stand, no speaker, no cables",
  },
  {
    // Arket: Fun Generation Mic Stand. Det gamle billede var en mikrofon på en skæv bom.
    id: "mikrofonstativ",
    fil: "product-mikrofonstativ-v2-white.webp",
    motiv:
      "one black microphone boom stand, standing alone and fully visible from feet to top: a folding " +
      "tripod base with three thin straight legs, a straight upright pole about 1 metre tall with a " +
      "clutch knob, and on top a telescopic boom arm angled slightly upwards, with a black plastic " +
      "microphone clip at the end of the boom and a small counterweight at the other end. " +
      "No microphone in the clip, no cable, only one stand",
  },
  {
    // Arket: Gravity KSX 2. Det gamle billede var et bord med en bordplade.
    id: "x_stativ",
    fil: "product-x-stativ-v2-white.webp",
    motiv:
      "one empty black steel double-braced X-shaped keyboard stand, standing open on the floor, seen " +
      "from the front at a slight three-quarter angle: two parallel X frames made of square steel tubing " +
      "connected by horizontal crossbars, with rubber end caps on the four feet, and two horizontal " +
      "support arms on top with black rubber padding, a central locking knob at the crossing point. " +
      "Nothing on top of it: no table top, no board, no keyboard, no DJ controller, no cables",
  },
  {
    // Philip 28. sept 2026: "Enkelt lyseffekt viser et spejlkuglespot. Det skal
    // være en lyseffekt." Arket: Eurolite LED Mini Z-20 beam-effekt.
    id: "lyseffekt",
    fil: "product-lyseffekt-v3-white.webp",
    motiv:
      "a small compact LED party light effect, a matte black box about the size of a hand, with a " +
      "short U-shaped mounting bracket underneath and a small power cable. The front face is a clear " +
      "domed multi-lens cluster with many small facets, lit from inside with separate red, green, blue " +
      "and white LED points, so that thin coloured beams fan out from the front in several directions " +
      "across the white background. Not a spotlight, not a single round lens, not a pinspot, no " +
      "mirror ball, no disco ball",
  },
  {
    // Philip 28. sept 2026: "Soundboks batteri skal være et billede af et reelt
    // SB-batteri." Beskrivelsen er Soundboks' egen: murstensformet sort
    // ABS-kasse, 15 × 6,4 × 9,4 cm, stofstrop til at trække den ud, gummiknap
    // og fem LED'er til batteriniveau, kraftigt DC-stik.
    id: "batteri",
    fil: "product-soundboks-batteri-v2-white.webp",
    motiv:
      "a rechargeable battery pack for a portable party speaker: a brick-shaped matte black moulded " +
      "plastic box, about 15 cm tall, 6 cm wide and 9 cm deep, with softly rounded edges, standing " +
      "upright. A short loop of black woven fabric strap sticks out of the top, used to pull the battery " +
      "out of the speaker. On the top face a small round black rubber push button next to a short row " +
      "of five tiny green LED dots, all lit. On the bottom edge a sturdy recessed DC connector. Plain " +
      "surfaces with no text, no logo, no labels. Not a phone power bank, no cable, no speaker",
  },
  {
    // Philip 28. sept 2026: "lav det ud fra en AlphaTheta XDJ-AZ". Det gamle
    // billede var en opdigtet pult med en tablet på en stander. -v2, så CDN'en
    // ikke bliver ved med at servere det gamle, se billede-cache-kraever-nyt-navn.
    id: "dj_pult",
    fil: "product-dj-pult-v2-white.webp",
    motiv:
      "a professional four-channel all-in-one standalone DJ system in matte black, seen from the front " +
      "and slightly above. One wide, low, flat rectangular console, about 90 cm wide, with a slightly " +
      "raised rear edge. In the top centre a large flat 10-inch colour touchscreen set flush into the " +
      "panel, showing a track list and two waveforms. Directly below the screen a four-channel club " +
      "mixer section: four vertical channel strips each with a column of small round EQ knobs and a " +
      "long vertical channel fader, a horizontal crossfader at the front, and a small effects section " +
      "beside the screen. On the left and on the right a large full-size round jog wheel with a small " +
      "round display in its centre, and below each jog wheel a row of eight rubber performance pads, " +
      "big round play and cue buttons at the front corners, and a long tempo slider at the outer edge. " +
      "Everything is built into the one console: no laptop, no tablet on a stand, no separate mixer, " +
      "no headphones, no cables",
  },
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

/**
 * Leverandørens eget produktfoto som reference, når opgaven har `refUrl`.
 *
 * Philip 28. sept 2026: "Lyseffekten du har lavet er utroligt grim. Kan du ikke
 * se i arket hvad der er linket til og lave noget ud fra originalen?" En
 * beskrivelse alene gav en opdigtet lampe. Arkets kolonne J linker til varen;
 * fotoet derfra er referencen for formen, og vores prompt sætter husstilen og
 * forbyder mærket. Filen gemmes i gallery/raw/ref (gitignoreret).
 */
async function hentReference(o) {
  if (!o.refUrl) return null;
  const sti = join(ROD, "gallery", "raw", "ref", `${o.id}.img`);
  if (!existsSync(sti)) {
    const svar = await fetch(o.refUrl, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/128 Safari/537.36" } });
    if (!svar.ok) throw new Error(`reference ${o.refUrl}: ${svar.status}`);
    mkdirSync(dirname(sti), { recursive: true });
    writeFileSync(sti, Buffer.from(await svar.arrayBuffer()));
  }
  const sharp = (await import("sharp")).default;
  // Gennemsigtig baggrund (webp/png) lægges på hvidt, så modellen ikke tager den sorte bund med
  const jpg = await sharp(readFileSync(sti)).flatten({ background: "#ffffff" }).jpeg({ quality: 90 }).toBuffer();
  return { type: "image", mime_type: "image/jpeg", data: jpg.toString("base64") };
}

async function generer(prompt, cfg, noegle, ref = null) {
  const svar = await fetch(cfg.spec.endpoint, {
    method: "POST",
    headers: {
      "x-goog-api-key": noegle,
      "Content-Type": "application/json",
      "Api-Revision": cfg.spec.api_revision,
    },
    body: JSON.stringify({
      model: cfg.spec.model,
      input: ref ? [{ type: "text", text: prompt }, ref] : [{ type: "text", text: prompt }],
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
    const prompt = o.refUrl
      ? `A clean catalogue product photo of ${o.motiv}. Reproduce the product in the attached reference photo faithfully: the same shape, proportions, colours and details, but remove every logo, brand name and printed text from it. ${STIL}`
      : `A clean catalogue product photo of ${o.motiv}, ${STIL}`;
    try {
      const raa = await generer(prompt, cfg, noegle, await hentReference(o));
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
