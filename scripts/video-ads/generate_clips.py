#!/usr/bin/env python3
"""
Generér scene-stills og bevægelsesklip til videoannoncerne via Runway-API'en.

To trin per anledning, beskrevet i ads/video-ads.json:

  images  gen4_image laver scenen. Produktfotoet sendes med som reference, så
          det er vores eget udstyr der står i billedet.
  videos  gen4_turbo animerer scenen i 6 sekunder (image-to-video).

Begge trin springer over filer der allerede findes. Det er bevidst: hvert kald
koster credits, og en genkørsel efter en fejl på anledning nr. 5 skal ikke
betale for de fire første igen. Slet filen for at gengenerere den.

Kræver RUNWAYML_API_SECRET i miljøet (eller .dev.vars). Nøglen hentes på
dev.runwayml.com → API Keys.

  python3 scripts/video-ads/generate_clips.py                      # estimat, intet forbrug
  python3 scripts/video-ads/generate_clips.py --steps images --apply
  python3 scripts/video-ads/generate_clips.py --apply --only karaoke
"""

from __future__ import annotations

import argparse
import base64
import json
import logging
import mimetypes
import os
import subprocess
import sys
import urllib.request

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))
CONFIG = os.path.join(PROJECT_DIR, "ads", "video-ads.json")
STILLS_DIR = os.path.join(PROJECT_DIR, "ads", "assets", "video", "stills")
CLIPS_DIR = os.path.join(PROJECT_DIR, "ads", "assets", "video", "clips")

# Runways prisliste, august 2026. Bruges kun til estimatet vi printer —
# faktureringen sker hos Runway, og et estimat der er en smule forkert er bedre
# end ingen advarsel om hvad en kørsel koster.
CREDITS_PER_SECOND = 12
CREDITS_PER_IMAGE = 8
USD_PER_CREDIT = 0.01

logger = logging.getLogger("generate_clips")


def load_api_key() -> str | None:
    """Miljøet først, ellers .dev.vars — samme sted som resten af projektets nøgler."""
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


def to_jpeg_data_uri(path: str, max_px: int = 1280) -> str:
    """WebP → JPEG som data-URI.

    Runway tager imod data-URI'er op til 5 MB base64, hvilket er ~3,3 MB binært.
    Vi konverterer i stedet for at linke til lejhojtaler.dk, så scripts kan køre
    mod uploadede billeder der endnu ikke er deployet.
    """
    out = subprocess.run(
        [
            "ffmpeg", "-v", "error", "-i", path,
            "-vf", f"scale='min({max_px},iw)':-2",
            "-q:v", "3", "-f", "image2", "-c:v", "mjpeg", "-",
        ],
        capture_output=True,
        check=True,
    ).stdout
    if len(base64.b64encode(out)) > 5_000_000:
        raise SystemExit(f"{path}: for stort til en data-URI selv efter nedskalering")
    return "data:image/jpeg;base64," + base64.b64encode(out).decode("ascii")


def download(url: str, dest: str) -> None:
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    tmp = dest + ".part"
    with urllib.request.urlopen(url) as resp, open(tmp, "wb") as fh:
        fh.write(resp.read())
    os.replace(tmp, dest)  # aldrig en halv fil på den endelige sti


def make_still(client, occ: dict, spec: dict, dest: str) -> None:
    from runwayml import TaskFailedError

    ref = os.path.join(PROJECT_DIR, occ["product_image"])
    if not os.path.exists(ref):
        raise SystemExit(f"{occ['id']}: mangler produktfoto {ref}")

    logger.info("%s: genererer scene …", occ["id"])
    try:
        task = client.text_to_image.create(
            model=spec["model_image"],
            prompt_text=occ["scene_prompt"],
            ratio=spec.get("still_ratio", "1920:1080"),
            reference_images=[{"uri": to_jpeg_data_uri(ref), "tag": "produkt"}],
        ).wait_for_task_output()
    except TaskFailedError as e:
        raise SystemExit(f"{occ['id']}: scenen blev afvist af Runway — {e.task_details}")

    download(task.output[0], dest)
    logger.info("%s: scene gemt i %s", occ["id"], os.path.relpath(dest, PROJECT_DIR))


