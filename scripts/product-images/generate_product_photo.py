#!/usr/bin/env python3
"""
Produktfotos i husstilen, genereret med Runway.

Stilen står i docs/_internal/produktbilleder-styleguide.md: gul sømløs
baggrund (#D4A017), blødt studielys fra øverste venstre, let 3/4-vinkel,
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
    "professional studio product photograph, seamless warm mustard-yellow "
    "backdrop (#D4A017) filling the whole frame, soft diffused light from the "
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
