#!/usr/bin/env node
/* ───── Upload nyt firmalogo til Google Ads ─────
 *
 *   node scripts/ads/upload-logo.mjs <logo-1x1.png> <logo-4x1.png>            # tørløb
 *   node scripts/ads/upload-logo.mjs <logo-1x1.png> <logo-4x1.png> --udfoer   # skriver
 *
 * Gør tre ting i én mutate (alt-eller-intet):
 *
 *   1. Opretter de to billeder som IMAGE-assets.
 *   2. Sætter det kvadratiske som BUSINESS_LOGO på kontoniveau og på
 *      search-kampagnen (det er det der vises i cirklen ved siden af
 *      firmanavnet i søgeannoncer).
 *   3. Lægger begge ind som LOGO / LANDSCAPE_LOGO i alle aktivgrupper i
 *      Performance Max-kampagnen (GOOGLE_ADS_PMAX_CAMPAIGN_ID).
 *
 * Google tillader kun ÉT firmalogo pr. konto og pr. kampagne, så de gamle
 * BUSINESS_LOGO-links fjernes (selve billedet bliver i kontoen og kan
 * linkes igen). I aktivgrupperne er der plads til fem, så dér pauses de
 * gamle blot.
 *
 * Krav fra Google: 1:1 mindst 128×128 (anbefalet 1200×1200), 4:1 mindst
 * 512×128 (anbefalet 1200×300), PNG/JPG, højst 5 MB.
 */

import fs from "node:fs";
import path from "node:path";
import { CAMPAIGN_ID, CUSTOMER_ID, connect, mutate, search } from "./lib.mjs";

const PMAX_CAMPAIGN_ID = process.env.GOOGLE_ADS_PMAX_CAMPAIGN_ID ?? "24148385473";

const [, , squarePath, widePath, ...flags] = process.argv;
const udfoer = flags.includes("--udfoer");
if (!squarePath || !widePath) {
  console.error("Brug: node scripts/ads/upload-logo.mjs <logo-1x1.png> <logo-4x1.png> [--udfoer]");
  process.exit(1);
}

/** PNG-dimensioner fra IHDR — nok til at fange en forkert fil før Google gør. */
function pngSize(file) {
  const b = fs.readFileSync(file);
  if (b.toString("ascii", 1, 4) !== "PNG") throw new Error(`${file} er ikke en PNG`);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), bytes: b.length, data: b.toString("base64") };
}

const sq = pngSize(squarePath);
const wd = pngSize(widePath);
if (sq.w !== sq.h || sq.w < 128) throw new Error(`Kvadratisk logo skal være 1:1 og mindst 128 px, fik ${sq.w}×${sq.h}`);
if (wd.w !== wd.h * 4 || wd.h < 128) throw new Error(`Bredt logo skal være 4:1 og mindst 512×128, fik ${wd.w}×${wd.h}`);
if (sq.bytes > 5e6 || wd.bytes > 5e6) throw new Error("Logo over 5 MB");

const { creds, token } = await connect();
const cid = CUSTOMER_ID;
const stamp = new Date().toISOString().slice(0, 10);

// ── Hvad ligger der nu? ──────────────────────────────────────────────────
const oldCustomer = await search(
  token,
  creds,
  `SELECT customer_asset.asset, customer_asset.status FROM customer_asset
   WHERE customer_asset.field_type = 'BUSINESS_LOGO' AND customer_asset.status = 'ENABLED'`,
);
const oldCampaign = await search(
  token,
  creds,
  `SELECT campaign.id, campaign_asset.asset, campaign_asset.status FROM campaign_asset
   WHERE campaign_asset.field_type = 'BUSINESS_LOGO' AND campaign_asset.status = 'ENABLED'
   AND campaign.id = ${CAMPAIGN_ID}`,
);
const groups = await search(
  token,
  creds,
  `SELECT campaign.id, asset_group.id, asset_group.name FROM asset_group WHERE campaign.id = ${PMAX_CAMPAIGN_ID}`,
);
const oldGroupLogos = await search(
  token,
  creds,
  `SELECT campaign.id, asset_group_asset.asset_group, asset_group_asset.asset, asset_group_asset.field_type
   FROM asset_group_asset
   WHERE asset_group_asset.field_type IN ('LOGO','LANDSCAPE_LOGO')
   AND asset_group_asset.status = 'ENABLED' AND campaign.id = ${PMAX_CAMPAIGN_ID}`,
);

