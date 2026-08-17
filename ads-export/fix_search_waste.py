#!/usr/bin/env python3
"""
Stop the two ways "Højtaler Udlejning - Search" wastes money.

1. GEO. The campaign targets the Copenhagen city constant but its
   positive_geo_target_type is PRESENCE_OR_INTEREST, so it also shows to people
   merely *interested* in Copenhagen from anywhere. That is where "leje af
   lyskæder fyn", "soundboks leje odense" and "leje soundboks smukfest" came
   from. The PMax campaign already runs PRESENCE.

2. CANNIBALISATION. AG 1 (Højtalere & Lyd) is broad enough to catch Soundboks
   queries that belong to AG 4 (Soundboks), and it pays two to three times more
   for them:

       lej soundboks      6.58 kr/click in AG 4   15.91 kr in AG 1
       soundboks leje     6.91 kr/click in AG 4   15.93 kr in AG 1
       lej en soundboks   6.98 kr/click in AG 4   20.42 kr in AG 1
       leje af soundbox   —                       14.70 kr in AG 1

   About 178 kr of 1,200 kr over 30 days. Raising AG 1 to 25 kr on 16 Aug made
   it worse, since AG 1 now outbids AG 4 for AG 4's own queries. Negative
   keywords in AG 1 hand them back.

   The misspelling "soundbox" also has real volume and exists as a keyword
   nowhere — it was only ever caught incidentally by AG 1's broad match, at
   ~103 kr. It is added to AG 4 properly.

Google's TOBACCO policy is worth remembering here: it rejects phrases like
"lys og røg", while "røgmaskine" passes. Nothing added below trips it, but
keywords are preflighted with validate_only anyway.

  python3 ads-export/fix_search_waste.py --customer-id 4410207627
  python3 ads-export/fix_search_waste.py --customer-id 4410207627 --apply
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

CAMPAIGN_NAME = "Højtaler Udlejning - Search"
DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")

# Ad group that over-reaches, and the terms it must stop claiming.
CANNIBAL_AD_GROUP = "AG 1 - Højtalere & Lyd"
NEGATIVES = ["soundboks", "soundbox"]

# Where those queries belong, plus the misspelling nobody had bid on.
OWNER_AD_GROUP = "AG 4 - Soundboks"
NEW_KEYWORDS = [
    "soundbox leje",
    "lej soundbox",
    "leje af soundbox",
    "soundbox udlejning",
]

# Free ad real estate. The campaign has sitelinks, a business name and a logo,
# but no callouts — and callouts lift CTR, which feeds the expected-CTR half of
# Quality Score. Max 25 characters each.
CALLOUTS = [
    "Weekendleje fredag-mandag",
    "Levering i København",
    "Book online på 2 min.",
    "Alle kabler følger med",
    "Bluetooth i højtalerne",
    "Opsætning kan tilvælges",
]

logger = logging.getLogger("fix_waste")


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def gaql_escape(s: str) -> str:
    return s.replace("'", "''")


def lookup(client, customer_id: str):
    ga = client.get_service("GoogleAdsService")
    q = f"""
        SELECT campaign.id, campaign.resource_name, campaign.name,
               campaign.geo_target_type_setting.positive_geo_target_type,
               ad_group.resource_name, ad_group.name
        FROM ad_group
        WHERE campaign.name = '{gaql_escape(CAMPAIGN_NAME)}'
          AND ad_group.status != 'REMOVED'
    """
    campaign_rn = geo = None
    groups = {}
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for r in batch.results:
            campaign_rn = r.campaign.resource_name
            geo = r.campaign.geo_target_type_setting.positive_geo_target_type.name
            groups[r.ad_group.name] = r.ad_group.resource_name
    return campaign_rn, geo, groups


def existing_negatives(client, customer_id: str, ad_group_rn: str) -> set[str]:
    ga = client.get_service("GoogleAdsService")
    q = f"""
        SELECT ad_group_criterion.keyword.text
        FROM ad_group_criterion
        WHERE ad_group.resource_name = '{ad_group_rn}'
          AND ad_group_criterion.negative = TRUE
          AND ad_group_criterion.type = 'KEYWORD'
          AND ad_group_criterion.status != 'REMOVED'
    """
    out = set()
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for r in batch.results:
            out.add(r.ad_group_criterion.keyword.text.lower())
    return out


def existing_keywords(client, customer_id: str, ad_group_rn: str) -> set[str]:
    ga = client.get_service("GoogleAdsService")
    q = f"""
        SELECT ad_group_criterion.keyword.text
        FROM ad_group_criterion
        WHERE ad_group.resource_name = '{ad_group_rn}'
          AND ad_group_criterion.negative = FALSE
          AND ad_group_criterion.type = 'KEYWORD'
          AND ad_group_criterion.status != 'REMOVED'
    """
    out = set()
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for r in batch.results:
            out.add(r.ad_group_criterion.keyword.text.lower())
    return out


def existing_callouts(client, customer_id: str, campaign_rn: str) -> set[str]:
    ga = client.get_service("GoogleAdsService")
    q = f"""
        SELECT campaign.resource_name, asset.callout_asset.callout_text
        FROM campaign_asset
        WHERE campaign.resource_name = '{campaign_rn}'
          AND campaign_asset.field_type = 'CALLOUT'
          AND campaign_asset.status != 'REMOVED'
    """
    out = set()
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for r in batch.results:
            out.add(r.asset.callout_asset.callout_text)
    return out


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    ap = argparse.ArgumentParser(description="Fix geo leakage and ad group cannibalisation.")
    ap.add_argument("--config", default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG))
    ap.add_argument("--customer-id", default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""))
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

    campaign_rn, geo, groups = lookup(client, customer_id)
    if not campaign_rn:
        logger.error("Campaign not found: %r", CAMPAIGN_NAME)
        return 1
    for name in (CANNIBAL_AD_GROUP, OWNER_AD_GROUP):
        if name not in groups:
            logger.error("Ad group not found: %r", name)
            return 1

    have_neg = existing_negatives(client, customer_id, groups[CANNIBAL_AD_GROUP])
    have_kw = existing_keywords(client, customer_id, groups[OWNER_AD_GROUP])
    have_co = existing_callouts(client, customer_id, campaign_rn)

    geo_needs_fix = geo != "PRESENCE"
    add_neg = [n for n in NEGATIVES if n.lower() not in have_neg]
    add_kw = [k for k in NEW_KEYWORDS if k.lower() not in have_kw]
    add_co = [c for c in CALLOUTS if c not in have_co]

    print(f"\n{CAMPAIGN_NAME}\n")
    print(f"  Geo:       {geo}" + ("  → PRESENCE" if geo_needs_fix else "  (allerede korrekt)"))
    print(f"  Negative i {CANNIBAL_AD_GROUP}: {', '.join(add_neg) or '(ingen nye)'}")
    print(f"  Keywords i {OWNER_AD_GROUP}:    {', '.join(add_kw) or '(ingen nye)'}")
    print(f"  Callouts:  {len(add_co)} nye af {len(CALLOUTS)}")

    if not (geo_needs_fix or add_neg or add_kw or add_co):
        print("\nIntet at gøre.")
        return 0
    if not args.apply:
        print("\nTørkørsel — intet skrevet. Tilføj --apply.")
        return 0

    try:
        if geo_needs_fix:
            op = client.get_type("CampaignOperation")
            op.update.resource_name = campaign_rn
            op.update.geo_target_type_setting.positive_geo_target_type = (
                client.enums.PositiveGeoTargetTypeEnum.PRESENCE
            )
            client.copy_from(
                op.update_mask,
                FieldMask(paths=["geo_target_type_setting.positive_geo_target_type"]),
            )
            client.get_service("CampaignService").mutate_campaigns(
                customer_id=customer_id, operations=[op]
            )
            logger.info("Geo → PRESENCE")

        if add_neg or add_kw:
            svc = client.get_service("AdGroupCriterionService")
            ops = []
            for text in add_neg:
                op = client.get_type("AdGroupCriterionOperation")
                c = op.create
                c.ad_group = groups[CANNIBAL_AD_GROUP]
                c.negative = True
                c.keyword.text = text
                # Broad negatives block every query containing the word, which
                # is the point: AG 4 should own all of them.
                c.keyword.match_type = client.enums.KeywordMatchTypeEnum.BROAD
                ops.append(op)
            for text in add_kw:
                op = client.get_type("AdGroupCriterionOperation")
                c = op.create
                c.ad_group = groups[OWNER_AD_GROUP]
                c.status = client.enums.AdGroupCriterionStatusEnum.ENABLED
                c.keyword.text = text
                c.keyword.match_type = client.enums.KeywordMatchTypeEnum.PHRASE
                ops.append(op)

            # Preflight: validate_only changes nothing and catches policy
            # rejections before half the batch is live.
            req = client.get_type("MutateAdGroupCriteriaRequest")
            req.customer_id = customer_id
            req.operations.extend(ops)
            req.validate_only = True
            svc.mutate_ad_group_criteria(request=req)
            logger.info("Preflight OK for %d criteria", len(ops))

            req.validate_only = False
            svc.mutate_ad_group_criteria(request=req)
            logger.info("Added %d negatives, %d keywords", len(add_neg), len(add_kw))

        if add_co:
            asset_service = client.get_service("AssetService")
            asset_ops = []
            for text in add_co:
                op = client.get_type("AssetOperation")
                op.create.callout_asset.callout_text = text
                asset_ops.append(op)
            results = asset_service.mutate_assets(
                customer_id=customer_id, operations=asset_ops
            ).results

            link_ops = []
            for res in results:
                op = client.get_type("CampaignAssetOperation")
                op.create.campaign = campaign_rn
                op.create.asset = res.resource_name
                op.create.field_type = client.enums.AssetFieldTypeEnum.CALLOUT
                link_ops.append(op)
            client.get_service("CampaignAssetService").mutate_campaign_assets(
                customer_id=customer_id, operations=link_ops
            )
            logger.info("Linked %d callouts", len(link_ops))

    except GoogleAdsException as e:
        logger.error("Google Ads rejected the request (request_id %s):", e.request_id)
        for err in e.failure.errors:
            logger.error("  %s", err.message)
        return 1

    # Read back — a mutate that changed nothing still returns success.
    _, geo_after, _ = lookup(client, customer_id)
    neg_after = existing_negatives(client, customer_id, groups[CANNIBAL_AD_GROUP])
    kw_after = existing_keywords(client, customer_id, groups[OWNER_AD_GROUP])
    problems = []
    if geo_after != "PRESENCE":
        problems.append(f"geo er stadig {geo_after}")
    missing_neg = [n for n in NEGATIVES if n.lower() not in neg_after]
    missing_kw = [k for k in NEW_KEYWORDS if k.lower() not in kw_after]
    if missing_neg:
        problems.append("negative mangler: " + ", ".join(missing_neg))
    if missing_kw:
        problems.append("keywords mangler: " + ", ".join(missing_kw))
    if problems:
        logger.error("Verifikation fejlede: %s", "; ".join(problems))
        return 1

    logger.info("Verificeret: geo=PRESENCE, negative og keywords på plads.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
