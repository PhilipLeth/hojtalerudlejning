#!/usr/bin/env python3
"""
Deploy a Performance Max campaign from ads/lejhojtaler-pmax.json.

openocean-promo/ads-export/sync_google_ads.py only builds SEARCH campaigns —
PMax has no ad groups, keywords or RSAs at all. It has asset groups holding
loose text and image assets, plus asset-group *signals* instead of keywords, so
it needs its own path rather than a flag on the existing script.

Modes:
  (default)      Validate the JSON and print the deployment plan. Touches nothing.
  --apply        Create budget, campaign, campaign assets, asset groups, assets
                 and signals. Aborts if a campaign of the same name exists.
  --force        With --apply: remove the existing campaign first.

Always deploy with --paused unless you have just verified the conversion goals.
See the _readme block in the JSON for why.

  python3 ads-export/deploy_pmax.py                                  # dry run
  python3 ads-export/deploy_pmax.py --apply --paused --customer-id 4410207627
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from typing import Any

from google.api_core import protobuf_helpers

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
DEFAULT_JSON = os.path.join(PROJECT_DIR, "ads", "lejhojtaler-pmax.json")
DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")

logger = logging.getLogger("deploy_pmax")

# Google's limits. Breaking one of these rejects the whole asset group with a
# message that does not say which field was wrong, so they are checked here.
LIMITS = {
    "headline": 30,
    "long_headline": 90,
    "description": 90,
    "description_short": 60,  # at least one description must fit this
    "business_name": 25,
    "sitelink_text": 25,
    "sitelink_desc": 35,
    "callout": 25,
    "search_theme": 80,
}

COUNTS = {
    "headlines": (3, 15),
    "long_headlines": (1, 5),
    "descriptions": (2, 5),
    "search_themes": (0, 25),
}

# (min width, min height, expected ratio, tolerance)
IMAGE_SPECS = {
    "landscape": (600, 314, 1.91, 0.02),
    "square": (300, 300, 1.0, 0.01),
    "portrait": (480, 600, 0.8, 0.02),
    "logo": (128, 128, 1.0, 0.01),
    "logo_landscape": (512, 128, 4.0, 0.02),
}

MAX_IMAGE_BYTES = 5_242_880


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def gaql_escape(s: str) -> str:
    return s.replace("'", "''")


# ── validation ───────────────────────────────────────────────────────────────


def check_image(path: str, kind: str, errors: list[str]) -> None:
    full = os.path.join(PROJECT_DIR, path)
    if not os.path.isfile(full):
        errors.append(f"missing image: {path}")
        return

    size = os.path.getsize(full)
    if size > MAX_IMAGE_BYTES:
        errors.append(f"{path}: {size/1e6:.1f} MB exceeds Google's 5 MB asset limit")

    try:
        from PIL import Image
    except ImportError:  # validation degrades, deployment still works
        return

    with Image.open(full) as im:
        w, h = im.size

    min_w, min_h, ratio, tol = IMAGE_SPECS[kind]
    if w < min_w or h < min_h:
        errors.append(f"{path}: {w}x{h} is below the {min_w}x{min_h} minimum for {kind}")
    actual = w / h
    if abs(actual - ratio) > tol:
        errors.append(f"{path}: ratio {actual:.3f} is not {ratio} (±{tol}) required for {kind}")


def validate(cfg: dict[str, Any]) -> list[str]:
    errors: list[str] = []

    campaign = cfg.get("campaign") or {}
    if not campaign.get("name"):
        errors.append("campaign.name is required")
    if not campaign.get("daily_budget_dkk"):
        errors.append("campaign.daily_budget_dkk is required")

    business_name = campaign.get("business_name", "")
    if not business_name:
        errors.append("campaign.business_name is required — PMax needs it on every asset group")
    elif len(business_name) > LIMITS["business_name"]:
        errors.append(
            f"business_name {len(business_name)} chars > {LIMITS['business_name']}: {business_name!r}"
        )

    assets = cfg.get("campaign_assets") or {}
    for sl in assets.get("sitelinks", []):
        if len(sl["text"]) > LIMITS["sitelink_text"]:
            errors.append(f"sitelink text {len(sl['text'])} > {LIMITS['sitelink_text']}: {sl['text']!r}")
        for key in ("description_line_1", "description_line_2"):
            line = sl.get(key, "")
            if len(line) > LIMITS["sitelink_desc"]:
                errors.append(f"sitelink {key} {len(line)} > {LIMITS['sitelink_desc']}: {line!r}")
    for co in assets.get("callouts", []):
        if len(co) > LIMITS["callout"]:
            errors.append(f"callout {len(co)} > {LIMITS['callout']}: {co!r}")

    logos = cfg.get("logos") or {}
    if not logos.get("square"):
        errors.append("logos.square is required")
    else:
        check_image(logos["square"], "logo", errors)
    if logos.get("landscape"):
        check_image(logos["landscape"], "logo_landscape", errors)

    groups = cfg.get("asset_groups") or []
    if not groups:
        errors.append("no asset_groups defined")

    seen_names = set()
    for g in groups:
        name = g.get("name", "<unnamed>")
        if name in seen_names:
            errors.append(f"duplicate asset group name: {name!r}")
        seen_names.add(name)

        if not g.get("final_url"):
            errors.append(f"{name}: final_url is required")

        for field, limit_key in (
            ("headlines", "headline"),
            ("long_headlines", "long_headline"),
            ("descriptions", "description"),
        ):
            items = g.get(field, [])
            lo, hi = COUNTS[field]
            if not lo <= len(items) <= hi:
                errors.append(f"{name}: {len(items)} {field}, must be {lo}-{hi}")
            for text in items:
                if len(text) > LIMITS[limit_key]:
                    errors.append(f"{name}: {field[:-1]} {len(text)} > {LIMITS[limit_key]}: {text!r}")

        descs = g.get("descriptions", [])
        if descs and not any(len(d) <= LIMITS["description_short"] for d in descs):
            errors.append(
                f"{name}: at least one description must be ≤{LIMITS['description_short']} chars"
            )

        themes = g.get("search_themes", [])
        lo, hi = COUNTS["search_themes"]
        if len(themes) > hi:
            errors.append(f"{name}: {len(themes)} search themes, max {hi}")
        for t in themes:
            if len(t) > LIMITS["search_theme"]:
                errors.append(f"{name}: search theme {len(t)} > {LIMITS['search_theme']}: {t!r}")

        videos = g.get("videos", [])
        if len(videos) > 5:
            errors.append(f"{name}: {len(videos)} videos, max 5")
        for v in videos:
            if not (11 <= len(v) <= 12) or "/" in v or "=" in v:
                errors.append(f"{name}: {v!r} is not a bare YouTube video id")

        images = g.get("images") or {}
        for kind in ("landscape", "square"):
            if not images.get(kind):
                errors.append(f"{name}: at least one {kind} image is required")
        for kind in ("landscape", "square", "portrait"):
            for path in images.get(kind, []):
                check_image(path, kind, errors)

    return errors


def summarize(cfg: dict[str, Any]) -> None:
    c = cfg["campaign"]
    print(f"\nCampaign: {c['name']}")
    print(f"  budget      {c['daily_budget_dkk']:.0f} kr/day")
    print(f"  bidding     {c['bidding_strategy']}")
    geo = c["targeting"]["geo"]
    if geo.get("proximity"):
        p = geo["proximity"]
        print(f"  geo         {p['radius_km']} km around ({p['lat']}, {p['lon']}), "
              f"{c['targeting'].get('positive_geo_target_type', 'PRESENCE')}")
    excl = c.get("url_exclusions", [])
    print(f"  url expand  always ON (no longer opt-out-able), {len(excl)} URL exclusions")

    assets = cfg.get("campaign_assets") or {}
    print(f"  sitelinks   {len(assets.get('sitelinks', []))}")
    print(f"  callouts    {len(assets.get('callouts', []))}")

    print(f"\nAsset groups: {len(cfg['asset_groups'])}")
    total_img = 0
    for g in cfg["asset_groups"]:
        imgs = g.get("images") or {}
        n_img = sum(len(v) for v in imgs.values())
        total_img += n_img
        print(
            f"  {g['name']:<44} {len(g['headlines']):>2}h "
            f"{len(g['long_headlines'])}lh {len(g['descriptions'])}d "
            f"{n_img:>2}img {len(g.get('search_themes', [])):>2}themes"
        )
        print(f"      → {g['final_url']}")
    print(f"\nTotal images referenced: {total_img} (deduplicated on upload)")


# ── deployment ───────────────────────────────────────────────────────────────


def set_state(client, customer_id: str, name: str, enabled: bool) -> int:
    """Flip an existing campaign and every asset group under it.

    Both levels have their own status and both must be ENABLED for anything to
    serve — an enabled campaign full of paused asset groups spends nothing and
    looks fine in the campaign list.
    """
    from google.protobuf.field_mask_pb2 import FieldMask

    campaign_rn = campaign_exists(client, customer_id, name)
    if not campaign_rn:
        logger.error("No campaign named %r", name)
        return 1

    target = "ENABLED" if enabled else "PAUSED"

    ga = client.get_service("GoogleAdsService")
    q = (
        "SELECT asset_group.resource_name, asset_group.name, asset_group.status, "
        "asset_group.ad_strength FROM asset_group "
        f"WHERE campaign.resource_name = '{campaign_rn}'"
    )
    groups = []
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for row in batch.results:
            groups.append({
                "resource_name": row.asset_group.resource_name,
                "name": row.asset_group.name,
                "status": row.asset_group.status.name,
                "strength": row.asset_group.ad_strength.name,
            })

    camp_op = client.get_type("CampaignOperation")
    camp_op.update.resource_name = campaign_rn
    camp_op.update.status = getattr(client.enums.CampaignStatusEnum, target)
    client.copy_from(camp_op.update_mask, FieldMask(paths=["status"]))
    client.get_service("CampaignService").mutate_campaigns(
        customer_id=customer_id, operations=[camp_op]
    )

    ag_ops = []
    for g in sorted(groups, key=lambda x: x["name"]):
        op = client.get_type("AssetGroupOperation")
        op.update.resource_name = g["resource_name"]
        op.update.status = getattr(client.enums.AssetGroupStatusEnum, target)
        client.copy_from(op.update_mask, FieldMask(paths=["status"]))
        ag_ops.append(op)
    if ag_ops:
        client.get_service("AssetGroupService").mutate_asset_groups(
            customer_id=customer_id, operations=ag_ops
        )

    # Read back — a mutate that changed nothing still returns success.
    stale = []
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for row in batch.results:
            if row.asset_group.status.name != target:
                stale.append(row.asset_group.name)
    if stale:
        logger.error("Asset groups still not %s: %s", target, ", ".join(stale))
        return 1

    logger.info("Campaign %r → %s, with %d asset groups.", name, target, len(ag_ops))
    for g in sorted(groups, key=lambda x: x["name"]):
        logger.info("  %-44s ad strength %s", g["name"], g["strength"])
    return 0


def find_budget(client, customer_id: str, name: str) -> str | None:
    ga = client.get_service("GoogleAdsService")
    q = (
        "SELECT campaign_budget.resource_name FROM campaign_budget "
        f"WHERE campaign_budget.name = '{gaql_escape(name)}' "
        "AND campaign_budget.status != 'REMOVED'"
    )
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for row in batch.results:
            return row.campaign_budget.resource_name
    return None


def campaign_exists(client, customer_id: str, name: str) -> str | None:
    ga = client.get_service("GoogleAdsService")
    q = (
        "SELECT campaign.resource_name FROM campaign "
        f"WHERE campaign.name = '{gaql_escape(name)}' AND campaign.status != 'REMOVED'"
    )
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for row in batch.results:
            return row.campaign.resource_name
    return None


def create_text_asset(client, customer_id: str, text: str, cache: dict[str, str]) -> str:
    """Create (or reuse) a text asset. Google dedupes by content, so the cache
    only saves round-trips within one run."""
    if text in cache:
        return cache[text]
    service = client.get_service("AssetService")
    op = client.get_type("AssetOperation")
    op.create.text_asset.text = text
    resp = service.mutate_assets(customer_id=customer_id, operations=[op])
    rn = resp.results[0].resource_name
    cache[text] = rn
    return rn


def create_image_asset(client, customer_id: str, path: str, cache: dict[str, str]) -> str:
    if path in cache:
        return cache[path]
    full = os.path.join(PROJECT_DIR, path)
    with open(full, "rb") as f:
        data = f.read()

    service = client.get_service("AssetService")
    op = client.get_type("AssetOperation")
    op.create.name = os.path.splitext(os.path.basename(path))[0]
    op.create.type_ = client.enums.AssetTypeEnum.IMAGE
    op.create.image_asset.data = data

    from google.ads.googleads.errors import GoogleAdsException

    try:
        resp = service.mutate_assets(customer_id=customer_id, operations=[op])
        rn = resp.results[0].resource_name
    except GoogleAdsException as e:
        # Re-uploading identical bytes is a DUPLICATE_ASSET error; the existing
        # asset is just as good, so look it up by name and carry on.
        if not any(
            err.error_code.asset_error.name == "DUPLICATE_ASSET"
            for err in e.failure.errors
        ):
            raise
        rn = lookup_image_asset(client, customer_id, op.create.name)
        if not rn:
            raise
        logger.info("Reusing existing image asset: %s", path)

    cache[path] = rn
    return rn


def create_video_asset(client, customer_id: str, video_id: str, cache: dict[str, str]) -> str:
    """Link a YouTube video the site already hosts on its product pages.

    Without a video asset Google auto-generates one from the images, which both
    scores lower on ad strength and looks like a slideshow. These are real
    product clips.
    """
    if video_id in cache:
        return cache[video_id]
    op = client.get_type("AssetOperation")
    op.create.name = f"yt-{video_id}"
    op.create.youtube_video_asset.youtube_video_id = video_id

    from google.ads.googleads.errors import GoogleAdsException

    try:
        rn = client.get_service("AssetService").mutate_assets(
            customer_id=customer_id, operations=[op]
        ).results[0].resource_name
    except GoogleAdsException as e:
        if not any(
            err.error_code.asset_error.name == "DUPLICATE_ASSET" for err in e.failure.errors
        ):
            raise
        rn = lookup_asset_by_name(client, customer_id, f"yt-{video_id}", "YOUTUBE_VIDEO")
        if not rn:
            raise
    cache[video_id] = rn
    return rn


def lookup_asset_by_name(client, customer_id: str, name: str, asset_type: str) -> str | None:
    ga = client.get_service("GoogleAdsService")
    q = (
        "SELECT asset.resource_name FROM asset "
        f"WHERE asset.type = '{asset_type}' AND asset.name = '{gaql_escape(name)}'"
    )
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for row in batch.results:
            return row.asset.resource_name
    return None


def lookup_image_asset(client, customer_id: str, name: str) -> str | None:
    ga = client.get_service("GoogleAdsService")
    q = (
        "SELECT asset.resource_name FROM asset "
        f"WHERE asset.type = 'IMAGE' AND asset.name = '{gaql_escape(name)}'"
    )
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for row in batch.results:
            return row.asset.resource_name
    return None


def deploy(client, customer_id: str, cfg: dict[str, Any], *, paused: bool, force: bool) -> None:
    c = cfg["campaign"]
    name = c["name"]

    existing = campaign_exists(client, customer_id, name)
    if existing:
        if not force:
            logger.error("Campaign already exists: %r — use --force to replace it.", name)
            sys.exit(2)
        svc = client.get_service("CampaignService")
        op = client.get_type("CampaignOperation")
        op.remove = existing
        svc.mutate_campaigns(customer_id=customer_id, operations=[op])
        logger.info("Removed existing campaign %s", existing)

    # 1. Budget — reuse the one from an earlier attempt rather than leaving a
    # trail of orphans behind every failed run.
    budget_name = f"PMax — {name}"[:255]
    budget_micros = int(float(c["daily_budget_dkk"]) * 1_000_000)
    budget_service = client.get_service("CampaignBudgetService")

    budget_rn = find_budget(client, customer_id, budget_name)
    if budget_rn:
        b_op = client.get_type("CampaignBudgetOperation")
        b_op.update.resource_name = budget_rn
        b_op.update.amount_micros = budget_micros
        client.copy_from(
            b_op.update_mask, protobuf_helpers.field_mask(None, b_op.update._pb)
        )
        budget_service.mutate_campaign_budgets(customer_id=customer_id, operations=[b_op])
        logger.info("Reusing budget: %s (%s kr/day)", budget_rn, c["daily_budget_dkk"])
    else:
        b_op = client.get_type("CampaignBudgetOperation")
        b_op.create.name = budget_name
        b_op.create.amount_micros = budget_micros
        b_op.create.explicitly_shared = False
        budget_rn = budget_service.mutate_campaign_budgets(
            customer_id=customer_id, operations=[b_op]
        ).results[0].resource_name
        logger.info("Budget: %s (%s kr/day)", budget_rn, c["daily_budget_dkk"])

    # 2. Campaign
    camp_service = client.get_service("CampaignService")
    c_op = client.get_type("CampaignOperation")
    camp = c_op.create
    camp.name = name
    camp.advertising_channel_type = client.enums.AdvertisingChannelTypeEnum.PERFORMANCE_MAX
    camp.status = (
        client.enums.CampaignStatusEnum.PAUSED if paused else client.enums.CampaignStatusEnum.ENABLED
    )
    camp.campaign_budget = budget_rn
    camp.bidding_strategy_type = client.enums.BiddingStrategyTypeEnum.MAXIMIZE_CONVERSIONS
    camp.maximize_conversions = client.get_type("MaximizeConversions")
    # Brand Guidelines is on by default on new accounts. It moves the business
    # name and logo to campaign level — which cannot be created in the same call
    # as the campaign they attach to, so campaign creation fails outright. Off
    # here means each asset group carries its own name and logo, which is what
    # the JSON describes.
    camp.brand_guidelines_enabled = False
    camp.geo_target_type_setting.positive_geo_target_type = getattr(
        client.enums.PositiveGeoTargetTypeEnum,
        c["targeting"].get("positive_geo_target_type", "PRESENCE"),
    )
    camp.contains_eu_political_advertising = (
        client.enums.EuPoliticalAdvertisingStatusEnum.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING
    )
    if c.get("final_url_suffix"):
        camp.final_url_suffix = c["final_url_suffix"]

    campaign_rn = camp_service.mutate_campaigns(
        customer_id=customer_id, operations=[c_op]
    ).results[0].resource_name
    logger.info("Campaign: %s (%s)", campaign_rn, "PAUSED" if paused else "ENABLED")

    # 3. Language + geo
    crit_service = client.get_service("CampaignCriterionService")
    crit_ops = []
    targeting = c["targeting"]

    lang_op = client.get_type("CampaignCriterionOperation")
    lang_op.create.campaign = campaign_rn
    lang_op.create.language.language_constant = targeting["language"]
    crit_ops.append(lang_op)

    geo = targeting["geo"]
    if geo.get("proximity"):
        p = geo["proximity"]
        prox_op = client.get_type("CampaignCriterionOperation")
        pc = prox_op.create
        pc.campaign = campaign_rn
        pc.proximity.geo_point.latitude_in_micro_degrees = int(round(p["lat"] * 1_000_000))
        pc.proximity.geo_point.longitude_in_micro_degrees = int(round(p["lon"] * 1_000_000))
        pc.proximity.radius = float(p["radius_km"])
        pc.proximity.radius_units = client.enums.ProximityRadiusUnitsEnum.KILOMETERS
        crit_ops.append(prox_op)
    for constant in geo.get("geo_target_constants", []):
        loc_op = client.get_type("CampaignCriterionOperation")
        loc_op.create.campaign = campaign_rn
        loc_op.create.location.geo_target_constant = constant
        crit_ops.append(loc_op)

    # URL exclusions. Google removed campaign.url_expansion_opt_out from the
    # API — final-URL expansion is always on for Performance Max now, so the
    # only way to keep ads off a page is a negative webpage criterion.
    for i, fragment in enumerate(c.get("url_exclusions", [])):
        ex_op = client.get_type("CampaignCriterionOperation")
        ex = ex_op.create
        ex.campaign = campaign_rn
        ex.negative = True
        ex.webpage.criterion_name = f"Ekskluderet: {fragment}"[:255]
        cond = client.get_type("WebpageConditionInfo")
        cond.operand = client.enums.WebpageConditionOperandEnum.URL
        cond.operator = client.enums.WebpageConditionOperatorEnum.CONTAINS
        cond.argument = fragment
        ex.webpage.conditions.append(cond)
        crit_ops.append(ex_op)

    crit_service.mutate_campaign_criteria(customer_id=customer_id, operations=crit_ops)
    logger.info(
        "Applied %d campaign criteria (%d URL exclusions)",
        len(crit_ops), len(c.get("url_exclusions", [])),
    )

    # 4. Campaign-level sitelinks and callouts
    deploy_campaign_assets(client, customer_id, campaign_rn, cfg)

    # 5. Asset groups
    text_cache: dict[str, str] = {}
    image_cache: dict[str, str] = {}
    video_cache: dict[str, str] = {}

    logos = cfg["logos"]
    logo_rn = create_image_asset(client, customer_id, logos["square"], image_cache)
    logo_wide_rn = (
        create_image_asset(client, customer_id, logos["landscape"], image_cache)
        if logos.get("landscape")
        else None
    )
    business_rn = create_text_asset(client, customer_id, c["business_name"], text_cache)

    for group in cfg["asset_groups"]:
        deploy_asset_group(
            client, customer_id, campaign_rn, group,
            paused=paused,
            logo_rn=logo_rn, logo_wide_rn=logo_wide_rn, business_rn=business_rn,
            text_cache=text_cache, image_cache=image_cache, video_cache=video_cache,
        )

    logger.info("Done. %d asset groups created.", len(cfg["asset_groups"]))


def deploy_campaign_assets(client, customer_id: str, campaign_rn: str, cfg: dict[str, Any]) -> None:
    assets = cfg.get("campaign_assets") or {}
    asset_service = client.get_service("AssetService")
    link_service = client.get_service("CampaignAssetService")

    ops, kinds = [], []
    for sl in assets.get("sitelinks", []):
        op = client.get_type("AssetOperation")
        a = op.create
        a.final_urls.append(sl["final_url"])
        a.sitelink_asset.link_text = sl["text"]
        if sl.get("description_line_1"):
            a.sitelink_asset.description1 = sl["description_line_1"]
        if sl.get("description_line_2"):
            a.sitelink_asset.description2 = sl["description_line_2"]
        ops.append(op)
        kinds.append("SITELINK")

    for co in assets.get("callouts", []):
        op = client.get_type("AssetOperation")
        op.create.callout_asset.callout_text = co
        ops.append(op)
        kinds.append("CALLOUT")

    if not ops:
        return

    results = asset_service.mutate_assets(customer_id=customer_id, operations=ops).results

    link_ops = []
    for res, kind in zip(results, kinds):
        op = client.get_type("CampaignAssetOperation")
        op.create.campaign = campaign_rn
        op.create.asset = res.resource_name
        op.create.field_type = getattr(client.enums.AssetFieldTypeEnum, kind)
        link_ops.append(op)

    link_service.mutate_campaign_assets(customer_id=customer_id, operations=link_ops)
    logger.info("Linked %d campaign assets (%d sitelinks, %d callouts)",
                len(link_ops), kinds.count("SITELINK"), kinds.count("CALLOUT"))


def deploy_asset_group(
    client, customer_id: str, campaign_rn: str, group: dict[str, Any], *,
    paused: bool, logo_rn: str, logo_wide_rn: str | None, business_rn: str,
    text_cache: dict[str, str], image_cache: dict[str, str], video_cache: dict[str, str],
) -> None:
    # An asset group must arrive complete. Creating it first and attaching
    # assets afterwards fails with "Headline asset for a valid asset group is
    # not enough" — Google validates the minimum asset set at creation time, so
    # the group and every link have to travel in one atomic MutateOperations
    # request, joined by a temporary resource name.
    temp_rn = f"customers/{customer_id}/assetGroups/-1"

    mutate_ops = []

    ag_mo = client.get_type("MutateOperation")
    ag = ag_mo.asset_group_operation.create
    ag.resource_name = temp_rn
    ag.name = group["name"]
    ag.campaign = campaign_rn
    ag.final_urls.append(group["final_url"])
    ag.status = (
        client.enums.AssetGroupStatusEnum.PAUSED if paused else client.enums.AssetGroupStatusEnum.ENABLED
    )
    mutate_ops.append(ag_mo)

    link_ops = []

    def link(asset_rn: str, field: str) -> None:
        mo = client.get_type("MutateOperation")
        create = mo.asset_group_asset_operation.create
        create.asset_group = temp_rn
        create.asset = asset_rn
        create.field_type = getattr(client.enums.AssetFieldTypeEnum, field)
        link_ops.append(mo)

    for text in group["headlines"]:
        link(create_text_asset(client, customer_id, text, text_cache), "HEADLINE")
    for text in group["long_headlines"]:
        link(create_text_asset(client, customer_id, text, text_cache), "LONG_HEADLINE")
    for text in group["descriptions"]:
        link(create_text_asset(client, customer_id, text, text_cache), "DESCRIPTION")

    link(business_rn, "BUSINESS_NAME")
    link(logo_rn, "LOGO")
    if logo_wide_rn:
        link(logo_wide_rn, "LANDSCAPE_LOGO")

    images = group.get("images") or {}
    for kind, field in (
        ("landscape", "MARKETING_IMAGE"),
        ("square", "SQUARE_MARKETING_IMAGE"),
        ("portrait", "PORTRAIT_MARKETING_IMAGE"),
    ):
        for path in images.get(kind, []):
            link(create_image_asset(client, customer_id, path, image_cache), field)

    for video_id in group.get("videos", []):
        link(create_video_asset(client, customer_id, video_id, video_cache), "YOUTUBE_VIDEO")

    # Search themes are this campaign type's answer to keywords, and they ride
    # along in the same atomic request.
    themes = group.get("search_themes", [])
    sig_ops = []
    for theme in themes:
        mo = client.get_type("MutateOperation")
        create = mo.asset_group_signal_operation.create
        create.asset_group = temp_rn
        create.search_theme.text = theme
        sig_ops.append(mo)

    mutate_ops.extend(link_ops)
    mutate_ops.extend(sig_ops)

    client.get_service("GoogleAdsService").mutate(
        customer_id=customer_id, mutate_operations=mutate_ops
    )

    logger.info("  %s — %d assets, %d search themes", group["name"], len(link_ops), len(themes))


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    ap = argparse.ArgumentParser(description="Deploy a Performance Max campaign.")
    ap.add_argument("--pmax-json", default=DEFAULT_JSON)
    ap.add_argument(
        "--config",
        default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG),
        help="google-ads.yaml with credentials (shared with openocean-promo)",
    )
    ap.add_argument(
        "--customer-id",
        default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""),
        help="Required for --apply. Lejhøjtaler is 4410207627 — the yaml default is OpenOcean.",
    )
    ap.add_argument("--apply", action="store_true", help="Actually create the campaign.")
    ap.add_argument(
        "--set-state",
        choices=("enabled", "paused"),
        help="Flip the existing campaign and its asset groups. Creates nothing.",
    )
    ap.add_argument("--paused", action="store_true", help="Create everything PAUSED.")
    ap.add_argument("--force", action="store_true", help="Replace an existing campaign of the same name.")
    args = ap.parse_args()

    with open(args.pmax_json, "r", encoding="utf-8") as f:
        cfg = json.load(f)

    if args.set_state:
        if not args.customer_id:
            logger.error("--customer-id is required with --set-state.")
            return 1
        if not os.path.isfile(args.config):
            logger.error("Missing credentials file: %s", args.config)
            return 1
        from google.ads.googleads.client import GoogleAdsClient

        return set_state(
            GoogleAdsClient.load_from_storage(args.config),
            normalize_customer_id(args.customer_id),
            cfg["campaign"]["name"],
            enabled=args.set_state == "enabled",
        )

    errors = validate(cfg)
    if errors:
        print(f"\n{len(errors)} validation error(s):\n", file=sys.stderr)
        for e in errors:
            print(f"  ✗ {e}", file=sys.stderr)
        return 1

    print("Validation passed.")
    summarize(cfg)

    if not args.apply:
        print("\nDry run — nothing was sent to Google Ads. Add --apply to deploy.")
        return 0

    if not args.customer_id:
        logger.error(
            "--customer-id is required with --apply. Without it the yaml default "
            "(OpenOcean) would receive this campaign."
        )
        return 1

    if not args.paused:
        print(
            "\nWARNING: deploying ENABLED. The account currently counts page_view, "
            "session_start, user_engagement, first_visit, scroll and form_start as "
            "primary PURCHASE conversions. Maximize-conversions will optimise toward "
            "those. Use --paused unless you have already set them to Secondary.",
            file=sys.stderr,
        )

    if not os.path.isfile(args.config):
        logger.error("Missing credentials file: %s", args.config)
        return 1

    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException

    client = GoogleAdsClient.load_from_storage(args.config)
    customer_id = normalize_customer_id(args.customer_id)

    try:
        deploy(client, customer_id, cfg, paused=args.paused, force=args.force)
    except GoogleAdsException as e:
        logger.error("Google Ads API rejected the request (request_id %s):", e.request_id)
        for err in e.failure.errors:
            loc = ".".join(str(p.field_name) for p in err.location.field_path_elements)
            logger.error("  %s — %s", loc or "?", err.message)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