console.log(`Konto ${cid}`);
console.log(`  Kvadratisk: ${path.basename(squarePath)} ${sq.w}×${sq.h} (${(sq.bytes / 1024).toFixed(0)} KB)`);
console.log(`  Bredt:      ${path.basename(widePath)} ${wd.w}×${wd.h} (${(wd.bytes / 1024).toFixed(0)} KB)`);
console.log(`  Nuværende BUSINESS_LOGO på konto:    ${oldCustomer.map((r) => r.customerAsset.asset).join(", ") || "ingen"}`);
console.log(`  Nuværende BUSINESS_LOGO på kampagne: ${oldCampaign.map((r) => r.campaignAsset.asset).join(", ") || "ingen"}`);
console.log(`  PMax-aktivgrupper (${groups.length}): ${groups.map((g) => g.assetGroup.name).join(" · ")}`);
console.log(`  Gamle logo-links i aktivgrupper: ${oldGroupLogos.length}`);

// ── Operationer ──────────────────────────────────────────────────────────
const SQ = `customers/${cid}/assets/-1`;
const WD = `customers/${cid}/assets/-2`;
const ops = [
  {
    assetOperation: {
      create: { resourceName: SQ, name: `logo-1x1-${stamp}`, type: "IMAGE", imageAsset: { data: sq.data } },
    },
  },
  {
    assetOperation: {
      create: { resourceName: WD, name: `logo-4x1-${stamp}`, type: "IMAGE", imageAsset: { data: wd.data } },
    },
  },
];
// Gamle links FØRST: Google tjekker grænsen på ét business-logo mod tilstanden
// før hver operation, så fjernelsen skal ligge før det nye link i batchen.
for (const r of oldCustomer) {
  ops.push({
    customerAssetOperation: {
      remove: `customers/${cid}/customerAssets/${r.customerAsset.asset.split("/").pop()}~BUSINESS_LOGO`,
    },
  });
}
for (const r of oldCampaign) {
  ops.push({
    campaignAssetOperation: {
      remove: `customers/${cid}/campaignAssets/${CAMPAIGN_ID}~${r.campaignAsset.asset.split("/").pop()}~BUSINESS_LOGO`,
    },
  });
}
for (const r of oldGroupLogos) {
  ops.push({
    assetGroupAssetOperation: {
      update: { resourceName: r.assetGroupAsset.resourceName, status: "PAUSED" },
      updateMask: "status",
    },
  });
}

ops.push({ customerAssetOperation: { create: { asset: SQ, fieldType: "BUSINESS_LOGO" } } });
ops.push({
  campaignAssetOperation: {
    create: { campaign: `customers/${cid}/campaigns/${CAMPAIGN_ID}`, asset: SQ, fieldType: "BUSINESS_LOGO" },
  },
});
for (const g of groups) {
  const ag = g.assetGroup.resourceName;
  ops.push({ assetGroupAssetOperation: { create: { assetGroup: ag, asset: SQ, fieldType: "LOGO" } } });
  ops.push({ assetGroupAssetOperation: { create: { assetGroup: ag, asset: WD, fieldType: "LANDSCAPE_LOGO" } } });
}
console.log(`\n${ops.length} operationer: 2 assets, 2 business-logo-links, ${groups.length * 2} aktivgruppe-links, ${
  oldCustomer.length + oldCampaign.length + oldGroupLogos.length
} gamle links fjernes/pauses.`);

// ── Preflight altid; skriv kun med --udfoer ─────────────────────────────
await mutate(token, creds, ops, true);
console.log("Preflight (validateOnly): OK — Google ville godkende ændringen.");

if (!udfoer) {
  console.log("Tørløb. Tilføj --udfoer for at uploade.");
  process.exit(0);
}

const res = await mutate(token, creds, ops, false);
const names = (res.mutateOperationResponses ?? []).map((r) => Object.values(r)[0]?.resourceName).filter(Boolean);
console.log("\nOprettet/ændret:");
for (const n of names) console.log("  " + n);
console.log(`\nSe dem her: https://ads.google.com/aw/assetreport/associations?ocid=&__c=${cid}`);
