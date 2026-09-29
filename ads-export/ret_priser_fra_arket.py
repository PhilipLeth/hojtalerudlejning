#!/usr/bin/env python3
"""
Annoncerne lover de priser, landingssiden viser (29. sept 2026).

Frederik satte priserne ned i prisarket 28. sept (fx Soundboks 695 → 595, Lille
højtalerpakke 595 → 395, Lysbar 395 → 295). Sitet fulgte med samme dag, men
annonceteksterne bar de gamle tal — og en del bar tal, der var forkerte i
forvejen (røgmaskine "fra 595" til en maskine til 245, uplights "fra 125").
Philip: "Kan du ikke oprette ads'ne med de nye priser".

Reglerne i RET nedenfor er skrevet ud fra en gennemgang af alle 99 aktive
annoncer i de tændte grupper. Hver regel er knyttet til landingssiden, så "fra
495" betyder én ting på /lydanlaeg (højtalere fra 395) og noget andet i
"Levering i KBH for 495 kr." (kørslen, som ikke er ændret).

RSA'er kan ikke redigeres (se ads-rsa-kan-ikke-redigeres): for hver annonce med
en ændring oprettes en ny med samme tekst, samme pins og samme visningssti —
kun de forkerte tal (og to forkerte påstande) er rørt — og den gamle fjernes
bagefter, så gruppen aldrig står uden annonce.

Preflight: hver ny pris skal stå i landingssidens HTML i produktion, ellers
skrives intet. Cloudflare svarer 403 på urllibs standard-User-Agent.

  python3 ads-export/ret_priser_fra_arket.py                 # tørkørsel: vis ændringerne
  python3 ads-export/ret_priser_fra_arket.py --apply
"""

from __future__ import annotations

import argparse
import logging
import os
import re
import sys
import urllib.request

DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")
CUSTOMER_ID = "4410207627"
CAMPAIGN_ID = 23973439325  # Højtaler Udlejning - Search
HEADLINE_MAX, DESCRIPTION_MAX = 30, 90
SITE = "https://lejhojtaler.dk"

# Udgåede landingssider → hvor annoncen skal lande i stedet
NY_LANDING = {"/diskolys": "/festlys"}

# (landingssti eller None for alle, regex, erstatning). Rækkefølgen betyder noget.
RET: list[tuple[str | None, str, str]] = [
    # Soundboks 4: 695/795 → 595 — overalt hvor ordet står i samme tekst
    (None, r"(?i)(sound(?:boks|box)[^.\n]*?)\b(?:695|795)\b", r"\g<1>595"),
    # Lille højtalerpakke 595 → 395
    ("/hojtalerpakke-lille", r"\b595\b", "395"),
    # PA-anlæg (mellem højtalerpakke, 2× 12") 795 → 595, og stativer er et tilvalg
    ("/lydanlaeg", r"(?i)(pa[ -]anlæg[^.\n]*?)\b795\b", r"\g<1>595"),
    ("/lydanlaeg", r"2× 12\" højtalere, stativer og alle kabler med\.", "2× 12\" højtalere og alle kabler med."),
    # Højtalere/anlæg/lydudstyr/festudstyr "fra 495" → 395 (billigste højtaler) — ikke kørslen
    ("/lydanlaeg", r"(?i)(?<!levering )\b(fra) 495\b", r"\g<1> 395"),
    ("/lej-hojtaler", r"(?i)(?<!levering )\b(fra) 495\b", r"\g<1> 395"),
    ("/", r"(?i)(?<!levering )\b(fra) 495\b", r"\g<1> 395"),
    # Røgmaskine (/roeg) fra 595 → 245
    ("/roeg", r"(?i)\b(fra) 595\b", r"\g<1> 245"),
    # Festlys: billigste lys er 195 (enkelt lyseffekt, uplight, lyskæde); lysbaren 295
    ("/festlys", r"(?i)\b(lysbar fra) 495\b", r"\g<1> 295"),
    ("/festlys", r"(?i)(?<!levering )\b(fra) (?:395|495)\b", r"\g<1> 195"),
    # Uplights: enkelt 195, 4-pak 495 (spar 4×195 − 495 = 285)
    ("/uplights", r"(?i)\b(fra) 125\b", r"\g<1> 195"),
    ("/uplights", r"(?i)(4-pak (?:fra |for )?)(?:395|595)\b", r"\g<1>495"),
    ("/uplights", r"(?i)\bspar 105 kr\b", "Spar 285 kr"),
    # Discokugle fra 545 → 345 (30 cm)
    ("/discokugle", r"\b545\b", "345"),
    # Diskolys-pakken er udgået; annoncen lander på /festlys, hvor lyseffekten er 195
    ("/diskolys", r"(?i)(?<!levering )\b(fra) 495\b", r"\g<1> 195"),
    ("/diskolys", r"^Diskolys-Pakken 685 kr\.$", "Lysbar Fra 295 kr."),
    ("/diskolys", r"^Diskolys-pakken 685 kr: flere effekter, stativ og alle kabler\. Plug and play uden teknik\.$",
     "Lysbar 295 kr: to farvede lamper og en centereffekt på stativ. Plug and play."),
    # Lysshow: pakkerne er festlys-pakkerne, fra 500 — lysbar og røg, ingen discokugle
    ("/lysshow", r"\b1\.140\b", "500"),
    ("/lysshow", r"Lys, discokugle og røg i én pakke", "Lysbar og røgmaskine i én pakke"),
    # Festpakke 0-30 895 → 630
    ("/festpakke-lille", r"\b895\b", "630"),
    # Siden viser nu Speakerpakke trådløs (2× 12" + trådløs mikrofon) til 960
    ("/pakke-tale-musik", r"\b1\.145\b", "960"),
]

