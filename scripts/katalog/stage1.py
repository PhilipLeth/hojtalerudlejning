#!/usr/bin/env python3
"""Trin 1: enkeltpriser fra arket, og pakkerne som FØLGE af dem.

Pakkerne er bundter af enkeltprodukter (Philip, 17. sept 2026). Derfor:
  • hver dels listepris i en pakke = enkeltproduktets pris × antal
  • en pakke der ikke står i arket beholder sin rabatPROCENT: ny pris =
    ny delsum × (gammel pris / gammel delsum), afrundet til 5 kr
  • PRO-mikrofon/-headset findes ikke i arket — arkets trådløse ER Shure, så
    pakkerne bruger traadloes_mikrofon / headset i stedet
  • enkeltprodukter uden for arket sættes på pause (hidden), og en pakke med
    en pauset del sættes på pause som følge
"""
import json, os, re
ROD = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FILER = ["src/lib/products.ts", "src/lib/situationPackages.ts", "src/lib/djGearProducts.ts", "src/lib/microphonePackages.ts", "src/lib/mixerModels.ts"]
FOER = json.load(open(os.path.join(ROD, "scripts/katalog/katalog-foer.json")))

ENKELT = {"thumpgo": 495, "soundboks": 695, "festival": 795, "hojtaler_100": 1295, "subwoofer": 495, "stativer": 95,
          "batteri": 395, "mikrofon": 445, "mixer_stor": 345, "stroboskop": 395, "lys": 395, "rog": 245, "dj_pult": 1695,
          "haandholdt_mikrofon_pro": 345, "traadloes_mikrofon": 445, "headset": 445, "uplight": 195, "uplight_4": 595,
          "discokugle_30": 545, "discokugle": 645, "low_fog": 545}
ERSTAT_DEL = {"traadloes_mikrofon_pro": "traadloes_mikrofon", "headset_pro": "headset"}
ERSTAT_TEKST = [("Shure trådløs mikrofon PRO", "Trådløs mikrofon"), ("Trådløs mikrofon PRO", "Trådløs mikrofon"), ("Wireless mic PRO", "Wireless mic"),
                ("Wireless microphone PRO", "Wireless microphone"), ("Trådløst headset PRO", "Trådløst headset"), ("Wireless headset PRO", "Wireless headset")]
# AV-udstyret (skærme, projektor, lærred, karaoke) står ikke i arket, men kom bevidst i udlejning igen
# 8. sept 2026 og bliver stående, indtil Philip siger andet. PRO-varianterne er derimod overflødige:
# arkets trådløse mikrofon og headset ER Shure-modellerne.
PAUSE_ENKELT = ["traadloes_mikrofon_pro", "headset_pro", "taske"]
FJERN_DEL = {"pakke_student": ["taske"]}
# Arkets egne pakkepriser (eksisterende id'er). None = følger reglen.
ARK_PAKKER = {"pakke_stemningslys": 1295, "pakke_fest_stor": 1395, "pakke_soundboks_lys": 995, "pakke_speaker_mik": 795, "pakke_tale_musik": 1395}

ID = r'(?<![A-Za-z])"?id"?:\s*"%s"'
NEXT = re.compile(r'\n\s*\{?\s*"?id"?:\s*"')
def span(src, pid):
    m = re.search(ID % re.escape(pid), src)
    if not m: return None
    n = NEXT.search(src, m.end())
    return m.start(), (n.start() if n else len(src))

def sub_in(src, pid, fn):
    sp = span(src, pid)
    if not sp: return src, False
    a, b = sp
    return src[:a] + fn(src[a:b]) + src[b:], True

def r5(x): return int(round(x / 5.0) * 5)

