#!/usr/bin/env node
/* ───── Middelvejen: AAG-bud op til første side, budget op til 350 kr ─────
 *
 * Baggrund (18. sep 2026): buddene blev sænket 24.–25. aug og igen 13.–15.
 * sep til 4 kr (Soundboks) og 6,50 kr (resten). Googles estimat for første
 * side ligger på 8–22 kr på kernetermerne, så stort set alle keywords stod
 * "below first page bid". Visninger faldt fra ~450 til ~40 om dagen, tabt
 * impression share på rank steg fra 25 % til 80 %, og der har ikke været én
 * konvertering siden 26. aug. Tabt på budget var 0 % — det er buddene, ikke
 * budgettet.
 *
 * Reglen er bevidst en mellemvej, ikke en tilbagevenden til 19–34 kr pr.
 * klik fra ugen før knækket:
 *
 *   Soundboks-grupper   → 8 kr    (lav ordreværdi, 595 kr)
 *   Øvrige AAG-grupper  → Googles første-side-estimat (højeste keyword i
 *                         gruppen), rundet op til nærmeste 0,50, men mindst
 *                         9 kr og højst 12 kr. Ingen estimat → 9 kr.
 *   Kampagnebudget      → 350 kr/dag (var 100)
 *
 * De gamle AG 1–15 (phrase-grupper) rører scriptet ikke. Tørløb er standard;
 * alt kører gennem Googles validateOnly først. Tilføj --udfoer for at gemme.
 *
 *   node scripts/ads/middelvej.mjs            # vis hvad der ville ske
 *   node scripts/ads/middelvej.mjs --udfoer   # gem
 */

import { CAMPAIGN_ID, CUSTOMER_ID, connect, mutate, search } from "./lib.mjs";

const BUDGET_ID = "15673984485";
const BUDGET_KR = 350;
const SOUNDBOKS_KR = 8;
const MIN_KR = 9;
const MAX_KR = 12;

const kr = (micros) => Number(micros) / 1e6;
const opTilHalve = (x) => Math.ceil(x * 2) / 2;

function nytBud(navn, foersteSide) {
  if (/soundboks/i.test(navn)) return SOUNDBOKS_KR;
  if (foersteSide == null) return MIN_KR;
  return Math.min(MAX_KR, Math.max(MIN_KR, opTilHalve(foersteSide)));
}

async function main() {
  const udfoer = process.argv.includes("--udfoer");
  const { creds, token } = await connect();

  const rows = await search(
    token,
    creds,
    `SELECT ad_group.id, ad_group.name, ad_group.cpc_bid_micros,
            ad_group_criterion.keyword.text,
            ad_group_criterion.position_estimates.first_page_cpc_micros
     FROM keyword_view
     WHERE campaign.id = ${CAMPAIGN_ID}
       AND ad_group.status = 'ENABLED'
       AND ad_group_criterion.status = 'ENABLED'
       AND ad_group.name LIKE 'AAG%'`,
  );

  const grupper = new Map();
  for (const r of rows) {
    const g = grupper.get(r.adGroup.id) ?? { navn: r.adGroup.name, bud: kr(r.adGroup.cpcBidMicros), foersteSide: null };
    const fp = r.adGroupCriterion.positionEstimates?.firstPageCpcMicros;
    if (fp != null) g.foersteSide = Math.max(g.foersteSide ?? 0, kr(fp));
    grupper.set(r.adGroup.id, g);
  }

  const ops = [];
  const nr = (navn) => Number(/AAG(\d+)/.exec(navn)?.[1] ?? 0);
  for (const [id, g] of [...grupper].sort((a, b) => nr(a[1].navn) - nr(b[1].navn))) {
    const nyt = nytBud(g.navn, g.foersteSide);
    const fp = g.foersteSide == null ? "  —  " : g.foersteSide.toFixed(2).padStart(5);
    const mark = nyt === g.bud ? " " : "*";
    console.log(`${mark} ${g.navn.slice(0, 52).padEnd(52)}  1.side ${fp}   ${g.bud.toFixed(2)} → ${nyt.toFixed(2)} kr`);
    if (nyt === g.bud) continue;
    ops.push({
      adGroupOperation: {
        update: { resourceName: `customers/${CUSTOMER_ID}/adGroups/${id}`, cpcBidMicros: String(Math.round(nyt * 1e6)) },
        updateMask: "cpc_bid_micros",
      },
    });
  }

  const [budget] = await search(
    token,
    creds,
    `SELECT campaign_budget.amount_micros FROM campaign_budget WHERE campaign_budget.id = ${BUDGET_ID}`,
  );
  const budgetNu = kr(budget.campaignBudget.amountMicros);
  console.log(`\nKampagnebudget: ${budgetNu.toFixed(0)} → ${BUDGET_KR} kr/dag`);
  if (budgetNu !== BUDGET_KR) {
    ops.push({
      campaignBudgetOperation: {
        update: { resourceName: `customers/${CUSTOMER_ID}/campaignBudgets/${BUDGET_ID}`, amountMicros: String(BUDGET_KR * 1e6) },
        updateMask: "amount_micros",
      },
    });
  }

  console.log(`\n${grupper.size} aktive AAG-grupper, ${ops.length} ændringer.`);
  if (!ops.length) return;

  await mutate(token, creds, ops, true);
  console.log("Preflight hos Google: OK");

  if (!udfoer) {
    console.log("\nTørløb. Intet er ændret. Kør igen med --udfoer for at gemme.");
    return;
  }
  await mutate(token, creds, ops, false);
  console.log(`\nGEMT — ${ops.length} ændringer skrevet til konto ${CUSTOMER_ID}.`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
