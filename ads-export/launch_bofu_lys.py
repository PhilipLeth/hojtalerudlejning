#!/usr/bin/env python3
"""
Tænd BOFU-grupperne for lys og for lyd+lys, med annoncer der siger "lej".

To færdigbyggede grupper lå pauset med kontoens stærkeste lejefraser, mens de
aktive lysgrupper kun havde de generiske ("festlys", "fest lys", "lys fest").
Nogen der søger "festlys" vil måske købe en lampe; nogen der søger "leje af lys
til fest" vil leje. Det er dem der er pengene værd.

  AG 29 — Lyspakke            → /lys-pakke   lys til festen
  AG 8  — Fest og event lyd   → /festlyd     lyd OG lys samlet

Tre ting ud over at tænde dem:

1. KEYWORDS. Lejefraserne der manglede. Ikke kombinatorisk genereret —
   phrase match kræver at lejeintentionen står i frasen selv, så "lyseffekter
   til fest" er udeladt mens "leje af lyseffekter" er med.

2. ANNONCER. Ingen af de eksisterende overskrifter indeholdt "lej" eller
   "leje" — kun beskrivelserne gjorde. Google viser tre overskrifter ad gangen,
   så en søgning på "leje af lys til fest" kunne møde "Lyspakke fra 495 kr.",
   der læser som et køb. Nye RSA'er sætter lejeordet i overskrifterne. Det
   løfter samtidig annoncerelevansen, som er den ene kvalitetskomponent der
   ikke er landingssiden.

   RSA'er kan ikke redigeres — en ny oprettes og den gamle fjernes.

   AG 8's annonce havde også forældede tal: "fra 399 kr." (billigste er 345)
   og "levering for 500 kr." (den er 495).

3. LABEL. Alle nye keywords mærkes "BOFU — købsintention", så de kan
   filtreres og måles for sig i rapporterne frem for at forsvinde i
   gennemsnittet.

Buddet er bevidst lavere end de generiske grupper (AG 2 står på 14,30): disse
fraser er smallere og billigere, og formålet er dækning, ikke at vinde hver
auktion.

  python3 ads-export/launch_bofu_lys.py --customer-id 4410207627
  python3 ads-export/launch_bofu_lys.py --customer-id 4410207627 --apply
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")
CAMPAIGN_ID = 23973439325
BID_DKK = 9.0
LABEL_NAME = "BOFU — købsintention"

HEADLINE_MAX = 30
DESCRIPTION_MAX = 90

GROUPS = {
    "AG 29 - Lyspakke": {
        "final_url": "https://lejhojtaler.dk/lys-pakke",
        "keywords": [
            "leje af lys til fest",
            "udlejning af lys til fest",
            "lys til fest leje",
            "lys til fest udlejning",
            "leje af festbelysning",
            "festbelysning leje",
            "lej festbelysning",
            "festbelysning udlejning",
            "lej lysudstyr",
            "lysudstyr leje",
            "lysudstyr udlejning",
            "leje af lyseffekter",
        ],
        "headlines": [
            "Lej Lys Til Festen",
            "Leje Af Festlys I KBH",
            "Lyspakke Til Leje 495 Kr",
            "Udlejning Af Festbelysning",
            "Lej Lyseffekter Fra 195 Kr",
            "Komplet Festlys I Én Pakke",
            "Lysbar, Effekter Og Stativ",
            "Afhentning I København K",
            "Ingen Depositum",
            "Betal Først Ved Afhentning",
            "Alt Udstyr Inkluderet",
            "Book Online På 3 Minutter",
            "Levering I KBH For 495 Kr.",
            "Nem Opsætning, Ingen Teknik",
            "Lejhøjtaler.dk",
        ],
        "descriptions": [
            "Lej komplet lyspakke fra 495 kr. Lysbar, effekter og stativer inkluderet.",
            "Leje af festlys i København — billigere end at leje effekterne hver for sig.",
            "Ingen depositum. Betal ved afhentning i KBH K. Gratis parkering på stedet.",
            "Kombiner med røgmaskine fra 245 kr. og få effekterne til at træde frem.",
        ],
    },
    "AG 8 - Fest og event lyd": {
        "final_url": "https://lejhojtaler.dk/festlyd",
        "keywords": [
            "lej lys og lyd",
            "leje af lys og lyd",
            "lej lyd og lys til fest",
            "leje af lyd og lys",
            "lys og lyd til fest leje",
            "leje af festudstyr",
            "lej lyd til fest",
            "leje af lyd til fest",
        ],
        "headlines": [
            "Lej Lyd Og Lys Til Fest",
            "Leje Af Festudstyr I KBH",
            "Lyd Til Fest Fra 345 Kr.",
            "Udlejning Af Festanlæg",
            "Festlyd I København",
            "Afhentning I København K",
            "Ingen Depositum",
            "Betal Først Ved Afhentning",
            "Levering I KBH For 495 Kr.",
            "Perfekt Til Havefest",
            "Lyd Til Fødselsdag",
            "Book Online, Svar Straks",
            "Kabler Og Stativer Med",
            "Nem Opsætning, Ingen Teknik",
            "Lejhøjtaler.dk",
        ],
        "descriptions": [
            "Lej festlyd fra 345 kr. i København. Perfekt til havefest, fødselsdag og privatfest.",
            "Ingen depositum — betal først når du henter. Book online på to minutter.",
            "Leje af professionelt festudstyr. Afhent i København K eller få leveret for 495 kr.",
            "Alt inkluderet — kabler, stativer og højtalere. Nem opsætning uden teknisk viden.",
        ],
    },
}

logger = logging.getLogger("bofu_lys")


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def gaql_escape(s: str) -> str:
    return s.replace("'", "''")


def validate_copy() -> list[str]:
    """Google afviser hele annoncen uden at sige hvilket felt der var for langt."""
    errors = []
    for name, g in GROUPS.items():
        if not 3 <= len(g["headlines"]) <= 15:
            errors.append(f"{name}: {len(g['headlines'])} overskrifter, skal være 3-15")
        if not 2 <= len(g["descriptions"]) <= 4:
            errors.append(f"{name}: {len(g['descriptions'])} beskrivelser, skal være 2-4")
        for h in g["headlines"]:
            if len(h) > HEADLINE_MAX:
                errors.append(f"{name}: overskrift {len(h)} > {HEADLINE_MAX}: {h!r}")
        for d in g["descriptions"]:
            if len(d) > DESCRIPTION_MAX:
                errors.append(f"{name}: beskrivelse {len(d)} > {DESCRIPTION_MAX}: {d!r}")
        rental = [h for h in g["headlines"] if any(w in h.lower() for w in ("lej", "leje", "udlejning"))]
        if len(rental) < 3:
            errors.append(f"{name}: kun {len(rental)} overskrifter med lejeord — mindst 3")
    return errors


def read_state(client, customer_id: str) -> dict:
    ga = client.get_service("GoogleAdsService")
    names = ", ".join(f"'{gaql_escape(n)}'" for n in GROUPS)
    q = f"""
        SELECT ad_group.resource_name, ad_group.name, ad_group.status,
               ad_group.cpc_bid_micros
        FROM ad_group
        WHERE campaign.id = {CAMPAIGN_ID} AND ad_group.name IN ({names})
          AND ad_group.status != 'REMOVED'
    """
    groups = {}
    for b in ga.search_stream(customer_id=customer_id, query=q):
        for r in b.results:
            groups[r.ad_group.name] = {
                "resource_name": r.ad_group.resource_name,
                "status": r.ad_group.status.name,
                "bid": r.ad_group.cpc_bid_micros / 1_000_000,
                "keywords": set(),
                "ads": [],
            }

    q2 = f"""
        SELECT ad_group.name, ad_group_criterion.keyword.text
        FROM ad_group_criterion
        WHERE campaign.id = {CAMPAIGN_ID} AND ad_group.name IN ({names})
          AND ad_group_criterion.type = 'KEYWORD'
          AND ad_group_criterion.negative = FALSE
          AND ad_group_criterion.status != 'REMOVED'
    """
    for b in ga.search_stream(customer_id=customer_id, query=q2):
        for r in b.results:
            if r.ad_group.name in groups:
                groups[r.ad_group.name]["keywords"].add(r.ad_group_criterion.keyword.text.lower())

    q3 = f"""
        SELECT ad_group.name, ad_group_ad.resource_name
        FROM ad_group_ad
        WHERE campaign.id = {CAMPAIGN_ID} AND ad_group.name IN ({names})
          AND ad_group_ad.status != 'REMOVED'
    """
    for b in ga.search_stream(customer_id=customer_id, query=q3):
        for r in b.results:
            if r.ad_group.name in groups:
                groups[r.ad_group.name]["ads"].append(r.ad_group_ad.resource_name)
    return groups


def find_label(client, customer_id: str) -> str | None:
    ga = client.get_service("GoogleAdsService")
    q = f"SELECT label.resource_name FROM label WHERE label.name = '{gaql_escape(LABEL_NAME)}'"
    for b in ga.search_stream(customer_id=customer_id, query=q):
        for r in b.results:
            return r.label.resource_name
    return None


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    ap = argparse.ArgumentParser(description="Tænd BOFU-grupper for lys og lyd+lys.")
    ap.add_argument("--config", default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG))
    ap.add_argument("--customer-id", default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""))
    ap.add_argument("--bid", type=float, default=BID_DKK)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    errors = validate_copy()
    if errors:
        for e in errors:
            print(f"  ✗ {e}", file=sys.stderr)
        return 1
    print("Annoncetekst valideret.")

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
    state = read_state(client, customer_id)

    missing = [n for n in GROUPS if n not in state]
    if missing:
        logger.error("Fandt ikke annoncegrupper: %s", ", ".join(missing))
        return 1

    plan = {}
    for name, cfg in GROUPS.items():
        s = state[name]
        new_kw = [k for k in cfg["keywords"] if k.lower() not in s["keywords"]]
        plan[name] = new_kw
        print(f"\n{name}  →  {cfg['final_url']}")
        print(f"  status  {s['status']}  →  ENABLED")
        print(f"  bud     {s['bid']:.2f} kr  →  {args.bid:.2f} kr")
        print(f"  keywords: {len(new_kw)} nye af {len(cfg['keywords'])}")
        for k in new_kw:
            print(f"      {k}")
        print(f"  annonce: ny RSA med {len(cfg['headlines'])} overskrifter "
              f"({sum(1 for h in cfg['headlines'] if 'lej' in h.lower())} med lejeord), "
              f"{len(s['ads'])} gammel fjernes")
    print(f"\nLabel: {LABEL_NAME!r} — sættes på alle nye keywords")

    if not args.apply:
        print("\nTørkørsel — intet skrevet. Tilføj --apply.")
        return 0

    try:
        label_rn = find_label(client, customer_id)
        if not label_rn:
            op = client.get_type("LabelOperation")
            op.create.name = LABEL_NAME
            op.create.text_label.background_color = "#c0392b"
            op.create.text_label.description = (
                "Fraser med eksplicit lejeintention — måles for sig, ikke i gennemsnittet."
            )
            label_rn = client.get_service("LabelService").mutate_labels(
                customer_id=customer_id, operations=[op]
            ).results[0].resource_name
            logger.info("Oprettede label %s", LABEL_NAME)

        for name, cfg in GROUPS.items():
            s = state[name]

            # Bud og status først — en tændt gruppe med 0,01 kr serverer intet.
            ag_op = client.get_type("AdGroupOperation")
            ag_op.update.resource_name = s["resource_name"]
            ag_op.update.cpc_bid_micros = int(args.bid * 1_000_000)
            ag_op.update.status = client.enums.AdGroupStatusEnum.ENABLED
            client.copy_from(ag_op.update_mask, FieldMask(paths=["cpc_bid_micros", "status"]))
            client.get_service("AdGroupService").mutate_ad_groups(
                customer_id=customer_id, operations=[ag_op]
            )

            new_rns = []
            if plan[name]:
                kw_ops = []
                for text in plan[name]:
                    op = client.get_type("AdGroupCriterionOperation")
                    c = op.create
                    c.ad_group = s["resource_name"]
                    c.status = client.enums.AdGroupCriterionStatusEnum.ENABLED
                    c.keyword.text = text
                    c.keyword.match_type = client.enums.KeywordMatchTypeEnum.PHRASE
                    kw_ops.append(op)

                svc = client.get_service("AdGroupCriterionService")
                # Preflight: fanger policy-afvisninger før halvdelen er live.
                req = client.get_type("MutateAdGroupCriteriaRequest")
                req.customer_id = customer_id
                req.operations.extend(kw_ops)
                req.validate_only = True
                svc.mutate_ad_group_criteria(request=req)
                req.validate_only = False
                new_rns = [r.resource_name for r in
                           svc.mutate_ad_group_criteria(request=req).results]
                logger.info("%s: %d keywords tilføjet", name, len(new_rns))

                lbl_ops = []
                for rn in new_rns:
                    op = client.get_type("AdGroupCriterionLabelOperation")
                    op.create.ad_group_criterion = rn
                    op.create.label = label_rn
                    lbl_ops.append(op)
                client.get_service("AdGroupCriterionLabelService").mutate_ad_group_criterion_labels(
                    customer_id=customer_id, operations=lbl_ops
                )

            # RSA'er kan ikke redigeres. Ny oprettes, gammel fjernes bagefter,
            # så gruppen aldrig står uden annonce.
            ad_op = client.get_type("AdGroupAdOperation")
            ad = ad_op.create
            ad.ad_group = s["resource_name"]
            ad.status = client.enums.AdGroupAdStatusEnum.ENABLED
            ad.ad.final_urls.append(cfg["final_url"])
            for h in cfg["headlines"]:
                asset = client.get_type("AdTextAsset")
                asset.text = h
                ad.ad.responsive_search_ad.headlines.append(asset)
            for d in cfg["descriptions"]:
                asset = client.get_type("AdTextAsset")
                asset.text = d
                ad.ad.responsive_search_ad.descriptions.append(asset)
            client.get_service("AdGroupAdService").mutate_ad_group_ads(
                customer_id=customer_id, operations=[ad_op]
            )

            if s["ads"]:
                rm_ops = []
                for rn in s["ads"]:
                    op = client.get_type("AdGroupAdOperation")
                    op.remove = rn
                    rm_ops.append(op)
                client.get_service("AdGroupAdService").mutate_ad_group_ads(
                    customer_id=customer_id, operations=rm_ops
                )
            logger.info("%s: ny annonce oprettet, %d gammel fjernet", name, len(s["ads"]))

    except GoogleAdsException as e:
        logger.error("Google Ads afviste (request_id %s):", e.request_id)
        for err in e.failure.errors:
            loc = ".".join(str(p.field_name) for p in err.location.field_path_elements)
            logger.error("  %s — %s", loc or "?", err.message)
        return 1

    after = read_state(client, customer_id)
    problems = []
    for name, cfg in GROUPS.items():
        a = after[name]
        if a["status"] != "ENABLED":
            problems.append(f"{name} er {a['status']}")
        if abs(a["bid"] - args.bid) > 0.01:
            problems.append(f"{name} bud {a['bid']}")
        mangler = [k for k in cfg["keywords"] if k.lower() not in a["keywords"]]
        if mangler:
            problems.append(f"{name} mangler: {', '.join(mangler)}")
        if len(a["ads"]) != 1:
            problems.append(f"{name} har {len(a['ads'])} annoncer, forventede 1")
    if problems:
        logger.error("Verifikation fejlede: %s", "; ".join(problems))
        return 1

    logger.info("Begge grupper kører på %.0f kr med nye annoncer og BOFU-mærkede keywords.",
                args.bid)
    return 0


if __name__ == "__main__":
    sys.exit(main())
