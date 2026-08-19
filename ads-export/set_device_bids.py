#!/usr/bin/env python3
"""
Enhedsjustering på søgekampagnerne.

Isoleret på den ægte purchase-handling, seneste 30 dage i hovedkampagnen:

              klik   forbrug   bookinger   ordreværdi   ROAS   pris/booking
  Desktop       51    617 kr           4     2.180 kr   3,5×        154 kr
  Mobil        163  1.790 kr           2       840 kr  0,47×        895 kr
  Tablet         1      7 kr           0           0      —            —

Desktop konverterer 6,5 gange bedre og har 30 % højere ordreværdi, mens mobil
æder 74 % af forbruget og koster 895 kr pr. booking mod en gennemsnitsordre på
420 kr.

Justeringen sænker mobil og tablet frem for at hæve desktop. Enhedsbud er
relative, så begge veje flytter fordelingen — men at sænke rammer spildet
direkte i stedet for at hæve CPC'en på det der allerede virker.

−25 % og ikke mere: grundlaget er fire og to konverteringer. Nok til en
retning, ikke nok til et stort snit. Og mobil kan være opdagelsen før en
booking på computeren senere.

Bemærk at CTR er identisk på de to enheder (10,1 %). Folk klikker lige så gerne
fra mobilen — de booker bare ikke. Det peger på bookingflowet på mobil, ikke på
annoncerne, og det problem løser en enhedsjustering ikke.

  python3 ads-export/set_device_bids.py --customer-id 4410207627
  python3 ads-export/set_device_bids.py --customer-id 4410207627 --apply
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")
CAMPAIGNS = {
    23973439325: "Højtaler Udlejning - Search",
    24108797469: "Lejhøjtaler — Yderområder",
}
MODIFIERS = {"MOBILE": 0.75, "TABLET": 0.75, "DESKTOP": 1.0}

logger = logging.getLogger("device_bids")


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def read_state(client, customer_id: str):
    ga = client.get_service("GoogleAdsService")
    ids = ", ".join(str(c) for c in CAMPAIGNS)
    q = f"""
        SELECT campaign.id, campaign.resource_name, campaign_criterion.resource_name,
               campaign_criterion.device.type, campaign_criterion.bid_modifier
        FROM campaign_criterion
        WHERE campaign.id IN ({ids}) AND campaign_criterion.type = 'DEVICE'
    """
    out = {}
    for b in ga.search_stream(customer_id=customer_id, query=q):
        for r in b.results:
            out.setdefault(r.campaign.id, {})[r.campaign_criterion.device.type_.name] = {
                "rn": r.campaign_criterion.resource_name,
                "modifier": r.campaign_criterion.bid_modifier,
                "campaign_rn": r.campaign.resource_name,
            }
    return out


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    ap = argparse.ArgumentParser(description="Sæt enhedsbud på søgekampagnerne.")
    ap.add_argument("--config", default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG))
    ap.add_argument("--customer-id", default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""))
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    if not args.customer_id or not os.path.isfile(args.config):
        logger.error("--customer-id og gyldig --config er påkrævet.")
        return 1

    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException
    from google.protobuf.field_mask_pb2 import FieldMask

    client = GoogleAdsClient.load_from_storage(args.config)
    cid = normalize_customer_id(args.customer_id)
    st = read_state(client, cid)

    plan = []
    print()
    for camp_id, name in CAMPAIGNS.items():
        print(f"{name}")
        devices = st.get(camp_id, {})
        for dev, want in MODIFIERS.items():
            cur = devices.get(dev)
            if not cur:
                print(f"   {dev:<9} intet kriterium — oprettes")
                plan.append(("create", camp_id, dev, want, None))
                continue
            now = cur["modifier"] or 1.0
            if abs(now - want) < 0.001:
                print(f"   {dev:<9} {now:.2f}  (uændret)")
            else:
                pct = lambda m: f"{(m - 1) * 100:+.0f} %" if abs(m - 1) > 0.001 else "neutral"
                print(f"   {dev:<9} {now:.2f} ({pct(now)})  →  {want:.2f} ({pct(want)})")
                plan.append(("update", camp_id, dev, want, cur["rn"]))
    if not plan:
        print("\nIntet at gøre.")
        return 0
    if not args.apply:
        print("\nTørkørsel — intet skrevet. Tilføj --apply.")
        return 0

    svc = client.get_service("CampaignCriterionService")
    ops = []
    for kind, camp_id, dev, want, rn in plan:
        op = client.get_type("CampaignCriterionOperation")
        if kind == "update":
            op.update.resource_name = rn
            op.update.bid_modifier = want
            client.copy_from(op.update_mask, FieldMask(paths=["bid_modifier"]))
        else:
            c = op.create
            c.campaign = f"customers/{cid}/campaigns/{camp_id}"
            c.device.type_ = getattr(client.enums.DeviceEnum, dev)
            c.bid_modifier = want
        ops.append(op)
    try:
        svc.mutate_campaign_criteria(customer_id=cid, operations=ops)
    except GoogleAdsException as e:
        logger.error("Google Ads afviste (request_id %s):", e.request_id)
        for err in e.failure.errors:
            logger.error("  %s", err.message)
        return 1

    after = read_state(client, cid)
    bad = []
    for camp_id in CAMPAIGNS:
        for dev, want in MODIFIERS.items():
            got = (after.get(camp_id, {}).get(dev) or {}).get("modifier") or 1.0
            if abs(got - want) > 0.001:
                bad.append(f"{CAMPAIGNS[camp_id]}/{dev}={got:.2f}")
    if bad:
        logger.error("Verifikation fejlede: %s", ", ".join(bad))
        return 1
    logger.info("Enhedsbud sat: mobil og tablet −25 %%, desktop neutral.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
