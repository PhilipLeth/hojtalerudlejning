#!/usr/bin/env python3
"""
Produktfotos i husstilen, genereret med Runway.

Stilen står i docs/_internal/produktbilleder-styleguide.md: hvid sømløs
baggrund (#FFFFFF), blødt studielys fra øverste venstre, let 3/4-vinkel,
kvadratisk. Prompten herunder er styleguidens skabelon.

To ting gør resultatet brugbart frem for "et gult billede":

  reference   Et eksisterende produktfoto KAN sendes med som reference_images
              for at ramme den præcise gule. Men referencen styrer også formen:
              med product-rog som reference kom den lille mixer ud som en
              røgmaskine med knapper på — inklusive "VF1300 EP" trykt på siden.
              Derfor er reference som standard SLÅET FRA, og den gule beskrives
              i teksten i stedet. Slå den til med --ref, hvis farven skrider.

  no branding Vi beder eksplicit om udstyr UDEN mærkelogoer. Et opdigtet
              Yamaha-logo på et produkt kunden skal låne er en påstand om
              en bestemt maskine, vi ikke kan indfri.

Billedet gemmes som PNG i public/images/ efter styleguidens navngivning og
skal derefter gennem scripts/optimize-images.py for at blive til WebP.

  python3 scripts/product-images/generate_product_photo.py --list
  python3 scripts/product-images/generate_product_photo.py mixer_lille
  python3 scripts/product-images/generate_product_photo.py --all --apply
"""

from __future__ import annotations

import argparse
import io
import logging
import os
import sys
import urllib.request

PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
IMAGES_DIR = os.path.join(PROJECT_DIR, "public", "images")
STYLE_REF = os.path.join(IMAGES_DIR, "product-rog.webp")
MODEL = "gen4_image"

STIL = (
    "professional studio product photograph, seamless pure white "
    "backdrop (#FFFFFF) filling the whole frame, soft diffused light from the "
    "upper left, gentle shadow under the product, product centred and shot "
    "almost straight on at a slight three-quarter angle from just above eye "
    "level, clean and minimal, matte background, square 1:1 crop. "
    "No text, no writing, no labels, no lettering, no brand logos, no model "
    "names anywhere in the image."
)

