"""Fjern Geminis vandmærke (en eller to lyse stjerner nederst til højre) fra
de gule studiebilleder i public/images.

Stjernen er et halvgennemsigtigt hvidt overlay. Vi finder den som det, der er
løftet over den lokale baggrund inden for et vindue, maskerer den og udfylder
hullet med en glat udgave af omgivelserne plus baggrundens egen tekstur fra et
nabofelt, så linned og puds ikke bliver til en glat plet.

Brug:
    python3 scripts/product-images/fjern_stjerne.py --ud <mappe>          # skriv resultater til en mappe (til gennemsyn)
    python3 scripts/product-images/fjern_stjerne.py --install              # skriv <navn>-v2.webp + -400.webp ind i public/images

Hvilke billeder og hvor stjernen sidder står i VINDUER nedenfor — det er
kontrolleret med øjnene, ikke gættet. Et billede uden opslag røres ikke.
"""
from __future__ import annotations
import argparse, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROD = os.path.join(os.path.dirname(__file__), "..", "..", "public", "images")

# (x0, y0, x1, y1)-vinduer, hvor stjernen/stjernerne står. Flere vinduer pr. billede er tilladt.
STD = (850, 850, 1024, 1024)          # den almindelige plads: stor stjerne ~880-927 + lille ~952-975
VINDUER: dict[str, list[tuple[int, int, int, int]]] = {
    "product-discokugle": [STD],
    "product-festival": [STD],
    "product-festival-bas": [STD],
    "product-headset": [STD],
    "product-headset-pro": [(850, 850, 1024, 1024)],   # rombe + stor tynd stjerne oveni
    "product-karaoke": [STD],
    "product-laerred": [STD],
    "product-lowfog": [(880, 620, 960, 705)],           # 1024x767
    "product-lys": [STD],
    "product-lyseffekt": [STD],
    "product-lyskaeder": [STD],
    "product-lyskaeder-farvet": [STD],
    "product-lysshow": [(830, 790, 980, 960)],
    "product-mixer-lille": [(830, 825, 900, 895)],
    "product-pakke-fest-150": [(890, 870, 1000, 990)],
    "product-pakke-fest-250": [(890, 870, 1000, 990)],
    "product-pakke-karaoke": [(685, 870, 740, 915)],
    "product-pakke-karaoke-fest": [(685, 870, 720, 915)],   # stopper før højttalerkanten
    "product-pakke-lydmand-fest": [(870, 660, 930, 715)],
    "product-pakke-lydmand-firma": [(890, 678, 955, 730)],   # starter under højttalerens kant
    "product-pakke-lydmand-stor": [(880, 640, 950, 705)],
    "product-party": [STD],
    "product-projektor-pro": [STD],
    "product-rog": [STD],
    "product-taske": [STD],
    "product-thumpgo": [STD],
    "product-uplight": [STD],
    # product-uplight-4 er Frederiks eget foto (fa0a6f6) — intet vandmærke
}
# Afvigelser fra standardopskriften, pr. billede:
#   fyld="spejl"      hullet fyldes ved at spejle rækkerne fra venstre i stedet
#                     for den glatte udfyldning — bruges hvor stjernen står i en
#                     produktskygge eller lige under et produkt, som en glat
#                     udfyldning ellers ville trække farve fra
#   rand=0            spring skyggeranden over (stjerner uden mørk kant oven i
#                     en skygge, som ellers ville blive taget med)
#   kun_stoerste=True kun det største felt (højttalerens kant lyser også op)
#   median=31         mindre median, når stjernen står i en oplyst plet, som
#                     selv ligger over et 75-px-median
SAER: dict[str, dict] = {
    "product-pakke-karaoke": dict(fyld="spejl", rand=0, kun_stoerste=True),
    "product-pakke-karaoke-fest": dict(fyld="spejl", rand=0, kun_stoerste=True),
    "product-pakke-lydmand-firma": dict(fyld="spejl"),
    "product-pakke-lydmand-fest": dict(median=31),
}

