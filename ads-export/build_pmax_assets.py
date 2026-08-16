#!/usr/bin/env python3
"""
Build Performance Max image assets from the site's product photos.

Google Ads rejects an asset group unless it carries at least one image in each
required aspect ratio. The site only has 1:1 product shots (1024x1024) and a
few 3:2 mood shots, so the landscape and portrait ratios have to be composed
rather than cropped — cropping a 1:1 product photo to 1.91:1 cuts the product
in half.

Output ratios (Google's minimums in brackets):
  landscape  1200x628   1.91:1  [600x314]   required
  square     1200x1200  1:1     [300x300]   required
  portrait   960x1200   4:5     [480x600]   optional, adds Discover inventory
  logo       1200x1200  1:1     [128x128]   required
  logo_wide  1200x300   4:1     [512x128]   optional

Run from anywhere:  python3 ads-export/build_pmax_assets.py
Writes to ads/assets/. Idempotent — safe to re-run.
"""

from __future__ import annotations

import os
import sys

from PIL import Image, ImageFilter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
SRC_DIR = os.path.join(PROJECT_DIR, "public", "images")
OUT_DIR = os.path.join(PROJECT_DIR, "ads", "assets")

# Brand palette — tailwind.config.ts brand.500 on the site's near-black.
BRAND = (255, 214, 0)
INK = (7, 6, 11)

RATIOS = {
    "landscape": (1200, 628),
    "square": (1200, 1200),
    "portrait": (960, 1200),
}

# Every product image that should become an asset, and which asset groups use
# it. The mood shots double as the generic fallbacks.
SOURCES = [
    "product-thumpgo.png",
    "product-party.png",
    "product-soundboks.png",
    "product-festival.png",
    "product-festival-bas.png",
    "product-subwoofer-v2.png",
    "product-stativer.png",
    "product-taske.png",
    "product-pakke-fest-lille.png",
    "product-pakke-fest-stor.png",
    "product-lys.png",
    "product-lyseffekt.png",
    "product-lysshow.png",
    "product-discokugle.png",
    "product-lyskaeder.png",
    "product-lyskaeder-farvet.png",
    "product-uplight.png",
    "product-uplight-4.png",
    "product-rog.png",
    "product-lowfog.png",
    "product-pakke-karaoke.png",
    "product-pakke-karaoke-fest.png",
    "product-karaoke.png",
    "product-mikrofon.png",
    "product-mikrofon-pro.png",
    "product-mikrofon-kabel.png",
    "product-mikrofon-kabel-pro.png",
    "product-headset.png",
    "product-headset-pro.png",
    "product-projektor.png",
    "product-projektor-pro.png",
    "product-skaerm.png",
    "product-skaerm-32.png",
    "product-laerred.png",
    "hero.png",
    "mood-party.png",
    "mood-festival.png",
]

LOGO = "logo-lejhojtaler.png"


def compose(src: Image.Image, size: tuple[int, int], *, fill: float) -> Image.Image:
    """Widen a square product shot to `size` by extending its own backdrop.

    The product photos are already shot on a warm studio background, so pasting
    them onto a separate brand canvas leaves a visible square seam. Instead the
    source is scaled to *cover* the frame and blurred to make the filler, then
    the sharp original is laid back on top. The bleed is the photo's own
    colours, so there is no edge.
    """
    w, h = size
    src = src.convert("RGB")

    # Cover: scale so the image fills both axes, centre-crop the overflow.
    scale = max(w / src.width, h / src.height)
    cover = src.resize((max(1, int(src.width * scale)), max(1, int(src.height * scale))), Image.LANCZOS)
    left = (cover.width - w) // 2
    top = (cover.height - h) // 2
    canvas = cover.crop((left, top, left + w, top + h))
    canvas = canvas.filter(ImageFilter.GaussianBlur(radius=max(12, min(w, h) // 14)))

    # Darken the bleed slightly so the sharp subject stays the focal point.
    canvas = Image.blend(canvas, Image.new("RGB", size, INK), 0.28)

    box = int(min(w, h) * fill)
    art = src.copy()
    art.thumbnail((box, box), Image.LANCZOS)
    canvas.paste(art, ((w - art.width) // 2, (h - art.height) // 2))
    return canvas


def build_logos() -> list[str]:
    """Pad the wide logo into the 1:1 and 4:1 shapes Google asks for.

    The file is named .png but is actually a JPEG — Pillow sniffs the real
    format, so opening it by name works regardless.
    """
    path = os.path.join(SRC_DIR, LOGO)
    logo = Image.open(path).convert("RGB")

    # The file carries a 3px lighter rim (~22,22,22) from an earlier JPEG
    # re-encode; the real backdrop is (14,14,14). Trim the rim, then sample the
    # backdrop from inside it — padding with the rim colour draws a visible
    # rectangle around the mark.
    rim = 3
    logo = logo.crop((rim, rim, logo.width - rim, logo.height - rim))
    pad = logo.getpixel((logo.width // 2, 2))
    written = []

    for name, size, fill in (("logo", (1200, 1200), 0.78), ("logo-wide", (1200, 300), 0.92)):
        w, h = size
        canvas = Image.new("RGB", size, pad)
        art = logo.copy()
        art.thumbnail((int(w * fill), int(h * fill)), Image.LANCZOS)
        canvas.paste(art, ((w - art.width) // 2, (h - art.height) // 2))
        out = os.path.join(OUT_DIR, f"{name}.jpg")
        canvas.save(out, "JPEG", quality=92, optimize=True)
        written.append(out)
    return written


def main() -> int:
    os.makedirs(OUT_DIR, exist_ok=True)

    missing = [s for s in SOURCES if not os.path.isfile(os.path.join(SRC_DIR, s))]
    if missing:
        print("Missing source images: " + ", ".join(missing), file=sys.stderr)
        return 1

    count = 0
    for src_name in SOURCES:
        stem = os.path.splitext(src_name)[0]
        src = Image.open(os.path.join(SRC_DIR, src_name))

        for ratio_name, size in RATIOS.items():
            # A 3:2 mood shot already fills the frame — crop it rather than
            # shrinking a scene onto a glow it does not need.
            is_scene = src.width != src.height
            if is_scene:
                out_img = crop_to(src.convert("RGB"), size)
            else:
                fill = 0.88 if ratio_name == "square" else 0.80
                out_img = compose(src, size, fill=fill)

            # JPEG, not PNG: these are photographs, and Google caps an image
            # asset at 5 MB. The PNG versions ran ~2 MB each and 67 MB total.
            out = os.path.join(OUT_DIR, f"{stem}--{ratio_name}.jpg")
            out_img.save(out, "JPEG", quality=88, optimize=True, progressive=True)
            count += 1

    logos = build_logos()
    print(f"Wrote {count} marketing images + {len(logos)} logos to {OUT_DIR}")
    return 0


def crop_to(src: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Centre-crop to the target ratio, then resize. Used for the mood shots."""
    tw, th = size
    target = tw / th
    w, h = src.size
    if w / h > target:
        new_w = int(h * target)
        src = src.crop(((w - new_w) // 2, 0, (w + new_w) // 2, h))
    else:
        new_h = int(w / target)
        src = src.crop((0, (h - new_h) // 2, w, (h + new_h) // 2))
    return src.resize(size, Image.LANCZOS)


if __name__ == "__main__":
    sys.exit(main())