MOTIVER = {
    "mixer_lille": {
        "fil": "product-mixer-lille.png",
        "prompt": (
            "A small flat rectangular desktop audio mixer lying flat on the "
            "surface, matte black, low profile like a thin book, four vertical "
            "channel strips of small round knobs on the top panel, a row of short "
            "faders, a few input sockets along the rear edge. No carrying handle, "
            "no case, no wheels, no vents, not a machine. " + STIL
        ),
    },
    "mixer_stor": {
        "fil": "product-mixer-stor.png",
        "prompt": (
            "A compact portable live-sound mixer for a small band, matte black "
            "metal, small enough to carry under one arm, roughly the footprint of "
            "a laptop and only a few centimetres thick, lying flat. Exactly ten "
            "narrow channel strips of small round knobs, ten short faders in a row "
            "along the front edge, one small effects knob on the right. "
            "A single unit. No wooden side panels, no rack ears, no carrying "
            "handle, no case, no second console, not a large studio desk, "
            "not a recording console. " + STIL
        ),
    },
    # Lydmanden er en ydelse, ikke en maskine — så motivet er hans værktøj:
    # mixeren, hovedtelefonerne og mikrofonen, stillet op som ét produktfoto.
    "lydmand": {
        "fil": "product-lydmand.png",
        "prompt": (
            "A compact matte black live-sound mixer lying flat with a row of "
            "small round knobs and short faders, a pair of closed-back black "
            "studio headphones resting on its left corner, and a black handheld "
            "wireless microphone lying diagonally in front of it. The three "
            "objects arranged tightly together as one product group, nothing "
            "else in the frame, no people, no hands, no cables. " + STIL
        ),
    },
    # ── Produktarket 17. sept 2026: nye enkeltprodukter. Generiske motiver uden mærker,
    # samme hvide studiestil. Filnavnet ender på -white, så produktsiden selv oplyser,
    # at billedet er genereret (erGenereretBillede i products.ts).
    "monitor": {"fil": "product-monitor-white.png", "prompt": (
        "A single black active PA loudspeaker standing upright on the floor, moulded plastic cabinet with a "
        "black perforated steel front grille covering a twelve inch woofer and a horn above it, a carrying "
        "handle recess on the side. One speaker only, no stand, no cables. " + STIL)},
    "discokugle_guld": {"fil": "product-discokugle-guld-white.png", "prompt": (
        "Isolated product cut-out: a gold mirror disco ball about forty centimetres across, covered in small "
        "square gold mirror tiles, hanging from a small black motor with a short black cable above it, "
        "nothing else in the picture, no stand, no lamp, no room, no cloth, no curtain, no floor line, only "
        "the ball on a flat seamless pure white background like a webshop cut-out. " + STIL)},
    "scenelys": {"fil": "product-scenelys-white.png", "prompt": (
        "Webshop product cut-out, the object photographed completely alone on a flat seamless pure white background, nothing else in the picture: "
        "a black lighting tripod stand with a horizontal bar on top, and on the bar four small black round LED par lights standing in a straight row, evenly spaced, drawn like o o o o: the first, the second, the third and the fourth, all identical, no barn doors, no other lights. Lights switched off. " + STIL)},
    "foelgespot": {"fil": "product-foelgespot-white.png", "prompt": (
        "A black LED follow spot stage light, a long cylindrical lamp body with a large front lens and a "
        "rear handle, mounted on a yoke on top of a black tripod stand, pointing slightly to the right. " + STIL)},
    "uv_lampe": {"fil": "product-uv-lampe-white.png", "prompt": (
        "Isolated product cut-out on a flat seamless pure white background like a webshop photo, nothing else in the picture, no room, no cloth, no curtain, no floor line, no other equipment: "
        "a flat thin rectangular black LED wash light the size of a laptop resting on a simple U-shaped bracket, its flat front holding nine round lenses in a three by three grid with a faint violet tint. Not a moving head. " + STIL)},
    "laser": {"fil": "product-laser-white.png", "prompt": (
        "A small black rectangular show laser projector, metal housing with cooling fins on the sides, a "
        "small round glass aperture on the front panel, a U-shaped mounting bracket, sitting on the floor. "
        "No visible beams. " + STIL)},
    "snemaskine": {"fil": "product-snemaskine-white.png", "prompt": (
        "A compact black snow machine for events, a rectangular black metal box with a round nozzle outlet "
        "covered by a fabric sock on the front, a translucent fluid tank on top at the rear, a U-shaped "
        "mounting bracket. No snow in the air. " + STIL)},
    "saebeboblemaskine": {"fil": "product-saebeboblemaskine-white.png", "prompt": (
        "A black professional bubble machine, a rectangular black metal housing with a large round opening "
        "on the front showing a rotating wheel of plastic bubble wands and a fan behind it, a carrying "
        "handle on top. No bubbles in the air. " + STIL)},
    "stroboskop": {"fil": "product-stroboskop-white.png", "prompt": (
        "A black strobe light, a wide shallow rectangular housing with a polished reflector and one long "
        "horizontal xenon tube behind clear glass, a U-shaped mounting bracket, sitting on the floor, and "
        "next to it a small black remote controller box with two knobs. Lamp switched off. " + STIL)},
    "mikrofonstativ": {"fil": "product-mikrofonstativ-white.png", "prompt": (
        "Webshop product cut-out, the object photographed completely alone on a flat seamless pure white background, nothing else in the picture: "
        "an EMPTY black microphone boom stand, sold without a microphone. Folding tripod base, telescopic pole, angled boom arm with a small black counterweight at its short end and a small empty plastic clip at its long end. There is NO microphone, NO windscreen, NO cable anywhere in the image. " + STIL)},
    "lysstativ": {"fil": "product-lysstativ-white.png", "prompt": (
        "Webshop product cut-out, the object photographed completely alone on a flat seamless pure white background, nothing else in the picture: "
        "an EMPTY black lighting tripod stand, sold without any lamp. A wide three-leg base, a telescopic pole, and on top a short horizontal T-bar with two bare bolts. There is NO light, NO lamp, NO fixture mounted; the T-bar is bare. " + STIL)},
    "x_stativ": {"fil": "product-x-stativ-white.png", "prompt": (
        "Webshop product cut-out, the object photographed completely alone on a flat seamless pure white background, nothing else in the picture: "
        "an EMPTY black X-frame folding keyboard stand seen from the front: two steel tube frames crossed like the letter X, two short padded arms on top, rubber feet. Nothing is placed on it, no keyboard, no bench cushion, no tabletop, no pedal, no cable. " + STIL)},
    "dj_stativ": {"fil": "product-dj-stativ-white.png", "prompt": (
        "A black X-frame keyboard stand used as a DJ table, its front and sides covered by a tight matte "
        "black stretch fabric cover that hides the legs, forming a clean black trapezoid front. Nothing "
        "placed on top. " + STIL)},
    "vaeske": {"fil": "product-vaeske-5l-white.png", "prompt": (
        "A five litre translucent white plastic jerrycan canister with a moulded handle and a black screw "
        "cap, filled almost to the top with a completely clear, colourless liquid, standing upright on a "
        "flat seamless pure white background. The canister surface is completely blank and smooth: no "
        "printing, no embossed words, no label, no sticker, no numbers. " + STIL)},
}

