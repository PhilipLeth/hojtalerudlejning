#!/usr/bin/env node
/* ───── Opret én annoncegruppe i Google Ads fra en JSON-fil ─────
 *
 * Det her er BEVIDST et script og ikke en test. En testkørsel skal kunne
 * gentages uden at ændre noget udenfor; det her kald skriver i en levende
 * annoncekonto og kan ikke fortrydes med et tastetryk. At pakke den slags
 * ind i vitest skjuler præcis den forskel — og et sikkerhedslag stoppede det
 * med rette 10. september 2026.
 *
 *   node scripts/ads/create-ad-group.mjs <gruppe.json>          # tørløb
 *   node scripts/ads/create-ad-group.mjs <gruppe.json> --opret   # skriver
 *
 * Uden --opret køres alt med validateOnly, så Google svarer på om gruppen
 * ville blive godkendt, uden at der oprettes noget.
 *
 * Gruppen bør være valideret af serverens egne guards først (prepareGroup i
 * functions/api/ads-build.ts): tegngrænser, frase i overskrift og
 * beskrivelse, gyldig landingsside, produktrelevans, leveringsområde.
 * Scriptet her gentager dem ikke — det sender det, du giver det.
 *
 * BEMÆRK: en gruppe oprettet herfra bliver IKKE skrevet i ads_mapping i KV.
 * Udsolgt-reglerne i /api/ads-rules er dermed blinde for den. Bygger du via
 * /admin/ads/opret, sker bindingen automatisk — brug helst den vej.
 */

import fs from "node:fs";
import { CAMPAIGN_ID, CUSTOMER_ID, GROUP_NEGATIVES, adGroupUrl, connect, mutate } from "./lib.mjs";

/** Samme opbygning som createAdGroup() i functions/api/_lib/googleads.ts. */
function operations(group, cid) {
  const temp = `customers/${cid}/adGroups/-1`;
  const ops = [
    {
      adGroupOperation: {
        create: {
          resourceName: temp,
          name: group.name,
          campaign: `customers/${cid}/campaigns/${CAMPAIGN_ID}`,
          // Altid pauset. Den tændes bevidst fra /admin/ads.
          status: group.status ?? "PAUSED",
          type: "SEARCH_STANDARD",
          cpcBidMicros: String(Math.round(group.cpcBidMicros ?? 9_000_000)),
        },
      },
    },
  ];

  for (const kw of group.keywords) {
    ops.push({
      adGroupCriterionOperation: {
        create: {
          adGroup: temp,
          status: "ENABLED",
          negative: false,
          keyword: { text: kw.text, matchType: kw.matchType ?? "PHRASE" },
        },
      },
    });
  }

  for (const neg of group.negatives ?? GROUP_NEGATIVES) {
    ops.push({
      adGroupCriterionOperation: {
        create: { adGroup: temp, negative: true, keyword: { text: neg, matchType: "BROAD" } },
      },
    });
  }

  ops.push({
    adGroupAdOperation: {
      create: {
        adGroup: temp,
        status: "ENABLED",
        ad: {
          finalUrls: [group.finalUrl],
          responsiveSearchAd: {
            headlines: group.headlines.map((text) => ({ text })),
            descriptions: group.descriptions.map((text) => ({ text })),
            ...(group.path1 ? { path1: group.path1 } : {}),
          },
        },
      },
    },
  });

  return ops;
}

async function main() {
  const [fil, ...flag] = process.argv.slice(2);
  if (!fil) {
    console.error("Brug: node scripts/ads/create-ad-group.mjs <gruppe.json> [--opret]");
    process.exit(1);
  }
  const opret = flag.includes("--opret");
  const group = JSON.parse(fs.readFileSync(fil, "utf8"));

  console.log(`Gruppe:   ${group.name}`);
  console.log(`Kampagne: ${CAMPAIGN_ID}  ·  konto: ${CUSTOMER_ID}`);
  console.log(`Status:   ${group.status ?? "PAUSED"}  ·  bud: ${(group.cpcBidMicros ?? 9_000_000) / 1e6} kr`);
  console.log(`Keywords: ${group.keywords.map((k) => `[${k.text}] ${k.matchType ?? "PHRASE"}`).join("  ")}`);
  console.log(`Side:     ${group.finalUrl}`);
  console.log("");

  const { creds, token } = await connect();
  const ops = operations(group, CUSTOMER_ID);

  // Preflight altid — også når vi opretter. Uden det kan Google afvise en
  // overskrift efter at gruppen er lagt, og så står kontoen halvt bygget.
  await mutate(token, creds, ops, true);
  console.log("Preflight hos Google: OK");

  if (!opret) {
    console.log("\nTørløb. Intet er oprettet. Kør igen med --opret for at skrive.");
    return;
  }

  const svar = await mutate(token, creds, ops, false);
  const rn = (svar.mutateOperationResponses ?? []).find((r) => r.adGroupResult)?.adGroupResult?.resourceName ?? "";
  const id = rn.split("/").pop();
  console.log(`\nOPRETTET — annoncegruppe ${id}`);
  console.log(adGroupUrl(id));
  console.log("Den står PAUSED. Tænd den bevidst fra /admin/ads, når du har set den efter.");
  console.log("Bemærk: den er ikke bundet i ads_mapping — udsolgt-reglerne ser den ikke.");
}

main().catch((e) => {
  console.error("FEJL:", e.message);
  process.exit(1);
});
