#!/usr/bin/env python3
"""
Luk app-inventaret ude på kontoniveau.

Performance Max brugte ~590 kr/dag med nul konverteringer. Placeringsrapporten
viser hvorfor: ved siden af rigtige danske medier (bt.dk, tv2.dk,
ekstrabladet.dk) løb annoncerne i mobilspil — Words of Wonders, Block Blast!,
Mahjong Club, Nonogram, My Talking Hank, Car Wash Garage, Cookingo. Asset group
"Mikrofoner" havde 10,9 % CTR til 26 øre pr. klik; reel display-CTR er omkring
0,5 %. Ti procent til den pris er utilsigtede tryk, ikke interesse.

PMax lader sig ikke styre med placeringsudelukkelser på kampagneniveau, men
**kontoniveau-udelukkelser gælder også for den**. Vi lukker spilkategorierne på
begge platforme — det er dér de utilsigtede tryk kommer fra.

To metoder virker ikke, og det er værd at vide før man prøver igen:
  - Placeringen adsenseformobileapps.com, den klassiske "luk alle apps"-genvej,
    afvises nu med "Invalid placement URL" på alle skrivemåder.
  - Butiks-rødderne Google Play (60000) og Apple App Store (60500) afvises med
    "Mobile application category is not valid". Kun blad-kategorier kan bruges.

Hver kategori valideres derfor for sig med validate_only, og kun de accepterede
sendes. Google flytter rundt på taksonomien, så en liste der virker i dag kan
have et dødt id om et år — scriptet siger til frem for at fejle samlet.

At lukke *alt* app-inventar er bevidst og ikke for hårdt: 2.134 klik fra apps
gav nul bookinger. Bannere i mobilspil sælger ikke højtalerudlejning i
København. Udelukkelserne kan fjernes igen, hvis der en dag er data der taler
for det.

Det fjerner ikke de danske mediesider — de er reelle visninger for mennesker.
Og det løser ikke grundproblemet: uden konverteringsdata har PMax intet at
optimere mod og vil søge mod det billigste, der er tilbage. AW-tagget er
forudsætningen; det her begrænser skaden imens.

  python3 ads-export/exclude_app_traffic.py --customer-id 4410207627
  python3 ads-export/exclude_app_traffic.py --customer-id 4410207627 --apply
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")

# Spil på begge platforme, inklusive de undergenrer placeringsrapporten viste:
# puslespil, ordspil, brætspil og "casual". Nyheds- og medie-apps er bevidst
# ikke med — de er samme slags inventar som bt.dk og tv2.dk, hvor annoncerne
# faktisk ses af mennesker.
APP_CATEGORIES = {
    "Games (Google Play)": 60008,
    "Arcade": 60028,
    "Board": 60029,
    "Cards": 60030,
    "Casual": 60031,
    "Racing": 60033,
    "Sports Games": 60034,
    "Action": 60036,
    "Adventure": 60037,
    "Casino": 60038,
    "Educational (spil)": 60039,
    "Family (spil)": 60040,
    "Music (spil)": 60041,
    "Puzzle": 60042,
    "Role Playing": 60043,
    "Simulation": 60044,
    "Strategy": 60045,
    "Trivia": 60046,
    "Word": 60047,
    "Action & Adventure": 60057,
    "Brain Games": 60058,
    "Pretend Play": 60062,
    "Games (Apple App Store)": 60506,
}

logger = logging.getLogger("exclude_apps")


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def existing(client, customer_id: str) -> set[str]:
    ga = client.get_service("GoogleAdsService")
    q = """
        SELECT customer_negative_criterion.type,
               customer_negative_criterion.mobile_app_category.mobile_app_category_constant
        FROM customer_negative_criterion
    """
    out = set()
    for batch in ga.search_stream(customer_id=customer_id, query=q):
        for r in batch.results:
            const = r.customer_negative_criterion.mobile_app_category.mobile_app_category_constant
            if const:
                out.add(const)
    return out


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    ap = argparse.ArgumentParser(description="Udeluk app-inventar på kontoniveau.")
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

    svc = client.get_service("CustomerNegativeCriterionService")

    def build(cat_id: int):
        op = client.get_type("CustomerNegativeCriterionOperation")
        op.create.mobile_app_category.mobile_app_category_constant = (
            f"mobileAppCategoryConstants/{cat_id}"
        )
        return op

    def accepted(cat_id: int) -> bool:
        """validate_only skriver intet og fanger døde id'er enkeltvis."""
        req = client.get_type("MutateCustomerNegativeCriteriaRequest")
        req.customer_id = customer_id
        req.operations.append(build(cat_id))
        req.validate_only = True
        try:
            svc.mutate_customer_negative_criteria(request=req)
            return True
        except GoogleAdsException:
            return False

    have = existing(client, customer_id)
    todo, rejected = {}, []
    for label, cat_id in APP_CATEGORIES.items():
        if f"mobileAppCategoryConstants/{cat_id}" in have:
            continue
        (todo.__setitem__(label, cat_id) if accepted(cat_id) else rejected.append(label))

    print("\nKontoniveau-udelukkelser (gælder også Performance Max)\n")
    print(f"  Allerede udelukket: {len(APP_CATEGORIES) - len(todo) - len(rejected)}")
    print(f"  Tilføjes:           {len(todo)}")
    for label in todo:
        print(f"      {label}")
    if rejected:
        print(f"  Afvist af Google:   {len(rejected)} — {', '.join(rejected)}")

    if not todo:
        print("\nIntet at gøre.")
        return 0
    if not args.apply:
        print("\nTørkørsel — intet skrevet. Tilføj --apply.")
        return 0

    ops = [build(cat_id) for cat_id in todo.values()]

    try:
        client.get_service("CustomerNegativeCriterionService").mutate_customer_negative_criteria(
            customer_id=customer_id, operations=ops
        )
    except GoogleAdsException as e:
        logger.error("Google Ads afviste (request_id %s):", e.request_id)
        for err in e.failure.errors:
            logger.error("  %s", err.message)
        return 1

    # Læs tilbage — en mutation der intet ændrede svarer også success.
    after = existing(client, customer_id)
    missing = [l for l, c in todo.items() if f"mobileAppCategoryConstants/{c}" not in after]
    if missing:
        logger.error("Ikke registreret: %s", ", ".join(missing))
        return 1

    logger.info("Tilføjede %d udelukkelser — verificeret.", len(ops))
    return 0


if __name__ == "__main__":
    sys.exit(main())
