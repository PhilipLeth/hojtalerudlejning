#!/usr/bin/env python3
"""Generér AAG-grupper: ÉN søgning pr. gruppe, kun dens stavemåder.

En gruppe er fx "lej soundboks" + "lej en soundboks" + "lej soundboks
københavn" — ikke "lej soundboks" OG "soundboks leje" OG "soundboks
udlejning", for det er tre forskellige søgninger, og annoncen kan kun bære
én af dem ordret i overskriften. Hver gruppe får sin egen annonce, hvor
hvert keyword står ordret i mindst én overskrift.

  python3 scripts/ads/aag/generate.py      # skriver scripts/ads/aag/*.json
"""
import json, os, re

HER = os.path.dirname(os.path.abspath(__file__))
SITE = "https://lejhojtaler.dk"
FAELLES = ["Book Online På 3 Minutter", "Betal Først Ved Afhentning", "Ingen Depositum",
           "Levering I København 495 kr.", "Hent I København S", "5 Dages Leje Til Én Pris", "Lejhøjtaler.dk"]
D_BOOK = "Book online på 3 minutter. Betal først ved afhentning, intet depositum."
D_HENT = "Hent i København S eller få det leveret for 495 kr. Alle kabler er med i prisen."

def cap(s):  # Title Case på dansk — små ord med stort som resten af kontoen, "kr." med småt
    return " ".join(w if w == "kr." else w[:1].upper() + w[1:] for w in s.split(" "))

def fits(h): return 0 < len(h) <= 30

def familier(p):
    """Fire søgninger pr. produkt: 'lej X', 'leje X', 'X leje', 'X udlejning'."""
    s, pl, art, alts = p["s"], p.get("pl"), p.get("art", "en"), p.get("alt", [])
    former = [s] + ([pl] if pl else []) + alts
    ud = []
    if p.get("fam", "1234").find("1") >= 0:
        ud.append((f"lej {s}", [f"lej {s}"] + ([f"lej {art} {s}"] if art else []) + ([f"lej {pl}"] if pl else []) + [f"lej {a}" for a in alts] + [f"lej {s} københavn"]))
    if p.get("fam", "1234").find("2") >= 0:
        ud.append((f"leje af {s}", [f"leje af {s}", f"leje {s}"] + ([f"leje af {pl}", f"leje {pl}"] if pl else []) + [f"leje af {a}" for a in alts]))
    if p.get("fam", "1234").find("3") >= 0:
        ud.append((f"{s} leje", [f"{s} leje", f"{s} til leje"] + ([f"{pl} leje"] if pl else []) + [f"{a} leje" for a in alts] + [f"{s} leje københavn"]))
    if p.get("fam", "1234").find("4") >= 0:
        ud.append((f"{s} udlejning", [f"{s} udlejning", f"udlejning af {s}"] + ([f"{pl} udlejning", f"udlejning af {pl}"] if pl else []) + [f"{a} udlejning" for a in alts] + [f"{s} udlejning københavn"]))
    return ud

