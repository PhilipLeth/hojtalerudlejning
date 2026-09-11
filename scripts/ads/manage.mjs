#!/usr/bin/env node
/* ───── Ret i eksisterende annoncegrupper (admin) ─────
 *
 * De fire ting man faktisk gør efter en gruppe er bygget: omdøbe, flytte
 * buddet, tænde/slukke, og lukke en frase ud af en bred gruppe med et
 * negativt keyword.
 *
 *   node scripts/ads/manage.mjs vis      <id>
 *   node scripts/ads/manage.mjs omdoeb   <id> "AAG: Nyt navn"
 *   node scripts/ads/manage.mjs bud      <id> 6.50
 *   node scripts/ads/manage.mjs status   <id> paused|enabled
 *   node scripts/ads/manage.mjs negativ  <id> "fest højtalere" [exact|phrase]
 *
 * Uden --udfoer er alt tørløb: scriptet viser nuværende tilstand, hvad der
 * ville ændres, og kører ændringen gennem Googles validateOnly — men skriver
 * ikke. Tilføj --udfoer for at gemme.
 *
 * `negativ` er den handling der frigør en ultrasmal gruppe: ejer AG 1 frasen
 * som phrase, byder den mod din nye exact-gruppe. Et exact-negativ i den
 * gamle gruppe lukker præcis den ene søgning ud og lader resten køre.
 */

import { CAMPAIGN_ID, CUSTOMER_ID, adGroupUrl, connect, mutate, search } from "./lib.mjs";

const KR = (micros) => (Number(micros) / 1e6).toFixed(2);

async function visGruppe(token, creds, id) {
  const rows = await search(
    token,
    creds,
    `SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.cpc_bid_micros, campaign.name
     FROM ad_group WHERE ad_group.id = ${id}`,
  );
  if (!rows.length) throw new Error(`Ingen annoncegruppe med id ${id} i konto ${CUSTOMER_ID}`);
  const g = rows[0].adGroup;
  console.log(`Gruppe:   ${g.name}`);
  console.log(`Id:       ${g.id}   ·   kampagne: ${rows[0].campaign.name}`);
  console.log(`Status:   ${g.status}   ·   bud: ${KR(g.cpcBidMicros)} kr`);

  const kws = await search(
    token,
    creds,
    `SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.negative
     FROM ad_group_criterion
     WHERE ad_group.id = ${id} AND ad_group_criterion.type = 'KEYWORD'`,
  );
  const pos = kws.filter((k) => !k.adGroupCriterion.negative);
  const neg = kws.filter((k) => k.adGroupCriterion.negative);
  console.log(`Keywords: ${pos.map((k) => `[${k.adGroupCriterion.keyword.text}] ${k.adGroupCriterion.keyword.matchType}`).join("  ") || "—"}`);
  console.log(`Negativ:  ${neg.map((k) => k.adGroupCriterion.keyword.text).join(", ") || "—"}`);
  console.log(adGroupUrl(id));
  return g;
}

/** Én operation + updateMask, som Googles REST-API kræver ved update. */
function opdater(id, felter, mask) {
  return {
    adGroupOperation: {
      update: { resourceName: `customers/${CUSTOMER_ID}/adGroups/${id}`, ...felter },
      updateMask: mask,
    },
  };
}

async function main() {
  const [kommando, id, ...rest] = process.argv.slice(2);
  const udfoer = rest.includes("--udfoer");
  const arg = rest.filter((a) => !a.startsWith("--"));

  if (!kommando || !id) {
    console.error("Brug: node scripts/ads/manage.mjs <vis|omdoeb|bud|status|negativ> <id> [værdi] [--udfoer]");
    process.exit(1);
  }

  const { creds, token } = await connect();
  const foer = await visGruppe(token, creds, id);
  console.log("");

  if (kommando === "vis") return;

  let ops;
  let hvad;

  if (kommando === "omdoeb") {
    const navn = arg[0];
    if (!navn) throw new Error('Mangler navn. Fx: omdoeb 197832499177 "AAG: Nyt navn"');
    if (navn.length > 255) throw new Error(`Navnet er for langt: ${navn.length} tegn (max 255)`);
    hvad = `Navn: "${foer.name}"  →  "${navn}"`;
    ops = [opdater(id, { name: navn }, "name")];
  } else if (kommando === "bud") {
    const kr = Number(arg[0]);
    if (!Number.isFinite(kr) || kr < 1 || kr > 50) throw new Error("Buddet skal være mellem 1 og 50 kr");
    hvad = `Bud: ${KR(foer.cpcBidMicros)} kr  →  ${kr.toFixed(2)} kr`;
    ops = [opdater(id, { cpcBidMicros: String(Math.round(kr * 1e6)) }, "cpc_bid_micros")];
  } else if (kommando === "status") {
    const ny = (arg[0] ?? "").toUpperCase();
    if (!["ENABLED", "PAUSED"].includes(ny)) throw new Error("Status skal være enabled eller paused");
    hvad = `Status: ${foer.status}  →  ${ny}`;
    ops = [opdater(id, { status: ny }, "status")];
  } else if (kommando === "negativ") {
    const frase = arg[0];
    const match = (arg[1] ?? "EXACT").toUpperCase();
    if (!frase) throw new Error('Mangler frase. Fx: negativ 199318678553 "fest højtalere"');
    if (!["EXACT", "PHRASE", "BROAD"].includes(match)) throw new Error("Match skal være exact, phrase eller broad");
    hvad = `Negativt keyword i gruppen: [${frase}] ${match}`;
    ops = [
      {
        adGroupCriterionOperation: {
          create: {
            adGroup: `customers/${CUSTOMER_ID}/adGroups/${id}`,
            negative: true,
            keyword: { text: frase.toLowerCase(), matchType: match },
          },
        },
      },
    ];
  } else {
    throw new Error(`Ukendt kommando: ${kommando}`);
  }

  console.log(`Ændring:  ${hvad}`);

  // Preflight altid — også i tørløb. Så ved man om Google ville godtage den.
  await mutate(token, creds, ops, true);
  console.log("Preflight hos Google: OK");

  if (!udfoer) {
    console.log("\nTørløb. Intet er ændret. Kør igen med --udfoer for at gemme.");
    return;
  }

  await mutate(token, creds, ops, false);
  console.log("\nGEMT.");
  console.log("");
  await visGruppe(token, creds, id);
}

main().catch((e) => {
  console.error("FEJL:", e.message);
  process.exit(1);
});