# "Levering fra 495" er kørslen og er ikke ændret — derfor (?<!levering ) i reglerne ovenfor
# Beløb der ikke er en pris at kontrollere på siden (kørslen står i checkout)
IKKE_KONTROLLER = {"495"}

logger = logging.getLogger("ret_priser_fra_arket")


def sti(url: str) -> str:
    s = url.replace(SITE, "") or "/"
    return s.split("?")[0].split("#")[0].rstrip("/") or "/"


def ret(tekst: str, landing: str) -> str:
    ny = tekst
    for s, mønster, erstat in RET:
        if s is None or s == landing:
            ny = re.sub(mønster, erstat, ny)
    return ny


def hent(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (preflight lejhojtaler)"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")


def beløb(tekst: str) -> set[str]:
    return set(re.findall(r"\b\d{1,2}(?:\.\d{3})+\b|\b\d{2,4}\b", tekst))


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    ap = argparse.ArgumentParser(description="Ret priserne i annonceteksterne.")
    ap.add_argument("--config", default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG))
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException

    client = GoogleAdsClient.load_from_storage(args.config)
    ga = client.get_service("GoogleAdsService")
    q = f"""
        SELECT ad_group.resource_name, ad_group.name, ad_group_ad.resource_name,
               ad_group_ad.ad.final_urls, ad_group_ad.ad.responsive_search_ad.headlines,
               ad_group_ad.ad.responsive_search_ad.descriptions,
               ad_group_ad.ad.responsive_search_ad.path1, ad_group_ad.ad.responsive_search_ad.path2
        FROM ad_group_ad
        WHERE campaign.id = {CAMPAIGN_ID} AND ad_group.status = 'ENABLED'
          AND ad_group_ad.status = 'ENABLED' AND ad_group_ad.ad.type = 'RESPONSIVE_SEARCH_AD'
    """
    planer = []
    for b in ga.search_stream(customer_id=CUSTOMER_ID, query=q):
        for r in b.results:
            ad = r.ad_group_ad.ad
            url = (list(ad.final_urls) or [""])[0]
            landing = sti(url)
            rsa = ad.responsive_search_ad
            h = [(a.text, a.pinned_field) for a in rsa.headlines]
            d = [(a.text, a.pinned_field) for a in rsa.descriptions]
            nh = [(ret(t, landing), p) for t, p in h]
            nd = [(ret(t, landing), p) for t, p in d]
            ny_url = SITE + NY_LANDING[landing] if landing in NY_LANDING else url
            if nh == h and nd == d and ny_url == url:
                continue
            planer.append(dict(ag=r.ad_group.name, ag_rn=r.ad_group.resource_name, ad_rn=r.ad_group_ad.resource_name,
                               url=url, ny_url=ny_url, h=h, d=d, nh=nh, nd=nd,
                               path1=rsa.path1, path2=rsa.path2))

    # Validering og visning
    fejl = []
    sider: dict[str, set[str]] = {}
    for p in planer:
        print(f"\n{p['ag']}  →  {sti(p['ny_url'])}" + (f"  (var {sti(p['url'])})" if p["ny_url"] != p["url"] else ""))
        for (gl, _), (ny, _) in list(zip(p["h"], p["nh"])) + list(zip(p["d"], p["nd"])):
            if gl != ny:
                print(f"    - {gl}\n    + {ny}")
                sider.setdefault(p["ny_url"], set()).update(beløb(ny) - beløb(gl) - IKKE_KONTROLLER)
        tekster = [t for t, _ in p["nh"]]
        if len(set(tekster)) != len(tekster):
            fejl.append(f"{p['ag']}: to ens overskrifter efter rettelsen")
        for t, _ in p["nh"]:
            if len(t) > HEADLINE_MAX:
                fejl.append(f"{p['ag']}: overskrift {len(t)} tegn: {t!r}")
        for t, _ in p["nd"]:
            if len(t) > DESCRIPTION_MAX:
                fejl.append(f"{p['ag']}: beskrivelse {len(t)} tegn: {t!r}")

    print(f"\n{len(planer)} annoncer skal erstattes.")

    # Preflight: de nye beløb skal stå på landingssiden i produktion
    for url, tal in sider.items():
        try:
            html = hent(url)
        except Exception as e:
            fejl.append(f"kunne ikke hente {url}: {e}")
            continue
        for t in sorted(tal):
            if t not in html:
                fejl.append(f"{url} viser ikke {t}")
    if fejl:
        for f in fejl:
            logger.error(f)
        return 1
    print("Preflight OK — alle nye beløb står på landingssiderne.")

    if not args.apply:
        print("Tørkørsel — intet skrevet. Tilføj --apply.")
        return 0

    svc = client.get_service("AdGroupAdService")
    ok = 0
    for p in planer:
        try:
            op = client.get_type("AdGroupAdOperation")
            ad = op.create
            ad.ad_group = p["ag_rn"]
            ad.status = client.enums.AdGroupAdStatusEnum.ENABLED
            ad.ad.final_urls.append(p["ny_url"])
            rsa = ad.ad.responsive_search_ad
            if p["path1"]:
                rsa.path1 = p["path1"]
            if p["path2"]:
                rsa.path2 = p["path2"]
            for t, pin in p["nh"]:
                a = client.get_type("AdTextAsset"); a.text = t
                if pin:
                    a.pinned_field = pin
                rsa.headlines.append(a)
            for t, pin in p["nd"]:
                a = client.get_type("AdTextAsset"); a.text = t
                if pin:
                    a.pinned_field = pin
                rsa.descriptions.append(a)
            svc.mutate_ad_group_ads(customer_id=CUSTOMER_ID, operations=[op])
            rm = client.get_type("AdGroupAdOperation"); rm.remove = p["ad_rn"]
            svc.mutate_ad_group_ads(customer_id=CUSTOMER_ID, operations=[rm])
            ok += 1
        except GoogleAdsException as e:
            logger.error("%s: Google Ads afviste (request_id %s):", p["ag"], e.request_id)
            for err in e.failure.errors:
                logger.error("  %s", err.message)
    logger.info("%d af %d annoncer erstattet.", ok, len(planer))
    return 0 if ok == len(planer) else 1


if __name__ == "__main__":
    sys.exit(main())
