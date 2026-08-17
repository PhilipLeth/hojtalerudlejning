#!/usr/bin/env python3
"""
Byg færdige videoannoncer af scene-klip, produktfotos og dansk tekst.

Hver anledning i ads/video-ads.json bliver til tre filer — 16:9, 1:1 og 9:16 —
fordi Google Ads viser video i alle tre formater og selv vælger ud fra
placeringen. Samme klip, tre udsnit.

Opbygning, 10 sekunder i alt:
  0,0–6,0 s   scenen fra Runway, med overskriften brændt ind nederst
  6,0–10,0 s  produktfotoet, prisen og lejhojtaler.dk

Findes der ikke et Runway-klip endnu, animerer scriptet i stedet produktfotoet
med et langsomt zoom. Så kan hele kæden testes uden at bruge credits, og
videoerne er brugbare — bare mindre levende.

Al tekst sættes med Pillow og lægges på som PNG. Homebrews ffmpeg er bygget
uden freetype, så drawtext findes ikke — og Pillow måler tekst rigtigt i stedet
for at gætte tegnbredder, hvilket dansk tekst med æøå har brug for.

  python3 scripts/video-ads/build_videos.py
  python3 scripts/video-ads/build_videos.py --only karaoke --renders 9x16
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))
CONFIG = os.path.join(PROJECT_DIR, "ads", "video-ads.json")
CLIPS_DIR = os.path.join(PROJECT_DIR, "ads", "assets", "video", "clips")
OUT_DIR = os.path.join(PROJECT_DIR, "ads", "assets", "video", "out")

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"

FPS = 30
logger = logging.getLogger("build_videos")


# ── tekst ────────────────────────────────────────────────────────────────────

def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def text_size(draw: ImageDraw.ImageDraw, text: str, f: ImageFont.FreeTypeFont) -> tuple[int, int]:
    left, top, right, bottom = draw.textbbox((0, 0), text, font=f)
    return right - left, bottom - top


def wrap(draw: ImageDraw.ImageDraw, text: str, f: ImageFont.FreeTypeFont, box: int) -> list[str]:
    """Ombryd på ord, målt på den faktiske font."""
    lines, line = [], ""
    for word in text.split():
        candidate = f"{line} {word}".strip()
        if text_size(draw, candidate, f)[0] <= box or not line:
            line = candidate
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_block(
    draw: ImageDraw.ImageDraw,
    lines: list[str],
    f: ImageFont.FreeTypeFont,
    anchor_x: int,
    top: int,
    fill: tuple,
    line_height: float = 1.18,
    shadow: tuple | None = None,
    align: str = "center",
) -> int:
    """Tegn linjer fra anchor_x. Returnerer y-koordinaten under blokken."""
    step = int(f.size * line_height)
    for i, line in enumerate(lines):
        w, _ = text_size(draw, line, f)
        x = anchor_x - w // 2 if align == "center" else anchor_x
        y = top + i * step
        if shadow:
            off = max(2, f.size // 20)
            draw.text((x + off, y + off), line, font=f, fill=shadow)
        draw.text((x, y), line, font=f, fill=fill)
    return top + len(lines) * step


def hex_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def place_extended(product: Image.Image, w: int, h: int, side: int, x: int, y: int) -> Image.Image:
    """Sæt produktfotoet ind og træk dets egne kantpixels ud til hele fladen.

    Produktfotoene ligger på en gul gradient, men den er svagt radial. Både en
    malet gradient og en sløret kopi af fotoet gav en synlig kant rundt om
    billedet — den ene fordi farven ikke fulgte fotoets forløb, den anden fordi
    den sorte højtaler smittede ud i det gule som grå slør. Strækkes fotoets egen
    yderste pixelrække i stedet, passer sømmen per definition.
    """
    canvas = Image.new("RGB", (w, h))
    prod = product.resize((side, side), Image.LANCZOS)
    canvas.paste(prod, (x, y))

    if x > 0:
        canvas.paste(prod.crop((0, 0, 1, side)).resize((x, side)), (0, y))
    right = w - x - side
    if right > 0:
        canvas.paste(prod.crop((side - 1, 0, side, side)).resize((right, side)), (x + side, y))

    # Øverste og nederste bånd tages efter siderne er fyldt, så de strækker en
    # række der allerede dækker hele bredden.
    if y > 0:
        canvas.paste(canvas.crop((0, y, w, y + 1)).resize((w, y)), (0, 0))
    below = h - y - side
    if below > 0:
        canvas.paste(canvas.crop((0, y + side - 1, w, y + side)).resize((w, below)), (0, y + side))

    return canvas


# ── lag ──────────────────────────────────────────────────────────────────────

def scene_overlay(occ: dict, w: int, h: int, dest: str) -> None:
    """Gennemsigtigt tekstlag til scenen: mørk bund der fader op, og overskriften."""
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    landscape = w > h

    head = font(FONT_BOLD, int(w / 15) if landscape else int(w / 11))
    sub = font(FONT_BOLD, int(head.size * 0.46))
    box = int(w * 0.84)

    head_lines = wrap(draw, occ["headline"], head, box)
    sub_lines = wrap(draw, occ["sub"], sub, box)

    block = int(len(head_lines) * head.size * 1.18 + sub.size * 0.6 + len(sub_lines) * sub.size * 1.25)
    # Nederste tredjedel i liggende format. I stående lidt højere op, hvor bunden
    # dækkes af grænsefladen i Shorts og i feeds.
    baseline = int(h * (0.90 if landscape else 0.80))
    top = baseline - block

    # Gradueret mørkning i stedet for en hård kasse — teksten skal kunne læses på
    # et lyst billede uden at der ligger en firkant midt i scenen. Gradienten er
    # færdig når den rammer overskriften og holder derefter fuld styrke: en
    # gradient der først bliver mørk under teksten mørkner kun tom baggrund.
    scrim_top = max(0, int(top - h * 0.16))
    ramp = max(1, top - scrim_top)
    scrim = Image.new("L", (1, h - scrim_top))
    for y in range(scrim.height):
        scrim.putpixel((0, y), int(215 * min(1.0, y / ramp) ** 0.75))
    layer.paste(
        Image.new("RGBA", (w, h - scrim_top), (0, 0, 0, 255)),
        (0, scrim_top),
        scrim.resize((w, h - scrim_top)),
    )

    after = draw_block(draw, head_lines, head, w // 2, top, (255, 255, 255, 255),
                       shadow=(0, 0, 0, 130))
    draw_block(draw, sub_lines, sub, w // 2, int(after + sub.size * 0.5),
               (255, 255, 255, 214), line_height=1.25, shadow=(0, 0, 0, 110))

    layer.save(dest)


def fallback_still(occ: dict, w: int, h: int, dest: str) -> None:
    """Scene-erstatning når der ikke er et Runway-klip: produktet i fuld figur.

    Rendres i dobbelt opløsning, fordi ffmpeg zoomer ind i den bagefter. Samme
    slørede udvidelse som afslutningen, så produktet ikke bliver beskåret — et
    afklippet højtalertop er værre end en rolig helhed.
    """
    product = Image.open(os.path.join(PROJECT_DIR, occ["product_image"])).convert("RGB")
    W, H = w * 2, h * 2
    side = int(min(W * 0.82, H * 0.82))
    # Lidt over midten: den nederste tredjedel går til overskriften.
    canvas = place_extended(product, W, H, side, (W - side) // 2, int((H - side) * 0.34))
    canvas.save(dest, quality=95)


def endcard_image(occ: dict, brand: dict, w: int, h: int, dest: str) -> None:
    """Afslutningen: produktet på sin egen gule baggrund, pris og domæne.

    Produktfotoene ligger allerede på brandets gule, så baggrunden hentes fra
    fotoet selv i stedet for at male en ny farve, der ville danne en kant.
    Logofilen er gul tekst på sort og ville blive en sort kasse her — derfor står
    domænet som tekst i en mørk pille, præcis som logoet ser ud.
    """
    product = Image.open(os.path.join(PROJECT_DIR, occ["product_image"])).convert("RGB")
    ink = hex_rgb(brand["ink"])
    accent = hex_rgb(brand["accent"])
    landscape = w > h

    gap = int(min(w, h) * 0.040)
    label = brand["domain"]

    if landscape:
        # Delt opsætning: produktet fylder højden til venstre, teksten står i den
        # udstrakte flade til højre. I 16:9 er der ikke plads under et kvadratisk
        # foto til at sætte tre linjer tekst.
        side = int(h * 0.88)
        prod_x, prod_y = int(w * 0.045), (h - side) // 2
        text_x = prod_x + side + int(w * 0.045)
        text_box = w - text_x - int(w * 0.05)
        align, anchor = "left", text_x
        name_px = int(w / 30)
    else:
        side = int(w * 0.94)
        prod_x = (w - side) // 2
        text_box = int(w * 0.86)
        align, anchor = "center", w // 2
        name_px = int(w / 17)
        prod_y = 0  # sættes når teksthøjden er kendt

    # Tekstmålene skal kendes før produktet placeres i stående format, så hele
    # blokken kan centreres. Måles på et tomt billede — Pillow behøver bare en
    # tegneflade, ikke den endelige.
    probe = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    name_f = font(FONT_BOLD, name_px)
    price_f = font(FONT_BLACK, int(name_px * 1.34))
    cta_f = font(FONT_BOLD, int(name_px * 0.92))

    name_lines = wrap(probe, occ["product"], name_f, text_box)
    price_lines = wrap(probe, f"{occ['price_dkk']} kr. pr. dag", price_f, text_box)

    _, cta_h = text_size(probe, label, cta_f)
    pad_x, pad_y = int(cta_f.size * 0.66), int(cta_f.size * 0.42)
    pill_h = cta_h + pad_y * 2
    text_h = (
        int(len(name_lines) * name_f.size * 1.14)
        + int(len(price_lines) * price_f.size * 1.14)
        + gap
        + pill_h
    )

    if landscape:
        y = (h - text_h) // 2
    else:
        # Foto og tekst centreres som én blok. Centreres teksten i stedet for sig
        # selv i resten under fotoet, opstår der et hul mellem de to.
        prod_y = max(int(h * 0.04), (h - (side + gap + text_h)) // 2)
        y = prod_y + side + gap

    canvas = place_extended(product, w, h, side, prod_x, prod_y)
    draw = ImageDraw.Draw(canvas)

    y = draw_block(draw, name_lines, name_f, anchor, y, ink, line_height=1.14, align=align)
    y = draw_block(draw, price_lines, price_f, anchor, y, ink, line_height=1.14, align=align)

    # Domænet i en mørk pille — samme kontrast som logofilen, og det er det
    # eneste der skal huskes når de ti sekunder er gået.
    tw, _ = text_size(draw, label, cta_f)
    pill_w = tw + pad_x * 2
    pill_x = anchor - pill_w // 2 if align == "center" else anchor
    pill_y = y + gap
    draw.rounded_rectangle(
        [pill_x, pill_y, pill_x + pill_w, pill_y + pill_h],
        radius=pill_h // 2, fill=ink,
    )
    draw.text(
        (pill_x + pad_x, pill_y + pad_y - int(cta_f.size * 0.18)),
        label, font=cta_f, fill=accent,
    )

    canvas.save(dest, quality=95)


# ── ffmpeg ───────────────────────────────────────────────────────────────────

def run(cmd: list[str]) -> None:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        tail = "\n".join(proc.stderr.strip().splitlines()[-12:])
        raise SystemExit(f"ffmpeg fejlede:\n{tail}")


SILENCE = ["-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000"]
ENCODE = [
    "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "96k", "-shortest",
]


def build_scene(
    occ: dict, spec: dict, w: int, h: int, overlay: str, fallback: str, dest: str
) -> bool:
    """Scenen. Returnerer True hvis der blev brugt et rigtigt Runway-klip."""
    seconds = spec["scene_seconds"]
    clip = os.path.join(CLIPS_DIR, f"{occ['id']}.mp4")
    has_clip = os.path.exists(clip)

    if has_clip:
        source = ["-i", clip]
        # Fyld formatet med en sløret udgave af klippet selv og læg det skarpe
        # billede ovenpå. I 16:9 dækker det skarpe hele fladen, så sløringen ses
        # kun i 1:1 og 9:16 — ét filter til alle tre formater.
        base = (
            f"[0:v]trim=duration={seconds},setpts=PTS-STARTPTS,fps={FPS},split=2[a][b];"
            f"[a]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},"
            f"gblur=sigma=30,eq=brightness=-0.16[bg];"
            f"[b]scale={w}:{h}:force_original_aspect_ratio=decrease[fg];"
            f"[bg][fg]overlay=(W-w)/2:(H-h)/2[base];"
        )
    else:
        # Erstatningen er allerede rendret i dobbelt opløsning, så zoomet har
        # pixels at tage af og ikke bliver grynet.
        source = ["-loop", "1", "-t", str(seconds), "-i", fallback]
        base = (
            f"[0:v]zoompan=z='min(zoom+0.0007,1.12)':x='iw/2-(iw/zoom/2)':"
            f"y='ih/2-(ih/zoom/2)':d={int(seconds*FPS)}:s={w}x{h}:fps={FPS}[base];"
        )

    graph = base + "[base][1:v]overlay=0:0[v]"
    run(["ffmpeg", "-v", "error", "-y", *source, "-i", overlay, *SILENCE,
         "-filter_complex", graph, "-map", "[v]", "-map", "2:a",
         "-t", str(seconds), *ENCODE, dest])
    return has_clip


def build_endcard(spec: dict, w: int, h: int, still: str, dest: str) -> None:
    seconds = spec["endcard_seconds"]
    # Et ganske langsomt zoom. Et helt stillestående billede i fire sekunder
    # læses som at videoen er gået i stå.
    graph = (
        f"[0:v]scale={w*2}:{h*2},zoompan=z='min(zoom+0.0004,1.05)':"
        f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
        f"d={int(seconds*FPS)}:s={w}x{h}:fps={FPS}[v]"
    )
    run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", str(seconds), "-i", still,
         *SILENCE, "-filter_complex", graph, "-map", "[v]", "-map", "1:a",
         "-t", str(seconds), *ENCODE, dest])


def concat(parts: list[str], dest: str, workdir: str) -> None:
    listing = os.path.join(workdir, "parts.txt")
    with open(listing, "w", encoding="utf-8") as fh:
        for part in parts:
            fh.write(f"file '{part}'\n")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    # Delene er kodet med samme parametre, så stream copy er nok — ingen grund
    # til at komprimere billedet to gange.
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", listing,
         "-c", "copy", "-movflags", "+faststart", dest])


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    ap = argparse.ArgumentParser(description="Byg videoannoncer.")
    ap.add_argument("--config", default=CONFIG)
    ap.add_argument("--only", action="append", default=[], help="Kun disse anledninger (id).")
    ap.add_argument("--renders", action="append", default=[], help="Kun disse formater, fx 9x16.")
    ap.add_argument("--out", default=OUT_DIR)
    args = ap.parse_args()

    if not shutil.which("ffmpeg"):
        logger.error("ffmpeg mangler. Kør: brew install ffmpeg")
        return 1
    for path in (FONT_BOLD, FONT_BLACK):
        if not os.path.exists(path):
            logger.error("Mangler font: %s", path)
            return 1

    with open(args.config, encoding="utf-8") as fh:
        cfg = json.load(fh)
    brand, spec = cfg["brand"], cfg["spec"]

    occasions = cfg["occasions"]
    if args.only:
        occasions = [o for o in occasions if o["id"] in args.only]
    renders = spec["renders"]
    if args.renders:
        renders = [r for r in renders if r["name"] in args.renders]
    if not occasions or not renders:
        logger.error("Ingenting at bygge — tjek --only og --renders.")
        return 1

    built, with_clip = [], set()
    for occ in occasions:
        for render in renders:
            w, h = render["width"], render["height"]
            dest = os.path.join(args.out, f"lejhojtaler-{occ['id']}-{render['name']}.mp4")
            with tempfile.TemporaryDirectory() as workdir:
                overlay = os.path.join(workdir, "overlay.png")
                endcard_png = os.path.join(workdir, "endcard.jpg")
                fallback = os.path.join(workdir, "fallback.jpg")
                scene_overlay(occ, w, h, overlay)
                endcard_image(occ, brand, w, h, endcard_png)
                fallback_still(occ, w, h, fallback)

                scene_mp4 = os.path.join(workdir, "scene.mp4")
                endcard_mp4 = os.path.join(workdir, "endcard.mp4")
                if build_scene(occ, spec, w, h, overlay, fallback, scene_mp4):
                    with_clip.add(occ["id"])
                build_endcard(spec, w, h, endcard_png, endcard_mp4)
                concat([scene_mp4, endcard_mp4], dest, workdir)
            built.append(dest)
            logger.info("%s", os.path.relpath(dest, PROJECT_DIR))

    total = spec["scene_seconds"] + spec["endcard_seconds"]
    print(f"\n{len(built)} filer, {total:.0f} sek. hver, i {os.path.relpath(args.out, PROJECT_DIR)}")
    missing = [o["id"] for o in occasions if o["id"] not in with_clip]
    if missing:
        print(f"Mangler Runway-klip og bruger zoomet produktfoto som scene: {', '.join(missing)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
