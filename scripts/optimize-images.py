#!/usr/bin/env python3
"""
Convert public/images to WebP.

next.config.ts sets output: "export" with images.unoptimized: true, so Next does
nothing to these files — whatever is in public/images is what ships. That left
19 MB of PNG on the site, including a 2.65 MB hero used as a full-bleed CSS
background on every product landing page, and 1024x1024 product shots rendered
into 48-pixel thumbnails in the booking flow.

Two classes of image, handled differently:

  backgrounds  hero and mood shots. Full-bleed, and the hero sits at 55% opacity
               under a dark gradient, so detail is invisible. Capped at 1600px
               wide and compressed hard.
  products     shot on a plain studio backdrop, rendered at most ~600px wide.
               Capped at 1024 (retina for a 600px slot) at higher quality since
               product detail is the point.

The PNGs are left in place as a fallback for anything that cannot read WebP;
nothing references them once src/ is updated.

  python3 scripts/optimize-images.py           # report only
  python3 scripts/optimize-images.py --write
"""

from __future__ import annotations

import argparse
import os
import sys

from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
IMG_DIR = os.path.join(PROJECT_DIR, "public", "images")

# Rendered full-bleed and dimmed — quality here is invisible, weight is not.
BACKGROUNDS = {"hero.png", "mood-party.png", "mood-festival.png"}
BACKGROUND_MAX_WIDTH = 1600
BACKGROUND_QUALITY = 62

PRODUCT_MAX_WIDTH = 1024
PRODUCT_QUALITY = 82

# Grids render product shots into a 160px-tall box, so the 1024px file is about
# six times wider than it is ever painted. A second narrow variant is emitted
# and offered through srcset; the wide one stays for the product detail page.
THUMB_WIDTH = 400
THUMB_QUALITY = 78
THUMB_SUFFIX = "-400"

# The logo is small, flat-coloured and sits in the header on every page.
LOGO = "logo-lejhojtaler.png"
LOGO_MAX_WIDTH = 512
LOGO_QUALITY = 88


def settings_for(name: str) -> tuple[int, int]:
    if name in BACKGROUNDS:
        return BACKGROUND_MAX_WIDTH, BACKGROUND_QUALITY
    if name == LOGO:
        return LOGO_MAX_WIDTH, LOGO_QUALITY
    return PRODUCT_MAX_WIDTH, PRODUCT_QUALITY


def main() -> int:
    ap = argparse.ArgumentParser(description="Convert public/images to WebP.")
    ap.add_argument("--write", action="store_true", help="Write the .webp files.")
    args = ap.parse_args()

    names = sorted(n for n in os.listdir(IMG_DIR) if n.lower().endswith(".png"))
    if not names:
        print("No PNGs found.", file=sys.stderr)
        return 1

    total_before = total_after = 0
    rows = []

    for name in names:
        src_path = os.path.join(IMG_DIR, name)
        before = os.path.getsize(src_path)

        max_w, quality = settings_for(name)
        # Pillow sniffs the real format, which matters: logo-lejhojtaler.png is
        # actually a JPEG.
        im = Image.open(src_path)
        im = im.convert("RGB") if im.mode in ("P", "RGBA", "LA") else im.convert("RGB")
        if im.width > max_w:
            height = round(im.height * max_w / im.width)
            im = im.resize((max_w, height), Image.LANCZOS)

        stem = os.path.splitext(src_path)[0]
        out_path = stem + ".webp"
        if args.write:
            im.save(out_path, "WEBP", quality=quality, method=6)
            after = os.path.getsize(out_path)
        else:
            import io

            buf = io.BytesIO()
            im.save(buf, "WEBP", quality=quality, method=6)
            after = buf.tell()

        # Backgrounds are painted full-bleed and the logo is already small;
        # only the product shots land in grids.
        if name not in BACKGROUNDS and name != LOGO and im.width > THUMB_WIDTH:
            thumb = im.resize(
                (THUMB_WIDTH, round(im.height * THUMB_WIDTH / im.width)), Image.LANCZOS
            )
            if args.write:
                thumb.save(stem + THUMB_SUFFIX + ".webp", "WEBP",
                           quality=THUMB_QUALITY, method=6)

        total_before += before
        total_after += after
        rows.append((name, before, after, im.size))

    rows.sort(key=lambda r: r[1] - r[2], reverse=True)
    print(f"{'file':<34} {'before':>10} {'after':>9} {'saved':>7}  dimensions")
    for name, before, after, size in rows:
        pct = 100 * (before - after) / before if before else 0
        print(f"{name:<34} {before/1024:>9.0f}K {after/1024:>8.0f}K {pct:>6.0f}%  {size[0]}x{size[1]}")

    print(f"\nTotal: {total_before/1e6:.1f} MB → {total_after/1e6:.1f} MB "
          f"({100*(total_before-total_after)/total_before:.0f}% smaller)")
    if not args.write:
        print("\nReport only — pass --write to create the .webp files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
