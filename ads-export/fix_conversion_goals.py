#!/usr/bin/env python3
"""
Demote the junk conversion actions so smart bidding has one honest target.

The account imported every GA4 event as its own conversion action, each with
category PURCHASE and primary_for_goal = true. There is a single biddable goal
(PURCHASE~WEBSITE), so all of them feed the same bidding signal. Over 30 days
they produced 180 of 181 "conversions" — page_view alone accounted for 68. The
one real booking is the GA4 purchase import.

Manual CPC ignores this, which is why the search campaign was unaffected. Any
smart bidding strategy does not, so the Performance Max campaign cannot be
enabled until this is fixed.

Demoting an action to secondary keeps its history and keeps it reported under
"All conversions" — nothing is deleted, and it can be promoted back in the UI.

  python3 ads-export/fix_conversion_goals.py --customer-id 4410207627
  python3 ads-export/fix_conversion_goals.py --customer-id 4410207627 --apply
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")

# Only a real purchase should drive bidding. Everything else that currently
# claims category PURCHASE is a page interaction wearing a purchase label.
KEEP_PRIMARY_TYPES = {"GOOGLE_ANALYTICS_4_PURCHASE"}

logger = logging.getLogger("fix_conversion_goals")


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def fetch_actions(client, customer_id: str) -> list[dict]:
    ga = client.get_service("GoogleAdsService")
    q = """
        SELECT conversion_action.resource_name, conversion_action.name,
               conversion_action.type, conversion_action.category,
               conversion_action.primary_for_goal, conversion_action.status
        FROM conversion_action
        WHERE conversion_action.status = 'ENABLED'
    """
    rows = []
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for row in batch.results:
            a = row.conversion_action
            rows.append({
                "resource_name": a.resource_name,
                "name": a.name,
                "type": a.type_.name,
                "category": a.category.name,
                "primary": a.primary_for_goal,
            })
    return sorted(rows, key=lambda r: r["name"])


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    ap = argparse.ArgumentParser(description="Make junk conversion actions secondary.")
    ap.add_argument("--config", default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG))
    ap.add_argument("--customer-id", default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""))
    ap.add_argument(
        "--keep",
        action="append",
        default=[],
        metavar="NAME",
        help="Also keep this action primary, by exact name. Repeatable.",
    )
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
        actions = fetch_actions(client, customer_id)
    except GoogleAdsException as e:
        logger.error("Could not read conversion actions: %s", e)
        return 1

    keep_names = set(args.keep)
    demote = [
        a for a in actions
        if a["primary"] and a["type"] not in KEEP_PRIMARY_TYPES and a["name"] not in keep_names
    ]
    keep = [a for a in actions if a not in demote]

    print(f"\n{len(actions)} enabled conversion actions\n")
    for a in actions:
        mark = "→ SECONDARY" if a in demote else "   primary  " if a["primary"] else "   secondary"
        print(f"  {mark}  {a['name']:<40} {a['type']:<28} {a['category']}")

    print(f"\nStaying primary: {', '.join(a['name'] for a in keep if a['primary']) or 'NONE'}")
    print(f"Demoting: {len(demote)}")

    if not demote:
        print("\nNothing to do.")
        return 0

    if not any(a["primary"] for a in keep):
        logger.error(
            "This would leave zero primary conversion actions — smart bidding would "
            "have no target at all. Refusing. Use --keep to nominate one."
        )
        return 1

    if not args.apply:
        print("\nDry run — nothing was written. Add --apply to commit.")
        return 0

    service = client.get_service("ConversionActionService")
    ops = []
    for a in demote:
        op = client.get_type("ConversionActionOperation")
        ca = op.update
        ca.resource_name = a["resource_name"]
        ca.primary_for_goal = False
        # The mask is spelled out rather than derived. protobuf_helpers.field_mask
        # diffs against an empty message, so a bool set to False — protobuf's
        # default — drops out of the mask and the update becomes a silent no-op
        # that the API accepts without complaint. Setting a field *to* its
        # default value always needs an explicit path.
        client.copy_from(op.update_mask, FieldMask(paths=["primary_for_goal"]))
        ops.append(op)

    try:
        service.mutate_conversion_actions(customer_id=customer_id, operations=ops)
    except GoogleAdsException as e:
        logger.error("Google Ads rejected the update (request_id %s):", e.request_id)
        for err in e.failure.errors:
            logger.error("  %s", err.message)
        return 1

    # Read back rather than trust the mutate — a no-op update returns success.
    still_primary = [
        a["name"] for a in fetch_actions(client, customer_id)
        if a["primary"] and a["type"] not in KEEP_PRIMARY_TYPES and a["name"] not in keep_names
    ]
    if still_primary:
        logger.error("Still primary after the update: %s", ", ".join(still_primary))
        return 1

    logger.info("Demoted %d conversion actions to secondary — verified.", len(ops))
    return 0


if __name__ == "__main__":
    sys.exit(main())
