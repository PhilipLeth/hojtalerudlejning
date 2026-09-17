#!/usr/bin/env python3
"""Trin 3: arkets nye produkter, tilvalg og pakker — og de pakker arket omdefinerer.

Arkets egen regel for pakkepriser er "delene hver for sig minus ca. 95 kr"
(Lille soundboks pakke 495+395−95 = 795, Festlys 0-50 395+245−95 = 545,
Speakerpakke trådløs 0-30 595+445−95 = 945). Fire priser i arket lå OVER
delenes sum og er regnet efter samme regel — se ARK_AFVIGELSER nederst.
"""
import json, os, re
ROD = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
P = os.path.join(ROD, "src/lib/products.ts"); DJ = os.path.join(ROD, "src/lib/djGearProducts.ts")
s = open(P).read()

def obj_span(src, pid, jsonstil=False):
    m = re.search(r'(?<![A-Za-z])"?id"?:\s*"%s"' % re.escape(pid), src); assert m, pid
    a = src.rfind("{", 0, m.start()); d = 0; i = a
    while True:
        c = src[i]
        if c == "{": d += 1
        elif c == "}":
            d -= 1
            if d == 0: return a, i + 1
        i += 1

def erstat(src, pid, ny): a, b = obj_span(src, pid); return src[:a] + ny + src[b:]
def felt(src, pid, fn): a, b = obj_span(src, pid); return src[:a] + fn(src[a:b]) + src[b:]
def must(src, a, b, n=1):
    assert src.count(a) >= 1, a[:60]
    return src.replace(a, b, n)

D = "...DELIVERY_ADDON_IDS"
# ── Højtalere: tilvalg som arket siger ─────────────────────────────────────
KOERSEL = '"levering_ud", "afhentning_retur", "levering_begge"'  # DELIVERY_ADDON_IDS er først defineret efter højtalerne
s = felt(s, "thumpgo", lambda b: b.replace('    contents: ["Mackie Thump GO 8\\"",', '    allowedAddons: ["mikrofon_kabel", "stativ_enkelt", "lys", %s],\n    contents: ["Mackie Thump GO 8\\"",' % KOERSEL, 1))
s = felt(s, "soundboks", lambda b: b.replace('    contents: ["Soundboks 4",', '    allowedAddons: ["mikrofon_kabel", "stativ_enkelt", "lys", "batteri", %s],\n    contents: ["Soundboks 4",' % KOERSEL, 1))
assert 'allowedAddons: ["mikrofon_kabel", "stativ_enkelt", "lys", "batteri"' in s and s.count('"mikrofon_kabel", "stativ_enkelt"') == 2
s = s.replace("Stativer kan tilkøbes for 100 kr.", "Stativer kan tilkøbes for 95 kr.").replace("Stands available as add-on for 100 kr.", "Stands available as add-on for 95 kr.")

# ── Tilvalg ────────────────────────────────────────────────────────────────
s = erstat(s, "stroboskop", '''{
    id: "stroboskop",
    price: 395,
    image: null,
    contents: ["Botex SP-1500 DMX stroboskop", "Controller", "Strømkabel"],
    da: { label: "Stroboskop med styring", desc: "Kraftigt stroboskop med controller, så hastighed og styrke kan skrues op og ned" },
    en: { label: "Strobe light with controller", desc: "Powerful strobe with a controller for speed and intensity" },
  }''')
s = s.replace("  // Skjult kladde: model og beholdning afklares før aktivering. 95 kr er prisforslag.\n", "")
s = felt(s, "batteri", lambda b: b.replace('image: "/images/product-thumpgo-v2-white.webp"', 'image: "/images/product-soundboks-v2-white.webp"')
         .replace('label: "Ekstra batteri", desc: "Ekstra batteri til batterihøjtaler, mere spilletid uden strøm"', 'label: "Soundboks batteri", desc: "Ekstra batteri til Soundboks 4, dobbelt spilletid uden strøm"')
         .replace('label: "Extra battery", desc: "Extra battery for battery speakers, more playtime without power"', 'label: "Soundboks battery", desc: "Extra battery for the Soundboks 4, twice the playtime without power"'))
