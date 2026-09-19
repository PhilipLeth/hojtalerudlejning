#!/usr/bin/env python3
"""Trin 4: produktsidernes egne priser og besparelser følger kataloget.

Hver produktside bærer price={N} og productId="x". Sidens gamle pris og gamle
besparelse erstattes af de nye, i alle skrivemåder (1245, 1.245, 1,245) og kun
hvor tallet står som et beløb (price={…}, "… kr", "… DKK", "…,-"). Beløb i en
sætning om kørsel røres ikke — 495 kr er også leveringsprisen.
"""
import json, os, re, glob
ROD = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
def flad(d): return {x["id"]: x for k in ("speakers", "addons", "rentals") for x in d[k]}
foer = flad(json.load(open(os.path.join(ROD, "scripts/katalog/katalog-foer.json"))))
efter = flad(json.load(open(os.path.join(ROD, "scripts/katalog/katalog-efter.json"))))
KOERSEL = re.compile(r"lever|deliver|kørsel|koersel|afhentning efter|collection|opsætning \(|begge veje|both ways", re.I)
TAL = re.compile(r"(?<![\d.,])(\d{1,3}(?:[.,]\d{3})+|\d+)(?![\d]|[.,]\d)")

def fmt(nyt, som):
    if "." in som: return f"{nyt:,}".replace(",", ".")
    if "," in som: return f"{nyt:,}"
    return str(nyt)

def ret(kilde, kort):
    def rep(m):
        raw = m.group(1); n = int(re.sub(r"[.,]", "", raw))
        if n not in kort or kort[n] == n: return m.group(0)
        foran = kilde[max(0, m.start() - 60):m.start()]; bagved = kilde[m.end():m.end() + 8]
        beloeb = foran.endswith("price={") or re.match(r"\s?(kr|DKK|,-)", bagved) or re.search(r"(DKK|kr\.?)\s$", foran)
        if not beloeb: return m.group(0)
        if n in (495, 795, 990) and KOERSEL.search(foran[-45:]) and not foran.endswith("price={"): return m.group(0)
        return fmt(kort[n], raw)
    return TAL.sub(rep, kilde)

n = 0
for sti in glob.glob(os.path.join(ROD, "src/app/**/page.tsx"), recursive=True):
    kilde = open(sti).read()
    if "<ProductLanding" not in kilde: continue
    pid = re.search(r'productId="([^"]+)"', kilde)
    if not pid or pid.group(1) not in foer or pid.group(1) not in efter: continue
    a, b = foer[pid.group(1)], efter[pid.group(1)]
    kort = {a["price"]: b["price"]}
    if a.get("discount") and b.get("discount") is not None and a["discount"] != b["discount"] and a["discount"] not in kort:
        kort[a["discount"]] = b["discount"]
    ny = ret(kilde, kort)
    if ny != kilde: open(sti, "w").write(ny); n += 1
print("produktsider rettet:", n)
