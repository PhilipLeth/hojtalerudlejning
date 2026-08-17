#!/usr/bin/env python3
"""
Fjern lånte YouTube-videoer fra Performance Max-kampagnen.

deploy_pmax.py linkede 19 YouTube-videoer som video-assets i troen om at det var
"real product clips" fra vores egne produktsider. Det var det ikke. Videoerne
tilhører Guitar Center, Shure, Chauvet, Soundboks, Epson og en håndfuld
tilfældige anmeldere. To problemer hvis de kører: fremmed ophavsret, og annoncer
der sender kunder mod amerikanske butikker i stedet for lejhojtaler.dk.

Da scriptet blev skrevet 17-08-2026 var alle 34 forbindelser allerede REMOVED —
de kørte ikke. Video-id'erne er samtidig fjernet fra ads/lejhojtaler-pmax.json,
for et deploy med --apply ville ellers have oprettet dem igen. Scriptet bliver
derfor stående som kontrol: kør det efter et deploy, og se at der er nul aktive
video-assets vi ikke selv har lavet.

Scriptet detacher alle aktive YOUTUBE_VIDEO-assets fra kampagnens asset groups.
Selve asset'et bliver liggende ubrugt i biblioteket — Google Ads API har ingen
remove-operation for assets — men et detachet asset vises ikke. Uden video
genererer PMax selv en video ud fra billederne i asset gruppen, så ingen gruppe
står tilbage uden video-dækning.

  python3 ads-export/strip_borrowed_videos.py --customer-id 4410207627
  python3 ads-export/strip_borrowed_videos.py --customer-id 4410207627 --apply
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")

logger = logging.getLogger("strip_borrowed_videos")


def normalize_customer_id(raw: str) -> str:
    return raw.replace("-", "").strip()


def find_video_links(client, customer_id: str, campaign_name: str | None) -> list[dict]:
    """Alle asset group ↔ YouTube-video-forbindelser, valgfrit filtreret til én kampagne."""
    ga = client.get_service("GoogleAdsService")
    # Filtrér på status. Fjernede forbindelser bliver liggende i API'et og kommer
    # med i svaret medmindre man beder om noget andet — uden filteret ser en
    # oprydning der er lavet for længe siden ud som 34 videoer der stadig kører,
    # og mutate afviser dem med "not allowed for removed resources".
    q = (
        "SELECT asset_group_asset.resource_name, asset_group.name, campaign.name, "
        "campaign.status, asset.youtube_video_asset.youtube_video_title, "
        "asset.youtube_video_asset.youtube_video_id "
        "FROM asset_group_asset "
        "WHERE asset_group_asset.field_type = 'YOUTUBE_VIDEO' "
        "AND asset_group_asset.status != 'REMOVED'"
    )
    links = []
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for row in batch.results:
            if campaign_name and row.campaign.name != campaign_name:
                continue
            links.append(
                {
                    "resource_name": row.asset_group_asset.resource_name,
                    "asset_group": row.asset_group.name,
                    "campaign": row.campaign.name,
                    "campaign_status": row.campaign.status.name,
                    "video_id": row.asset.youtube_video_asset.youtube_video_id,
                    "title": row.asset.youtube_video_asset.youtube_video_title,
                }
            )
    return links


def summarize(links: list[dict]) -> None:
    if not links:
        print("Ingen video-assets fundet — der er intet at fjerne.")
        return

    by_group: dict[str, list[dict]] = {}
    for link in links:
        by_group.setdefault(f"{link['campaign']} / {link['asset_group']}", []).append(link)

    videos = {link["video_id"]: link["title"] for link in links}
    print(f"\n{len(links)} forbindelser på tværs af {len(by_group)} asset groups "
          f"({len(videos)} unikke videoer):\n")
    for group in sorted(by_group):
        print(f"  {group}")
        for link in by_group[group]:
            print(f"    − {link['video_id']}  {link['title'][:64]}")
    print()


def strip(client, customer_id: str, links: list[dict]) -> int:
    service = client.get_service("AssetGroupAssetService")
    ops = []
    for link in links:
        op = client.get_type("AssetGroupAssetOperation")
        op.remove = link["resource_name"]
        ops.append(op)

    # Ét mutate for hele bundtet: enten ryger alle 19 væk, eller ingen. En delvis
    # oprydning ville efterlade kampagnen i en tilstand ingen har besluttet.
    resp = service.mutate_asset_group_assets(customer_id=customer_id, operations=ops)
    logger.info("Fjernede %d video-forbindelser.", len(resp.results))
    return 0


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    ap = argparse.ArgumentParser(description="Fjern lånte YouTube-videoer fra PMax.")
    ap.add_argument(
        "--config",
        default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG),
        help="google-ads.yaml med credentials (deles med openocean-promo)",
    )
    ap.add_argument(
        "--customer-id",
        default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""),
        help="Lejhøjtaler er 4410207627 — yaml'ens default er OpenOcean.",
    )
    ap.add_argument(
        "--campaign",
        default="Lejhøjtaler — Performance Max",
        help="Begræns til én kampagne. Tom streng rammer alle kampagner på kontoen.",
    )
    ap.add_argument("--apply", action="store_true", help="Udfør fjernelsen.")
    args = ap.parse_args()

    if not args.customer_id:
        logger.error("--customer-id er påkrævet (Lejhøjtaler: 4410207627).")
        return 1
    if not os.path.exists(args.config):
        logger.error("Mangler credentials-fil: %s", args.config)
        return 1

    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException

    client = GoogleAdsClient.load_from_storage(args.config)
    customer_id = normalize_customer_id(args.customer_id)

    try:
        links = find_video_links(client, customer_id, args.campaign or None)
        summarize(links)

        if not links:
            return 0
        if not args.apply:
            print("Dry run — intet er sendt til Google Ads. Tilføj --apply for at fjerne.")
            return 0

        return strip(client, customer_id, links)
    except GoogleAdsException as e:
        logger.error("Google Ads API afviste kaldet (request_id %s):", e.request_id)
        for err in e.failure.errors:
            loc = ".".join(str(p.field_name) for p in err.location.field_path_elements)
            logger.error("  %s — %s", loc or "?", err.message)
        return 1


if __name__ == "__main__":
    sys.exit(main())
