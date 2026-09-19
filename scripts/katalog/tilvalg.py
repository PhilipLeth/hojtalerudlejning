#!/usr/bin/env python3
"""Tilvalg pr. produkt efter arkets kolonne "Relevante add-ons" (19. sept 2026).

Kolonnen læses som en relation begge veje: "Soundboks batteri → Soundboks 4"
betyder, at batteriet er et tilvalg på Soundboks. Kun varer fra tilvalgslisten
(addons i products.ts) kan vises som tilvalg i bookingen; de øvrige
relationer (fx uplight-pakke ↔ diskokugle) er krydssalg og bæres ikke her.

  python3 scripts/katalog/tilvalg.py   # skriver allowedAddons i katalogfilerne
"""
import os, re, json
ROD = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
P = os.path.join(ROD, "src/lib/products.ts"); DJ = os.path.join(ROD, "src/lib/djGearProducts.ts")

# Arkets navne → produkt-id (rækken)
PRODUKT = {"Monitor": "monitor", "Sumwoofer": "subwoofer", "Soundboks 4": "soundboks", "Lille batteri højtaler": "thumpgo",
  "Højtaler stativer": "stativer", "Soundboks batteri": "batteri", "DJ pult": "dj_pult", "X-stativ": "x_stativ", "DJ stativ m. klæde": "dj_stativ",
  "Mikrofon m. ledning": "haandholdt_mikrofon", "Pro mikrofon m. ledning": "haandholdt_mikrofon_pro", "Trådløs mikrofon": "traadloes_mikrofon",
  "Trådløst headset": "headset", "Mikrofon stativ": "mikrofonstativ", "Mixer med effekter": "mixer_stor",
  "Lille højtalerpakke": "party", "Mellem højtalerpakke": "festival", "Stor højtalerpakke": "hojtaler_100",
  "Speakerpakke 0-30": "pakke_speaker_lille", "Speakerpakke 30-50": "pakke_speaker_mik", "Speakerpakke trådløs 0-30": "pakke_speaker_traadloes_lille",
  "Speakerpakke trådløs 30-50": "pakke_tale_musik", "DJ Pakke 0-30": "dj_pakke_lille", "DJ Pakke 30-50": "dj_pakke_mellem",
  "Single up-light": "uplight", "Single lyseffekt": "lyseffekt", "Lyskæde hvid": "lyskaeder", "Lyskæde farvet": "lyskaeder_farvet",
  "Stroboskop": "stroboskop", "Følgespot": "foelgespot", "UV lampe": "uv_lampe", "RGB Laser": "laser", "Lysstativ": "lysstativ", "Lysbar": "lys",
  "Diskokugle 30": "discokugle_30", "Diskokugle 40": "discokugle", "Diskokugle guld": "discokugle_guld",
  "Røgmaskine": "rog", "Røggulv maskine": "low_fog", "Snemaskine": "snemaskine", "Sæbebobelmaskine": "saebeboblemaskine",
  "Ekstra røgvæske": "roegvaeske", "Ekstra Snevæske": "snevaeske", "Ekstra bobelvæske": "boblevaeske",
  "Up-light pakke": "uplight_4", "Scenelys": "scenelys", "Festlys 0-50": "pakke_festlys_50", "Festlys 50-100": "pakke_festlys_100",
  "Stemningslyspakke": "pakke_stemningslys", "Elegant festpakke": "pakke_elegant", "Festpakke 0-30": "pakke_fest_lille",
  "Festpakke 30-50": "pakke_fest_stor", "Festpakke 50-100": "pakke_fest_100", "Lille soundboks pakke": "pakke_soundboks_lille", "Stor soundboks pakke": "pakke_soundboks_lys"}
# Samme vare som tilvalg (kun disse kan stå i allowedAddons)
TILVALG = {"Sumwoofer": "subwoofer", "Højtaler stativer": "stativer", "1x højtalerstativ": "stativ_enkelt", "Soundboks batteri": "batteri", "Ekstra batteri": "batteri",
  "X-stativ": "x_stativ", "DJ stativ m. klæde": "dj_stativ", "Mikrofon m. ledning": "mikrofon_kabel", "Trådløs mikrofon": "mikrofon",
  "Mikrofon stativ": "mikrofonstativ", "Mixer med effekter": "mixer_stor", "Single lyseffekt": "lyseffekt", "Stroboskop": "stroboskop",
  "Lysstativ": "lysstativ", "Lysbar": "lys", "Røgmaskine": "rog", "Ekstra røgvæske": "roegvaeske", "Ekstra Snevæske": "snevaeske", "Ekstra bobelvæske": "boblevaeske"}

