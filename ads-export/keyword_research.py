#!/usr/bin/env python3
"""
Find de søgninger vi IKKE dækker. Rapport — ændrer intet.

To kilder, og de svarer på hver sit spørgsmål:

  Keyword Planner      "hvad søger folk på, som vi slet ikke har tænkt på?"
                       Estimeret volumen, bredt, men Googles gæt.
  Søgetermrapporten    "hvad har folk faktisk søgt på hos OS?"
                       Ægte data fra kontoen, men kun det vi allerede vises på.

Den anden er den vigtigste: en søgeterm med klik, som ikke findes som keyword,
er en søgning vi vinder ved et tilfælde gennem phrase match. Gør man den til
et rigtigt keyword, får den sit eget bud og sin egen kvalitetsscore.

Volumen hentes for HELE Danmark, ikke for København. Lokale tal rundes ned til
nul på alt andet end de største fraser, og så forsvinder de nicher der er
sjældne på landsplan men fint dækkende i en by. Tallene er derfor et
størrelsesforhold, ikke en prognose.

  python3 ads-export/keyword_research.py --customer-id 4410207627
  python3 ads-export/keyword_research.py --customer-id 4410207627 --min-volume 50
"""

from __future__ import annotations

import argparse
import collections
import os
import sys

DEFAULT_CONFIG = os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml")
CAMPAIGNS = {23973439325: "HOVED", 24108797469: "YDER"}

# Ét frø pr. produktområde. Planner udvider selv; flere frø giver mest støj.
SEEDS = [
    "lej højtaler", "leje af pa anlæg", "lej festudstyr",
    "leje af lys til fest", "lej diskokugle", "lej røgmaskine",
    "lej karaoke", "leje af mikrofon", "lej projektor",
    "lej lærred", "leje af storskærm", "lej lyskæder",
    "lej soundboks", "leje af festanlæg", "lej uplights",
]


def normalize_customer_id(raw: str) -> str:
    return "".join(c for c in raw.strip() if c.isdigit())


def existing_keywords(client, customer_id: str) -> set[str]:
    ga = client.get_service("GoogleAdsService")
    ids = ", ".join(str(c) for c in CAMPAIGNS)
    q = f"""
        SELECT ad_group_criterion.keyword.text
        FROM ad_group_criterion
        WHERE campaign.id IN ({ids})
          AND ad_group_criterion.type = 'KEYWORD'
          AND ad_group_criterion.negative = FALSE
          AND ad_group_criterion.status != 'REMOVED'
    """
    out = set()
    for b in ga.search_stream(customer_id=customer_id, query=q):
        for r in b.results:
            out.add(r.ad_group_criterion.keyword.text.lower().strip())
    return out


def search_terms(client, customer_id: str) -> list[dict]:
    ga = client.get_service("GoogleAdsService")
    q = """
        SELECT search_term_view.search_term, campaign.name, ad_group.name,
               metrics.impressions, metrics.clicks, metrics.cost_micros,
               metrics.conversions
        FROM search_term_view
        WHERE segments.date DURING LAST_30_DAYS
    """
    rows = []
    for b in ga.search_stream(customer_id=customer_id, query=q):
        for r in b.results:
            rows.append({
                "term": r.search_term_view.search_term.lower().strip(),
                "ad_group": r.ad_group.name,
                "impressions": r.metrics.impressions,
                "clicks": r.metrics.clicks,
                "cost": r.metrics.cost_micros / 1_000_000,
                "conversions": r.metrics.conversions,
            })
    return rows


def keyword_ideas(client, customer_id: str) -> dict[str, dict]:
    svc = client.get_service("KeywordPlanIdeaService")
    ideas = {}
    # Planner tager højst 20 frø ad gangen; batchvis så listen kan vokse.
    for i in range(0, len(SEEDS), 10):
        req = client.get_type("GenerateKeywordIdeasRequest")
        req.customer_id = customer_id
        req.language = "languageConstants/1009"
        req.geo_target_constants.append("geoTargetConstants/2208")
        req.include_adult_keywords = False
        req.keyword_seed.keywords.extend(SEEDS[i:i + 10])
        for r in svc.generate_keyword_ideas(request=req):
            m = r.keyword_idea_metrics
            ideas[r.text.lower().strip()] = {
                "volume": m.avg_monthly_searches or 0,
                "competition": m.competition.name,
            }
    return ideas


