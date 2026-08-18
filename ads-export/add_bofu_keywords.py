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
CAMPAIGN_ID = 23973439325
LABEL_NAME = "BOFU — købsintention"

ADDITIONS = {
    "AG 1 - Højtalere & Lyd": [
        "leje af højtaler",
        "leje af højtalere",
        "udlejning af højtalere",
    ],
    "AG 9 - PA-anlæg og lydudstyr": [
        "lej pa anlæg",
        "leje af pa anlæg",
        "lej lydudstyr",
        "leje af lydudstyr",
        "lej lydanlæg",
        "leje af lydanlæg",
        "lej musikanlæg",
        "leje af musikanlæg",
    ],
    "AG 4 - Soundboks": [
        "udlejning af soundboks",
    ],
    "AG 13 - Trådløs mikrofon": [
        "leje af mikrofon",
        "leje af trådløs mikrofon",
        "udlejning af mikrofon",
    ],
    "AG 46 - Håndholdt mikrofon": [
        "leje af håndholdt mikrofon",
    ],
    "AG 42 - Skærm 32\"": [
        "leje af skærm",
        "skærm udlejning",
    ],
    "AG 10 - AV-udstyr": [
        "leje af av udstyr",
        "udlejning af av udstyr",
    ],
    "AG 5 - Lyskæder": [
        "leje af lyskæder",
        "lyskæder leje",
        "lyskæder udlejning",
    ],
    "AG 38 - Uplights": [
        "leje af uplights",
    ],
    "AG 2 — Festlys & diskokugle": [
        "leje af diskokugle",
        "udlejning af diskokugle",
    ],
    "AG 3 - Røgmaskine": [
        "udlejning af røgmaskine",
    ],
    "AG 6 - Lysshow": [
        "leje af lysshow",
    ],
    "AG 36 - Subwoofer": [
        "udlejning af subwoofer",
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
        SELECT ad_group.resource_name, ad_group.name, ad_group.status,
               ad_group_criterion.keyword.text
        FROM ad_group_criterion
        WHERE campaign.id = {CAMPAIGN_ID}
          AND ad_group_criterion.type = 'KEYWORD'
          AND ad_group_criterion.negative = FALSE
          AND ad_group_criterion.status = 'ENABLED'
          AND ad_group.status = 'ENABLED'
    """
    groups, owner = {}, {}
    for b in ga.search_stream(customer_id=customer_id, query=q):
        for r in b.results:
            n = r.ad_group.name
            groups.setdefault(n, {"resource_name": r.ad_group.resource_name, "keywords": set()})
            t = r.ad_group_criterion.keyword.text.lower()
            groups[n]["keywords"].add(t)
            owner[t] = n
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

    missing_groups = [g for g in ADDITIONS if g not in groups]
    if missing_groups:
        logger.error("Fandt ikke tændte grupper: %s", ", ".join(missing_groups))
        return 1

    plan, skipped, total = {}, [], 0
    for name, kws in ADDITIONS.items():
        new = []
        for k in kws:
            if k.lower() in groups[name]["keywords"]:
                continue
            if k.lower() in owner:
                skipped.append((k, owner[k.lower()]))
                continue
            new.append(k)
        if new:
            plan[name] = new
            total += len(new)

    print(f"\n{total} nye keywords i {len(plan)} grupper, alle mærket {LABEL_NAME!r}\n")
    for name in sorted(plan):
        print(f"  {name}")
        for k in plan[name]:
            print(f"      {k}")
    if skipped:
        print(f"\n  Sprunget over — findes allerede i en anden tændt gruppe ({len(skipped)}):")
        for k, g in skipped:
            print(f"      {k:<30} ligger i {g}")

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
        for name, kws in plan.items():
            ops = []
            for text in kws:
                op = client.get_type("AdGroupCriterionOperation")
                c = op.create
                c.ad_group = groups[name]["resource_name"]
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
            logger.info("%s: %d keywords", name, len(rns))
    except GoogleAdsException as e:
        logger.error("Google Ads afviste (request_id %s):", e.request_id)
        for err in e.failure.errors:
            logger.error("  %s", err.message)
        return 1

    after, after_owner = read_state(client, customer_id)
    mangler = [f"{n}: {k}" for n, kws in plan.items() for k in kws
               if k.lower() not in after[n]["keywords"]]
    if mangler:
        logger.error("Ikke registreret: %s", "; ".join(mangler))
        return 1

    import collections
    dupes = collections.Counter(after_owner)  # owner er allerede unik pr. tekst
    seen = collections.defaultdict(list)
    for n, g in after.items():
        for k in g["keywords"]:
            seen[k].append(n)
    cross = {k: v for k, v in seen.items() if len(v) > 1}
    if cross:
        logger.error("Dubletter på tværs af grupper: %s", cross)
        return 1

    logger.info("Tilføjede %d keywords. Ingen dubletter på tværs af tændte grupper.", total)
    return 0


if __name__ == "__main__":
    sys.exit(main())