NYE_TILVALG = '''  // ── Produktarket 17. sept 2026: stativer, væsker og den kablede mikrofon som tilvalg.
  // Uden foto, som kørslen — de vælges til et produkt, de sælger ikke sig selv.
  {
    id: "mikrofon_kabel",
    // Samme mikrofon som rental-varen haandholdt_mikrofon, én side til begge
    page: "/haandholdt-mikrofon",
    price: 95,
    image: "/images/product-mikrofon-kabel-v2-white.webp",
    da: { label: "Mikrofon med ledning", desc: "Håndholdt mikrofon med kabel, sættes direkte i højtaleren" },
    en: { label: "Wired microphone", desc: "Handheld wired microphone, plugs straight into the speaker" },
  },
  {
    id: "stativ_enkelt",
    price: 75,
    image: null,
    da: { label: "1 højtalerstativ", desc: "Ét stativ, løfter højtaleren op i ørehøjde" },
    en: { label: "1 speaker stand", desc: "A single stand, lifts the speaker to ear level" },
  },
  {
    id: "mikrofonstativ",
    price: 95,
    image: null,
    da: { label: "Mikrofonstativ", desc: "Gulvstativ med galge, til taler og sang" },
    en: { label: "Microphone stand", desc: "Floor stand with boom arm, for speeches and vocals" },
  },
  {
    id: "lysstativ",
    price: 145,
    image: null,
    da: { label: "Lysstativ", desc: "Stativ med T-bar til lyseffekter" },
    en: { label: "Lighting stand", desc: "Stand with T-bar for light effects" },
  },
  {
    id: "x_stativ",
    price: 95,
    image: null,
    da: { label: "X-stativ", desc: "Sammenklappeligt X-stativ til DJ-pult eller keyboard" },
    en: { label: "X-stand", desc: "Folding X-stand for a DJ controller or keyboard" },
  },
  {
    id: "dj_stativ",
    price: 495,
    image: null,
    da: { label: "DJ-stativ med klæde", desc: "X-stativ med sort klæde foran, skjuler kabler og giver en pæn DJ-front" },
    en: { label: "DJ stand with cloth", desc: "X-stand with a black front cloth, hides cables and gives a tidy DJ booth" },
  },
  {
    id: "roegvaeske",
    price: 295,
    image: null,
    da: { label: "Ekstra røgvæske 5 liter", desc: "Til lange fester, en normal aften klares af væsken der følger med maskinen" },
    en: { label: "Extra fog fluid 5 litres", desc: "For long parties, a normal evening is covered by the fluid that comes with the machine" },
  },
  // Væske til maskiner der endnu venter på foto — pauset sammen med dem.
  {
    id: "snevaeske",
    price: 295,
    image: null,
    hidden: true,
    da: { label: "Ekstra snevæske 5 liter", desc: "Ekstra væske til snemaskinen" },
    en: { label: "Extra snow fluid 5 litres", desc: "Extra fluid for the snow machine" },
  },
  {
    id: "boblevaeske",
    price: 295,
    image: null,
    hidden: true,
    da: { label: "Ekstra boblevæske 5 liter", desc: "Ekstra væske til sæbeboblemaskinen" },
    en: { label: "Extra bubble fluid 5 litres", desc: "Extra fluid for the bubble machine" },
  },
'''
s = must(s, "  ...mixerModels,\n", NYE_TILVALG + "  ...mixerModels,\n")

# ── Mikrofoner: tilvalg og model efter arket ───────────────────────────────
MIC = 'allowedAddons: ["mikrofonstativ", "mixer_stor", %s], ' % D
for pid in ("haandholdt_mikrofon", "haandholdt_mikrofon_pro", "traadloes_mikrofon"):
    s = felt(s, pid, lambda b: b.replace("contents: [", MIC + "contents: [", 1))
s = felt(s, "headset", lambda b: b.replace("contents: [", 'allowedAddons: ["mixer_stor", %s], contents: [' % D, 1))
s = felt(s, "traadloes_mikrofon", lambda b: b.replace('desc_da: "Trådløs håndholdt mikrofon til taler og karaoke."', 'desc_da: "Shure BLX24 med SM58, trådløs håndholdt mikrofon i scenekvalitet til taler, sang og karaoke."')
         .replace('desc_en: "Wireless handheld microphone for speeches and karaoke."', 'desc_en: "Shure BLX24 with SM58, a stage-quality wireless handheld microphone for speeches, vocals and karaoke."')
         .replace('contents: ["Trådløs håndholdt mic", "Modtager",', 'contents: ["Shure BLX24/SM58 trådløs mikrofon", "Shure modtager",'))
