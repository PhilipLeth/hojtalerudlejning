#!/usr/bin/env python3
"""
Repair the bids on "Højtaler Udlejning - Search".

The campaign has a 1000 kr/day budget and spends about 40 kr of it. Budget is
not the constraint — over the last 30 days it lost 1.7% of impressions to
budget and 61.9% to ad rank. Two separate causes:

  1. The five ad groups that actually run bid 6.80-16 kr against an average CPC
     of 9.30. They are outbid, not out of money.
  2. The 27 paused ad groups all sit at 0.01 kr, set by an earlier pause script.
     Enabling one without fixing its bid changes nothing — it just sits there
     eligible and never wins an auction.

Deliberately stays on MANUAL_CPC. Smart bidding is the better answer, but not
while page_view, session_start, user_engagement, first_visit, scroll and
form_start are all primary PURCHASE conversions in this account — a
maximize-conversions strategy would bid toward pageviews. Fix the goals first,
then switch.

  python3 ads-export/fix_search_campaign.py                             # dry run
  python3 ads-export/fix_search_campaign.py --apply --customer-id 4410207627
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

CAMPAIGN_NAME = "Højtaler Udlejning - Search"
DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")

# Bid ceiling, not a bid. Manual CPC charges what it takes to beat the ad below,
# so raising the cap buys impression share without necessarily raising CPC to
# the cap. 30 kr against a 9.30 kr average leaves room to win the auctions
# currently lost on rank.
DEFAULT_BID_DKK = 30.0

# The occasion ad groups already point at the right landing pages and were left
# paused pending conversion tracking. Naming is stable ("AG 16 - Bryllup" etc).
OCCASION_PREFIXES = (
    "AG 16", "AG 17", "AG 18", "AG 19", "AG 20", "AG 21", "AG 22", "AG 23",
)

logger = logging.getLogger("fix_search")


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def gaql_escape(s: str) -> str:
    return s.replace("'", "''")


def fetch_ad_groups(client, customer_id: str) -> list[dict]:
    ga = client.get_service("GoogleAdsService")
    q = f"""
        SELECT ad_group.resource_name, ad_group.name, ad_group.status,
               ad_group.cpc_bid_micros, campaign.id, campaign.name
        FROM ad_group
        WHERE campaign.name = '{gaql_escape(CAMPAIGN_NAME)}'
          AND ad_group.status != 'REMOVED'
    """
    rows = []
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for row in batch.results:
            rows.append({
                "resource_name": row.ad_group.resource_name,
                "name": row.ad_group.name,
                "status": row.ad_group.status.name,
                "bid": row.ad_group.cpc_bid_micros / 1_000_000,
            })
    return sorted(rows, key=lambda r: r["name"])


def report_duplicates(groups: list[dict]) -> None:
    """Four ad groups exist twice under slightly different names. In a single
    campaign duplicates split the data and compete in the same auction."""
    by_suffix: dict[str, list[str]] = {}
    for g in groups:
        # "AG 9 - PA-anlæg og lydudstyr" and "PA-anlæg og lydudstyr" collapse here.
        key = g["name"].split(" - ", 1)[-1].split(" — ", 1)[-1].strip().lower()
        by_suffix.setdefault(key, []).append(g["name"])

    dupes = {k: v for k, v in by_suffix.items() if len(v) > 1}
    if not dupes:
        return
    print("\nDuplicate ad groups — same target under two names:")
    for names in dupes.values():
        print("  " + "  |  ".join(names))
    print("  These split impressions and data. Worth removing the empty twin by hand.")


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    ap = argparse.ArgumentParser(description="Repair bids on the search campaign.")
    ap.add_argument("--config", default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG))
    ap.add_argument("--customer-id", default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""))
    ap.add_argument("--bid", type=float, default=DEFAULT_BID_DKK, help="Max CPC in DKK.")
    ap.add_argument("--apply", action="store_true", help="Write the changes.")
    ap.add_argument(
        "--enable-occasions",
        action="store_true",
        help="Also set the eight occasion ad groups (AG 16-23) to ENABLED.",
    )
    args = ap.parse_args()

    if not os.path.isfile(args.config):
        logger.error("Missing credentials file: %s", args.config)
        return 1
    if not args.customer_id:
        logger.error("--customer-id is required (Lejhøjtaler is 4410207627).")
        return 1

    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException

    client = GoogleAdsClient.load_from_storage(args.config)
    customer_id = normalize_customer_id(args.customer_id)

    try:
        groups = fetch_ad_groups(client, customer_id)
    except GoogleAdsException as e:
        logger.error("Could not read ad groups: %s", e)
        return 1

    if not groups:
        logger.error("No ad groups found in %r", CAMPAIGN_NAME)
        return 1

    target_micros = int(args.bid * 1_000_000)
    changes = []
    for g in groups:
        new_bid = g["bid"] != args.bid
        enable = args.enable_occasions and g["status"] == "PAUSED" and any(
            g["name"].startswith(p) for p in OCCASION_PREFIXES
        )
        if new_bid or enable:
            changes.append({**g, "enable": enable})

    print(f"\n{CAMPAIGN_NAME} — {len(groups)} ad groups "
          f"({sum(1 for g in groups if g['status'] == 'ENABLED')} enabled)")
    print(f"Target max CPC: {args.bid:.2f} kr\n")

    for c in changes:
        flag = "  ENABLE" if c["enable"] else ""
        print(f"  {c['name']:<44} {c['status']:<8} {c['bid']:>7.2f} → {args.bid:.2f} kr{flag}")

    print(f"\n{len(changes)} ad group(s) would change.")
    report_duplicates(groups)

    if not args.apply:
        print("\nDry run — nothing was written. Add --apply to commit.")
        return 0

    from google.api_core import protobuf_helpers

    service = client.get_service("AdGroupService")
    ops = []
    for c in changes:
        op = client.get_type("AdGroupOperation")
        ag = op.update
        ag.resource_name = c["resource_name"]
        ag.cpc_bid_micros = target_micros
        if c["enable"]:
            ag.status = client.enums.AdGroupStatusEnum.ENABLED
        # Derive the mask from what was actually set — an update without a mask
        # is a no-op, and a hand-built FieldMask silently drops unlisted fields.
        client.copy_from(op.update_mask, protobuf_helpers.field_mask(None, ag._pb))
        ops.append(op)

    try:
        service.mutate_ad_groups(customer_id=customer_id, operations=ops)
    except GoogleAdsException as e:
        logger.error("Google Ads rejected the update (request_id %s):", e.request_id)
        for err in e.failure.errors:
            logger.error("  %s", err.message)
        return 1

    logger.info("Updated %d ad groups.", len(ops))
    return 0


if __name__ == "__main__":
    sys.exit(main())
