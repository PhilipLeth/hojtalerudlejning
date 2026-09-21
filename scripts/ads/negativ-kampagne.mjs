#!/usr/bin/env node
/* ───── Negative keywords på KAMPAGNEN ─────
 *
 * manage.mjs kan lægge et negativt keyword i én annoncegruppe. Det duer, når
 * støjen kommer ét sted fra, men ikke når den er geografisk: søgninger på
 * "lej soundboks odense" og "lyd og lys odense" ramte fire forskellige
 * grupper på 30 dage, og kontoen har 122. Et negativ på kampagnen gælder dem
 * alle, også dem der bliver oprettet i morgen.
 *
 * Ingen af de 122 grupper skal altså røres — og grupperne kan ikke komme til
 * at stå med hver sin geo-liste, der driver fra hinanden.
 *
 * Brug:
 *   node scripts/ads/negativ-kampagne.mjs vis
 *   node scripts/ads/negativ-kampagne.mjs tilfoej odense århus            (tørløb)
 *   node scripts/ads/negativ-kampagne.mjs tilfoej odense --match broad --udfoer
 *
 * Standard er BROAD: et bredt negativ blokerer enhver søgning, der indeholder
 * ordet, uanset hvad der ellers står. Det er netop pointen ved en by, vi ikke
 * kører til.
 */
import { CAMPAIGN_ID, CUSTOMER_ID, connect, mutate, search } from "./lib.mjs";

const MATCH = ["EXACT", "PHRASE", "BROAD"];

async function visNegativer(token, creds) {
  const rows = await search(
    token,
    creds,
    `SELECT campaign_criterion.criterion_id, campaign_criterion.keyword.text, campaign_criterion.keyword.match_type
       FROM campaign_criterion
      WHERE campaign.id = ${CAMPAIGN_ID}
        AND campaign_criterion.negative = TRUE
        AND campaign_criterion.type = 'KEYWORD'`,
  );
  const liste = rows
    .map((r) => ({
      text: r.campaignCriterion?.keyword?.text ?? "",
      match: r.campaignCriterion?.keyword?.matchType ?? "",
    }))
    .sort((a, b) => a.text.localeCompare(b.text, "da"));

  console.log(`Kampagne ${CAMPAIGN_ID} har ${liste.length} negative keywords:`);
  for (const n of liste) console.log(`  [${n.text}] ${n.match}`);
  return liste;
}

async function main() {
  const argv = process.argv.slice(2);
  const kommando = argv[0];
  const udfoer = argv.includes("--udfoer");
  const matchIdx = argv.indexOf("--match");
  const match = (matchIdx >= 0 ? argv[matchIdx + 1] : "BROAD").toUpperCase();
  const fraser = argv
    .slice(1)
    .filter((a, i) => !a.startsWith("--") && !(matchIdx >= 0 && i === matchIdx))
    .map((f) => f.toLowerCase());

  if (!kommando || !["vis", "tilfoej"].includes(kommando)) {
    console.log("Brug: node scripts/ads/negativ-kampagne.mjs vis | tilfoej <frase...> [--match broad] [--udfoer]");
    process.exit(1);
  }
  if (!MATCH.includes(match)) throw new Error("Match skal være exact, phrase eller broad");

  const { token, creds } = await connect();
  const eksisterende = await visNegativer(token, creds);
  if (kommando === "vis") return;

  if (!fraser.length) throw new Error('Mangler frase. Fx: tilfoej odense');

  const kendte = new Set(eksisterende.map((n) => `${n.text}|${n.match}`));
  const nye = fraser.filter((f) => !kendte.has(`${f}|${match}`));
  const sprunget = fraser.filter((f) => kendte.has(`${f}|${match}`));
  for (const f of sprunget) console.log(`\nStår der allerede: [${f}] ${match} — springes over.`);
  if (!nye.length) {
    console.log("\nIntet at tilføje.");
    return;
  }

  const ops = nye.map((text) => ({
    campaignCriterionOperation: {
      create: {
        campaign: `customers/${CUSTOMER_ID}/campaigns/${CAMPAIGN_ID}`,
        negative: true,
        keyword: { text, matchType: match },
      },
    },
  }));

  console.log(`\nTilføjer til kampagne ${CAMPAIGN_ID}:`);
  for (const f of nye) console.log(`  [${f}] ${match}`);

  // Preflight altid — også i tørløb, jf. mutate() i lib.mjs.
  await mutate(token, creds, ops, true);
  console.log("Preflight hos Google: OK");

  if (!udfoer) {
    console.log("\nTørløb. Intet er ændret. Kør igen med --udfoer for at gemme.");
    return;
  }

  await mutate(token, creds, ops, false);
  console.log("\nGEMT.\n");
  await visNegativer(token, creds);
}

main().catch((e) => {
  console.error("FEJL:", e.message);
  process.exit(1);
});
