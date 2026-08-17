#!/usr/bin/env python3
"""
Gør de pausede annoncegrupper klar til at blive tændt. Fjerner intet.

29 pausede grupper står med bud på 0,01 kr, sat af et tidligere pause-script.
De skal blive liggende — de er en ressource, ikke affald — men med det bud er
de en fælde: tænder man en, ser den korrekt ud i kampagnelisten, bruger ingen
penge og vinder aldrig en auktion. Fejlen viser sig først som "hvorfor får den
gruppe ingen visninger?" uger senere.

10 kr er kontoens etablerede standard for utestede grupper: 12 af de 17 tændte
står præcis der. Grupper med data har fået deres eget bud af
fix_search_campaign.py ud fra kvalitetsscore og tabt visningsandel; de røres
ikke her.

Ændrer ikke status på noget. En pauset gruppe forbliver pauset.

  python3 ads-export/prepare_paused_groups.py --customer-id 4410207627
  python3 ads-export/prepare_paused_groups.py --customer-id 4410207627 --apply
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from collections import defaultdict

CAMPAIGN_NAME = "Højtaler Udlejning - Search"
DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")

# Under dette regnes buddet som "aldrig sat rigtigt" frem for "bevidst lavt".
BROKEN_BID_THRESHOLD = 1.0
DEFAULT_BID_DKK = 10.0

logger = logging.getLogger("prepare_paused")


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def gaql_escape(s: str) -> str:
    return s.replace("'", "''")


def fetch_groups(client, customer_id: str) -> list[dict]:
    ga = client.get_service("GoogleAdsService")
    q = f"""
        SELECT ad_group.resource_name, ad_group.name, ad_group.status,
               ad_group.cpc_bid_micros
        FROM ad_group
        WHERE campaign.name = '{gaql_escape(CAMPAIGN_NAME)}'
          AND ad_group.status != 'REMOVED'
    """
    rows = []
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for r in batch.results:
            rows.append({
                "resource_name": r.ad_group.resource_name,
                "name": r.ad_group.name,
                "status": r.ad_group.status.name,
                "bid": r.ad_group.cpc_bid_micros / 1_000_000,
            })
    return sorted(rows, key=lambda r: r["name"])


def find_duplicates(groups: list[dict]) -> list[list[dict]]:
    """Grupper hvis navne peger på samme ting under to stavemåder.

    Rapporteres, fjernes ikke — dubletter i én kampagne splitter data og byder
    mod hinanden, men hvilken tvilling der skal væk er en vurdering.
    """
    by_key = defaultdict(list)
    for g in groups:
        key = g["name"].split(" - ", 1)[-1].split(" — ", 1)[-1].strip().lower()
        by_key[key].append(g)
    return [v for v in by_key.values() if len(v) > 1]


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    ap = argparse.ArgumentParser(description="Giv pausede annoncegrupper et brugbart bud.")
    ap.add_argument("--config", default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG))
    ap.add_argument("--customer-id", default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""))
    ap.add_argument("--bid", type=float, default=DEFAULT_BID_DKK)
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

    groups = fetch_groups(client, customer_id)
    if not groups:
        logger.error("Ingen annoncegrupper i %r", CAMPAIGN_NAME)
        return 1

    fix = [g for g in groups if g["bid"] < BROKEN_BID_THRESHOLD]

    print(f"\n{CAMPAIGN_NAME} — {len(groups)} grupper "
          f"({sum(1 for g in groups if g['status'] == 'ENABLED')} tændte)\n")
    print(f"Bud under {BROKEN_BID_THRESHOLD:.2f} kr → {args.bid:.2f} kr "
          f"({len(fix)} grupper, status uændret):")
    for g in fix:
        print(f"  {g['name']:<44} {g['status']:<8} {g['bid']:>5.2f} → {args.bid:.2f} kr")

    dupes = find_duplicates(groups)
    if dupes:
        print(f"\nDubletter — samme mål under to navne ({len(dupes)} par). "
              "Rapporteres kun; intet fjernes:")
        for pair in dupes:
            print("  " + "  |  ".join(f"{g['name']} [{g['status']}]" for g in pair))

    if not fix:
        print("\nIntet at gøre.")
        return 0
    if not args.apply:
        print("\nTørkørsel — intet skrevet. Tilføj --apply.")
        return 0

    ops = []
    for g in fix:
        op = client.get_type("AdGroupOperation")
        op.update.resource_name = g["resource_name"]
        op.update.cpc_bid_micros = int(round(args.bid * 1_000_000))
        # Kun buddet i masken. Status skal IKKE med — en pauset gruppe forbliver
        # pauset, og en maske der rørte status ville tænde dem alle.
        client.copy_from(op.update_mask, FieldMask(paths=["cpc_bid_micros"]))
        ops.append(op)

    try:
        client.get_service("AdGroupService").mutate_ad_groups(
            customer_id=customer_id, operations=ops
        )
    except GoogleAdsException as e:
        logger.error("Google Ads afviste opdateringen (request_id %s):", e.request_id)
        for err in e.failure.errors:
            logger.error("  %s", err.message)
        return 1

    after = fetch_groups(client, customer_id)
    still_broken = [g["name"] for g in after if g["bid"] < BROKEN_BID_THRESHOLD]
    enabled_before = {g["name"] for g in groups if g["status"] == "ENABLED"}
    enabled_after = {g["name"] for g in after if g["status"] == "ENABLED"}
    if still_broken:
        logger.error("Stadig under grænsen: %s", ", ".join(still_broken))
        return 1
    if enabled_before != enabled_after:
        logger.error("Status ændrede sig — det må den ikke: %s",
                     enabled_after ^ enabled_before)
        return 1

    logger.info("Opdaterede %d grupper. Ingen status ændret.", len(ops))
    return 0


if __name__ == "__main__":
    sys.exit(main())
