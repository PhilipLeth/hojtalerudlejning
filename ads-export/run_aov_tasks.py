#!/usr/bin/env python3
"""
Kør de fire annonceopgaver under epic_aov / aov-6.

Rækkefølgen er ikke til forhandling: værnet før udvidelsen. Keyword Planner
viser at volumen på de bare "lys til <anledning>"-fraser er blandet sammen med
stearinlys og bryllupssange — "stearinlys bryllup", "stearinlys til
konfirmation", "bryllupssang med lys" ligger i samme klynge. Byder vi uden
negative keywords, betaler vi for folk der leder efter levende lys.

  ads-negative-stearinlys     værn mod stearinlys, lysestager og bryllupssange
  ads-lyskaeder-bryllup       100 søgn./md, helt udækket
  ads-lys-havefest             70 søgn./md, helt udækket
  ads-anledninger-saeson      tænd de anledninger der er i sæson NU

Ejerskab: AG 16 (/bryllup) overtager bryllups-lyskæder fra AG 5 (/lyskaeder).
Anledningssiden er den bedre landingsside for en bryllupssøgning, og AG 5 får
"bryllup" som negativ, så de to ikke byder mod hinanden. AG 5's egen
"lej lyskæder til bryllup" fjernes ikke — den bliver bare inaktiv.

Sæson pr. 18. august: bryllup, havefest, fødselsdag og polterabend er i sæson.
Julefrokost hører til september, konfirmation til det tidlige forår,
studenterkørsel til juni og nytår til december — de forbliver pausede.

  python3 ads-export/run_aov_tasks.py --customer-id 4410207627
  python3 ads-export/run_aov_tasks.py --customer-id 4410207627 --apply
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")
CAMPAIGN_ID = 23973439325
LABEL = "customers/4410207627/labels/22270631751"
BID_DKK = 10.0

# ── ads-negative-stearinlys ──────────────────────────────────────────────
# Stearinlys og bryllupssange deler ordet "lys" med festbelysning.
NEGATIVES = {
    "AG 16 - Bryllup":            ["stearinlys", "lysestage", "levende lys", "bloklys",
                                   "bryllupssang", "salme", "lyskæde diy"],
    "AG 18 - Havefest":           ["stearinlys", "lysestage", "solcellelys", "havelamper"],
    "AG 29 - Lyspakke":           ["stearinlys", "lysestage", "levende lys", "fyrfadslys"],
    "AG 2 — Festlys & diskokugle":["stearinlys", "lysestage", "levende lys"],
    "AG 5 - Lyskæder":            ["stearinlys", "solcellelys", "julelys",
                                   # AG 16 ejer bryllupssøgningerne — bedre landingsside
                                   "bryllup"],
}

# ── ads-lyskaeder-bryllup og ads-lys-havefest ────────────────────────────
KEYWORDS = {
    "AG 16 - Bryllup": ["lyskæder til bryllup", "lyskæder bryllup",
                        "lys til bryllup", "uplights til bryllup",
                        "festbelysning bryllup"],
    "AG 18 - Havefest": ["lys til havefest", "lyskæder til havefest",
                         "lyskæde havefest", "havefest lys",
                         "festbelysning havefest"],
}

# ── ads-anledninger-saeson ───────────────────────────────────────────────
IN_SEASON = ["AG 16 - Bryllup", "AG 18 - Havefest",
             "AG 17 - Fødselsdag", "AG 22 - Polterabend"]
OUT_OF_SEASON = {
    "AG 19 - Julefrokost": "september",
    "AG 20 - Konfirmation": "tidligt forår",
    "AG 23 - Studenterkørsel": "juni",
    "AG 21 - Nytår": "december",
}

logger = logging.getLogger("aov_tasks")


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def read_state(client, customer_id: str):
    ga = client.get_service("GoogleAdsService")
    names = set(NEGATIVES) | set(KEYWORDS) | set(IN_SEASON)
    q = f"""
        SELECT ad_group.resource_name, ad_group.name, ad_group.status,
               ad_group.cpc_bid_micros, ad_group_criterion.keyword.text,
               ad_group_criterion.negative
        FROM ad_group_criterion
        WHERE campaign.id = {CAMPAIGN_ID}
          AND ad_group.name IN ({", ".join(repr(n) for n in names)})
          AND ad_group_criterion.type = 'KEYWORD'
          AND ad_group_criterion.status != 'REMOVED'
    """.replace("'", '"').replace('"', "'", 0)
    q = q.replace("(" + ", ".join(repr(n) for n in names) + ")",
                  "(" + ", ".join("'" + n.replace("'", "''") + "'" for n in names) + ")")
    g = {}
    for b in ga.search_stream(customer_id=customer_id, query=q):
        for r in b.results:
            d = g.setdefault(r.ad_group.name, {
                "rn": r.ad_group.resource_name, "status": r.ad_group.status.name,
                "bid": r.ad_group.cpc_bid_micros / 1_000_000, "pos": set(), "neg": set()})
            t = r.ad_group_criterion.keyword.text.lower()
            (d["neg"] if r.ad_group_criterion.negative else d["pos"]).add(t)

    # Annoncer — en gruppe uden godkendt annonce må ikke tændes
    q2 = f"""
        SELECT ad_group.name, ad_group_ad.status,
               ad_group_ad.policy_summary.approval_status
        FROM ad_group_ad
        WHERE campaign.id = {CAMPAIGN_ID}
          AND ad_group_ad.status != 'REMOVED'
    """
    for b in ga.search_stream(customer_id=customer_id, query=q2):
        for r in b.results:
            if r.ad_group.name in g:
                g[r.ad_group.name].setdefault("ads", []).append(
                    r.ad_group_ad.policy_summary.approval_status.name)
    return g


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    ap = argparse.ArgumentParser(description="Kør AOV-annonceopgaverne.")
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

    missing = [n for n in set(NEGATIVES) | set(KEYWORDS) | set(IN_SEASON) if n not in st]
    if missing:
        logger.error("Fandt ikke: %s", ", ".join(missing))
        return 1

    plan_neg = {n: [k for k in v if k.lower() not in st[n]["neg"]] for n, v in NEGATIVES.items()}
    plan_neg = {n: v for n, v in plan_neg.items() if v}
    plan_kw = {n: [k for k in v if k.lower() not in st[n]["pos"]] for n, v in KEYWORDS.items()}
    plan_kw = {n: v for n, v in plan_kw.items() if v}
    to_enable = [n for n in IN_SEASON if st[n]["status"] != "ENABLED"]

    print("\n1. ads-negative-stearinlys — værn mod stearinlys og bryllupssange")
    for n, v in plan_neg.items():
        print(f"   {n:<30} {', '.join(v)}")
    print("\n2-3. ads-lyskaeder-bryllup og ads-lys-havefest")
    for n, v in plan_kw.items():
        print(f"   {n:<30} {len(v)} nye")
        for k in v:
            print(f"      {k}")
    print("\n4. ads-anledninger-saeson — i sæson nu")
    for n in IN_SEASON:
        ads = st[n].get("ads", [])
        ok = ads and all(a == "APPROVED" for a in ads)
        mark = "TÆNDES" if n in to_enable else "allerede tændt"
        print(f"   {n:<30} {st[n]['status']:<8} {st[n]['bid']:>5.2f} kr  "
              f"{len(ads)} annonce(r) {'godkendt' if ok else '⚠ IKKE GODKENDT'}  → {mark}")
    print("   Uden for sæson, forbliver pausede:")
    for n, m in OUT_OF_SEASON.items():
        print(f"      {n:<28} tændes i {m}")

    blocked = [n for n in to_enable
               if not st[n].get("ads") or any(a != "APPROVED" for a in st[n]["ads"])]
    if blocked:
        logger.error("Kan ikke tændes uden godkendt annonce: %s", ", ".join(blocked))
        return 1

    if not args.apply:
        print("\nTørkørsel — intet skrevet. Tilføj --apply.")
        return 0

    svc = client.get_service("AdGroupCriterionService")
    try:
        # Værnet FØRST — grupperne må ikke nå at servere uden det.
        ops = []
        for n, v in plan_neg.items():
            for t in v:
                op = client.get_type("AdGroupCriterionOperation")
                c = op.create
                c.ad_group = st[n]["rn"]; c.negative = True
                c.keyword.text = t
                c.keyword.match_type = client.enums.KeywordMatchTypeEnum.BROAD
                ops.append(op)
        if ops:
            svc.mutate_ad_group_criteria(customer_id=cid, operations=ops)
            logger.info("Værn: %d negative keywords", len(ops))

        for n, v in plan_kw.items():
            ops = []
            for t in v:
                op = client.get_type("AdGroupCriterionOperation")
                c = op.create
                c.ad_group = st[n]["rn"]
                c.status = client.enums.AdGroupCriterionStatusEnum.ENABLED
                c.keyword.text = t
                c.keyword.match_type = client.enums.KeywordMatchTypeEnum.PHRASE
                ops.append(op)
            req = client.get_type("MutateAdGroupCriteriaRequest")
            req.customer_id = cid; req.operations.extend(ops); req.validate_only = True
            svc.mutate_ad_group_criteria(request=req)
            req.validate_only = False
            rns = [r.resource_name for r in svc.mutate_ad_group_criteria(request=req).results]
            lbl = []
            for rn in rns:
                o = client.get_type("AdGroupCriterionLabelOperation")
                o.create.ad_group_criterion = rn; o.create.label = LABEL
                lbl.append(o)
            client.get_service("AdGroupCriterionLabelService").mutate_ad_group_criterion_labels(
                customer_id=cid, operations=lbl)
            logger.info("%s: %d keywords, BOFU-mærket", n, len(rns))

        if to_enable:
            ag_ops = []
            for n in to_enable:
                op = client.get_type("AdGroupOperation")
                op.update.resource_name = st[n]["rn"]
                op.update.cpc_bid_micros = int(BID_DKK * 1_000_000)
                op.update.status = client.enums.AdGroupStatusEnum.ENABLED
                client.copy_from(op.update_mask,
                                 FieldMask(paths=["cpc_bid_micros", "status"]))
                ag_ops.append(op)
            client.get_service("AdGroupService").mutate_ad_groups(
                customer_id=cid, operations=ag_ops)
            logger.info("Tændt: %s", ", ".join(to_enable))
    except GoogleAdsException as e:
        logger.error("Google Ads afviste (request_id %s):", e.request_id)
        for err in e.failure.errors:
            logger.error("  %s", err.message)
        return 1

    after = read_state(client, cid)
    problems = []
    for n, v in plan_neg.items():
        miss = [k for k in v if k.lower() not in after[n]["neg"]]
        if miss: problems.append(f"{n} negative mangler: {miss}")
    for n, v in plan_kw.items():
        miss = [k for k in v if k.lower() not in after[n]["pos"]]
        if miss: problems.append(f"{n} keywords mangler: {miss}")
    for n in IN_SEASON:
        if after[n]["status"] != "ENABLED": problems.append(f"{n} er {after[n]['status']}")
    for n in OUT_OF_SEASON:
        if n in after and after[n]["status"] == "ENABLED":
            problems.append(f"{n} blev tændt — den er uden for sæson")
    if problems:
        logger.error("Verifikation fejlede: %s", "; ".join(problems))
        return 1

    logger.info("Alle fire opgaver kørt og verificeret.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