s = felt(s, "headset", lambda b: b.replace('desc_da: "Headset-mikrofon til præsentationer."', 'desc_da: "Shure BLX14 trådløst headset, frie hænder til præsentationer og undervisning."')
         .replace('desc_en: "Headset mic for presentations."', 'desc_en: "Shure BLX14 wireless headset, hands free for presentations and teaching."'))

# ── Pakker arket omdefinerer ───────────────────────────────────────────────
def pakke(pid, navn_da, navn_en, kat, pris, billede, dele, desc_da, desc_en, use_da, use_en, contents, addons, page=None, extra=""):
    summ = sum(d[3] for d in dele)
    parts = "\n".join('        { productId: "%s", %slabel_da: %s, label_en: %s, price: %d },' % (d[0], ("qty: %d, " % d[4]) if len(d) > 4 else "", json.dumps(d[1], ensure_ascii=False), json.dumps(d[2], ensure_ascii=False), d[3]) for d in dele)
    return '''{
    id: "%s",%s
    category: "%s",
    price: %d,
    image: "%s",
    showPartImages: true,%s
    name_da: %s,
    name_en: %s,
    desc_da: %s,
    desc_en: %s,
    contents: %s,
    allowedAddons: [%s],
    bundle: {
      discount: %d,
      usecase_da: %s,
      usecase_en: %s,
      parts: [
%s
      ],
    },
  }''' % (pid, ('\n    page: "%s",' % page) if page else "", kat, pris, billede, extra, json.dumps(navn_da, ensure_ascii=False), json.dumps(navn_en, ensure_ascii=False),
          json.dumps(desc_da, ensure_ascii=False), json.dumps(desc_en, ensure_ascii=False), json.dumps(contents, ensure_ascii=False),
          ", ".join(['"%s"' % a for a in addons] + [D]), summ - pris, json.dumps(use_da, ensure_ascii=False), json.dumps(use_en, ensure_ascii=False), parts)

LILLE = ("party", "Lille højtalerpakke", "Small speaker package", 595)
MELLEM = ("festival", "Mellem højtalerpakke", "Medium speaker package", 795)
STOR = ("hojtaler_100", "Stor højtalerpakke", "Large speaker package", 1295)
LYSBAR = ("lys", "Lysbar", "Light bar", 395)
ROG = ("rog", "Røgmaskine", "Fog machine", 245)
MIK = ("haandholdt_mikrofon", "Mikrofon med ledning", "Wired microphone", 95)
TRAAD = ("traadloes_mikrofon", "Trådløs mikrofon", "Wireless mic", 445)
SPK_ADDONS = ["mikrofonstativ", "mixer_stor"]

def behold(src, pid, *felter):
    a, b = obj_span(src, pid); blok = src[a:b]; ud = ""
    for f in felter:
        m = re.search(r'\n?\s*%s: (?:"[^"\n]*"|\'[^\'\n]*\'),?' % f, blok)
        if m: ud += "\n    %s" % m.group(0).strip().rstrip(",") + ","
    return ud