def gruppe(p, primary, kws, ekstra_h=()):
    kws = list(dict.fromkeys(k.lower() for k in kws))
    # Et keyword der ikke kan stå ordret i en overskrift på 30 tegn ryger ud —
    # hellere færre keywords end et keyword annoncen ikke bærer.
    if len(cap(primary)) > 30: raise SystemExit(f"primary for lang til en overskrift: {primary}")
    kws = [k for k in kws if len(cap(k)) <= 30]
    pris = p["pris"]  # fx "fra 595 kr."
    H = []
    # 1) hvert keyword ordret, så annoncerelevansen kan måles på selve søgningen
    for k in kws:
        for cand in (cap(k), f"{cap(k)} I København", f"{cap(k)} {cap(pris)}", f"{cap(k)} Til Weekenden"):
            if fits(cand) and cand not in H and k in cand.lower():
                H.append(cand); break
    for k in kws:  # anden variant med pris/by hvor der er plads
        if k.endswith("københavn"): continue
        for cand in (f"{cap(k)} {cap(pris)}", f"{cap(k)} I København"):
            if fits(cand) and cand not in H and len(H) < 8:
                H.append(cand); break
    for h in list(ekstra_h) + p["usp"] + FAELLES:
        if fits(h) and h not in H and len(H) < 15: H.append(h)
    mangler = [k for k in kws if not any(k in h.lower() for h in H)]
    Pr = primary[:1].upper() + primary[1:]
    k2 = (kws[1] if len(kws) > 1 else primary); K2 = k2[:1].upper() + k2[1:]
    def first(*cands):  # første variant der overholder de 90 tegn
        return next((c for c in cands if len(c) <= 90), None)
    D = [first(f"{Pr} i København {pris} {p['d']}", f"{Pr} {pris} {p['d']}", f"{Pr} i København {pris}", f"{Pr} {pris}"),
         D_BOOK,
         first(f"{K2} til en hel weekend. {D_HENT}", f"{K2} til en hel weekend. Hent i København S eller få leveret for 495 kr.", f"{K2}. Hent i København S eller få leveret for 495 kr."),
         p["d2"] if len(p["d2"]) <= 90 else None]
    D = [d for d in D if d][:4]
    if len(D) < 2: raise SystemExit(f"for få beskrivelser: {primary}")
    if not any(primary in d.lower() for d in D): raise SystemExit(f"primary ikke i beskrivelse: {primary}")
    if mangler: raise SystemExit(f"{primary}: keywords uden overskrift: {mangler}")
    for d in D: assert len(d) <= 90, d
    return {"name": f"AAG: {p['navn']} — {primary}", "status": "ENABLED", "cpcBidMicros": int(min(p.get("bud", 6.5), 6.5) * 1e6),
            "matchType": "EXACT", "primary": primary,
            "keywords": [{"text": k, "matchType": "EXACT"} for k in kws],
            "finalUrl": SITE + p["url"], "path1": p["path"][:15], "headlines": H[:15], "descriptions": D}

