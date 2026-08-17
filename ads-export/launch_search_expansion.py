#!/usr/bin/env python3
"""
Udvid søgningen: tænd Yderområder, og slå søgepartnere til.

Hovedkampagnen "Højtaler Udlejning - Search" rammer kun geo-konstanten
`Copenhagen` (1005010) — altså Københavns Kommune. Placeringsrapporten fra
Performance Max viste efterspørgsel i Frederiksberg, Rødovre, Ishøj,
Albertslund, Taastrup, Værløse, Birkerød, Roskilde, Smørum og Hedehusene, som
søgekampagnen slet ikke kan nå.

Kampagnen til det findes allerede. "Lejhøjtaler — Yderområder" har 9 geo-mål
der dækker netop de områder, 8 annoncegrupper med phrase-keywords og aktive
RSA'er mod de rigtige landingssider. Den har aldrig kørt: pauset, 50 kr i
budget, bud på 0,01 kr.

Tre ting skal rettes før den kan bruges, og den midterste er den vigtigste:

  budget      50 → 400 kr/dag
  budgivning  MAXIMIZE_CONVERSIONS → MANUAL_CPC
  bud         0,01 → 15 kr på alle otte grupper

Budgivningen er ikke en detalje. Smart bidding uden konverteringshistorik er
præcis det, der fik Performance Max til at bruge 590 kr/dag på spil-apps: uden
noget at optimere mod søger den mod det billigste. Hovedkampagnen kører bevidst
MANUAL_CPC indtil AW-tagget leverer data, og den her skal gøre det samme.

Søgepartnere slås til på begge søgekampagner. Det er Googles partnersider —
samme søgeintention som Google selv, typisk billigere klik. Ét felt, nemt at
rulle tilbage hvis søgetermerne ser forkerte ud.

  python3 ads-export/launch_search_expansion.py --customer-id 4410207627
  python3 ads-export/launch_search_expansion.py --customer-id 4410207627 --apply
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

YDER_ID = 24108797469
MAIN_ID = 23973439325

YDER_BUDGET_DKK = 400.0
YDER_BID_DKK = 15.0

DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")

logger = logging.getLogger("search_expansion")


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def read_state(client, customer_id: str) -> dict:
    ga = client.get_service("GoogleAdsService")
    q = f"""
        SELECT campaign.id, campaign.name, campaign.status,
               campaign.bidding_strategy_type,
               campaign.network_settings.target_search_network,
               campaign_budget.resource_name, campaign_budget.amount_micros
        FROM campaign
        WHERE campaign.id IN ({MAIN_ID}, {YDER_ID})
    """
    camps = {}
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for r in batch.results:
            camps[r.campaign.id] = {
                "resource_name": r.campaign.resource_name,
                "name": r.campaign.name,
                "status": r.campaign.status.name,
                "bidding": r.campaign.bidding_strategy_type.name,
                "partners": r.campaign.network_settings.target_search_network,
                "budget_rn": r.campaign_budget.resource_name,
                "budget": r.campaign_budget.amount_micros / 1_000_000,
            }

    q2 = f"""
        SELECT ad_group.resource_name, ad_group.name, ad_group.status,
               ad_group.cpc_bid_micros
        FROM ad_group
        WHERE campaign.id = {YDER_ID} AND ad_group.status != 'REMOVED'
    """
    groups = []
    for batch in ga.search_stream(customer_id=customer_id, query=q2):
        for r in batch.results:
            groups.append({
                "resource_name": r.ad_group.resource_name,
                "name": r.ad_group.name,
                "status": r.ad_group.status.name,
                "bid": r.ad_group.cpc_bid_micros / 1_000_000,
            })
    return {"campaigns": camps, "groups": sorted(groups, key=lambda g: g["name"])}


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    ap = argparse.ArgumentParser(description="Tænd Yderområder og søgepartnere.")
    ap.add_argument("--config", default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG))
    ap.add_argument("--customer-id", default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""))
    ap.add_argument("--budget", type=float, default=YDER_BUDGET_DKK)
    ap.add_argument("--bid", type=float, default=YDER_BID_DKK)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    if not args.customer_id:
        logger.error("--customer-id er påkrævet (Lejhøjtaler er 4410207627).")
        return 1
    if not os.path.isfile(args.config):
        logger.error("Mangler credentials: %s", args.config)
        return 1

    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException
    from google.protobuf.field_mask_pb2 import FieldMask

    client = GoogleAdsClient.load_from_storage(args.config)
    customer_id = normalize_customer_id(args.customer_id)
    state = read_state(client, customer_id)

    yder = state["campaigns"].get(YDER_ID)
    main = state["campaigns"].get(MAIN_ID)
    if not yder or not main:
        logger.error("Fandt ikke begge kampagner.")
        return 1

    print(f"\n{yder['name']}")
    print(f"  status      {yder['status']}  →  ENABLED")
    print(f"  budget      {yder['budget']:.0f} kr  →  {args.budget:.0f} kr")
    print(f"  budgivning  {yder['bidding']}  →  MANUAL_CPC")
    print(f"  {len(state['groups'])} annoncegrupper, bud → {args.bid:.0f} kr, alle tændes:")
    for g in state["groups"]:
        print(f"      {g['name']:<32} {g['status']:<8} {g['bid']:>5.2f} kr")

    print("\nSøgepartnere:")
    for c in (main, yder):
        print(f"  {c['name']:<34} {'allerede til' if c['partners'] else 'FRA  →  TIL'}")

    if not args.apply:
        print("\nTørkørsel — intet skrevet. Tilføj --apply.")
        return 0

    try:
        # Budget først. Tændes kampagnen før budgettet er hævet, kan den nå at
        # bruge de gamle 50 kr op og stoppe samme dag.
        b_op = client.get_type("CampaignBudgetOperation")
        b_op.update.resource_name = yder["budget_rn"]
        b_op.update.amount_micros = int(args.budget * 1_000_000)
        client.copy_from(b_op.update_mask, FieldMask(paths=["amount_micros"]))
        client.get_service("CampaignBudgetService").mutate_campaign_budgets(
            customer_id=customer_id, operations=[b_op]
        )

        # Bud på grupperne før kampagnen tændes, ellers serverer de intet.
        ag_ops = []
        for g in state["groups"]:
            op = client.get_type("AdGroupOperation")
            op.update.resource_name = g["resource_name"]
            op.update.cpc_bid_micros = int(args.bid * 1_000_000)
            op.update.status = client.enums.AdGroupStatusEnum.ENABLED
            client.copy_from(op.update_mask, FieldMask(paths=["cpc_bid_micros", "status"]))
            ag_ops.append(op)
        client.get_service("AdGroupService").mutate_ad_groups(
            customer_id=customer_id, operations=ag_ops
        )

        camp_ops = []
        # Yderområder: budgivning, status og søgepartnere i én opdatering.
        y_op = client.get_type("CampaignOperation")
        y_op.update.resource_name = yder["resource_name"]
        # manual_cpc kan ikke stå alene i masken — den har underfelter, og
        # API'et svarer "The field mask updated a field with subfields".
        # Underfeltet skal med, og så skifter budgivningsstrategien med.
        y_op.update.manual_cpc.enhanced_cpc_enabled = False
        y_op.update.status = client.enums.CampaignStatusEnum.ENABLED
        y_op.update.network_settings.target_search_network = True
        client.copy_from(y_op.update_mask, FieldMask(paths=[
            "manual_cpc.enhanced_cpc_enabled",
            "status",
            "network_settings.target_search_network",
        ]))
        camp_ops.append(y_op)

        m_op = client.get_type("CampaignOperation")
        m_op.update.resource_name = main["resource_name"]
        m_op.update.network_settings.target_search_network = True
        client.copy_from(m_op.update_mask,
                         FieldMask(paths=["network_settings.target_search_network"]))
        camp_ops.append(m_op)

        client.get_service("CampaignService").mutate_campaigns(
            customer_id=customer_id, operations=camp_ops
        )
    except GoogleAdsException as e:
        logger.error("Google Ads afviste (request_id %s):", e.request_id)
        for err in e.failure.errors:
            loc = ".".join(str(p.field_name) for p in err.location.field_path_elements)
            logger.error("  %s — %s", loc or "?", err.message)
        return 1

    # Læs tilbage — en mutation der intet ændrede svarer også success.
    after = read_state(client, customer_id)
    y, m = after["campaigns"][YDER_ID], after["campaigns"][MAIN_ID]
    problems = []
    if y["status"] != "ENABLED":
        problems.append(f"Yderområder er {y['status']}")
    if y["bidding"] != "MANUAL_CPC":
        problems.append(f"budgivning er {y['bidding']}")
    if abs(y["budget"] - args.budget) > 0.01:
        problems.append(f"budget er {y['budget']}")
    if not (y["partners"] and m["partners"]):
        problems.append("søgepartnere ikke slået til på begge")
    stale = [g["name"] for g in after["groups"] if g["status"] != "ENABLED" or g["bid"] < 1]
    if stale:
        problems.append("grupper ikke klar: " + ", ".join(stale))
    if problems:
        logger.error("Verifikation fejlede: %s", "; ".join(problems))
        return 1

    logger.info("Yderområder kører: %.0f kr/dag, MANUAL_CPC, %d grupper à %.0f kr. "
                "Søgepartnere til på begge kampagner.",
                y["budget"], len(after["groups"]), args.bid)
    return 0


if __name__ == "__main__":
    sys.exit(main())