def main():
    src = {f: open(os.path.join(ROD, f)).read() for f in FILER}
    # 1) PRO → arkets Shure-varianter, i dele og i tekster der beskriver pakkernes indhold
    for f in FILER:
        if f.endswith("products.ts"):
            # kun i pakkernes dele/indhold — selve PRO-produkterne beholder deres navn (de pauses)
            def fix(block):
                for a, b in ERSTAT_DEL.items(): block = block.replace('productId: "%s"' % a, 'productId: "%s"' % b)
                return block
            s = src[f]
            for a, b in ERSTAT_DEL.items(): s = s.replace('productId: "%s"' % a, 'productId: "%s"' % b)
            # labels + contents i pakker
            for r in FOER["rentals"]:
                if r["parts"] and any(p["id"] in ERSTAT_DEL for p in r["parts"]):
                    def t(block):
                        for x, y in ERSTAT_TEKST: block = block.replace(x, y)
                        return block
                    s, _ = sub_in(s, r["id"], t)
            src[f] = s
        else:
            s = src[f]
            for a, b in ERSTAT_DEL.items(): s = re.sub(r'("productId":\s*)"%s"' % a, r'\1"%s"' % b, s); s = s.replace('productId: "%s"' % a, 'productId: "%s"' % b)
            for x, y in ERSTAT_TEKST: s = s.replace(x, y)
            src[f] = s
    # 2) bæretasken ud af studenterpakken
    for pid, dele in FJERN_DEL.items():
        for d in dele:
            for f in FILER:
                src[f], ok = sub_in(src[f], pid, lambda b: re.sub(r'\n?\s*\{[^{}]*productId:\s*"%s"[^{}]*\},?' % d, "", b).replace('"Polstret bæretaske", ', ""))
    # 3) enkeltpriser
    def own(block, kr): return re.sub(r'("?price"?:\s*)\d+', lambda m: m.group(1) + str(kr), block, count=1)
    for pid, kr in ENKELT.items():
        hit = False
        for f in FILER:
            src[f], ok = sub_in(src[f], pid, lambda b, kr=kr: own(b, kr)); hit |= ok
        assert hit, pid
    # 4) ny katalogtilstand: pris pr. enkeltprodukt
    pris = {x["id"]: x["price"] for k in ("speakers", "addons", "rentals") for x in FOER[k]}
    pris.update(ENKELT)
    pauset = set(PAUSE_ENKELT) | {x["id"] for k in ("speakers", "addons", "rentals") for x in FOER[k] if x["hidden"]}
    pauset -= {"stroboskop"}  # står i arket til 395
    # 5) pakker: dele, pris, rabat, pause-som-følge
    rapport = []
    for r in FOER["rentals"]:
        if not r["parts"]: continue
        dele = [dict(p, id=ERSTAT_DEL.get(p["id"], p["id"])) for p in r["parts"] if p["id"] not in FJERN_DEL.get(r["id"], [])]
        gl_sum = sum(p["price"] for p in r["parts"]); ny_sum = sum(pris[p["id"]] * p["qty"] for p in dele)
        if r["id"] in ARK_PAKKER: ny = min(ARK_PAKKER[r["id"]], ny_sum)
        else: ny = min(ny_sum, r5(ny_sum * r["price"] / gl_sum)) if gl_sum else r["price"]
        pris[r["id"]] = ny
        rabat = ny_sum - ny
        skal_pause = (not r["hidden"]) and any(p["id"] in pauset for p in dele)
        def patch(block, dele=dele, ny=ny, rabat=rabat, skal_pause=skal_pause, gl=r):
            block = own(block, ny)
            for p in dele:
                block = re.sub(r'(\{[^{}]*"?productId"?:\s*"%s"[^{}]*?"?price"?:\s*)\d+' % re.escape(p["id"]), lambda m, p=p: m.group(1) + str(pris[p["id"]] * p["qty"]), block)
            block = re.sub(r'("?discount"?:\s*)\d+', lambda m: m.group(1) + str(rabat), block, count=1)
            if gl["discount"]:
                gd = gl["discount"]; pat = r'(?<!\d)%s(?!\d)' % (f"{gd:,}".replace(",", r"\.?"))
                block = re.sub(r'((?:[Ss]par|[Ss]ave)\s+)' + pat, lambda m: m.group(1) + (f"{rabat:,}".replace(",", ".") if rabat >= 1000 else str(rabat)), block)
            if skal_pause:
                block = re.sub(r'("?id"?:\s*"[^"]+",)', lambda m: m.group(1) + (' "hidden": true,' if m.group(1).startswith('"') else " hidden: true,"), block, count=1)
            return block
        hit = False
        for f in FILER:
            src[f], ok = sub_in(src[f], r["id"], patch); hit |= ok
        assert hit, r["id"]
        if skal_pause: pauset.add(r["id"])
        rapport.append((r["id"], r["price"], ny, gl_sum, ny_sum, rabat, skal_pause))
    # 6) pause enkeltprodukter uden for arket
    for pid in PAUSE_ENKELT:
        if next(x for k in FOER for x in FOER[k] if x["id"] == pid)["hidden"]: continue
        for f in FILER:
            src[f], ok = sub_in(src[f], pid, lambda b: re.sub(r'("?id"?:\s*"[^"]+",)', r'\1 hidden: true,', b, count=1))
    for f in FILER: open(os.path.join(ROD, f), "w").write(src[f])
    json.dump({"pris": pris, "pauset": sorted(pauset)}, open(os.path.join(ROD, "scripts/katalog/katalog-efter-trin1.json"), "w"), ensure_ascii=False, indent=1)
    print(f"{'pakke':32} {'før':>6} {'nu':>6} {'delsum før':>10} {'delsum nu':>10} {'rabat':>6}  pause")
    for x in rapport: print(f"{x[0]:32} {x[1]:>6} {x[2]:>6} {x[3]:>10} {x[4]:>10} {x[5]:>6}  {'JA' if x[6] else ''}")

main()