def make_clip(client, occ: dict, spec: dict, still: str, dest: str) -> None:
    from runwayml import TaskFailedError

    if not os.path.exists(still):
        raise SystemExit(f"{occ['id']}: mangler scene-still — kør --steps images først")

    seconds = int(spec["scene_seconds"])
    logger.info("%s: animerer %d sek …", occ["id"], seconds)
    try:
        task = client.image_to_video.create(
            model=spec["model_video"],
            prompt_image=to_jpeg_data_uri(still, max_px=1920),
            prompt_text=occ["motion_prompt"],
            ratio=spec["scene_ratio"],
            duration=seconds,
        ).wait_for_task_output()
    except TaskFailedError as e:
        raise SystemExit(f"{occ['id']}: klippet blev afvist af Runway — {e.task_details}")

    download(task.output[0], dest)
    logger.info("%s: klip gemt i %s", occ["id"], os.path.relpath(dest, PROJECT_DIR))


def plan(occasions: list[dict], spec: dict, steps: set[str]) -> tuple[list[tuple], int]:
    """Hvad mangler, og hvad koster det. Eksisterende filer koster ingenting."""
    todo, credits = [], 0
    for occ in occasions:
        still = os.path.join(STILLS_DIR, f"{occ['id']}.jpg")
        clip = os.path.join(CLIPS_DIR, f"{occ['id']}.mp4")

        if "images" in steps and not os.path.exists(still):
            todo.append(("image", occ, still))
            credits += CREDITS_PER_IMAGE
        if "videos" in steps and not os.path.exists(clip):
            todo.append(("video", occ, clip))
            credits += CREDITS_PER_SECOND * int(spec["scene_seconds"])
    return todo, credits


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    ap = argparse.ArgumentParser(description="Generér videoannonce-klip via Runway.")
    ap.add_argument("--config", default=CONFIG)
    ap.add_argument("--steps", default="images,videos", help="images, videos eller begge")
    ap.add_argument("--only", action="append", default=[], help="Kun disse anledninger (id).")
    ap.add_argument("--apply", action="store_true", help="Kald Runway. Koster credits.")
    args = ap.parse_args()

    with open(args.config, encoding="utf-8") as fh:
        cfg = json.load(fh)
    spec = cfg["spec"]

    steps = {s.strip() for s in args.steps.split(",") if s.strip()}
    if not steps <= {"images", "videos"}:
        logger.error("--steps kan kun være images og/eller videos")
        return 1

    occasions = cfg["occasions"]
    if args.only:
        occasions = [o for o in occasions if o["id"] in args.only]
        missing = set(args.only) - {o["id"] for o in occasions}
        if missing:
            logger.error("Ukendte anledninger: %s", ", ".join(sorted(missing)))
            return 1

    todo, credits = plan(occasions, spec, steps)

    if not todo:
        print("Alt findes allerede — intet at generere.")
        return 0

    print(f"\n{len(todo)} kald mangler:\n")
    for kind, occ, dest in todo:
        print(f"  {kind:5s}  {occ['id']:14s} → {os.path.relpath(dest, PROJECT_DIR)}")
    print(f"\nEstimat: {credits} credits ≈ ${credits * USD_PER_CREDIT:.2f}")

    if not args.apply:
        print("\nTørkørsel — der er ikke kaldt til Runway. Tilføj --apply for at generere.")
        return 0

    key = load_api_key()
    if not key:
        logger.error(
            "Mangler RUNWAYML_API_SECRET. Hent nøglen på dev.runwayml.com → API Keys "
            "og læg den i .dev.vars som RUNWAYML_API_SECRET=…"
        )
        return 1
    os.environ["RUNWAYML_API_SECRET"] = key

    try:
        from runwayml import RunwayML
    except ImportError:
        logger.error("Mangler SDK'et. Kør: pip3 install runwayml")
        return 1

    client = RunwayML()
    for kind, occ, dest in todo:
        if kind == "image":
            make_still(client, occ, spec, dest)
        else:
            make_clip(client, occ, spec, os.path.join(STILLS_DIR, f"{occ['id']}.jpg"), dest)

    print(f"\nFærdig. Byg videoerne med:\n  python3 scripts/video-ads/build_videos.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