def loeft(a: np.ndarray, vindue, kant=40, size=75) -> np.ndarray:
    """Hvor meget hver pixel i vinduet er løftet over den lokale baggrund.
    Baggrunden er et medianfilter (75 px) — det følger et farveforløb, men
    stjernen er for lille til at trække i det. Min-kanalen, fordi et hvidt
    overlay på gul løfter blå mest."""
    h, w, _ = a.shape
    x0, y0, x1, y1 = vindue
    X0, Y0, X1, Y1 = max(0, x0 - kant), max(0, y0 - kant), min(w, x1 + kant), min(h, y1 + kant)
    lum = a[Y0:Y1, X0:X1].min(axis=2).astype(float)
    D = lum - ndimage.median_filter(lum, size=size, mode="nearest")
    return D[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0]

def maske(a: np.ndarray, vinduer, taerskel=9, mindste=40, udvid=4, rand=10, randtaerskel=3, kun_stoerste=False, median=75) -> np.ndarray:
    """Stjernen: sammenhængende felter løftet > taerskel, mindst `mindste` px og
    nogenlunde runde (lysstriber og glimt er lange og tynde). Den tynde
    stjerne har en mørk skygge om armene, som ligger *under* baggrunden —
    derfor et andet gennemløb med D < -randtaerskel inden for `rand` px af
    et fundet felt (kun den mørke side — den lyse er allerede taget, og
    teksturens egne lyse tråde skal ikke med)."""
    h, w, _ = a.shape
    m = np.zeros((h, w), bool)
    for (x0, y0, x1, y1) in vinduer:
        x1, y1 = min(x1, w), min(y1, h)
        D = loeft(a, (x0, y0, x1, y1), size=median)
        lab, n = ndimage.label(D > taerskel)
        if n == 0:
            continue
        stor = np.zeros(D.shape, bool)
        for k, sl in enumerate(ndimage.find_objects(lab), start=1):
            komp = lab[sl] == k
            if komp.sum() < mindste:                      # teksturens små glimt er under det
                continue
            kh, kw = komp.shape
            if not (0.3 < kh / kw < 3.3):                 # striber og lysstråler
                continue
            stor[sl] |= komp
        if not stor.any():
            continue
        if kun_stoerste:
            lab2, n2 = ndimage.label(stor)
            stoerst = np.argmax(ndimage.sum(stor, lab2, range(1, n2 + 1))) + 1
            stor = lab2 == stoerst
        if rand:
            naer = ndimage.binary_dilation(stor, iterations=rand)
            stor |= naer & (D < -randtaerskel)
        m[y0:y1, x0:x1] |= stor
    if not m.any():
        return m
    return ndimage.binary_dilation(m, iterations=udvid)