for pid, args in {
  "pakke_fest_lille": ("Festpakke 0-30", "Party package 0-30", "lyd", 895, "/images/product-pakke-fest-lille-white.webp", [LILLE, LYSBAR],
      "Lille højtalerpakke + lysbar. Lyd og lys til op til 30 gæster, spar 95 kr.", "Small speaker package + light bar. Sound and lights for up to 30 guests, save 95 DKK.",
      "Lyd og lys til den lille fest, op til 30 gæster. Kompakt sæt, klar på 10 minutter.", "Sound and lights for the small party, up to 30 guests. Compact set, ready in 10 minutes.",
      ['2× Alto 10" højtalere', "Lysbar (2 lamper + centereffekt)", "Bluetooth + alle kabler"], ["subwoofer", "rog", "stativer", "mikrofon"]),
  "pakke_fest_stor": ("Festpakke 30-50", "Party package 30-50", "lyd", 1095, "/images/product-pakke-fest-stor-white.webp", [MELLEM, LYSBAR],
      "Mellem højtalerpakke + lysbar. Lyd og lys til 30-50 gæster, spar 95 kr.", "Medium speaker package + light bar. Sound and lights for 30-50 guests, save 95 DKK.",
      'Lyd og lys til festen med 30-50 gæster, med de store 12" højtalere.', 'Sound and lights for the party with 30-50 guests, with the large 12" speakers.',
      ['2× EV 12" højtalere', "Lysbar (2 lamper + centereffekt)", "Bluetooth + alle kabler"], ["subwoofer", "rog", "stativer", "mikrofon"]),
  "pakke_soundboks_lys": ("Stor soundboks pakke", "Large Soundboks package", "lyd", 995, "/images/product-soundboks-v2-white.webp", [("soundboks", "Soundboks 4", "Soundboks 4", 695), LYSBAR],
      "Soundboks 4 + lysbar. Batteridrevet lyd og lys til festen, spar 95 kr.", "Soundboks 4 + light bar. Battery-powered sound and lights, save 95 DKK.",
      "Soundboks klarer lyden uden en stikkontakt, lysbaren gør det til en fest. Lysbaren kræver strøm, så den skal tænkes med, hvis I er udenfor.", "The Soundboks handles sound without a socket, the light bar makes it a party. The light bar needs power, so plan for that if you are outdoors.",
      ["Soundboks 4 (batteri)", "Lysbar (2 lamper + centereffekt)", "Stativ", "Alle kabler"], ["rog", "batteri", "mikrofon_kabel"]),
  "pakke_speaker_mik": ("Speakerpakke 30-50", "Speaker package 30-50", "lyd", 795, "/images/product-festival-v2-white.webp", [MELLEM, MIK],
      "Mellem højtalerpakke + mikrofon med ledning. Lyd og taler til 30-50 gæster, spar 95 kr.", "Medium speaker package + wired microphone. Sound and speeches for 30-50 guests, save 95 DKK.",
      "Til det arrangement hvor der både skal spilles musik og holdes tale. Mikrofonen går direkte i højtaleren, så der ikke skal en mixer imellem.", "For the event with both music and speeches. The microphone plugs straight into the speaker, so no mixer is needed in between.",
      ['2× EV 12" højtalere', "Mikrofon med ledning", "Bluetooth", "Alle kabler"], SPK_ADDONS),
  "pakke_tale_musik": ("Speakerpakke trådløs 30-50", "Wireless speaker package 30-50", "av", 1145, "/images/product-festival-v2-white.webp", [MELLEM, TRAAD],
      "Mellem højtalerpakke + trådløs Shure-mikrofon. Taler og musik til 30-50 gæster, spar 95 kr.", "Medium speaker package + wireless Shure microphone. Speeches and music for 30-50 guests, save 95 DKK.",
      "Taler uden kabel: den trådløse mikrofon giver frihed til at gå rundt, højtalerne klarer musikken bagefter.", "Speeches without a cable: the wireless microphone lets you move around, the speakers handle the music afterwards.",
      ['2× EV 12" højtalere', "Trådløs Shure-mikrofon", "Alle kabler"], SPK_ADDONS),
}.items():
    ekstra = behold(s, pid, "youtubeUrl", "cardImageCrop")
    page = re.search(r'page: "([^"]+)"', s[slice(*obj_span(s, pid))]).group(1)
    s = erstat(s, pid, pakke(pid, *args, page=page, extra=ekstra))

