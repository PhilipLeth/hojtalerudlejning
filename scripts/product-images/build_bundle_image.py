#!/usr/bin/env python3
"""
Byg et pakkebillede af pakkens EGNE studiefotos.

En pakke skal vise det, kunden får — alle delene sammen, som Festpakke 150 og
250 gør det. Fem lys-pakker gik live 7. sep 2026 med ét løsdelsfoto hver, og
Bryllupslys-pakken viste en sort røgmaskine på gul baggrund. Det er ikke et
bryllup.

Metoden, og hvorfor:

  1. Baggrunden estimeres PR. BILLEDE, ikke som en fælles plade. Første forsøg
     tog medianen af alle produktfotos — men grejet står midt i billedet i dem
     alle, så medianen beholdt et spøgelse af det, og et Bluetooth-logo fra et
     andet foto slog igennem i det færdige billede. I stedet måles kun på de
     gule pixels (høj farvemætning, rød ≥ grøn > blå), og hullet, hvor grejet
     står, fyldes glat ud med den omgivende baggrund (normaliseret foldning).
     Baggrunden ER en glat gradient, så det er eksakt nok til at dividere med.

  2. Hver del lægges ind som forholdet foto / baggrund, ganget på lærredet.
     Multiplikation er hele pointen: der klippes ikke ud, så der opstår ingen
     haloer eller firkantede plateauer — og skyggen under grejet følger med af
     sig selv, fordi en skygge netop ER et forhold under 1.

  3. Kanten af hver udklipsramme normaliseres og fades til 1.0, så en kilde med
     en lidt anden baggrund (low fog-maskinen er 1024×767) ikke efterlader et
     synligt rektangel.

Delene må ikke overlappe: to forhold ganget oven i hinanden giver en dobbelt
mørk plet, der ligner en fejl.

  python3 scripts/product-images/build_bundle_image.py            # rapport
  python3 scripts/product-images/build_bundle_image.py --write
  python3 scripts/product-images/build_bundle_image.py --write --only product-pakke-bryllupslys
"""

from __future__ import annotations

import argparse
import os

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

ROD = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BILLEDER = os.path.join(ROD, "public", "images")
KANT = 1024

# (fil, bredde som andel af lærredet, midte-x, grundlinje-y, tærskel).
# Grundlinjen er delens BUND inkl. skygge, så tingene står på samme gulv.
#
# Tærsklen bestemmer, hvor lidt der skal til, for at en pixel regnes med i
# udklippet. Den er høj for discokuglen og røgmaskinen: kuglens spot kaster
# lysprikker ud over hele baggrunden, og tågen driver langt væk fra maskinen.
# Med den lave standardtærskel kom det med — og rammen skar prikkerne og tågen
# midt over, så delen stod i sin egen synlige kasse.
# Bredden BAGGRUND betyder: brug hele fotoet som lærred i stedet for at klippe
# et udsnit ud. Discokuglens spot kaster lysprikker over hele baggrunden, og
# intet udklip kan skjule dem — rammen skar dem midt over, så kuglen stod i en
# lys kasse. Som lærred bliver prikkerne til stemning i stedet for en fejl.
BAGGRUND = 0.0