RENTAL = ("lej ", " leje", "leje af", "udlejning", " udlej", "til leje")


def looks_rental(term: str) -> bool:
    return any(w in term for w in RENTAL)


def main() -> int:
    ap = argparse.ArgumentParser(description="Find udækkede søgninger.")
    ap.add_argument("--config", default=os.environ.get("GOOGLE_ADS_YAML", DEFAULT_CONFIG))
    ap.add_argument("--customer-id", default=os.environ.get("GOOGLE_ADS_CUSTOMER_ID", ""))
    ap.add_argument("--min-volume", type=int, default=30)
    args = ap.parse_args()

    if not args.customer_id or not os.path.isfile(args.config):
        print("--customer-id og gyldig --config er påkrævet.", file=sys.stderr)
        return 1

    from google.ads.googleads.client import GoogleAdsClient

    client = GoogleAdsClient.load_from_storage(args.config)
    cid = normalize_customer_id(args.customer_id)

    have = existing_keywords(client, cid)
    print(f"{len(have)} keywords i de to kampagner.\n")

    # ── 1. Ægte søgetermer uden matchende keyword ────────────────────────
    terms = search_terms(client, cid)
    agg = collections.defaultdict(lambda: {"impressions": 0, "clicks": 0, "cost": 0.0,
                                           "conversions": 0.0, "groups": set()})
    for t in terms:
        a = agg[t["term"]]
        a["impressions"] += t["impressions"]
        a["clicks"] += t["clicks"]
        a["cost"] += t["cost"]
        a["conversions"] += t["conversions"]
        a["groups"].add(t["ad_group"])

    uncovered = {t: a for t, a in agg.items() if t not in have}
    ranked = sorted(uncovered.items(), key=lambda kv: -kv[1]["cost"])

    print("═" * 78)
    print("1. ÆGTE SØGETERMER UDEN EGET KEYWORD (seneste 30 dage)")
    print("   Vundet gennem phrase match — uden eget bud og egen kvalitetsscore.")
    print("═" * 78)
    print(f"{'søgeterm':<40}{'vis':>5}{'klik':>6}{'kr':>8}{'konv':>6}  gruppe")
    shown = 0
    for term, a in ranked:
        if a["clicks"] == 0 and a["impressions"] < 5:
            continue
        flag = "  ⟵ LEJEINTENTION" if looks_rental(term) else ""
        print(f"{term:<40}{a['impressions']:>5}{a['clicks']:>6}{a['cost']:>8.0f}"
              f"{a['conversions']:>6.0f}  {sorted(a['groups'])[0][:22]}{flag}")
        shown += 1
        if shown >= 30:
            break
    if not shown:
        print("  (ingen)")

    # ── 2. Planner-idéer vi ikke dækker ──────────────────────────────────
    ideas = keyword_ideas(client, cid)
    missing = {k: v for k, v in ideas.items()
               if k not in have and v["volume"] >= args.min_volume and looks_rental(k)}
    print()
    print("═" * 78)
    print(f"2. KEYWORD PLANNER — lejefraser vi ikke har, ≥{args.min_volume} søgn./md (DK)")
    print("═" * 78)
    print(f"{'frase':<48}{'søgn./md':>10}  konkurrence")
    for k, v in sorted(missing.items(), key=lambda kv: -kv[1]["volume"])[:35]:
        print(f"{k:<48}{v['volume']:>10}  {v['competition']}")
    if not missing:
        print("  (ingen over grænsen)")

    print(f"\n{len(ideas)} idéer hentet, {len(missing)} udækkede lejefraser over grænsen.")
    print("Rapport — intet er ændret.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
