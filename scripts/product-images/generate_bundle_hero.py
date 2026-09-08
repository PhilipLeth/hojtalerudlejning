#!/usr/bin/env python3
"""
Stilede pakkebilleder: vores eget grej, fotograferet TÆNDT.

Lys sælger ikke på gul studiebaggrund. En LED-lampe med slukket lys er en sort
kasse — det er først, når den står i et mørkt rum og kaster farve på gulvet, at
kunden kan se, hvad han lejer. Derfor er pakkebillederne til lys-pakkerne
stilede studiebilleder på mørk baggrund frem for katalogfotos.

Grejet er VORES: hver del sendes med som referencebillede fra de rigtige
studiefotos, og prompten forbyder modellen at finde på udstyr. Samme regel som
galleriet og videoannoncerne — en udlejningsforretning kan ikke reklamere med
noget, den ikke har.

Billederne lander i en mappe til gennemsyn. De installeres først i
public/images med --install, når nogen har set på dem.

  python3 scripts/product-images/generate_bundle_hero.py                 # plan + pris
  python3 scripts/product-images/generate_bundle_hero.py --apply --only product-pakke-bryllupslys
  python3 scripts/product-images/generate_bundle_hero.py --install --only product-pakke-bryllupslys
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import urllib.request

from PIL import Image

ROD = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BILLEDER = os.path.join(ROD, "public", "images")
RAA = os.path.join(ROD, "gallery", "raw", "pakkefoto")   # gitignoreret
ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions"
API_REVISION = "2026-05-20"
MODEL = "gemini-3-pro-image"
PRIS_USD = 0.134

# Delene i hver pakke, som de hedder i public/images, plus en linje om hvordan
# de står i billedet. Kun VORES grej — listen skal svare til bundle.parts i
# src/lib/products.ts.
PAKKER: dict[str, dict] = {
    "product-pakke-diskolys": {
        "dele": ["product-discokugle.png", "product-lyseffekt.png"],
        "opstilling": (
            "The mirror ball hangs from its stand at the left, slowly turning, with its own spotlight on the "
            "floor throwing sharp dots of light across the backdrop. The LED par light stands to the right, "
            "switched on, washing the floor in deep magenta and blue."
        ),
    },
    "product-pakke-teenagefest": {
        "dele": ["product-discokugle.png", "product-lyseffekt.png", "product-lyskaeder-farvet.png"],
        "opstilling": (
            "The mirror ball on its stand fills the left of the frame with its spotlight scattering dots, the "
            "LED par light stands at the right throwing green and violet across the floor, and the string of "
            "coloured festoon bulbs is draped in a low swag across the foreground, lit warm."
        ),
    },
    "product-pakke-festtelt": {
        "dele": ["product-uplight-4.png", "product-lyskaeder.png", "product-lyskaeder-farvet.png"],
        "opstilling": (
            "TWO separate and clearly distinct festoon strings swag across the upper half of the frame, one "
            "hanging above the other with a clear gap between them: the upper string has only warm white "
            "filament bulbs, the lower string has only coloured bulbs. Neither string mixes bulb types. Below "
            "them the four LED uplights stand in a row on the floor, switched on, washing the backdrop in "
            "amber and soft blue."
        ),
    },
    "product-pakke-bryllupslys": {
        "dele": ["product-uplight-4.png", "product-lowfog.png", "product-lyskaeder.png"],
        "opstilling": (
            "The string of warm white festoon bulbs swags across the top of the frame, glowing. The four LED "
            "uplights stand along the backdrop washing it in a warm amber wash. The low fog machine sits at "
            "the right on the floor, and a thin blanket of low-lying fog rolls forward across the floor and "
            "catches the light."
        ),
    },
    "product-pakke-diskotek": {
        "dele": ["product-lys.png", "product-lyseffekt.png", "product-discokugle.png"],
        "opstilling": (
            "The light bar on its stand dominates the centre, all its heads lit and throwing coloured beams "
            "outward. The mirror ball on its stand is behind at the right, scattering dots, and the single "
            "LED par light sits low at the left, uplighting the floor."
        ),
    },
}

STIL = (
    "A styled studio photograph of exactly the referenced equipment and nothing else, arranged together on a "
    "seamless dark studio background that falls from charcoal grey at the top to black at the edges. "
    "{opstilling} "
    "The fixtures are switched ON and are the only light in the frame: their colour spills across the floor and "
    "glows on the backdrop, and a thin veil of atmospheric haze makes the beams readable in the air. "
    "Shot on a full-frame camera with a fast prime lens from a low three-quarter angle, shallow depth of field, "
    "rich true-to-life colour, no HDR look. Premium rental-catalogue photography — the gear is the subject and "
    "it looks expensive. "
    "Do not invent or substitute equipment: every fixture, machine and cable in the frame must be one of the "
    "referenced products, reproduced faithfully down to housing shape, colour, proportions and its own markings. "
    "Invent nothing else: no made-up brand names, no added logos, no text, no signage, no watermarks, no people, "
    "no laser beams, no confetti. Square framing with the group centred and generous margin around it."
)


def noegle() -> str:
    for linje in open(os.path.join(ROD, ".dev.vars"), encoding="utf-8"):
        if linje.strip().startswith("GEMINI_API_KEY"):
            return linje.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("GEMINI_API_KEY mangler i .dev.vars")


def find_billede(node) -> str | None:
    """Gemini svarer UDEN output_image-genvejen — billedet ligger nede i steps."""
    if isinstance(node, dict) and isinstance(node.get("output_image"), dict):
        if node["output_image"].get("data"):
            return node["output_image"]["data"]
    stak = [node]
    while stak:
        n = stak.pop()
        if not isinstance(n, (dict, list)):
            continue
        vaerdier = n.values() if isinstance(n, dict) else n
        if isinstance(n, dict) and isinstance(n.get("data"), str) and len(n["data"]) > 1000:
            return n["data"]
        for v in vaerdier:
            if isinstance(v, (dict, list)):
                stak.append(v)
    return None


def generer(navn: str, spec: dict, api: str) -> bytes:
    prompt = STIL.format(opstilling=spec["opstilling"])
    krop = [{"type": "text", "text": prompt}]
    for fil in spec["dele"]:
        sti = os.path.join(BILLEDER, fil)
        if not os.path.exists(sti):
            raise SystemExit(f"Mangler reference: {fil}")
        with open(sti, "rb") as f:
            krop.append({"type": "image", "mime_type": "image/png",
                         "data": base64.b64encode(f.read()).decode()})

    data = json.dumps({
        "model": MODEL,
        "input": krop,
        "response_format": {"type": "image", "aspect_ratio": "1:1", "image_size": "2K"},
    }).encode()

    req = urllib.request.Request(ENDPOINT, data=data, headers={
        "x-goog-api-key": api,
        "Content-Type": "application/json",
        "Api-Revision": API_REVISION,
    })
    with urllib.request.urlopen(req, timeout=300) as svar:
        json_svar = json.loads(svar.read())

    b64 = find_billede(json_svar)
    if not b64:
        raise SystemExit(f"Intet billede i svaret: {json.dumps(json_svar)[:400]}")
    return base64.b64decode(b64)


def install(navn: str) -> None:
    kilde = os.path.join(RAA, f"{navn}.png")
    if not os.path.exists(kilde):
        raise SystemExit(f"Ikke genereret endnu: {kilde}")
    im = Image.open(kilde).convert("RGB").resize((1024, 1024), Image.LANCZOS)
    im.save(os.path.join(BILLEDER, f"{navn}.png"))
    im.save(os.path.join(BILLEDER, f"{navn}.webp"), "WEBP", quality=82, method=6)
    im.resize((400, 400), Image.LANCZOS).save(
        os.path.join(BILLEDER, f"{navn}-400.webp"), "WEBP", quality=78, method=6)
    print(f"  {navn}: installeret i public/images")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="kald modellen (koster penge)")
    ap.add_argument("--install", action="store_true", help="flyt et gennemset billede til public/images")
    ap.add_argument("--only", help="kun ét navn")
    flag = ap.parse_args()

    navne = [n for n in PAKKER if not flag.only or n == flag.only]
    if not navne:
        raise SystemExit(f"Kender ikke: {flag.only}")

    if flag.install:
        for n in navne:
            install(n)
        return

    if not flag.apply:
        print(f"{len(navne)} billeder × {PRIS_USD} $ = {len(navne) * PRIS_USD:.2f} $ (kør med --apply)")
        for n in navne:
            print(f"  {n}: {', '.join(PAKKER[n]['dele'])}")
        return

    os.makedirs(RAA, exist_ok=True)
    api = noegle()
    for n in navne:
        raa = generer(n, PAKKER[n], api)
        ud = os.path.join(RAA, f"{n}.png")
        with open(ud, "wb") as f:
            f.write(raa)
        print(f"  {n}: {len(raa) // 1024} KB -> {os.path.relpath(ud, ROD)}")
    print(f"Brugt: {len(navne) * PRIS_USD:.2f} $. Se dem efter, og kør --install på dem, der duer.")


if __name__ == "__main__":
    main()