logger = logging.getLogger("produktfoto")


def load_api_key() -> str | None:
    """Samme rækkefølge som scripts/video-ads: miljøet først, så .dev.vars."""
    key = os.environ.get("RUNWAYML_API_SECRET")
    if key:
        return key.strip()
    dev_vars = os.path.join(PROJECT_DIR, ".dev.vars")
    if os.path.exists(dev_vars):
        with open(dev_vars, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line.startswith("RUNWAYML_API_SECRET="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def to_jpeg_data_uri(path: str, max_px: int = 1024) -> str:
    from PIL import Image
    import base64

    im = Image.open(path).convert("RGB")
    im.thumbnail((max_px, max_px), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=88)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def generer(client, navn: str, motiv: dict, dest: str, brug_ref: bool = False) -> None:
    from runwayml import TaskFailedError

    logger.info("%s: genererer …", navn)
    kwargs = {}
    if brug_ref:
        kwargs["reference_images"] = [{"uri": to_jpeg_data_uri(STYLE_REF), "tag": "stil"}]
    try:
        task = client.text_to_image.create(
            model=MODEL,
            prompt_text=motiv["prompt"],
            ratio="1024:1024",
            **kwargs,
        ).wait_for_task_output()
    except TaskFailedError as e:
        raise SystemExit(f"{navn}: afvist af Runway — {e.task_details}")

    tmp = dest + ".part"
    with urllib.request.urlopen(task.output[0]) as resp, open(tmp, "wb") as fh:
        fh.write(resp.read())
    os.replace(tmp, dest)
    logger.info("%s: gemt i %s (%.0f KB)", navn, os.path.relpath(dest, PROJECT_DIR),
                os.path.getsize(dest) / 1024)


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    ap = argparse.ArgumentParser(description="Generér produktfotos i husstilen.")
    ap.add_argument("motiv", nargs="*", help="fx mixer_lille")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--apply", action="store_true", help="uden denne skrives intet")
    ap.add_argument("--ref", action="store_true",
                    help="send product-rog med som stilreference (styrer også formen — se filhovedet)")
    args = ap.parse_args()

    if args.list:
        for k, v in MOTIVER.items():
            print(f"  {k:<14} → public/images/{v['fil']}")
        return 0

    valgte = list(MOTIVER) if args.all else args.motiv
    if not valgte:
        logger.error("Angiv et motiv, eller brug --all. --list viser dem.")
        return 1
    ukendte = [m for m in valgte if m not in MOTIVER]
    if ukendte:
        logger.error("Ukendt motiv: %s", ", ".join(ukendte))
        return 1

    if args.ref and not os.path.exists(STYLE_REF):
        logger.error("Mangler stil-reference %s", STYLE_REF)
        return 1

    if not args.apply:
        print("\nTørkørsel — intet genereret. Tilføj --apply.\n")
        for m in valgte:
            print(f"  {m} → public/images/{MOTIVER[m]['fil']}")
            print(f"     {MOTIVER[m]['prompt'][:110]}…\n")
        return 0

    key = load_api_key()
    if not key:
        logger.error("Ingen RUNWAYML_API_SECRET i miljøet eller .dev.vars.")
        return 1

    from runwayml import RunwayML

    client = RunwayML(api_key=key)
    for m in valgte:
        generer(client, m, MOTIVER[m], os.path.join(IMAGES_DIR, MOTIVER[m]["fil"]), args.ref)

    print("\nKør derefter: python3 scripts/optimize-images.py --write")
    return 0


if __name__ == "__main__":
    sys.exit(main())