# ── Produkter: fire søgninger hver ──────────────────────────────────────────
P = [
 dict(navn="Højtalere", s="højtaler", pl="højtalere", url="/lej-hojtaler", path="hojtaler", pris="fra 395 kr.",
      usp=["Fra Soundboks Til Stort Anlæg", "Bluetooth Og Alle Kabler Med", "Vælg Efter Antal Gæster"],
      d="Soundboks, festhøjtalere og PA-anlæg med alle kabler.", d2="Lej højtaler med Bluetooth og nem opsætning. Vælg størrelse efter antal gæster."),
 dict(navn="Soundboks 4", bud=4, s="soundboks", url="/soundboks-4", path="soundboks", pris="fra 695 kr.",
      usp=["Soundboks 4 Med Bluetooth", "Fuldt Opladet, Klar Til Fest", "Bluetooth — Bare Stream Løs"],
      d="Soundboks 4 med Bluetooth, opladet og klar til fest.", d2="Lej en Soundboks 4 til fest, havefest eller studentertur. Nem booking, klar til at hente."),
 dict(navn="Soundboks 4", bud=4, s="soundbox", url="/soundboks-4", path="soundboks", pris="fra 695 kr.",
      usp=["Soundboks 4 Til Leje", "Fuldt Opladet, Klar Til Fest", "Bluetooth — Bare Stream Løs"],
      d="Soundboks 4 med Bluetooth, opladet og klar til fest.", d2="Lej en Soundboks 4 til fest, havefest eller studentertur. Nem booking, klar til at hente."),
 dict(navn='55" Storskærm', s="storskærm", pl="storskærme", url="/skaerm", path="storskaerm", pris="595 kr.",
      usp=['55" LED-Skærm På Stativ', "Til Event, Møde Og Fest", "HDMI-Kabel Og Stativ Med"],
      d='55" LED-skærm på stativ med HDMI-kabel.', d2="Lej storskærm alene eller med projektor, lærred og mikrofon. Justerbar højde på stativet."),
 dict(navn='55" Storskærm', s="led skærm", pl="led skærme", url="/skaerm", path="storskaerm", pris="595 kr.",
      usp=['55" LED-Skærm På Stativ', "Til Event, Møde Og Fest", "HDMI-Kabel Og Stativ Med"],
      d='55" LED-skærm på stativ med HDMI-kabel.', d2="Lej LED skærm alene eller med projektor, lærred og mikrofon. Justerbar højde på stativet."),
 dict(navn="Projektor", s="projektor", pl="projektorer", url="/lej-projektor", path="projektor", pris="fra 495 kr.", bud=9,
      usp=["Full HD, HDMI-Kabel Med", "Lærred 160 cm Fra 195 kr.", "5000 Lumen Pro Fås Også"],
      d="Full HD med HDMI-kabel og fjernbetjening.", d2="Lej projektor med lærred 160 cm eller 55\" storskærm. Pro-model med 5000 lumen til dagslys."),
 dict(navn="Lærred", s="lærred", url="/laerred-160", path="laerred", pris="fra 195 kr.", bud=9, fam="12",
      usp=["Lærred 160 cm På Stativ", "Projektor Fås Fra 495 kr.", "Klar Til Filmaften"],
      d="160 cm lærred på stativ, klar til projektor.", d2="Lej lærred alene eller sammen med projektor. Præsentationspakken fra 695 kr."),
 dict(navn="Mikrofon", s="mikrofon", pl="mikrofoner", url="/lej-mikrofon", path="mikrofon", pris="fra 95 kr.", bud=9,
      usp=["Trådløs, Headset Eller Shure", "Modtager Og Kabler Med", "Til Taler, Sang Og Karaoke"],
      d="Trådløs, headset eller Shure. Modtager og kabler med.", d2="Lej mikrofon fra 95 kr. Passer til vores højtalere og til dit eget anlæg."),
 dict(navn="Trådløs mikrofon", s="trådløs mikrofon", pl="trådløse mikrofoner", url="/traadloes-mikrofon", path="mikrofon", pris="fra 295 kr.", bud=9,
      usp=["Håndholdt Med Modtager", "Shure PRO Fås Fra 595 kr.", "Til Taler, Sang Og Karaoke"],
      d="Håndholdt med modtager og kabel til højtaler.", d2="Lej trådløs mikrofon fra 295 kr. Passer til vores højtalere og til dit eget anlæg."),
 dict(navn="Håndholdt mikrofon", s="håndholdt mikrofon", url="/haandholdt-mikrofon", path="mikrofon", pris="fra 95 kr.", bud=9, fam="12",
      usp=["Mikrofon Med Kabel Fra 95 kr.", "Shure Beta 58A Fås Også", "Til Taler Og Sang"],
      d="Håndholdt mikrofon med kabel til taler og sang.", d2="Lej håndholdt mikrofon fra 95 kr. Shure Beta 58A med kabel fra 395 kr."),
 dict(navn="Headset", s="headset mikrofon", url="/headset-mikrofon", path="headset", pris="fra 345 kr.", bud=9, fam="13",
      usp=["Trådløst Headset Til Talere", "Bodypack Og Modtager Med", "Til Konference Og Scene"],
      d="Trådløst headset med bodypack og modtager.", d2="Lej headset mikrofon til præsentationer og konferencer. PRO-udgave fra 595 kr."),
 dict(navn="Røgmaskine", s="røgmaskine", pl="røgmaskiner", url="/roegmaskine", path="roegmaskine", pris="fra 595 kr.",
      usp=["Røgvæske Er Med I Prisen", "Fjernbetjening Og Kabler Med", "Klar Til Dansegulvet"],
      d="Røgvæske og fjernbetjening er med i prisen.", d2="Lej røgmaskine til fest, diskotek eller halloween. Kombinér med diskolys og diskokugle."),
 dict(navn="Lyskæder", s="lyskæde", pl="lyskæder", url="/lyskaeder", path="lyskaeder", pris="fra 195 kr.",
      usp=["10 m Lyskæde, Varm Hvid", "Farvede Eller Varm Hvide Pærer", "Klar Til Telt, Have Og Sal"],
      d="10 m kæder i varm hvid eller farvet, klar til fest.", d2="Lej lyskæder til festtelt, have og sal. Strømforsyning med, bare hæng op og tænd."),
 dict(navn="Discokugle", s="diskokugle", pl="diskokugler", alt=["discokugle"], url="/discokugle", path="discokugle", pris="fra 495 kr.", bud=9,
      usp=["Roterende Diskokugle 40 cm", "Motor, Spot Og Stativ Med", "Klar Til Dansegulvet"],
      d="30 eller 40 cm roterende kugle med motor og spot.", d2="Komplet diskokugle-pakke: kugle, motor, LED-spot og ophæng. Sæt op på 5 minutter."),
 dict(navn="Diskolys", s="diskolys", art="", alt=["discolys"], url="/diskolys", path="diskolys", pris="fra 495 kr.",
      usp=["Lys Der Kører Til Musikken", "Diskolys-Pakken 845 kr.", "Klar Til Dansegulvet"],
      d="Effekter der kører selv til musikken, klar til fest.", d2="Diskolys-pakken 845 kr: flere effekter, stativ og alle kabler. Plug and play uden teknik."),
 dict(navn="Festlys", s="festlys", art="", url="/festlys", path="festlys", pris="fra 495 kr.",
      usp=["Diskolys, Diskokugle Og Røg", "Plug And Play, Ingen Teknik", "Klar Til Dansegulvet"],
      d="Diskolys, diskokugle, uplights og røg, klar til fest.", d2="Lys til fest der kører selv til musikken. Plug and play med stativ og alle kabler med."),
 dict(navn="Festlys", s="lys", art="", url="/festlys", path="festlys", pris="fra 195 kr.",
      usp=["Diskolys, Diskokugle Og Røg", "Lyskæder Fra 195 kr.", "Plug And Play, Ingen Teknik"],
      d="Diskolys, diskokugle, lyskæder og uplights, klar til fest.", d2="Lej lys til fest der kører selv til musikken. Plug and play med stativ og alle kabler med."),
 dict(navn="Lysshow", s="lysshow", art="et", url="/lysshow", path="lysshow", pris="fra 1.045 kr.", fam="13",
      usp=["Lys, Discokugle Og Røg", "Klar Til Dansegulvet", "Plug And Play, Ingen Teknik"],
      d="Lys, discokugle og røg i én pakke, klar til fest.", d2="Lej lysshow som pakke med diskolys, diskokugle og røgmaskine. Alle kabler med."),
 dict(navn="Uplights", s="uplight", pl="uplights", url="/uplights", path="uplights", pris="fra 125 kr.", bud=9, fam="13",
      usp=["LED Uplight, Plug And Play", "4-Pak Fra 395 kr.", "Farvet Lys På Vægge Og Hjørner"],
      d="LED uplights på gulv, plug and play.", d2="Lej uplights enkeltvis eller som 4-pak fra 395 kr. Vasker vægge og hjørner i farvet lys."),
 dict(navn="Lydanlæg", s="lydanlæg", art="et", url="/lydanlaeg", path="lydanlaeg", pris="fra 495 kr.",
      usp=["Anlæg Efter Antal Gæster", "Bluetooth Og Alle Kabler Med", "Til 30–250 Gæster"],
      d="Vælg anlæg efter antal gæster, fra 30 til 250.", d2="Lej lydanlæg med Bluetooth, mikrofon og alle kabler. Nem opsætning uden teknik."),
 dict(navn="Musikanlæg", s="musikanlæg", art="et", url="/lydanlaeg", path="lydanlaeg", pris="fra 495 kr.",
      usp=["Anlæg Efter Antal Gæster", "Bluetooth Og Alle Kabler Med", "Til Fest Og Event"],
      d="Vælg anlæg efter antal gæster, fra 30 til 250.", d2="Lej musikanlæg med Bluetooth, mikrofon og alle kabler. Nem opsætning uden teknik."),
 dict(navn="Anlæg", s="anlæg", art="et", url="/lydanlaeg", path="lydanlaeg", pris="fra 495 kr.", fam="124",
      usp=["Anlæg Efter Antal Gæster", "Bluetooth Og Alle Kabler Med", "Til Fest Og Event"],
      d="Vælg anlæg efter antal gæster, fra 30 til 250.", d2="Lej anlæg med Bluetooth, mikrofon og alle kabler. Nem opsætning uden teknik."),
 dict(navn="PA-anlæg", s="pa anlæg", art="et", alt=["pa-anlæg"], url="/lydanlaeg", path="pa-anlaeg", pris="fra 995 kr.",
      usp=['2× 12" Højtalere På Stativer', "Til 100–250 Gæster", "Mikrofon Og Mixer Fås Med"],
      d='2× 12" højtalere, stativer og alle kabler med.', d2="Lej PA anlæg med subwoofer, mixer og trådløs mikrofon. Vælg størrelse efter antal gæster."),
 dict(navn="Lydudstyr", s="lydudstyr", art="", url="/lydanlaeg", path="lydudstyr", pris="fra 495 kr.",
      usp=["Højtalere, Mikrofon Og Mixer", "Bluetooth Og Alle Kabler Med", "Anlæg Efter Antal Gæster"],
      d="Højtalere, mikrofon og mixer, klar til brug.", d2="Lej lydudstyr med Bluetooth og alle kabler. Nem opsætning uden teknik."),
 dict(navn="Karaoke", s="karaoke", art="", url="/karaoke", path="karaoke", pris="fra 695 kr.",
      usp=["Karaokemaskine, 2 Mikrofoner", "Indbygget Skærm Og Festlys", "Karaokepakke Med Højtalere"],
      d="Maskine med skærm, 2 trådløse mikrofoner og lys.", d2="Lej karaoke alene eller som pakke med højtalere. Tilslut dit TV via HDMI."),
 dict(navn="Karaokemaskine", s="karaokemaskine", alt=["karaoke maskine"], url="/karaoke-maskine", path="karaoke", pris="fra 695 kr.",
      usp=["Indbygget Skærm Og Festlys", "2 Trådløse Mikrofoner Med", "Tilslut TV Via HDMI"],
      d="Singing Machine med skærm, 2 mikrofoner og lys.", d2="Lej karaokemaskine med 2 trådløse mikrofoner og indbygget festlys. Bluetooth og HDMI."),
 dict(navn="Karaokeanlæg", s="karaokeanlæg", art="et", alt=["karaoke anlæg"], url="/karaoke", path="karaoke", pris="fra 695 kr.",
      usp=["Karaokemaskine, 2 Mikrofoner", "Karaokepakke Med Højtalere", "Tilslut TV Via HDMI"],
      d="Maskine, 2 mikrofoner og højtalere, klar til brug.", d2="Lej karaokeanlæg som pakke med højtalere fra 1.300 kr. Tilslut dit TV via HDMI."),
 dict(navn="AV-udstyr", s="av udstyr", art="", alt=["av-udstyr"], url="/av-udstyr", path="av-udstyr", pris="fra 95 kr.", bud=9,
      usp=["Projektor, Skærm Og Mikrofon", "Til Konference Og Firmaevent", "Alle Kabler Med I Prisen"],
      d="Projektor, storskærm, lærred og mikrofoner.", d2="Lej AV udstyr som pakke: præsentationspakken med projektor, lærred og mikrofon fra 695 kr."),
 dict(navn="Festudstyr", s="festudstyr", art="", url="/", path="festudlejning", pris="fra 395 kr.", bud=9,
      usp=["Lyd, Lys Og Røg Til Festen", "Alt Klar Til Weekendens Fest", "Højtalere Fra 395 kr."],
      d="Højtalere, festlys, diskokugle og røgmaskine.", d2="Lej alt til festen ét sted: lyd, lys og røg med alle kabler. Nem opsætning uden teknik."),
]

