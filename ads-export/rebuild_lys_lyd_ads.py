#!/usr/bin/env python3
"""
Gør lys- og lyd-grupperne annonceklare: rette landingssider, lejeord i
overskrifterne, og nok aktiver til at annoncestyrken holder.

Gennemgangen af de 24 lys- og lyd-grupper fandt tre slags problemer:

1. AG 6 — Lysshow pegede på /lysshow, som giver 404 i produktion. En tændt
   gruppe med ni keywords sendte betalt trafik til en side der ikke findes.
   Flyttet til /festlys, som er kategorisiden for lysshow, moving heads og DMX.

2. Otte grupper havde annoncestyrke POOR og under tre overskrifter med
   lejeord. Google viser tre overskrifter ad gangen — uden lejeord kan en
   annonce på "leje af subwoofer" læse som et salg.

3. Annoncerne var korte. RSA'er scorer på mængde og variation af aktiver;
   femten overskrifter og fire beskrivelser er hvad der skal til.

RSA'er kan ikke redigeres. Ny oprettes først, gammel fjernes bagefter, så
gruppen aldrig står uden annonce. AG 5 havde to annoncer og får kun én.

  python3 ads-export/rebuild_lys_lyd_ads.py --customer-id 4410207627
  python3 ads-export/rebuild_lys_lyd_ads.py --customer-id 4410207627 --apply
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")
CAMPAIGN_ID = 23973439325
HEADLINE_MAX, DESCRIPTION_MAX = 30, 90
MIN_RENTAL_HEADLINES = 5

COMMON = [
    "Afhentning I København K",
    "Ingen Depositum",
    "Betal Først Ved Afhentning",
    "Hent Fredag, Aflever Mandag",
    "Book Online På 2 Minutter",
    "Levering I KBH For 495 Kr.",
    "Lejhøjtaler.dk",
]

ADS = {
    "AG 36 - Subwoofer": {
        "url": "https://lejhojtaler.dk/subwoofer",
        "headlines": [
            "Lej Subwoofer 295 Kr", "Leje Af Subwoofer I KBH", "Udlejning Af Subwoofer",
            'Behringer 12" Aktiv Sub', "Dyb Bas Til Dansegulvet", "Passer Til Alle Anlæg",
            "Signalkabel Følger Med", "Lej Bas Til Festen",
        ] + COMMON,
        "descriptions": [
            "Lej 12\" aktiv subwoofer til 295 kr for weekenden. Giver festen den dybe bas.",
            "Leje af Behringer-sub i København. Strøm- og signalkabel følger med.",
            "Kombinér med en højtalerpakke og få tryk på dansegulvet.",
            "Ingen depositum. Betal ved afhentning i København K, gratis parkering.",
        ],
    },
    "AG 46 - Håndholdt mikrofon": {
        "url": "https://lejhojtaler.dk/haandholdt-mikrofon",
        "headlines": [
            "Lej Mikrofon Fra 95 Kr", "Leje Af Håndholdt Mikrofon", "Udlejning Af Mikrofon",
            "Shure Beta 58A Til Leje", "Mikrofon Til Taler Og Sang", "Kabel Følger Med",
            "Lej Mikrofon I København", "Klar Til Brug Straks",
        ] + COMMON,
        "descriptions": [
            "Lej håndholdt mikrofon fra 95 kr. Til taler, sang og fest.",
            "Leje af Shure Beta 58A — klassikeren til vokal — for 195 kr.",
            "XLR-kabel følger med. Passer til alle vores højtalerpakker.",
            "Ingen depositum. Hent fredag i København K og aflever mandag.",
        ],
    },
    "AG 13 - Trådløs mikrofon": {
        "url": "https://lejhojtaler.dk/traadloes-mikrofon",
        "headlines": [
            "Lej Trådløs Mikrofon", "Leje Af Mikrofon 295 Kr", "Udlejning Af Trådløs Mic",
            "Shure BLX Til Leje", "Til Taler Og Karaoke", "Modtager Og Kabel Med",
            "Lej Mikrofon I København", "Scenekvalitet Fra 295 Kr",
        ] + COMMON,
        "descriptions": [
            "Lej trådløs håndholdt mikrofon fra 295 kr for hele weekenden.",
            "Leje af Shure BLX i scenekvalitet — 495 kr. Til event og konference.",
            "Modtager og kabel til højtaleren følger med. Klar på et minut.",
            "Ingen depositum. Betal ved afhentning i København K.",
        ],
    },
    "AG 38 - Uplights": {
        "url": "https://lejhojtaler.dk/uplights",
        "headlines": [
            "Lej Uplights Fra 125 Kr", "Leje Af Uplights I KBH", "Udlejning Af Uplights",
            "4-Pak Uplights 395 Kr", "Vasker Vægge I Farvet Lys", "Plug And Play",
            "Lej Stemningslys Til Fest", "LED Uplight På Gulv",
        ] + COMMON,
        "descriptions": [
            "Lej LED-uplights fra 125 kr. Vasker vægge og hjørner i farvet lys.",
            "Leje af 4-pak til 395 kr — spar 105 kr mod at leje dem enkeltvis.",
            "Plug and play med automatiske farver. Ingen teknisk viden nødvendig.",
            "Ingen depositum. Hent fredag i København K og aflever mandag.",
        ],
    },
    "AG 40 - Low fog maskine": {
        "url": "https://lejhojtaler.dk/roeg",
        "headlines": [
            "Lej Low Fog Maskine", "Leje Af Røgmaskine 245 Kr", "Udlejning Af Low Fog",
            "Tåge Der Bliver Ved Gulvet", "Perfekt Til Første Dans", "Røgvæske Følger Med",
            "Lej Tågemaskine I KBH", "Gør Lyset Ti Gange Federe",
        ] + COMMON,
        "descriptions": [
            "Lej low fog maskine fra 245 kr. Tågen bliver liggende ved gulvet.",
            "Leje af tågemaskine til bryllup og første dans. Røgvæske følger med.",
            "Kombinér med festlys og få effekterne til at træde tydeligt frem.",
            "Ingen depositum. Betal ved afhentning i København K.",
        ],
    },
    "AG 5 - Lyskæder": {
        "url": "https://lejhojtaler.dk/lyskaeder",
        "headlines": [
            "Lej Lyskæder 195 Kr", "Leje Af Lyskæder I KBH", "Udlejning Af Lyskæder",
            "10 Meter Varmt Hvidt Lys", "Farvede Pærer Kan Vælges", "Til Havefest Og Festtelt",
            "Lej Lyskæde Til Bryllup", "Hyggelig Festbelysning",
        ] + COMMON,
        "descriptions": [
            "Lej 10 m lyskæde til 195 kr. Varmt hvidt eller farvede pærer.",
            "Leje af lyskæder til havefest, festtelt og bryllup i København.",
            "Strømforsyning følger med. Hængt op på få minutter.",
            "Ingen depositum. Hent fredag i København K og aflever mandag.",
        ],
    },
    "AG 6 - Lysshow": {
        # Pegede på /lysshow — 404 i produktion. /festlys er kategorisiden.
        "url": "https://lejhojtaler.dk/festlys",
        "headlines": [
            "Lej Lysshow Til Festen", "Leje Af Festlys I København", "Udlejning Af Lysshow",
            "Moving Heads Og DMX", "Professionelt Scenelys", "Lys-Pakke Fra 495 Kr",
            "Lej Diskolys I København", "Lys Der Følger Musikken",
        ] + COMMON,
        "descriptions": [
            "Lej lysshow og festlys i København fra 495 kr for hele weekenden.",
            "Leje af professionelt scenelys — lysbar, effekter og stativ inkluderet.",
            "Kombinér med røgmaskine fra 245 kr, så lyskeglerne bliver synlige.",
            "Ingen depositum. Betal ved afhentning i København K.",
        ],
    },
}

logger = logging.getLogger("rebuild_ads")


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def validate() -> list[str]:
    errs = []
    for name, a in ADS.items():
        if not 3 <= len(a["headlines"]) <= 15:
            errs.append(f"{name}: {len(a['headlines'])} overskrifter, skal være 3-15")
        if not 2 <= len(a["descriptions"]) <= 4:
            errs.append(f"{name}: {len(a['descriptions'])} beskrivelser, skal være 2-4")
        for h in a["headlines"]:
            if len(h) > HEADLINE_MAX:
                errs.append(f"{name}: overskrift {len(h)}: {h!r}")
        for d in a["descriptions"]:
            if len(d) > DESCRIPTION_MAX:
                errs.append(f"{name}: beskrivelse {len(d)}: {d!r}")
        if len(set(a["headlines"])) != len(a["headlines"]):
            errs.append(f"{name}: dublerede overskrifter")
        n = sum(1 for h in a["headlines"] if any(w in h.lower() for w in ("lej", "leje", "udlejning")))
        if n < MIN_RENTAL_HEADLINES:
            errs.append(f"{name}: kun {n} overskrifter med lejeord, kræver {MIN_RENTAL_HEADLINES}")
    return errs


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    ap = argparse.ArgumentParser(description="Byg annoncer om i lys- og lyd-grupperne.")
    ap.add_argument("--config", default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG))
    ap.add_argument("--customer-id", default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""))
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    errs = validate()
    if errs:
        for e in errs:
            print(f"  ✗ {e}", file=sys.stderr)
        return 1
    print(f"Annoncetekst valideret for {len(ADS)} grupper.")

    if not args.customer_id or not os.path.isfile(args.config):
        logger.error("--customer-id og gyldig --config er påkrævet.")
        return 1

    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException

    client = GoogleAdsClient.load_from_storage(args.config)
    cid = normalize_customer_id(args.customer_id)
    ga = client.get_service("GoogleAdsService")

    names = ", ".join(f"'{n}'" for n in ADS)
    q = f"""
        SELECT ad_group.resource_name, ad_group.name, ad_group_ad.resource_name,
               ad_group_ad.ad.final_urls, ad_group_ad.ad_strength
        FROM ad_group_ad
        WHERE campaign.id = {CAMPAIGN_ID} AND ad_group.name IN ({names})
          AND ad_group_ad.status != 'REMOVED'
    """
    state = {}
    for b in ga.search_stream(customer_id=cid, query=q):
        for r in b.results:
            s = state.setdefault(r.ad_group.name, {
                "ad_group": r.ad_group.resource_name, "ads": [], "url": None, "strength": None})
            s["ads"].append(r.ad_group_ad.resource_name)
            s["url"] = (list(r.ad_group_ad.ad.final_urls) or [None])[0]
            s["strength"] = r.ad_group_ad.ad_strength.name

    missing = [n for n in ADS if n not in state]
    if missing:
        logger.error("Fandt ikke: %s", ", ".join(missing))
        return 1

    print()
    for name, a in ADS.items():
        s = state[name]
        moved = " ⟵ URL RETTET" if s["url"] != a["url"] else ""
        rental = sum(1 for h in a["headlines"] if any(w in h.lower() for w in ("lej", "leje", "udlejning")))
        print(f"  {name:<30} {s['strength']:<9} {len(a['headlines'])}H/{rental} med lejeord, "
              f"{len(s['ads'])} gammel fjernes")
        if moved:
            print(f"      {s['url']}  →  {a['url']}{moved}")

    if not args.apply:
        print("\nTørkørsel — intet skrevet. Tilføj --apply.")
        return 0

    svc = client.get_service("AdGroupAdService")
    try:
        for name, a in ADS.items():
            s = state[name]
            op = client.get_type("AdGroupAdOperation")
            ad = op.create
            ad.ad_group = s["ad_group"]
            ad.status = client.enums.AdGroupAdStatusEnum.ENABLED
            ad.ad.final_urls.append(a["url"])
            for h in a["headlines"]:
                t = client.get_type("AdTextAsset"); t.text = h
                ad.ad.responsive_search_ad.headlines.append(t)
            for d in a["descriptions"]:
                t = client.get_type("AdTextAsset"); t.text = d
                ad.ad.responsive_search_ad.descriptions.append(t)
            svc.mutate_ad_group_ads(customer_id=cid, operations=[op])

            rm = []
            for rn in s["ads"]:
                o = client.get_type("AdGroupAdOperation"); o.remove = rn
                rm.append(o)
            svc.mutate_ad_group_ads(customer_id=cid, operations=rm)
            logger.info("%s: ny annonce, %d gammel fjernet", name, len(rm))
    except GoogleAdsException as e:
        logger.error("Google Ads afviste (request_id %s):", e.request_id)
        for err in e.failure.errors:
            logger.error("  %s", err.message)
        return 1

    after = {}
    for b in ga.search_stream(customer_id=cid, query=q):
        for r in b.results:
            after.setdefault(r.ad_group.name, []).append(
                (list(r.ad_group_ad.ad.final_urls) or [None])[0])
    bad = [f"{n}: {len(v)} annoncer" for n, v in after.items() if len(v) != 1]
    bad += [f"{n}: url {v[0]}" for n, v in after.items() if v[0] != ADS[n]["url"]]
    if bad:
        logger.error("Verifikation fejlede: %s", "; ".join(bad))
        return 1

    logger.info("%d grupper har nu én annonce med korrekt landingsside.", len(ADS))
    return 0


if __name__ == "__main__":
    sys.exit(main())