def udfyld(a: np.ndarray, m: np.ndarray, sigma=10.0) -> np.ndarray:
    """Normaliseret foldning: glat udfyldning fra de gyldige naboer, plus
    tekstur (højfrekvens) hentet fra et nabofelt. Nabofeltet vælges blandt
    venstre/højre/op/ned som det roligste — ellers ender et stativben eller
    en røgmaskines kant inde i hullet. Er selv det roligste felt tydeligt
    mere uroligt end ringen omkring hullet, udelades teksturen helt."""
    h, w, _ = a.shape
    ok = (~m).astype(float)
    ud = a.astype(float).copy()
    for c in range(3):
        num = ndimage.gaussian_filter(a[..., c] * ok, sigma)
        den = ndimage.gaussian_filter(ok, sigma)
        glat = num / np.maximum(den, 1e-6)
        ud[..., c][m] = glat[m]

    # Tekstur = højfrekvent luminans (kun luminans — ellers følger farvede
    # lyspletter med fra nabofeltet). Kilden er det nabofelt, hvis uro ligner
    # ringen om hullet mest; er selv det for uroligt, udelades teksturen.
    lum = a.astype(float).mean(axis=2)
    hf_lum = lum - ndimage.gaussian_filter(lum, sigma)
    ring = ndimage.binary_dilation(m, iterations=14) & ~ndimage.binary_dilation(m, iterations=6)
    # Ringens uro måles uden dens 10 % voldsomste pixels — en kant af et
    # produkt lige ved siden af stjernen skal ikke gøre en blank baggrund "urolig".
    r = np.abs(hf_lum[ring]) if ring.any() else np.zeros(1)
    r = r[r <= np.percentile(r, 90)]
    ring_energi = max(float((r ** 2).mean()) if r.size else 0.0, 1.0)

    ys, xs = np.where(m)
    bw, bh = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
    bedst = None
    for dy, dx in ((0, bw + 12), (0, -(bw + 12)), (bh + 12, 0), (-(bh + 12), 0)):   # venstre, højre, op, ned
        sy, sx = ys - dy, xs - dx                          # pixel (y, x) får tekstur fra (y - dy, x - dx)
        if sy.min() < 0 or sx.min() < 0 or sy.max() >= h or sx.max() >= w:
            continue
        if m[sy, sx].any():                                # kilden må ikke overlappe hullet
            continue
        energi = max(float((hf_lum[sy, sx] ** 2).mean()), 1.0)
        afstand = abs(np.log(energi / ring_energi))
        if bedst is None or afstand < bedst[0]:
            bedst = (afstand, energi, dy, dx)
    if os.environ.get("STJERNE_DEBUG"):
        print(f"   ring={ring_energi:.1f} kilde={bedst}", file=sys.stderr)
    if bedst is not None and bedst[1] <= 2.5 * ring_energi:
        _, _, dy, dx = bedst
        for c in range(3):
            ud[..., c][ys, xs] += hf_lum[ys - dy, xs - dx]
    # blød kant
    fjer = ndimage.gaussian_filter(m.astype(float), 1.2)
    ud = ud * fjer[..., None] + a.astype(float) * (1 - fjer[..., None])
    return np.clip(ud, 0, 255).astype(np.uint8)

def udfyld_spejl(a: np.ndarray, m: np.ndarray) -> np.ndarray:
    """Hver række i hullet fyldes med pixels spejlet om hullets venstre kant."""
    ud = a.copy()
    for y in np.where(m.any(axis=1))[0]:
        xs = np.where(m[y])[0]
        x0 = xs.min()
        ud[y, xs] = a[y, 2 * x0 - 1 - xs]
    fjer = ndimage.gaussian_filter(m.astype(float), 1.0)
    ud = ud * fjer[..., None] + a.astype(float) * (1 - fjer[..., None])
    return np.clip(ud, 0, 255).astype(np.uint8)

def behandl(navn: str) -> tuple[Image.Image, np.ndarray]:
    im = Image.open(os.path.join(ROD, navn + ".webp")).convert("RGB")
    a = np.asarray(im)
    saer = dict(SAER.get(navn, {}))
    fyld = saer.pop("fyld", "glat")
    m = maske(a, VINDUER[navn], **saer)
    if not m.any():
        return im, m
    ud = udfyld_spejl(a, m) if fyld == "spejl" else udfyld(a, m)
    return Image.fromarray(ud), m

def gem(im: Image.Image, sti: str):
    im.save(sti, "WEBP", quality=88, method=6)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--ud", help="skriv resultater hertil (gennemsyn)")
    p.add_argument("--install", action="store_true", help="skriv <navn>-v2.webp og -v2-400.webp i public/images")
    p.add_argument("--kun", nargs="*", help="kun disse navne")
    args = p.parse_args()
    navne = args.kun or sorted(VINDUER)
    for navn in navne:
        im, m = behandl(navn)
        antal = int(m.sum())
        if args.ud:
            os.makedirs(args.ud, exist_ok=True)
            gem(im, os.path.join(args.ud, navn + ".webp"))
            Image.fromarray((m * 255).astype(np.uint8)).save(os.path.join(args.ud, navn + "-maske.png"))
        if args.install:
            if antal == 0:
                print(f"{navn}: ingen stjerne fundet — springer over", file=sys.stderr)
                continue
            gem(im, os.path.join(ROD, navn + "-v2.webp"))
            lille = im.copy(); lille.thumbnail((400, 400), Image.LANCZOS)
            gem(lille, os.path.join(ROD, navn + "-v2-400.webp"))
        print(f"{navn}: {antal} px maskeret")

if __name__ == "__main__":
    main()
