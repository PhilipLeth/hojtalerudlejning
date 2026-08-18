#!/usr/bin/env python3
"""
Tilføj de manglende lejeformer på lyd- og udstyrsgrupperne, mærket BOFU.

launch_bofu_lys.py gjorde det for lys. En optælling på tværs af alle tændte
grupper viste at hullet er generelt: `leje af X` fandtes kun i 6 af 19 grupper,
`udlejning af X` i 2. Det er den mest almindelige måde danskere skriver det på.

De groveste huller:
  AG 1 — Højtalere & Lyd      kontoens største, manglede "leje af højtaler"
  AG 9 — PA-anlæg og lydudstyr 10 keywords, hverken "lej X" eller "leje af X"

Fraserne er ikke genereret kombinatorisk fra produktnavne — det gav sidst
sludder som "lej en festlys pakke". Hver gruppe får kun de standardformer af
det navneord gruppen allerede ejer, og kun dem der lyder som noget en kunde
faktisk taster.

Grupper der bevidst ikke røres:
  AG 15 (EN)              engelsk, andre formuleringer
  AG 37 — PA-anlæg        overlapper AG 9; ville kannibalisere
  AG 31, AG 40            for smalle til at bære flere fraser

Scriptet afviser at tilføje et keyword der allerede findes i en anden tændt
gruppe. Det var præcis sådan AG 1 kaprede Soundboks-søgningerne til tre gange
prisen.

  python3 ads-export/add_bofu_keywords.py --customer-id 4410207627
  python3 ads-export/add_bofu_keywords.py --customer-id 4410207627 --apply
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
LABEL_NAME = "BOFU — købsintention"

# Nøglet på (kampagne-id, annoncegruppe). De to kampagner rammer forskellig
# geografi — hovedkampagnen Københavns Kommune, Yderområder forstæderne — så
# den SAMME frase i begge er tilsigtet og konkurrerer ikke: en bruger er i det
# ene område eller det andet. Dubletter inden for samme kampagne er derimod
# skadelige, og det er dem værnet fanger.
ADDITIONS = {
    # ── Yderområder: havde 0 af 29 keywords BOFU-mærket ──────────────────
    (24108797469, "YDER - Stor højtalerpakke"): [
        "leje af højtaler",
        "leje af højtalere",
        "højtaler udlejning",
        "udlejning af højtalere",
    ],
    (24108797469, "YDER - Lille højtalerpakke"): [
        "lej højtalerpakke",
        "højtalerpakke leje",
        "leje af højtalerpakke",
    ],
    (24108797469, "YDER - PA-anlæg"): [
        "pa anlæg leje",
        "lydudstyr leje",
        "leje af lydudstyr",
        "lydanlæg udlejning",
    ],
    (24108797469, "YDER - Stor festpakke"): [
        "festanlæg leje",
        "leje af festanlæg",
        "udlejning af festanlæg",
    ],
    (24108797469, "YDER - Lille festpakke"): [
        "leje af festudstyr",
        "leje af festpakke",
        "udlejning af festudstyr",
    ],
    (24108797469, "YDER - Karaoke"): [
        "udlejning af karaoke",
        "lej karaokeanlæg",
        "karaokeanlæg leje",
    ],
    (24108797469, "YDER - Mackie Thump GO"): [
        "leje af batterihøjtaler",
        "batterihøjtaler leje",
    ],
    (24108797469, "YDER - Bryllup"): [
        "lyd til bryllup leje",
        "leje af lyd til bryllup",
        "leje af højtaler til bryllup",
    ],

    # ── Hovedkampagnen: de tyndeste grupper der stod tilbage ─────────────
    (23973439325, "AG 31 - Præsentationspakke"): [
        "lej præsentationsudstyr",
        "præsentationsudstyr leje",
        "leje af præsentationsudstyr",
    ],
    (23973439325, "AG 40 - Low fog maskine"): [
        "leje af low fog maskine",
    ],
    (23973439325, "AG 46 - Håndholdt mikrofon"): [
        "håndholdt mikrofon udlejning",
    ],
    (23973439325, "AG 42 - Skærm 32\""): [
        "udlejning af skærm",
    ],
    (23973439325, "AG 5 - Lyskæder"): [
        "udlejning af lyskæder",
    ],
    (23973439325, "AG 38 - Uplights"): [
        "udlejning af uplights",
    ],
    (23973439325, "AG 6 - Lysshow"): [
        "udlejning af lysshow",
    ],
    (23973439325, "AG 9 - PA-anlæg og lydudstyr"): [
        "udlejning af lydudstyr",
    ],
    (23973439325, "AG 8 - Fest og event lyd"): [
        "udlejning af festudstyr",
    ],
}

logger = logging.getLogger("add_bofu")


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def gaql_escape(s: str) -> str:
    return s.replace("'", "''")


def read_state(client, customer_id: str):
    ga = client.get_service("GoogleAdsService")
    q = f"""
        SELECT campaign.id, ad_group.resource_name, ad_group.name, ad_group.status,
               ad_group_criterion.keyword.text
        FROM ad_group_criterion
        WHERE campaign.id IN ({", ".join(str(c) for c in CAMPAIGNS)})
          AND ad_group_criterion.type = 'KEYWORD'
          AND ad_group_criterion.negative = FALSE
          AND ad_group_criterion.status = 'ENABLED'
          AND ad_group.status = 'ENABLED'
    """
    groups, owner = {}, {}
    for b in ga.search_stream(customer_id=customer_id, query=q):
        for r in b.results:
            key = (r.campaign.id, r.ad_group.name)
            groups.setdefault(key, {"resource_name": r.ad_group.resource_name, "keywords": set()})
            t = r.ad_group_criterion.keyword.text.lower()
            groups[key]["keywords"].add(t)
            # Ejerskab holdes PR. KAMPAGNE — samme frase i to kampagner med
            # hver sin geografi er tilsigtet.
            owner[(r.campaign.id, t)] = r.ad_group.name
    return groups, owner


def find_label(client, customer_id: str):
    ga = client.get_service("GoogleAdsService")
    q = f"SELECT label.resource_name FROM label WHERE label.name = '{gaql_escape(LABEL_NAME)}'"
    for b in ga.search_stream(customer_id=customer_id, query=q):
        for r in b.results:
            return r.label.resource_name
    return None


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    ap = argparse.ArgumentParser(description="Tilføj manglende lejeformer, mærket BOFU.")
    ap.add_argument("--config", default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG))
    ap.add_argument("--customer-id", default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""))
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

    client = GoogleAdsClient.load_from_storage(args.config)
    customer_id = normalize_customer_id(args.customer_id)
    groups, owner = read_state(client, customer_id)

    missing_groups = [f"{CAMPAIGNS[c]} / {n}" for (c, n) in ADDITIONS if (c, n) not in groups]
    if missing_groups:
        logger.error("Fandt ikke tændte grupper: %s", ", ".join(missing_groups))
        return 1

    plan, skipped, total = {}, [], 0
    for key, kws in ADDITIONS.items():
        cid, name = key
        new = []
        for k in kws:
            if k.lower() in groups[key]["keywords"]:
                continue
            if (cid, k.lower()) in owner:
                skipped.append((CAMPAIGNS[cid], k, owner[(cid, k.lower())]))
                continue
            new.append(k)
        if new:
            plan[key] = new
            total += len(new)

    print(f"\n{total} nye keywords i {len(plan)} grupper, alle mærket {LABEL_NAME!r}")
    for cid, cname in CAMPAIGNS.items():
        rows = {k: v for k, v in plan.items() if k[0] == cid}
        if not rows:
            continue
        print(f"\n  === {cname} ===")
        for (_, name) in sorted(rows, key=lambda x: x[1]):
            print(f"  {name}")
            for k in rows[(cid, name)]:
                print(f"      {k}")
    if skipped:
        print(f"\n  Sprunget over — findes i samme kampagne ({len(skipped)}):")
        for cname, k, g in skipped:
            print(f"      {k:<32} {cname} / {g}")

    if not plan:
        print("\nIntet at gøre.")
        return 0
    if not args.apply:
        print("\nTørkørsel — intet skrevet. Tilføj --apply.")
        return 0

    label_rn = find_label(client, customer_id)
    if not label_rn:
        logger.error("Fandt ikke label %r — kør launch_bofu_lys.py først.", LABEL_NAME)
        return 1

    svc = client.get_service("AdGroupCriterionService")
    try:
        for key, kws in plan.items():
            ops = []
            for text in kws:
                op = client.get_type("AdGroupCriterionOperation")
                c = op.create
                c.ad_group = groups[key]["resource_name"]
                c.status = client.enums.AdGroupCriterionStatusEnum.ENABLED
                c.keyword.text = text
                c.keyword.match_type = client.enums.KeywordMatchTypeEnum.PHRASE
                ops.append(op)

            req = client.get_type("MutateAdGroupCriteriaRequest")
            req.customer_id = customer_id
            req.operations.extend(ops)
            req.validate_only = True
            svc.mutate_ad_group_criteria(request=req)
            req.validate_only = False
            rns = [r.resource_name for r in svc.mutate_ad_group_criteria(request=req).results]

            lbl = []
            for rn in rns:
                op = client.get_type("AdGroupCriterionLabelOperation")
                op.create.ad_group_criterion = rn
                op.create.label = label_rn
                lbl.append(op)
            client.get_service("AdGroupCriterionLabelService").mutate_ad_group_criterion_labels(
                customer_id=customer_id, operations=lbl
            )
            logger.info("%s / %s: %d keywords", CAMPAIGNS[key[0]], key[1], len(rns))
    except GoogleAdsException as e:
        logger.error("Google Ads afviste (request_id %s):", e.request_id)
        for err in e.failure.errors:
            logger.error("  %s", err.message)
        return 1

    after, after_owner = read_state(client, customer_id)
    mangler = [f"{k}" for key, kws in plan.items() for k in kws
               if k.lower() not in after[key]["keywords"]]
    if mangler:
        logger.error("Ikke registreret: %s", "; ".join(mangler))
        return 1

    # Dubletter tjekkes PR. KAMPAGNE: samme frase i begge kampagner er
    # tilsigtet, fordi de rammer hver sin geografi.
    import collections
    seen = collections.defaultdict(list)
    for (cid, n), g in after.items():
        for k in g["keywords"]:
            seen[(cid, k)].append(n)
    cross = {k: v for k, v in seen.items() if len(v) > 1}
    if cross:
        logger.error("Dubletter inden for en kampagne: %s", cross)
        return 1

    logger.info("Tilføjede %d keywords. Ingen dubletter inden for nogen kampagne.", total)
    return 0


if __name__ == "__main__":
    sys.exit(main())