# Arkets rækker: produkt → "Relevante add-ons"
ARK = {
 "Soundboks 4": ["Mikrofon m. ledning", "1x højtalerstativ", "Lysbar", "Ekstra batteri"],
 "Lille batteri højtaler": ["Mikrofon m. ledning", "1x højtalerstativ", "Lysbar"],
 "Højtaler stativer": ["Lille højtalerpakke", "Mellem højtalerpakke"],
 "Soundboks batteri": ["Soundboks 4"],
 "DJ pult": ["Festpakke 30-50", "Festpakke 50-100", "X-stativ", "DJ stativ m. klæde"],
 "X-stativ": ["DJ pult"], "DJ stativ m. klæde": ["DJ pult"],
 "Mikrofon m. ledning": ["Mikrofon stativ", "Mixer med effekter", "Lille højtalerpakke", "Mellem højtalerpakke"],
 "Pro mikrofon m. ledning": ["Mikrofon stativ", "Mixer med effekter", "Lille højtalerpakke", "Mellem højtalerpakke"],
 "Trådløs mikrofon": ["Mikrofon stativ", "Mixer med effekter", "Lille højtalerpakke", "Mellem højtalerpakke"],
 "Trådløst headset": ["Mixer med effekter", "Lille højtalerpakke", "Mellem højtalerpakke"],
 "Mikrofon stativ": ["Mikrofon m. ledning", "Pro mikrofon m. ledning", "Trådløs mikrofon"],
 "Mixer med effekter": ["Mikrofon m. ledning", "Pro mikrofon m. ledning", "Trådløs mikrofon", "Trådløst headset"],
 "Lille højtalerpakke": ["Højtaler stativer", "Single lyseffekt", "Lysbar", "Festlys 0-50", "Mikrofon m. ledning", "Trådløs mikrofon"],
 "Mellem højtalerpakke": ["Højtaler stativer", "Single lyseffekt", "Lysbar", "Festlys 0-50", "Mikrofon m. ledning", "Trådløs mikrofon"],
 "Stor højtalerpakke": ["Højtaler stativer", "Lysbar", "Festlys 50-100", "Mikrofon m. ledning", "Trådløs mikrofon"],
 "Speakerpakke 0-30": ["Mikrofon stativ", "Mixer med effekter", "Højtaler stativer"], "Speakerpakke 30-50": ["Mikrofon stativ", "Mixer med effekter", "Højtaler stativer"],
 "Speakerpakke trådløs 0-30": ["Mikrofon stativ", "Mixer med effekter", "Højtaler stativer"], "Speakerpakke trådløs 30-50": ["Mikrofon stativ", "Mixer med effekter", "Højtaler stativer"],
 "DJ Pakke 0-30": ["DJ stativ m. klæde", "Røgmaskine", "Up-light pakke"], "DJ Pakke 30-50": ["DJ stativ m. klæde", "Røgmaskine", "Up-light pakke"],
 "Single up-light": ["Up-light pakke"],
 "Single lyseffekt": ["Lysstativ", "Lysbar", "Soundboks 4", "Lille batteri højtaler", "Lille højtalerpakke", "Mellem højtalerpakke", "Røgmaskine"],
 "Lyskæde hvid": ["Diskokugle 40", "Up-light pakke"], "Lyskæde farvet": ["Diskokugle 40", "Up-light pakke"],
 "Stroboskop": ["Lysstativ", "Lysbar", "RGB Laser", "Soundboks 4", "UV lampe", "Mellem højtalerpakke", "Stor højtalerpakke", "Røgmaskine"],
 "Følgespot": ["Scenelys"],
 "UV lampe": ["Lysstativ", "Lysbar", "RGB Laser", "Soundboks 4", "Stroboskop", "Mellem højtalerpakke", "Stor højtalerpakke", "Røgmaskine"],
 "RGB Laser": ["Lysstativ", "Lysbar", "UV lampe", "Soundboks 4", "Stroboskop", "Mellem højtalerpakke", "Stor højtalerpakke", "Røgmaskine"],
 "Lysstativ": ["Single lyseffekt", "Stroboskop", "UV lampe", "RGB Laser"],
 "Lysbar": ["Lille højtalerpakke", "Mellem højtalerpakke", "Lille batteri højtaler", "Soundboks 4", "Røgmaskine"],
 "Diskokugle 30": ["Lyskæde hvid", "Lyskæde farvet", "Up-light pakke", "Lille højtalerpakke", "Mellem højtalerpakke"],
 "Diskokugle 40": ["Lyskæde hvid", "Lyskæde farvet", "Up-light pakke", "Lille højtalerpakke", "Mellem højtalerpakke"],
 "Diskokugle guld": ["Lyskæde hvid", "Lyskæde farvet", "Up-light pakke", "Lille højtalerpakke", "Mellem højtalerpakke"],
 "Røgmaskine": ["Ekstra røgvæske", "Lysbar", "RGB Laser", "UV lampe", "Stroboskop", "Festpakke 0-30", "Festpakke 30-50", "Festpakke 50-100", "Soundboks 4", "Lille batteri højtaler"],
 "Røggulv maskine": ["Ekstra røgvæske", "Festpakke 30-50", "Festpakke 50-100", "Lyskæde hvid", "Lyskæde farvet", "Up-light pakke"],
 "Snemaskine": ["Ekstra Snevæske"], "Sæbebobelmaskine": ["Ekstra bobelvæske"],
 "Ekstra røgvæske": ["Røgmaskine", "Røggulv maskine"], "Ekstra Snevæske": ["Snemaskine"], "Ekstra bobelvæske": ["Sæbebobelmaskine"],
 "Up-light pakke": ["Lille højtalerpakke", "Mellem højtalerpakke"], "Scenelys": ["Følgespot", "Speakerpakke trådløs 30-50"],
 "Festlys 0-50": ["Mellem højtalerpakke"], "Festlys 50-100": ["Stor højtalerpakke"], "Stemningslyspakke": ["Lille højtalerpakke", "Mellem højtalerpakke"],
 "Elegant festpakke": ["Lyskæde hvid", "Lyskæde farvet", "Up-light pakke", "Højtaler stativer"],
 "Festpakke 0-30": ["Røgmaskine", "Højtaler stativer"], "Festpakke 30-50": ["Røgmaskine", "Højtaler stativer"], "Festpakke 50-100": ["Røgmaskine", "Højtaler stativer"],
 "Lille soundboks pakke": ["Højtaler stativer"], "Stor soundboks pakke": ["Højtaler stativer"],
}
RANG = ["lys", "rog", "stativer", "stativ_enkelt", "subwoofer", "mikrofon", "mikrofon_kabel", "batteri", "lyseffekt", "mixer_stor", "mikrofonstativ", "lysstativ", "stroboskop", "x_stativ", "dj_stativ", "roegvaeske", "snevaeske", "boblevaeske"]
KOERSEL = ["levering_ud", "afhentning_retur", "levering_begge"]