NYE_PAKKER = ",\n  ".join([
  pakke("pakke_speaker_lille", "Speakerpakke 0-30", "Speaker package 0-30", "lyd", 645, "/images/product-party-v2-white.webp", [LILLE, MIK],
      "Lille højtalerpakke + mikrofon med ledning. Lyd og taler til op til 30 gæster, spar 45 kr.", "Small speaker package + wired microphone. Sound and speeches for up to 30 guests, save 45 DKK.",
      "Musik og en tale eller to i det mindre selskab. Mikrofonen går direkte i højtaleren.", "Music and a speech or two for the smaller gathering. The microphone plugs straight into the speaker.",
      ['2× Alto 10" højtalere', "Mikrofon med ledning", "Bluetooth", "Alle kabler"], SPK_ADDONS),
  pakke("pakke_speaker_traadloes_lille", "Speakerpakke trådløs 0-30", "Wireless speaker package 0-30", "lyd", 945, "/images/product-party-v2-white.webp", [LILLE, TRAAD],
      "Lille højtalerpakke + trådløs Shure-mikrofon. Taler og musik til op til 30 gæster, spar 95 kr.", "Small speaker package + wireless Shure microphone. Speeches and music for up to 30 guests, save 95 DKK.",
      "Taler uden kabel i det mindre selskab, og musik bagefter.", "Speeches without a cable for the smaller gathering, and music afterwards.",
      ['2× Alto 10" højtalere', "Trådløs Shure-mikrofon", "Alle kabler"], SPK_ADDONS),
  pakke("pakke_fest_100", "Festpakke 50-100", "Party package 50-100", "lyd", 1695, "/images/product-festival-bas-v2-white.webp", [STOR, ("lys", "2× lysbar", "2× light bar", 790, 2)],
      "Stor højtalerpakke + 2 lysbarer. Lyd med bas og lys i begge ender af dansegulvet til 50-100 gæster, spar 390 kr.", "Large speaker package + 2 light bars. Sound with bass and lights at both ends of the dancefloor for 50-100 guests, save 390 DKK.",
      "Festen med 50-100 gæster: subwooferen giver tryk, to lysbarer dækker hele dansegulvet.", "The party with 50-100 guests: the subwoofer adds punch, two light bars cover the whole dancefloor.",
      ['2× EV 12" højtalere', '12" subwoofer', "2× lysbar (2 lamper + centereffekt)", "Alle kabler"], ["rog", "mikrofon"]),
  pakke("pakke_elegant", "Elegant festpakke", "Elegant party package", "lyd", 1395, "/images/product-festival-v2-white.webp", [MELLEM, ("discokugle", "Discokugle 40 cm komplet", "Disco ball 40 cm complete", 645)],
      "Mellem højtalerpakke + discokugle 40 cm med stativ og spot. Lyd og klassisk lys til 30-50 gæster, spar 45 kr.", "Medium speaker package + 40 cm disco ball with stand and spot. Sound and classic light for 30-50 guests, save 45 DKK.",
      "Til festen hvor lyset skal være stilfuldt frem for blinkende: en discokugle i spot og god lyd.", "For the party where the light should be stylish rather than flashing: a disco ball in a spotlight and good sound.",
      ['2× EV 12" højtalere', "Discokugle 40 cm med motor, stativ og spot", "Alle kabler"], ["stativer", "mikrofon", "rog"]),
  pakke("pakke_soundboks_lille", "Lille soundboks pakke", "Small Soundboks package", "lyd", 795, "/images/product-thumpgo-v2-white.webp", [("thumpgo", "Mackie Thump GO", "Mackie Thump GO", 495), LYSBAR],
      "Mackie Thump GO + lysbar. Batterihøjtaler og lys til den lille fest, spar 95 kr.", "Mackie Thump GO + light bar. Battery speaker and lights for the small party, save 95 DKK.",
      "Det billige alternativ til Soundboks-pakken: batterihøjtaler til op til 30 gæster og en lysbar. Lysbaren kræver strøm.", "The budget alternative to the Soundboks package: a battery speaker for up to 30 guests and a light bar. The light bar needs power.",
      ['Mackie Thump GO 8"', "Lysbar (2 lamper + centereffekt)", "Stativ", "Alle kabler"], ["rog", "mikrofon_kabel"]),
  pakke("pakke_festlys_50", "Festlys 0-50", "Party lights 0-50", "lys", 545, "/images/product-lys-v4-white.webp", [LYSBAR, ROG],
      "Lysbar + røgmaskine. Lys og røg til dansegulvet for op til 50 gæster, spar 95 kr.", "Light bar + fog machine. Lights and fog for the dancefloor for up to 50 guests, save 95 DKK.",
      "Røgen gør lyset synligt. Til dig der har lyden, men mangler dansegulvet.", "Fog makes the light visible. For when you have the sound but need a dancefloor.",
      ["Lysbar (2 lamper + centereffekt)", "Røgmaskine med væske", "Stativ og kabler"], ["roegvaeske", "stroboskop"]),
  pakke("pakke_festlys_100", "Festlys 50-100", "Party lights 50-100", "lys", 995, "/images/product-lys-v4-white.webp", [("lys", "2× lysbar", "2× light bar", 790, 2), ROG],
      "2 lysbarer + røgmaskine. Lys i begge ender af dansegulvet og røg til 50-100 gæster, spar 40 kr.", "2 light bars + fog machine. Lights at both ends of the dancefloor and fog for 50-100 guests, save 40 DKK.",
      "Det store dansegulv: to lysbarer dækker rummet, røgen gør strålerne synlige.", "The big dancefloor: two light bars cover the room, fog makes the beams visible.",
      ["2× lysbar (2 lamper + centereffekt)", "Røgmaskine med væske", "Stativer og kabler"], ["roegvaeske", "stroboskop"]),
])

