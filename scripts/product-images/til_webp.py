#!/usr/bin/env python3
"""Lav WebP (1024 + 400 px) af nye produktfotos i public/images.

  python3 scripts/product-images/til_webp.py product-monitor-white.png …

Samme output som scripts/optimize-images.py giver for produktfotos: en
<navn>.webp i op til 1024 px og en <navn>-400.webp til kort og tilvalgslister.
PNG'en bliver liggende som kilde, som resten af mappen.
"""
import os, sys
from PIL import Image
IMG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "images")
for navn in sys.argv[1:]:
    src = os.path.join(IMG, navn); stem = os.path.splitext(navn)[0]
    im = Image.open(src).convert("RGB")
    for px, suffix in ((1024, ""), (400, "-400")):
        k = im.copy(); k.thumbnail((px, px), Image.LANCZOS)
        ud = os.path.join(IMG, f"{stem}{suffix}.webp"); k.save(ud, "WEBP", quality=82 if px == 1024 else 78, method=6)
        print(f"{os.path.basename(ud)}: {os.path.getsize(ud)//1024} KB")