rel = {}
for a, liste in ARK.items():
    for b in liste:
        rel.setdefault(a, set()).add(b); rel.setdefault(b, set()).add(a)
ud = {}
for navn, naboer in rel.items():
    pid = PRODUKT.get(navn)
    if not pid: continue
    tv = sorted({TILVALG[n] for n in naboer if n in TILVALG and TILVALG[n] != pid}, key=RANG.index)
    ud[pid] = tv

def blok_span(s, pid):
    m = re.search(r'(?<![A-Za-z])"?id"?:\s*"%s"' % re.escape(pid), s)
    if not m: return None
    a = s.rfind("{", 0, m.start()); d = 0; i = a
    while True:
        if s[i] == "{": d += 1
        elif s[i] == "}":
            d -= 1
            if d == 0: return a, i + 1
        i += 1

def skriv(sti, jsonstil):
    s = open(sti).read(); n = 0
    for pid, tv in ud.items():
        sp = blok_span(s, pid)
        if not sp: continue
        a, b = sp; blok = s[a:b]
        if jsonstil:
            felt = '"allowedAddons": %s,' % json.dumps(tv + KOERSEL)
            blok2 = re.sub(r'"allowedAddons":\s*\[[^\]]*\],?', felt, blok) if '"allowedAddons"' in blok else blok.replace('"contents":', felt + '\n    "contents":', 1)
        else:
            # Alt der står FØR DELIVERY_ADDON_IDS i filen (højtalere og tilvalg) får kørslen skrevet ud,
            # ellers rammer man "Cannot access before initialization".
            koersel = ", ".join('"%s"' % k for k in KOERSEL) if a < s.index("export const DELIVERY_ADDON_IDS") else "...DELIVERY_ADDON_IDS"
            felt = "allowedAddons: [%s]," % ", ".join(['"%s"' % t for t in tv] + [koersel])
            if "allowedAddons:" in blok: blok2 = re.sub(r'allowedAddons:\s*\[[^\]]*\],?', felt, blok)
            elif "\n    contents:" in blok: blok2 = blok.replace("\n    contents:", "\n    " + felt + "\n    contents:", 1)
            elif " contents:" in blok: blok2 = blok.replace(" contents:", " " + felt + " contents:", 1)
            else: blok2 = blok.replace(" name_da:", " " + felt + " name_da:", 1)
        if blok2 != blok: s = s[:a] + blok2 + s[b:]; n += 1
    open(sti, "w").write(s); return n

if __name__ == "__main__":
    print("products.ts:", skriv(P, False), "· djGearProducts.ts:", skriv(DJ, True))
    for pid in ("soundboks", "party", "hojtaler_100", "rog", "dj_pult", "pakke_fest_lille", "uv_lampe"): print(f"  {pid:18} {ud.get(pid)}")