# ── Enkeltfraser: én søgning, egne stavemåder ───────────────────────────────
S = [
 (P[0], "lej højtaler til fest", ["lej højtaler til fest", "lej højtalere til fest", "leje af højtaler til fest", "leje af højtalere til fest", "højtaler til fest leje"],
  dict(url="/hojtalerpakke-lille", path="fest", pris="fra 595 kr.", navn="Lille højtalerpakke", usp=['2 Stk. Alto 10" Højtalere', "Bluetooth — Bare Stream Løs", "Klar Til Weekendens Fest"], d='2× Alto 10" med Bluetooth og alle kabler.', d2="Lej højtaler til fest med nem opsætning: tænd, par med telefonen og spil. Ingen teknik.")),
 (P[0], "festhøjtaler leje", ["festhøjtaler leje", "lej festhøjtaler", "lej festhøjtalere", "festhøjtaler udlejning", "leje af festhøjtaler"],
  dict(url="/hojtalerpakke-lille", path="fest", pris="fra 595 kr.", navn="Lille højtalerpakke", usp=['2 Stk. Alto 10" Højtalere', "Bluetooth — Bare Stream Løs", "Klar Til Weekendens Fest"], d='2× Alto 10" med Bluetooth og alle kabler.', d2="Lej festhøjtaler med nem opsætning: tænd, par med telefonen og spil. Ingen teknik.")),
 (P[0], "party højtaler leje", ["party højtaler leje", "lej party højtaler", "lej partyhøjtaler", "partyhøjtaler leje"],
  dict(url="/hojtalerpakke-lille", path="fest", pris="fra 595 kr.", navn="Lille højtalerpakke", usp=['2 Stk. Alto 10" Højtalere', "Bluetooth — Bare Stream Løs", "Klar Til Weekendens Fest"], d='2× Alto 10" med Bluetooth og alle kabler.', d2="Lej party højtaler med nem opsætning: tænd, par med telefonen og spil. Ingen teknik.")),
 (P[1], "lån soundboks", ["lån soundboks", "lån en soundboks"], {}),
 (P[3], "storskærm til event", ["storskærm til event", "storskærm til møde", "storskærm mødelokale", "storskærm til fest"], {}),
 (P[5], "lej projektor og lærred", ["lej projektor og lærred", "leje af projektor og lærred", "leje af lærred og projektor", "leje af lærred og projektor københavn", "lej lærred og projektor"], {}),
 (P[7], "leje af mikrofon og højtaler", ["leje af mikrofon og højtaler", "lej mikrofon og højtaler", "mikrofon og højtaler leje"],
  dict(url="/pakke-tale-musik", path="tale-musik", pris="1.195 kr.", navn="Tale & musik-pakken", usp=['2× 12" Højtalere + Trådløs Mic', "Til Taler Og Musik", "Alle Kabler Med"], d='2× 12" højtalere og trådløs mikrofon i én pakke.', d2="Leje af mikrofon og højtaler som pakke: taler og musik til events, alle kabler med.")),
 (P[12], "lej lyskæder til fest", ["lej lyskæder til fest", "lyskæder til fest leje", "leje af lyskæder til fest"], {}),
 (P[12], "lej lyskæder til bryllup", ["lej lyskæder til bryllup", "lyskæder til bryllup leje", "leje af lyskæder til bryllup"], {}),
 (P[15], "lys til fest", ["lej lys til fest", "lys til fest leje", "leje lys til fest", "leje af lys til fest", "udlejning af lys til fest"], {}),
 (P[15], "lyd og lys udlejning", ["lyd og lys udlejning", "lys og lyd udlejning", "udlejning af lyd og lys"],
  dict(url="/festpakke-lille", path="lyd-og-lys", pris="fra 890 kr.", navn="Lille festpakke", usp=["Højtalere + Festlys I Én Pakke", "Lille Festpakke 890 kr.", "Klar Til Dansegulvet"], d="Højtalere og festlys i én pakke med alle kabler.", d2="Lyd og lys udlejning som pakke: 2 højtalere med Bluetooth, diskolys og stativ.")),
 (P[15], "lej lyd og lys", ["lej lyd og lys", "lej lys og lyd", "leje af lyd og lys", "leje af lys og lyd", "lej lyd og lys til fest"],
  dict(url="/festpakke-lille", path="lyd-og-lys", pris="fra 890 kr.", navn="Lille festpakke", usp=["Højtalere + Festlys I Én Pakke", "Lille Festpakke 890 kr.", "Klar Til Dansegulvet"], d="Højtalere og festlys i én pakke med alle kabler.", d2="Lej lyd og lys som pakke: 2 højtalere med Bluetooth, diskolys og stativ.")),
 (P[19], "lydudlejning", ["lydudlejning", "lydudlejning københavn", "lyd udlejning", "lyd udlejning københavn"],
  dict(navn="Lydudlejning", path="lydudlejning", usp=["Højtalere, Mikrofon Og Mixer", "Anlæg Efter Antal Gæster", "Bluetooth Og Alle Kabler Med"])),
 (P[20], "musikanlæg til fest", ["leje af musikanlæg til fest", "lej musikanlæg til fest", "musikanlæg til fest leje"], {}),
 (P[21], "anlæg til fest", ["lej anlæg til fest", "leje af anlæg til fest", "anlæg til fest leje", "lydanlæg til fest leje"], {}),
 (P[28], "festudlejning", ["festudlejning", "festudlejning københavn", "fest udlejning"], dict(navn="Festudlejning")),
 (P[28], "lej til fest", ["lej til fest", "leje til fest", "lej udstyr til fest", "udstyr til fest leje"], dict(navn="Festudlejning")),
]

def main():
    for f in os.listdir(HER):
        if f.endswith(".json"): os.remove(os.path.join(HER, f))
    grupper = []
    for p in P:
        for primary, kws in familier(p):
            grupper.append(gruppe(p, primary, kws))
    for p, primary, kws, over in S:
        grupper.append(gruppe({**p, **over}, primary, kws))
    navne = set()
    for i, g in enumerate(grupper, 1):
        assert g["name"] not in navne, g["name"]; navne.add(g["name"])
        slug = re.sub(r"[^a-z0-9]+", "-", g["primary"].lower().replace("æ", "ae").replace("ø", "oe").replace("å", "aa")).strip("-")
        with open(os.path.join(HER, f"{i:03d}-{slug}.json"), "w") as fh:
            json.dump(g, fh, ensure_ascii=False, indent=2)
    print(len(grupper), "grupper,", sum(len(g["keywords"]) for g in grupper), "keywords")
    for g in grupper: print(f"  {len(g['keywords'])} kw · {g['name']}")

if __name__ == "__main__":
    main()
