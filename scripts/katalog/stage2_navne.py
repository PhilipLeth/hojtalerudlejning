#!/usr/bin/env python3
"""Trin 2: visningsnavne efter arket. URL'er, id'er og billedstier røres ikke.

  Stor højtalerpakke (2× EV)        → Mellem højtalerpakke
  Højtalerpakke 100 (2× EV + sub)   → Stor højtalerpakke
  Lys-pakke                         → Lysbar
  Mixer mellem · t.mix 1202 FX USB  → Mixer med effekter · t.mix 1202 FXMP USB
"""
import os, re, subprocess
ROD = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
filer = subprocess.check_output(["git", "ls-files", "src", "functions", "docs", "public/llms.txt"], cwd=ROD, text=True).split("\n")
filer = [f for f in filer if f and f.endswith((".ts", ".tsx", ".md", ".txt", ".json", ".mjs"))]

T1, T2, T3 = "@@HP100DA@@", "@@HP100EN@@", "@@HP100EN2@@"
EN_BESKYT = {"ambient", "disco", "club", "wedding", "party", "made", "full", "so", "tent", "mood", "festival"}

def lysbar_da(m):
    stor, endelse = m.group(1), m.group(2) or ""
    ny = {"": "", "n": "en", "r": "er", "rne": "erne", "ns": "ens"}.get(endelse, endelse)
    return ("L" if stor == "L" else "l") + "ysbar" + ny

def lysbar_en(m):
    foer = m.string[max(0, m.start() - 20):m.start()].lower().split()
    if foer and re.sub(r"[^a-z]", "", foer[-1]) in EN_BESKYT and m.string[m.start() - 1] == " ": return m.group(0)
    L, P, s = m.group(1), m.group(2), m.group(3)
    return f"{L}ight {'B' if P == 'P' else 'b'}ar{s}"

def omdoeb(s):
    s = s.replace("Højtalerpakke 100", T1).replace("højtalerpakke 100", T1)
    s = s.replace("Speaker package 100", T2).replace("Speaker Package 100", T2).replace("speaker package 100", T3)
    for a, b in [("Den store højtalerpakke", "Mellem højtalerpakke"), ("den store højtalerpakke", "Mellem højtalerpakke"),
                 ("Store højtalerpakke", "Mellem højtalerpakke"), ("store højtalerpakke", "Mellem højtalerpakke"),
                 ("Stor højtalerpakke", "Mellem højtalerpakke"), ("stor højtalerpakke", "mellem højtalerpakke"),
                 ("Large Speaker Package", "Medium Speaker Package"), ("Large speaker package", "Medium speaker package"),
                 ("large speaker package", "medium speaker package")]:
        s = s.replace(a, b)
    s = s.replace(T1, "Stor højtalerpakke").replace(T2, "Large speaker package").replace(T3, "large speaker package")
    s = re.sub(r"(?<![A-Za-zæøåÆØÅ/_\-])([Ll])ys-pakke(ns|n|rne|r)?(?![A-Za-zæøå])", lysbar_da, s)
    s = re.sub(r"(?<![A-Za-z/_\-])([Ll])ight ([Pp])ackage(s?)(?![A-Za-z])", lysbar_en, s)
    for a, b in [("Mixer mellem · t.mix 1202 FX USB", "Mixer med effekter · t.mix 1202 FXMP USB"),
                 ("Medium mixer · t.mix 1202 FX USB", "Mixer with effects · t.mix 1202 FXMP USB"),
                 ("the t.mix xmix 1202 FX USB", "the t.mix xmix 1202 FXMP USB")]:
        s = s.replace(a, b)
    return s

n = 0
for f in filer:
    p = os.path.join(ROD, f)
    try: s = open(p).read()
    except Exception: continue
    ny = omdoeb(s)
    if ny != s: open(p, "w").write(ny); n += 1
print("filer ændret:", n)