# Nye enkeltprodukter uden foto: i kataloget, men på pause til fotoet findes.
def venter(pid, navn_da, navn_en, kat, pris, billede, desc_da, desc_en, contents):
    return '{ id: "%s", hidden: true, category: "%s", price: %d, image: "%s", name_da: %s, name_en: %s, desc_da: %s, desc_en: %s, contents: %s }' % (
        pid, kat, pris, billede, json.dumps(navn_da, ensure_ascii=False), json.dumps(navn_en, ensure_ascii=False), json.dumps(desc_da, ensure_ascii=False), json.dumps(desc_en, ensure_ascii=False), json.dumps(contents, ensure_ascii=False))
VENTER = ",\n  ".join([
  venter("monitor", "Monitor · EV ZLX 12P", "Monitor · EV ZLX 12P", "lyd", 495, "/images/product-festival-v2-white.webp", 'Én aktiv 12" EV-højtaler, som monitor til scenen eller ekstra højtaler.', 'A single active 12" EV speaker, as a stage monitor or an extra speaker.', ['1× EV ZLX 12P aktiv højtaler', "Strømkabel"]),
  venter("discokugle_guld", "Discokugle 40 cm guld", "Disco ball 40 cm gold", "lys", 645, "/images/product-discokugle-v2-white.webp", "Komplet pakke: 40 cm guldfarvet discokugle med motor, spot og stativ.", "Complete package: 40 cm gold disco ball with motor, spotlight and stand.", ["Discokugle 40 cm guld", "Motor", "LED-spot", "Stativ", "Strømkabel"]),
  venter("scenelys", "Scenelys (4 LED på stativ)", "Stage lights (4 LEDs on a stand)", "lys", 695, "/images/product-uplight-4-v2-white.webp", "4 LED-lamper på stativ med tværbom og fjernbetjening, lys til scene, taler og band.", "4 LED lights on a stand with cross bar and remote, light for a stage, speeches and bands.", ["4× LED PAR", "Stativ med tværbom", "Fjernbetjening", "Strømkabler"]),
  venter("foelgespot", "Følgespot", "Follow spot", "lys", 1995, "/images/product-lyseffekt-live-white.webp", "LED-følgespot 120 W på stativ, til at følge taleren eller brudeparret.", "120 W LED follow spot on a stand, to follow the speaker or the couple.", ["LED-følgespot 120 W", "Stativ", "Strømkabel"]),
  venter("uv_lampe", "UV-lampe", "UV light", "lys", 245, "/images/product-lyseffekt-live-white.webp", "UV-lampe der får hvidt og neon til at lyse, til UV- og neonfester.", "UV light that makes white and neon glow, for UV and neon parties.", ["LED UV-lampe", "Strømkabel"]),
  venter("laser", "RGB-laser", "RGB laser", "lys", 595, "/images/product-lyseffekt-live-white.webp", "Farvet laser med mønstre, bedst sammen med røg.", "Colour laser with patterns, best together with fog.", ["RGB-laser", "Strømkabel"]),
  venter("snemaskine", "Snemaskine", "Snow machine", "roeg", 445, "/images/product-rog-v2-white.webp", "Snemaskine der laver fin kunstig sne, inkl. snevæske.", "Snow machine that makes fine artificial snow, incl. snow fluid.", ["Snemaskine", "Snevæske", "Strømkabel"]),
  venter("saebeboblemaskine", "Sæbeboblemaskine", "Bubble machine", "roeg", 995, "/images/product-rog-v2-white.webp", "Stor sæbeboblemaskine, fylder rummet med bobler, inkl. boblevæske.", "Large bubble machine that fills the room with bubbles, incl. bubble fluid.", ["Sæbeboblemaskine", "Boblevæske", "Strømkabel"]),
])
s = must(s, "  ...djGearProducts,\n", "  ...djGearProducts,\n  // ── Produktarket 17. sept 2026: nye pakker (bundter af arkets enkeltprodukter)\n  " + NYE_PAKKER + ",\n  // ── Nye enkeltprodukter fra arket. Pauset indtil der er et ærligt produktfoto, billedet her er en pladsholder.\n  " + VENTER + ",\n")