PAKKER: dict[str, list[tuple[str, float, float, float, float]]] = {
    "product-pakke-diskolys": [
        ("product-discokugle.png", BAGGRUND, 0.0, 0.0, 0.0),
        ("product-lyseffekt.png", 0.36, 0.82, 0.95, 0.09),
    ],
    "product-pakke-teenagefest": [
        ("product-discokugle.png", BAGGRUND, 0.0, 0.0, 0.0),
        ("product-lyseffekt.png", 0.30, 0.85, 0.72, 0.09),
        ("product-lyskaeder-farvet.png", 0.30, 0.84, 0.99, 0.09),
    ],
    "product-pakke-festtelt": [
        ("product-uplight-4.png", 0.48, 0.29, 0.88, 0.09),
        ("product-lyskaeder.png", 0.33, 0.68, 0.81, 0.09),
        ("product-lyskaeder-farvet.png", 0.33, 0.78, 0.99, 0.09),
    ],
    # Bryllup: det varme lys forrest. Røgmaskinen er en maskine, ikke en
    # stemning, og skal ikke være det første, øjet lander på.
    "product-pakke-bryllupslys": [
        ("product-uplight-4.png", 0.46, 0.28, 0.86, 0.09),
        ("product-lowfog.png", 0.40, 0.73, 0.82, 0.16),
        ("product-lyskaeder.png", 0.33, 0.59, 0.99, 0.09),
    ],
    "product-pakke-diskotek": [
        ("product-discokugle.png", BAGGRUND, 0.0, 0.0, 0.0),
        ("product-lys.png", 0.44, 0.78, 0.74, 0.09),
        ("product-lyseffekt.png", 0.28, 0.83, 0.99, 0.09),
    ],
    # Pakkerne med lydmand (11. sept 2026): højtalerne bagerst, lydmandens
    # mixer forrest — det er teknikeren, der adskiller dem fra festpakkerne.
    "product-pakke-lydmand-fest": [
        ("product-festival.png", 0.50, 0.30, 0.86, 0.09),
        ("product-lys.png", 0.36, 0.74, 0.72, 0.09),
        ("product-lydmand.png", 0.36, 0.76, 0.99, 0.09),
    ],
    "product-pakke-lydmand-firma": [
        ("product-festival.png", 0.50, 0.30, 0.86, 0.09),
        ("product-mikrofon.png", 0.24, 0.80, 0.70, 0.09),
        ("product-lydmand.png", 0.38, 0.75, 0.99, 0.09),
    ],
    "product-pakke-lydmand-stor": [
        ("product-festival.png", 0.50, 0.30, 0.86, 0.09),
        ("product-rog.png", 0.34, 0.76, 0.70, 0.09),
        ("product-lydmand.png", 0.38, 0.75, 0.99, 0.09),
    ],
}


