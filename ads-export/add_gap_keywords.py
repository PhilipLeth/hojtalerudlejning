import os, sys, collections
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

APPLY = "--apply" in sys.argv
c = GoogleAdsClient.load_from_storage(os.path.expanduser("~/gitprojects/openocean-promo/google-ads.yaml"))
cid = "4410207627"
LABEL = "customers/4410207627/labels/22270631751"
MAIN = 23973439325

# Fraser fra Keyword Planner og søgetermrapporten som allerede tændte grupper
# burde eje. Volumen i parentes er DK/md fra Planner.
ADD = {
    "AG 1 - Højtalere & Lyd": [
        "lej en højtaler",            # 210/md — og 1 konv. i søgetermrapporten
        "højtaler leje",              # 210/md
        "udlejning højtaler",         # 50/md
        "udlejning højtalere",        # 50/md
        "lej højtalere til fest",     # 70/md
        "lej højtaler til fest",      # 70/md
        "leje af højtaler til fest",  # 70/md
        "højtalere leje",
        "leje højtalere",
        "leje af mikrofon og højtaler",
    ],
    "AG 5 - Lyskæder": [
        "lej lyskæder",               # 140/md
        "lyskæde leje",               # 140/md
        "lej lyskæder til bryllup",
        "party lyskæder",
    ],
    "AG 4 - Soundboks": [
        "leje soundboks",             # 4 "konv." i rapporten (se forbehold)
        "leje en soundboks",
        "udlejning soundboks",        # 30/md
        "lej en soundbox",
    ],
    "AG 2 — Festlys & diskokugle": [
        "lej en diskokugle",
        "leje diskokugle",
        "leje diskolys",
        "leje af diskolys",
        "stor diskokugle",
        "dj lys",
    ],
    "AG 9 - PA-anlæg og lydudstyr": [
        "leje musikanlæg",
        "leje af musikanlæg til fest",
    ],
}

# Søgetermer vi betalte for uden at kunne levere, eller uden for geografien.
NEGATIVES = {
    "AG 10 - AV-udstyr": ["dj udstyr"],   # vi udlejer ikke DJ-udstyr
}

ga = c.get_service("GoogleAdsService")
q = f"""SELECT ad_group.resource_name, ad_group.name, ad_group_criterion.keyword.text,
        ad_group_criterion.negative FROM ad_group_criterion
        WHERE campaign.id = {MAIN} AND ad_group_criterion.type='KEYWORD'
        AND ad_group_criterion.status != 'REMOVED' AND ad_group.status='ENABLED'"""
groups, have_pos, have_neg = {}, collections.defaultdict(set), collections.defaultdict(set)
owner = {}
for b in ga.search_stream(customer_id=cid, query=q):
    for r in b.results:
        n = r.ad_group.name
        groups[n] = r.ad_group.resource_name
        t = r.ad_group_criterion.keyword.text.lower()
        if r.ad_group_criterion.negative:
            have_neg[n].add(t)
        else:
            have_pos[n].add(t); owner[t] = n

plan, skip = {}, []
for n, kws in ADD.items():
    new = []
    for k in kws:
        if k.lower() in have_pos[n]: continue
        if k.lower() in owner: skip.append((k, owner[k.lower()])); continue
        new.append(k)
    if new: plan[n] = new

negplan = {n: [k for k in kws if k.lower() not in have_neg[n]] for n, kws in NEGATIVES.items()}
negplan = {n: v for n, v in negplan.items() if v}

total = sum(len(v) for v in plan.values())
print(f"{total} nye keywords i {len(plan)} grupper:\n")
for n in sorted(plan):
    print(f"  {n}")
    for k in plan[n]: print(f"      {k}")
if negplan:
    print("\n  Negative keywords:")
    for n, v in negplan.items(): print(f"      {n}: {', '.join(v)}")
if skip:
    print(f"\n  Sprunget over — findes i anden gruppe ({len(skip)}):")
    for k, g in skip: print(f"      {k:<34} {g}")

if not APPLY:
    print("\nTørkørsel — tilføj --apply."); sys.exit(0)

svc = c.get_service("AdGroupCriterionService")
try:
    for n, kws in plan.items():
        ops = []
        for t in kws:
            op = c.get_type("AdGroupCriterionOperation")
            cr = op.create; cr.ad_group = groups[n]
            cr.status = c.enums.AdGroupCriterionStatusEnum.ENABLED
            cr.keyword.text = t
            cr.keyword.match_type = c.enums.KeywordMatchTypeEnum.PHRASE
            ops.append(op)
        req = c.get_type("MutateAdGroupCriteriaRequest")
        req.customer_id = cid; req.operations.extend(ops); req.validate_only = True
        svc.mutate_ad_group_criteria(request=req)
        req.validate_only = False
        rns = [r.resource_name for r in svc.mutate_ad_group_criteria(request=req).results]
        lbl = []
        for rn in rns:
            op = c.get_type("AdGroupCriterionLabelOperation")
            op.create.ad_group_criterion = rn; op.create.label = LABEL
            lbl.append(op)
        c.get_service("AdGroupCriterionLabelService").mutate_ad_group_criterion_labels(
            customer_id=cid, operations=lbl)
        print(f"  {n}: {len(rns)}")

    for n, kws in negplan.items():
        ops = []
        for t in kws:
            op = c.get_type("AdGroupCriterionOperation")
            cr = op.create; cr.ad_group = groups[n]; cr.negative = True
            cr.keyword.text = t
            cr.keyword.match_type = c.enums.KeywordMatchTypeEnum.BROAD
            ops.append(op)
        svc.mutate_ad_group_criteria(customer_id=cid, operations=ops)
        print(f"  {n}: {len(ops)} negative")
except GoogleAdsException as e:
    for err in e.failure.errors: print("FEJL:", err.message)
    sys.exit(1)
print(f"\nTilføjet {total} keywords, alle BOFU-mærket.")