# ── Pakkestigen følger pakkerne ────────────────────────────────────────────
s = re.sub(r'\{ productId: "pakke_fest_lille", navn: "[^"]*", navn_en: "[^"]*", gaester: "[^"]*", gaester_en: "[^"]*", maxGaester: \d+, href: "/festpakke-lille", pris: \d+, hvad: \'[^\']*\', hvad_en: \'[^\']*\'',
           '{ productId: "pakke_fest_lille", navn: "Festpakke 0-30", navn_en: "Party package 0-30", gaester: "op til 30", gaester_en: "up to 30", maxGaester: 30, href: "/festpakke-lille", pris: 895, hvad: \'2× 10" højtalere + lysbar\', hvad_en: \'2× 10" speakers + light bar\'', s)
s = re.sub(r'\{ productId: "pakke_fest_stor", navn: "[^"]*", navn_en: "[^"]*", gaester: "[^"]*", gaester_en: "[^"]*", maxGaester: \d+, href: "/festpakke-stor", pris: \d+',
           '{ productId: "pakke_fest_stor", navn: "Festpakke 30-50", navn_en: "Party package 30-50", gaester: "30-50", gaester_en: "30-50", maxGaester: 50, href: "/festpakke-stor", pris: 1095', s)
for pid in ("pakke_fest_150", "pakke_fest_250"):
    pris = json.load(open(os.path.join(ROD, "scripts/katalog/katalog-efter-trin1.json")))["pris"][pid]
    s = re.sub(r'(\{ productId: "%s",[^\n]*? pris: )\d+' % pid, lambda m: m.group(1) + str(pris), s)
s = s.replace('gaester: "100-150", gaester_en: "100-150", maxGaester: 150', 'gaester: "50-150", gaester_en: "50-150", maxGaester: 150')

# ── Pauselisten siger højt hvad der er pauset, og hvorfor ──────────────────
s = must(s, 'export const PAUSEDE_PRODUKTER: string[] = ["stroboskop", "mixer_lille", "mixer_xl"];',
 '''export const PAUSEDE_PRODUKTER: string[] = [
  "mixer_lille", "mixer_xl",
  // Produktarket 17. sept 2026: arkets trådløse mikrofon og headset ER Shure-modellerne,
  // så PRO-varianterne er overflødige. Bæretasken står ikke i arket.
  "traadloes_mikrofon_pro", "headset_pro", "taske",
  // Nye produkter fra arket, der venter på et ærligt produktfoto.
  "monitor", "discokugle_guld", "scenelys", "foelgespot", "uv_lampe", "laser", "snemaskine", "saebeboblemaskine", "snevaeske", "boblevaeske",
];''')
open(P, "w").write(s)

# ── DJ-pakkerne efter arket: højtalere, stativer, lysbar og X-stativ ────────
d = open(DJ).read()
def dj(pid, navn_da, navn_en, pris, hp):
    global d
    a, b = obj_span(d, pid); o = json.loads(d[a:b])
    o["name_da"], o["name_en"], o["price"] = navn_da, navn_en, pris
    dele = [("dj_pult", None), hp, ("stativer", "Højtalerstativer", "Speaker stands", 95), LYSBAR, ("x_stativ", "X-stativ", "X-stand", 95)]
    pult = next(p for p in o["bundle"]["parts"] if p["productId"] == "dj_pult")
    o["bundle"]["parts"] = [pult] + [{"productId": x[0], "price": x[3], "label_da": x[1], "label_en": x[2]} for x in dele[1:]]
    o["bundle"]["discount"] = sum(p["price"] for p in o["bundle"]["parts"]) - pris
    hoved = [c for c in o["contents"] if "hovedtelefoner" in c.lower() or "DJ-pult" in c]
    o["contents"] = hoved + [hp[1], "Højtalerstativer", "Lysbar", "X-stativ"]
    d = d[:a] + json.dumps(o, ensure_ascii=False, indent=2).replace("\n", "\n  ") + d[b:]
dj("dj_pakke_lille", "DJ Pakke 0-30", "DJ package 0-30", 2795, LILLE)
dj("dj_pakke_mellem", "DJ Pakke 30-50", "DJ package 30-50", 2995, MELLEM)
open(DJ, "w").write(d)
print("trin 3 skrevet")