def gul_maske(a: np.ndarray) -> np.ndarray:
    """True hvor pixlen er studiets gule baggrund — ikke grej, ikke skygge."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(2), a.min(2)
    maetning = (mx - mn) / np.maximum(mx, 1)
    return (mx > 110) & (maetning > 0.35) & (r >= g) & (g > b)


def _udfyld(a: np.ndarray, w: np.ndarray, sigma: float) -> np.ndarray:
    den = gaussian_filter(w, sigma, mode="nearest") + 1e-9
    return np.stack([gaussian_filter(a[..., k] * w, sigma, mode="nearest") / den for k in range(3)], 2)


def baggrund(a: np.ndarray, sigma: float = 110) -> np.ndarray:
    """
    Billedets egen baggrund, med grejets hul fyldt glat ud.

    To gennemløb, og det andet er det vigtige. Skyggen under grejet er også
    gul og kommer med i første estimat, som derfor bliver for mørkt lige om
    grejet — forholdet foto/plade blev så STØRRE end 1 i baggrunden omkring
    delen, og hver del stod med en lys ramme om sig i det færdige billede.
    Anden runde måler kun på pixels, der ikke er i skygge.
    """
    gul = gul_maske(a)
    if gul.mean() < 0.15:
        raise SystemExit("For lidt synlig baggrund til at estimere pladen")

    plade = _udfyld(a, gul.astype(np.float64), sigma)
    for _ in range(2):
        lys = ((a + 1.0) / (plade + 1.0)).mean(axis=2) > 0.94  # ikke skygge
        w = (gul & lys).astype(np.float64)
        if w.mean() < 0.08:
            break
        plade = _udfyld(a, w, sigma)
    return plade


def forhold(sti: str) -> np.ndarray:
    a = np.asarray(Image.open(sti).convert("RGB"), dtype=np.float64)
    return np.clip((a + 1.0) / (baggrund(a) + 1.0), 0.0, 4.0)


def beskaer(r: np.ndarray, taerskel: float = 0.09) -> np.ndarray:
    """
    Skær ind om grejet OG dets skygge.

    Rigelig luft, fordi overgangen i rens_kant skal have plads at ske i.
    Low fog-maskinens tåge løber helt ud i billedet; med en smal ramme endte
    den brat, og tågen stod som en grå kasse på den gule baggrund.
    """
    # KUN det mørkere end baggrunden bestemmer rammen: grej og skygge er
    # mørkt, mens discokuglens spot kaster lysprikker ud over hele baggrunden.
    # Med |1 - r| trak prikkerne rammen helt ud til billedkanten, og kuglen
    # stod i en synlig lys kasse.
    maske = (1.0 - r).mean(axis=2) > taerskel
    rk = np.where(maske.any(axis=1))[0]
    kl = np.where(maske.any(axis=0))[0]
    if not len(rk) or not len(kl):
        return r
    luft = 60
    y0, y1 = max(0, rk[0] - luft), min(r.shape[0], rk[-1] + 1 + luft)
    x0, x1 = max(0, kl[0] - luft), min(r.shape[1], kl[-1] + 1 + luft)
    return r[y0:y1, x0:x1]


def rens_kant(r: np.ndarray, fade: int = 55) -> np.ndarray:
    """
    Normalisér og fade rammens kant mod 1.0, så den ikke tegner sig.

    Niveauet måles som 80-percentilen af kantringen, ikke medianen: ringen
    indeholder også skyggen, der løber ud til rammen, og en median trukket ned
    af skygge lysnede HELE udklippet — hver del stod med et synligt lyst
    rektangel om sig. Baggrunden er det lyseste i ringen.
    """
    ring = np.concatenate([r[:6].reshape(-1, 3), r[-6:].reshape(-1, 3),
                           r[:, :6].reshape(-1, 3), r[:, -6:].reshape(-1, 3)])
    r = r / np.maximum(np.percentile(ring, 80, axis=0), 1e-3)
    h, w = r.shape[:2]
    vy = np.clip(np.minimum(np.arange(h), h - 1 - np.arange(h)) / max(fade, 1), 0, 1)
    vx = np.clip(np.minimum(np.arange(w), w - 1 - np.arange(w)) / max(fade, 1), 0, 1)
    return 1.0 + (r - 1.0) * (vy[:, None] * vx[None, :])[:, :, None]


def skaler(r: np.ndarray, bredde: int) -> np.ndarray:
    """Skalér forholdet i flydende tal — en omvej over uint8 kvantiserer det."""
    hoejde = max(1, int(round(r.shape[0] * bredde / r.shape[1])))
    kanaler = [
        np.asarray(
            Image.fromarray(r[..., k].astype(np.float32)).resize((bredde, hoejde), Image.LANCZOS),
            dtype=np.float64,
        )
        for k in range(3)
    ]
    return np.stack(kanaler, axis=2)


def byg(dele: list[tuple[str, float, float, float, float]]) -> Image.Image:
    plader = []
    lag = []
    fuldt: np.ndarray | None = None
    for fil, bredde, midte_x, bund_y, taerskel in dele:
        sti = os.path.join(BILLEDER, fil)
        if not os.path.exists(sti):
            raise SystemExit(f"Mangler kilde: {fil}")
        a = np.asarray(Image.open(sti).convert("RGB"), dtype=np.float64)
        if a.shape[:2] != (KANT, KANT):
            a = np.asarray(
                Image.open(sti).convert("RGB").resize((KANT, KANT), Image.LANCZOS), dtype=np.float64
            ) if bredde == BAGGRUND else a
        bg = baggrund(a)
        if bredde == BAGGRUND:
            fuldt = a
            continue
        if a.shape[:2] == (KANT, KANT):
            plader.append(bg)
        r = skaler(rens_kant(beskaer(np.clip((a + 1.0) / (bg + 1.0), 0.0, 4.0), taerskel)), int(KANT * bredde))
        lag.append((r, midte_x, bund_y))

    if fuldt is not None:
        laerred = fuldt.copy()
    else:
        laerred = (np.mean(plader, axis=0) if plader else np.full((KANT, KANT, 3), 210.0)).copy()

    for r, midte_x, bund_y in lag:
        h, w = r.shape[:2]
        x0, y0 = int(KANT * midte_x - w / 2), int(KANT * bund_y - h)
        sx, sy = max(0, -x0), max(0, -y0)
        x0, y0 = max(0, x0), max(0, y0)
        x1, y1 = min(KANT, x0 + w - sx), min(KANT, y0 + h - sy)
        if x1 <= x0 or y1 <= y0:
            continue
        laerred[y0:y1, x0:x1] *= r[sy:sy + (y1 - y0), sx:sx + (x1 - x0)]

    return Image.fromarray(np.clip(laerred, 0, 255).astype(np.uint8))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="skriv .png + .webp + -400.webp")
    ap.add_argument("--only")
    flag = ap.parse_args()

    for navn, dele in PAKKER.items():
        if flag.only and navn != flag.only:
            continue
        im = byg(dele)
        if not flag.write:
            print(f"  {navn}: {len(dele)} dele — klar (kør med --write)")
            continue
        im.save(os.path.join(BILLEDER, f"{navn}.png"))
        im.save(os.path.join(BILLEDER, f"{navn}.webp"), "WEBP", quality=82, method=6)
        im.resize((400, 400), Image.LANCZOS).save(
            os.path.join(BILLEDER, f"{navn}-400.webp"), "WEBP", quality=78, method=6
        )
        print(f"  {navn}: skrevet")


if __name__ == "__main__":
    main()
