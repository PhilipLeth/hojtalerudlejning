#!/usr/bin/env node
/* ───── Bring de levende AAG-grupper i takt med JSON-filerne ─────
 *
 *   node scripts/ads/aag/sync.mjs            # tørløb: viser hvad der ville ske
 *   node scripts/ads/aag/sync.mjs --udfoer   # fjerner forældede grupper og opretter nye
 *
 * En gruppe kendes på sit navn efter "AAGn: ". Findes navnet i kontoen, men
 * gruppens annonce (overskrifter + beskrivelser) eller keywords afviger fra
 * JSON'en, fjernes gruppen og oprettes igen fra filen. Findes navnet ikke,
 * oprettes gruppen. En gruppe uden fil, hvis keywords er præcis en fils, er
 * afløst af den (omdøbt produkt) og fjernes; andre grupper uden fil lades stå.
 *
 * Kør den EFTER deploy af nye priser: annoncen må ikke love én pris, mens
 * siden viser en anden.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { CAMPAIGN_ID, CUSTOMER_ID, connect, mutate, search } from "../lib.mjs";

const udfoer = process.argv.includes("--udfoer");
const DIR = path.dirname(new URL(import.meta.url).pathname);
const filer = fs.readdirSync(DIR).filter((f) => f.endsWith(".json")).sort();
const oensket = new Map(filer.map((f) => { const g = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")); return [g.name.replace(/^AAG:\s*/, ""), { fil: f, g }]; }));

const { creds, token } = await connect();
const grupper = await search(token, creds,
  `SELECT ad_group.id, ad_group.name, ad_group.status FROM ad_group WHERE campaign.id = ${CAMPAIGN_ID} AND ad_group.status != 'REMOVED' AND ad_group.name LIKE 'AAG%'`);
const ads = await search(token, creds,
  `SELECT ad_group.id, ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.ad.responsive_search_ad.descriptions FROM ad_group_ad WHERE campaign.id = ${CAMPAIGN_ID} AND ad_group_ad.status != 'REMOVED' AND ad_group.name LIKE 'AAG%'`);
const kws = await search(token, creds,
  `SELECT ad_group.id, ad_group_criterion.keyword.text FROM ad_group_criterion WHERE campaign.id = ${CAMPAIGN_ID} AND ad_group_criterion.status != 'REMOVED' AND ad_group_criterion.negative = FALSE AND ad_group_criterion.type = 'KEYWORD' AND ad_group.name LIKE 'AAG%'`);
const adAf = new Map(ads.map((r) => [r.adGroup.id, r.adGroupAd.ad.responsiveSearchAd]));
const kwAf = new Map();
for (const r of kws) { const l = kwAf.get(r.adGroup.id) ?? []; l.push(r.adGroupCriterion.keyword.text.toLowerCase()); kwAf.set(r.adGroup.id, l); }

const live = new Map(grupper.map((r) => [r.adGroup.name.replace(/^AAG\d+:\s*/, ""), r.adGroup]));
const opret = [], fjern = [];
for (const [navn, { fil, g }] of oensket) {
  const l = live.get(navn);
  if (!l) { opret.push(fil); continue; }
  const rsa = adAf.get(l.id);
  const h = (rsa?.headlines ?? []).map((x) => x.text).sort().join("|"), d = (rsa?.descriptions ?? []).map((x) => x.text).sort().join("|");
  const k = (kwAf.get(l.id) ?? []).sort().join("|");
  const ens = h === [...g.headlines].sort().join("|") && d === [...g.descriptions].sort().join("|") && k === g.keywords.map((x) => x.text.toLowerCase()).sort().join("|");
  if (!ens) { fjern.push(l); opret.push(fil); }
}
// Grupper uden fil: er keywords præcis en fils keywords, er gruppen afløst af den
// (omdøbt produkt) og fjernes; ellers bliver den stående — fx AAG1, der er håndlavet.
const filKw = new Set([...oensket.values()].map(({ g }) => g.keywords.map((x) => x.text.toLowerCase()).sort().join("|")));
for (const [navn, l] of live) {
  if (oensket.has(navn)) continue;
  const k = (kwAf.get(l.id) ?? []).sort().join("|");
  if (k && filKw.has(k)) fjern.push(l);
  else if (l.status === "ENABLED") console.log("    lades stå (uden fil):", l.name);
}

console.log(`${oensket.size} filer · ${live.size} grupper i kontoen`);
console.log(`  uændrede: ${oensket.size - opret.length} · genskabes/afløses: ${fjern.length} · nye: ${opret.length}`);
for (const l of fjern) console.log("    fjern ", l.name);
if (!udfoer) { console.log("Tørløb. Tilføj --udfoer."); process.exit(0); }

const ops = fjern.map((l) => ({ adGroupOperation: { remove: `customers/${CUSTOMER_ID}/adGroups/${l.id}` } }));
if (ops.length) { await mutate(token, creds, ops, true); await mutate(token, creds, ops, false); console.log(`fjernet ${fjern.length}`); }
for (const fil of opret) {
  const ud = execFileSync("node", [path.join(DIR, "..", "create-ad-group.mjs"), path.join(DIR, fil), "--opret"], { encoding: "utf8" });
  console.log("  " + (ud.match(/OPRETTET.*|FEJL.*/)?.[0] ?? ud.trim().split("\n").pop()));
}
