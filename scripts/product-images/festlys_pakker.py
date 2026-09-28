#!/usr/bin/env python3
"""
Festlys-pakkernes billeder, sat sammen af de ægte studiefotos på hvid bund.

Philip 28. sept 2026: "Festlys 50-100 skal vise hvad den reelt er... 2 barer."
Begge pakker viste ét lysbarfoto. 50-100 er 2× lysbar + røgmaskine, 0-50 er
1× lysbar + røgmaskine, og billedet skal sige det samme som indholdslisten.

Delene lægges ind med multiply: på en hvid bund er det eksakt, der klippes
ikke ud, og skyggen under grejet følger med. Delene må ikke overlappe.

  python3 scripts/product-images/festlys_pakker.py
"""
import os
from PIL import Image, ImageChops

IMG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "images")
K = 1024


def indhold(navn):
    """Beskær fotoet til grejet (alt der ikke er næsten-hvidt) plus lidt luft."""
    im = Image.open(os.path.join(IMG, navn)).convert("RGB")
    maske = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255))).convert("L").point(lambda v: 255 if v > 14 else 0)
    x0, y0, x1, y1 = maske.getbbox()
    m = 12
    ud = im.crop((max(0, x0 - m), max(0, y0 - m), min(im.width, x1 + m), min(im.height, y1 + m)))
    # Bunden er 254, ikke 255: uden at løfte den står hvert udsnit som en svag
    # grå firkant, når det ganges ind på det rene hvide lærred.
    return ud.point(lambda v: min(255, round(v * 255 / 248)))


def læg(lærred, del_, bredde, cx, bund):
    """Skalér delen til en bredde og gang den ind med bunden på `bund`."""
    h = round(del_.height * bredde / del_.width)
    d = del_.resize((bredde, h), Image.LANCZOS)
    x, y = round(cx - bredde / 2), bund - h
    felt = lærred.crop((x, y, x + bredde, y + h))
    lærred.paste(ImageChops.multiply(felt, d), (x, y))


bar, rog = indhold("product-lys-v4-white.webp"), indhold("product-rog-v2-white.webp")

PAKKER = {
    # 2× lysbar øverst side om side, røgmaskinen foran i midten
    "product-pakke-festlys-100-white": [(bar, 450, 262, 480), (bar, 450, 762, 480), (rog, 340, 512, 960)],
    # 1× lysbar til venstre, røgmaskinen til højre
    "product-pakke-festlys-50-white": [(bar, 500, 290, 740), (rog, 380, 790, 780)],
}

for stem, dele in PAKKER.items():
    c = Image.new("RGB", (K, K), (255, 255, 255))
    for d, b, cx, bund in dele:
        læg(c, d, b, cx, bund)
    for px, suf, q in ((1024, "", 82), (400, "-400", 78)):
        u = c.copy(); u.thumbnail((px, px), Image.LANCZOS)
        u.save(os.path.join(IMG, f"{stem}{suf}.webp"), "WEBP", quality=q, method=6)
    print(f"{stem}.webp")
