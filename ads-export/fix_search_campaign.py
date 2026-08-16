#!/usr/bin/env python3
"""
Selective, quality-score-driven bid changes on "Højtaler Udlejning - Search".

The campaign loses 1.7% of impressions to budget and 61.9% to ad rank, so more
budget buys nothing. But a flat bid increase is the wrong answer too: ad rank is
bid × quality, and on this account quality is the weak term. Landing page
experience is BELOW_AVERAGE on 22 of the 25 keywords that carry impressions,
which is why "fest højtaler" already costs 14.27 kr/click at quality score 3.
Paying more for a bad keyword just makes it a more expensive bad keyword.

So this does two things, in this order:

  1. Pause keywords with quality score <= 3 that have real impressions. There
     are no keyword-level bids in this campaign — every keyword inherits the ad
     group bid — so a weak keyword inside a strong ad group would otherwise ride
     along on any increase.

  2. Raise ad group bids where the surviving keywords justify it. The multiplier
     scales with the ad group's impression-weighted quality score, computed
     *after* step 1, and only applies to ad groups measurably losing impressions
     to ad rank. That loss is read from search_rank_lost_impression_share rather
     than inferred by comparing average CPC to the bid — see the comment on
     RANK_LOST_THRESHOLD for why the inference is wrong.

Stays on MANUAL_CPC. Smart bidding is the better long-term answer but wants far
more conversion data than this account has.

  python3 ads-export/fix_search_campaign.py --customer-id 4410207627
  python3 ads-export/fix_search_campaign.py --customer-id 4410207627 --apply
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from collections import defaultdict

CAMPAIGN_NAME = "Højtaler Udlejning - Search"
DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")

# Quality score at or below this, with enough impressions to be sure, gets paused.
PRUNE_QS_AT_OR_BELOW = 3
PRUNE_MIN_IMPRESSIONS = 10

# An ad group needs this much traffic before its weighted quality score means
# anything.
BID_MIN_IMPRESSIONS = 20

# Share of impressions lost to ad rank before a bid increase is worth making.
# This is measured directly rather than inferred from average CPC: in a
# second-price auction you pay only what it takes to beat the ad below you, so
# an ad group can be hitting its cap on every auction it *loses* while showing a
# comfortable average CPC on the ones it wins. Comparing avg CPC to the bid
# under-detects exactly the groups worth raising — it excluded AG 1, which loses
# 64% of its impressions to rank.
RANK_LOST_THRESHOLD = 0.25

# Weighted quality score → bid multiplier. Below the lowest threshold: no change,
# because the fix there is the landing page, not the wallet.
QS_MULTIPLIERS = [(7.0, 2.0), (6.0, 1.6), (5.0, 1.3)]

DEFAULT_MAX_BID_DKK = 25.0

logger = logging.getLogger("fix_search")


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def gaql_escape(s: str) -> str:
    return s.replace("'", "''")


def fetch_keywords(client, customer_id: str) -> list[dict]:
    ga = client.get_service("GoogleAdsService")
    q = f"""
        SELECT ad_group.resource_name, ad_group.name, ad_group.status,
               ad_group.cpc_bid_micros,
               ad_group_criterion.resource_name, ad_group_criterion.keyword.text,
               ad_group_criterion.quality_info.quality_score,
               ad_group_criterion.quality_info.post_click_quality_score,
               metrics.impressions, metrics.clicks, metrics.average_cpc
        FROM keyword_view
        WHERE campaign.name = '{gaql_escape(CAMPAIGN_NAME)}'
          AND ad_group.status = 'ENABLED'
          AND ad_group_criterion.status = 'ENABLED'
          AND ad_group_criterion.negative = FALSE
          AND segments.date DURING LAST_30_DAYS
    """
    rows = []
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for r in batch.results:
            qs = r.ad_group_criterion.quality_info.quality_score
            rows.append({
                "ad_group_rn": r.ad_group.resource_name,
                "ad_group": r.ad_group.name,
                "bid": r.ad_group.cpc_bid_micros / 1_000_000,
                "criterion_rn": r.ad_group_criterion.resource_name,
                "keyword": r.ad_group_criterion.keyword.text,
                "qs": qs or None,
                "lp": r.ad_group_criterion.quality_info.post_click_quality_score.name,
                "impressions": r.metrics.impressions,
                "clicks": r.metrics.clicks,
                "avg_cpc": r.metrics.average_cpc / 1_000_000,
            })
    return rows


def fetch_share(client, customer_id: str) -> dict[str, dict]:
    """Impression share and rank-lost share per ad group.

    Lives in its own query because impression-share metrics are not selectable
    from keyword_view.
    """
    ga = client.get_service("GoogleAdsService")
    q = f"""
        SELECT ad_group.resource_name, metrics.search_impression_share,
               metrics.search_rank_lost_impression_share
        FROM ad_group
        WHERE campaign.name = '{gaql_escape(CAMPAIGN_NAME)}'
          AND ad_group.status = 'ENABLED'
          AND segments.date DURING LAST_30_DAYS
          AND metrics.impressions > 0
    """
    out = {}
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for r in batch.results:
            out[r.ad_group.resource_name] = {
                "share": r.metrics.search_impression_share,
                "rank_lost": r.metrics.search_rank_lost_impression_share,
            }
    return out


def multiplier_for(weighted_qs: float) -> float:
    for threshold, mult in QS_MULTIPLIERS:
        if weighted_qs >= threshold:
            return mult
    return 1.0


def plan(rows: list[dict], share: dict[str, dict], max_bid: float) -> tuple[list[dict], list[dict]]:
    prune = [
        r for r in rows
        if r["qs"] and r["qs"] <= PRUNE_QS_AT_OR_BELOW
        and r["impressions"] >= PRUNE_MIN_IMPRESSIONS
    ]
    pruned_rns = {r["criterion_rn"] for r in prune}

    groups: dict[str, dict] = defaultdict(
        lambda: {"impressions": 0, "clicks": 0, "cost": 0.0, "qs_weight": 0.0, "qs_impr": 0}
    )
    for r in rows:
        if r["criterion_rn"] in pruned_rns:
            continue  # judge the ad group on what will survive
        g = groups[r["ad_group_rn"]]
        g["name"] = r["ad_group"]
        g["bid"] = r["bid"]
        g["impressions"] += r["impressions"]
        g["clicks"] += r["clicks"]
        g["cost"] += r["avg_cpc"] * r["clicks"]
        if r["qs"]:
            g["qs_weight"] += r["qs"] * r["impressions"]
            g["qs_impr"] += r["impressions"]

    raises = []
    for rn, g in groups.items():
        if g["impressions"] < BID_MIN_IMPRESSIONS or not g["qs_impr"]:
            continue
        s = share.get(rn)
        if not s or s["rank_lost"] < RANK_LOST_THRESHOLD:
            continue  # not losing to rank — a higher bid buys nothing

        weighted_qs = g["qs_weight"] / g["qs_impr"]
        mult = multiplier_for(weighted_qs)
        if mult == 1.0:
            continue  # quality too low to fund; fix the landing page instead

        new_bid = round(min(g["bid"] * mult, max_bid), 2)
        if new_bid <= g["bid"]:
            continue
        raises.append({
            "resource_name": rn, "name": g["name"], "bid": g["bid"], "new_bid": new_bid,
            "qs": weighted_qs,
            "avg_cpc": g["cost"] / g["clicks"] if g["clicks"] else 0.0,
            "impressions": g["impressions"], "clicks": g["clicks"],
            "share": s["share"], "rank_lost": s["rank_lost"],
        })

    return sorted(prune, key=lambda r: -r["impressions"]), sorted(raises, key=lambda r: r["name"])


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    ap = argparse.ArgumentParser(description="Quality-score-driven bid changes.")
    ap.add_argument("--config", default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG))
    ap.add_argument("--customer-id", default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""))
    ap.add_argument("--max-bid", type=float, default=DEFAULT_MAX_BID_DKK)
    ap.add_argument("--apply", action="store_true", help="Write the changes.")
    args = ap.parse_args()

    if not args.customer_id:
        logger.error("--customer-id is required (Lejhøjtaler is 4410207627).")
        return 1
    if not os.path.isfile(args.config):
        logger.error("Missing credentials file: %s", args.config)
        return 1

    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException
    from google.protobuf.field_mask_pb2 import FieldMask

    client = GoogleAdsClient.load_from_storage(args.config)
    customer_id = normalize_customer_id(args.customer_id)

    try:
        rows = fetch_keywords(client, customer_id)
    except GoogleAdsException as e:
        logger.error("Could not read keywords: %s", e)
        return 1

    if not rows:
        logger.error("No enabled keywords with data in %r", CAMPAIGN_NAME)
        return 1

    try:
        share = fetch_share(client, customer_id)
    except GoogleAdsException as e:
        logger.error("Could not read impression share: %s", e)
        return 1

    prune, raises = plan(rows, share, args.max_bid)

    print(f"\n{CAMPAIGN_NAME} — last 30 days\n")

    print(f"PAUSE — quality score ≤{PRUNE_QS_AT_OR_BELOW} with ≥{PRUNE_MIN_IMPRESSIONS} impressions:")
    if prune:
        for r in prune:
            print(f"  {r['keyword']:<28} QS {r['qs']}  {r['impressions']:>4} vis  "
                  f"{r['clicks']:>3} klik  {r['avg_cpc']:>6.2f} kr  [{r['ad_group']}]")
    else:
        print("  (none)")

    print(f"\nRAISE — losing ≥{RANK_LOST_THRESHOLD*100:.0f}% to rank and quality justifies "
          f"funding it (max {args.max_bid:.0f} kr):")
    if raises:
        for r in raises:
            print(f"  {r['name']:<32} QS {r['qs']:.2f}  bid {r['bid']:>5.2f} → {r['new_bid']:>5.2f} kr"
                  f"   (IS {r['share']*100:.0f}%, tabt på rank {r['rank_lost']*100:.0f}%, "
                  f"avg CPC {r['avg_cpc']:.2f})")
    else:
        print("  (none)")

    untouched = {r["ad_group"] for r in rows} - {r["name"] for r in raises}
    print(f"\nUnchanged ad groups: {len(untouched)} — either not losing to rank, "
          "too little traffic to judge, or quality too low to be worth funding.")

    if not prune and not raises:
        print("\nNothing to do.")
        return 0

    if not args.apply:
        print("\nDry run — nothing was written. Add --apply to commit.")
        return 0

    try:
        if prune:
            ops = []
            for r in prune:
                op = client.get_type("AdGroupCriterionOperation")
                op.update.resource_name = r["criterion_rn"]
                op.update.status = client.enums.AdGroupCriterionStatusEnum.PAUSED
                client.copy_from(op.update_mask, FieldMask(paths=["status"]))
                ops.append(op)
            client.get_service("AdGroupCriterionService").mutate_ad_group_criteria(
                customer_id=customer_id, operations=ops
            )
            logger.info("Paused %d keywords.", len(ops))

        if raises:
            ops = []
            for r in raises:
                op = client.get_type("AdGroupOperation")
                op.update.resource_name = r["resource_name"]
                op.update.cpc_bid_micros = int(round(r["new_bid"] * 1_000_000))
                client.copy_from(op.update_mask, FieldMask(paths=["cpc_bid_micros"]))
                ops.append(op)
            client.get_service("AdGroupService").mutate_ad_groups(
                customer_id=customer_id, operations=ops
            )
            logger.info("Raised bids on %d ad groups.", len(ops))
    except GoogleAdsException as e:
        logger.error("Google Ads rejected the update (request_id %s):", e.request_id)
        for err in e.failure.errors:
            logger.error("  %s", err.message)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
