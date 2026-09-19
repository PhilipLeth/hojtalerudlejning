#!/usr/bin/env python3
"""Trin 5: beløb i løbende tekst (FAQ, blog, kategorisider, beskrivelser) følger kataloget.

  1. Delte produktsider (uplights, mixer, discokugle …): alle sidens produkter rettes, ikke kun productId'et.
  2. Entydige gamle priser (kun ét produkt havde den) rettes overalt, hvor tallet står som et beløb.
  3. Flertydige priser (395, 495, 595 …) rettes kun, når produktets navn står lige foran beløbet.
  4. Et beløb på 1000 kr eller mere skrives med tusindtalsseparator, ellers læser vogterne "1125 kr" som "125 kr".
"""
import json, os, re, subprocess, collections
ROD = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
def flad(d): return {x["id"]: x for k in ("speakers", "addons", "rentals") for x in d[k]}
foer = flad(json.load(open(os.path.join(ROD, "scripts/katalog/katalog-foer.json"))))
efter = flad(json.load(open(os.path.join(ROD, "scripts/katalog/katalog-efter.json"))))
TAL = re.compile(r"(?<![\d.,])(\d{1,3}(?:[.,]\d{3})+|\d+)(?![\d]|[.,]\d)")
KOERSEL = re.compile(r"lever|deliver|kørsel|afhentning efter|collection|begge veje|both ways|én vej|one way", re.I)

def fmt(nyt, som, en):
    if nyt < 1000: return str(nyt)
    if "," in som or (en and "." not in som): return f"{nyt:,}"
    return f"{nyt:,}".replace(",", ".")

def er_beloeb(kilde, m):
    foran = kilde[max(0, m.start() - 12):m.start()]; bagved = kilde[m.end():m.end() + 8]
    return bool(re.match(r"\s?(kr|DKK|,-)", bagved) or re.search(r"(DKK|kr\.?)\s$", foran))

aendret = {i: (foer[i]["price"], efter[i]["price"]) for i in foer if i in efter and foer[i]["price"] != efter[i]["price"]}
gl_antal = collections.Counter(x["price"] for x in foer.values())
nye = {x["price"] for x in efter.values()}
ENTYDIG = {g: n for i, (g, n) in aendret.items() if gl_antal[g] == 1 and g not in nye and g >= 600}
NAVNE = {  # flertydige: navn der skal stå lige foran beløbet
    "thumpgo": ["thump go"], "soundboks": ["soundboks 4", "soundboks"], "festival": ["mellem højtalerpakke", "medium speaker package"],
    "hojtaler_100": ["stor højtalerpakke", "large speaker package"], "subwoofer": ["subwoofer"], "stativer": ["højtalerstativer", "stativer", "speaker stands", "stands"],
    "batteri": ["ekstra batteri", "extra battery", "batteri", "battery"], "lys": ["lysbar", "light bar", "lysbaren"], "rog": ["røgmaskine", "røgmaskinen", "fog machine", "smoke machine"],
    "uplight": ["uplight", "en uplight", "one uplight"], "uplight_4": ["4-pak", "4-pack", "fire stk.", "four of them", "fire uplights", "4 uplights"],
    "discokugle": ["40 cm"], "discokugle_30": ["30 cm"], "low_fog": ["low fog"], "headset": ["headset"], "traadloes_mikrofon": ["trådløs mikrofon", "wireless mic", "wireless microphone"],
    "haandholdt_mikrofon_pro": ["beta 58a", "håndholdt mikrofon pro"], "mixer_stor": ["mixer"], "dj_pult": ["dj-pult", "dj controller"],
    "pakke_fest_lille": ["festpakke 50", "party package 50", "lille festpakke", "small party package"], "pakke_fest_stor": ["festpakke 100", "party package 100", "stor festpakke", "large party package"],
}

filer = subprocess.check_output(["git", "ls-files", "src/app", "src/lib", "src/components", "docs", "public/llms.txt"], cwd=ROD, text=True).split("\n")
filer = [f for f in filer if f.endswith((".ts", ".tsx", ".md", ".txt")) and "__tests__" not in f]
sider = collections.defaultdict(list)
for i, x in efter.items():
    if x.get("page"): sider[x["page"]].append(i)

n = 0
for f in filer:
    p = os.path.join(ROD, f); kilde = open(p).read(); en = "/en/" in f or f.startswith("docs/en")
    lokal = {}
    m = re.match(r"src/app(?:/en)?(/[^/]+(?:/[^/]+)?)/page\.tsx$", f)
    if m and m.group(1) in sider:
        for i in sider[m.group(1)]:
            if i in aendret and aendret[i][0] not in lokal: lokal[aendret[i][0]] = aendret[i][1]
    def rep(mm):
        raw = mm.group(1); tal = int(re.sub(r"[.,]", "", raw))
        if not er_beloeb(kilde, mm): return mm.group(0)
        foran = kilde[max(0, mm.start() - 70):mm.start()].lower()
        if tal in (495, 795, 990) and KOERSEL.search(foran[-50:]): return mm.group(0)
        if tal in ENTYDIG: return fmt(ENTYDIG[tal], raw, en)
        if tal in lokal: return fmt(lokal[tal], raw, en)
        for i, navne in NAVNE.items():
            if i in aendret and aendret[i][0] == tal and any(nv in foran[-45:] for nv in navne): return fmt(aendret[i][1], raw, en)
        if tal >= 1000 and not re.search(r"[.,]", raw): return fmt(tal, raw, en)   # 1125 kr → 1.125 kr
        return mm.group(0)
    ny = TAL.sub(rep, kilde) if not f.endswith(("products.ts", "situationPackages.ts", "djGearProducts.ts", "microphonePackages.ts", "mixerModels.ts")) else kilde
    if ny != kilde: open(p, "w").write(ny); n += 1
print("filer rettet:", n, "· entydige gamle priser:", len(ENTYDIG))
