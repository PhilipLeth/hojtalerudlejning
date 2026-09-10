#!/usr/bin/env python3
"""
Retter Soundboks-prisen i AG 4, så annoncen ikke lover 795 kr og lander på 695.

Soundboks 4 blev sat 100 kr ned til 695 den 10. september 2026, fordi den ikke
solgte til 795. Annoncen i AG 4 - Soundboks bar prisen to steder — én overskrift
og én beskrivelse — og de peger på /soundboks-4, hvor der nu står 695. En annonce,
der lover en anden pris end landingssiden, er både en dårlig oplevelse og et
kvalitetsproblem hos Google.

RSA'er kan ikke redigeres. Ny oprettes først, gammel fjernes bagefter, så gruppen
aldrig står uden annonce — samme fremgangsmåde som rebuild_lys_lyd_ads.py.

Teksten er ELLERS uændret. Annoncen står med ad strength GOOD, og en omskrivning
ville smide den styrke væk oven i den historik, en ny annonce alligevel koster.
Kun de to tal er rørt.

AG 7 - Soundboks-alternativ har også forkerte tal ("fra 399 kr.", "levering for
500 kr.", "til halv Soundboks-pris"), men den gruppe er PAUSED og serverer ikke.
Den røres ikke her.

  python3 ads-export/fix_soundboks_pris.py --customer-id 4410207627
  python3 ads-export/fix_soundboks_pris.py --customer-id 4410207627 --apply
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")
CAMPAIGN_ID = 23973439325
AD_GROUP = "AG 4 - Soundboks"
HEADLINE_MAX, DESCRIPTION_MAX = 30, 90

# Katalogprisen. Står den her forkert, fejler preflight mod produktion nedenfor.
SOUNDBOKS_PRIS = 695
LANDING = "https://lejhojtaler.dk/soundboks-4"

HEADLINES = [
    "Lej Soundboks i København",
    "Soundboks Udlejning",
    "Lej En Soundboks Nu",
    f"Soundboks Leje Fra {SOUNDBOKS_PRIS} Kr.",   # var: 795 kr.
    "Leje Af Soundboks Nemt",
    "Soundboks Til Leje",
    "Fest? Lej En Soundboks",
    "Billig Soundboks Til Leje",
    "Levering I KBH For 495 kr.",
    "Book Soundboks Online",
    "Høj Lyd Til Din Fest",
    "Gratis Parkering",
    "Book På 2 Minutter",
    "Danmarks Billigste Festlyd",
    "Lejhøjtaler.dk",
]

DESCRIPTIONS = [
    "Lej en kraftfuld soundboks til din fest i København. Book online på få minutter.",
    "Nem udlejning af soundboks – hurtig levering og afhentning i hele København.",
    f"Soundboks til leje fra {SOUNDBOKS_PRIS} kr. – lej af os i dag, nemt og hurtigt.",  # var: 795
    "Fleksibel udlejning, gode priser og hurtig respons. Book din soundboks nu.",
]

logger = logging.getLogger("fix_soundboks_pris")


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def validate() -> list[str]:
    errs = []
    if not 3 <= len(HEADLINES) <= 15:
        errs.append(f"{len(HEADLINES)} overskrifter, skal være 3-15")
    if not 2 <= len(DESCRIPTIONS) <= 4:
        errs.append(f"{len(DESCRIPTIONS)} beskrivelser, skal være 2-4")
    for h in HEADLINES:
        if len(h) > HEADLINE_MAX:
            errs.append(f"overskrift {len(h)} tegn: {h!r}")
    for d in DESCRIPTIONS:
        if len(d) > DESCRIPTION_MAX:
            errs.append(f"beskrivelse {len(d)} tegn: {d!r}")
    if len(set(HEADLINES)) != len(HEADLINES):
        errs.append("dublerede overskrifter")
    if any("795" in t for t in HEADLINES + DESCRIPTIONS):
        errs.append("795 står stadig i teksten")
    return errs


def preflight_pris() -> str | None:
    """Annoncen må ikke love en anden pris end den, siden faktisk viser."""
    import re
    import urllib.request

    # Cloudflare svarer 403 på urllibs standard-User-Agent.
    req = urllib.request.Request(LANDING, headers={"User-Agent": "Mozilla/5.0 (preflight lejhojtaler)"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            html = r.read().decode("utf-8", "replace")
    except Exception as e:  # netværksfejl må ikke skrive en forkert pris live
        return f"kunne ikke hente {LANDING}: {e}"
    m = re.search(r"<title>([^<]*)</title>", html)
    titel = m.group(1) if m else ""
    if str(SOUNDBOKS_PRIS) not in titel:
        return f"{LANDING} har titlen {titel!r} — {SOUNDBOKS_PRIS} står der ikke"
    return None


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    ap = argparse.ArgumentParser(description="Ret Soundboks-prisen i AG 4.")
    ap.add_argument("--config", default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG))
    ap.add_argument("--customer-id", default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""))
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    errs = validate()
    if errs:
        for e in errs:
            print(f"  ✗ {e}", file=sys.stderr)
        return 1

    fejl = preflight_pris()
    if fejl:
        logger.error("Preflight mod produktion: %s", fejl)
        return 1
    print(f"Preflight OK — {LANDING} viser {SOUNDBOKS_PRIS} kr.")

    if not args.customer_id or not os.path.isfile(args.config):
        logger.error("--customer-id og gyldig --config er påkrævet.")
        return 1

    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException

    client = GoogleAdsClient.load_from_storage(args.config)
    cid = normalize_customer_id(args.customer_id)
    ga = client.get_service("GoogleAdsService")

    q = f"""
        SELECT ad_group.resource_name, ad_group.name, ad_group.status,
               ad_group_ad.resource_name, ad_group_ad.ad.final_urls,
               ad_group_ad.ad_strength
        FROM ad_group_ad
        WHERE campaign.id = {CAMPAIGN_ID} AND ad_group.name = '{AD_GROUP}'
          AND ad_group_ad.status != 'REMOVED'
    """
    ad_group_rn, gamle, url, strength, status = None, [], None, None, None
    for b in ga.search_stream(customer_id=cid, query=q):
        for r in b.results:
            ad_group_rn = r.ad_group.resource_name
            status = r.ad_group.status.name
            gamle.append(r.ad_group_ad.resource_name)
            url = (list(r.ad_group_ad.ad.final_urls) or [None])[0]
            strength = r.ad_group_ad.ad_strength.name

    if not ad_group_rn:
        logger.error("Fandt ikke %s i kampagne %s", AD_GROUP, CAMPAIGN_ID)
        return 1

    print(f"\n  {AD_GROUP}  ({status}, ad strength {strength})")
    print(f"    landingsside: {url}")
    print(f"    {len(gamle)} annonce(r) erstattes med én ny")
    print(f"    ændret: overskrift 4 og beskrivelse 3 — 795 → {SOUNDBOKS_PRIS}")
    print("    alt andet er ord for ord det samme")

    if url != LANDING:
        logger.error("Landingssiden er %s, forventede %s", url, LANDING)
        return 1

    if not args.apply:
        print("\nTørkørsel — intet skrevet. Tilføj --apply.")
        return 0

    svc = client.get_service("AdGroupAdService")
    try:
        op = client.get_type("AdGroupAdOperation")
        ad = op.create
        ad.ad_group = ad_group_rn
        ad.status = client.enums.AdGroupAdStatusEnum.ENABLED
        ad.ad.final_urls.append(LANDING)
        for h in HEADLINES:
            t = client.get_type("AdTextAsset"); t.text = h
            ad.ad.responsive_search_ad.headlines.append(t)
        for d in DESCRIPTIONS:
            t = client.get_type("AdTextAsset"); t.text = d
            ad.ad.responsive_search_ad.descriptions.append(t)
        svc.mutate_ad_group_ads(customer_id=cid, operations=[op])

        rm = []
        for rn in gamle:
            o = client.get_type("AdGroupAdOperation"); o.remove = rn
            rm.append(o)
        svc.mutate_ad_group_ads(customer_id=cid, operations=rm)
        logger.info("Ny annonce oprettet, %d gammel fjernet.", len(rm))
    except GoogleAdsException as e:
        logger.error("Google Ads afviste (request_id %s):", e.request_id)
        for err in e.failure.errors:
            logger.error("  %s", err.message)
        return 1

    efter = []
    for b in ga.search_stream(customer_id=cid, query=q):
        for r in b.results:
            efter.append(r.ad_group_ad.resource_name)
    if len(efter) != 1:
        logger.error("Verifikation: gruppen har %d annoncer, forventede 1", len(efter))
        return 1

    logger.info("%s har nu én annonce, og den lover %s kr.", AD_GROUP, SOUNDBOKS_PRIS)
    return 0


if __name__ == "__main__":
    sys.exit(main())
