#!/usr/bin/env python3
"""
Generate public/sitemap.xml from the pages the build actually produced.

The sitemap was maintained by hand and drifted: 55 URLs against 89 built pages.
The 17 missing ones included /lej-hojtaler, /festlys, /festlyd, /av-udstyr,
/lydudstyr and /erhverv — the landing pages the Google Ads campaigns point at,
and pages prd.json's seo.sitemap_paths already said should be listed. A file
that has to be edited every time a page is added will drift again, so it is
derived instead.

Run after `npm run build`, since it reads out/.

  python3 scripts/generate-sitemap.py            # report
  python3 scripts/generate-sitemap.py --write
"""

from __future__ import annotations

import argparse
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
OUT_DIR = os.path.join(PROJECT_DIR, "out")
SITEMAP = os.path.join(PROJECT_DIR, "public", "sitemap.xml")

BASE = "https://lejhojtaler.dk"

# Real pages that must never be listed. Admin is a private back office, and
# /accounting is bookkeeping — neither belongs in a search index. They are also
# blocked in robots.txt and carry a noindex tag; a sitemap entry would
# contradict both.
EXCLUDE_PREFIXES = ("/admin", "/accounting")

# Not content: a thank-you page has no standalone value, and 404 is not a page.
EXCLUDE_EXACT = {"/404", "/book/tak", "/en/book/tak"}

# Pages whose canonical points somewhere else are dropped automatically. /book
# is the front page with the booking drawer open and declares the front page as
# its canonical; listing it would ask Google to index a URL the page itself
# disclaims. Deriving this from the markup beats maintaining a second list.
CANONICAL_RE = r'rel="canonical"\s+href="([^"]+)"'

# Weekly for pages whose prices and availability move, monthly for the rest.
FREQUENT = {"/", "/lej-hojtaler", "/festlyd", "/festlys", "/lydudstyr", "/av-udstyr", "/book"}

PRIORITY = {"/": "1.0"}
DEFAULT_PRIORITY = "0.8"
LOW_PRIORITY_PREFIXES = ("/blog", "/lejevilkaar", "/privatlivspolitik", "/om")


def discover() -> tuple[list[str], list[tuple[str, str]]]:
    """Returns (paths to list, pages skipped because they disclaim themselves)."""
    import re

    found = {}
    for dirpath, _, names in os.walk(OUT_DIR):
        for n in names:
            if not n.endswith(".html"):
                continue
            full = os.path.join(dirpath, n)
            rel = os.path.relpath(full, OUT_DIR)
            p = "/" + rel[: -len(".html")]
            if p.endswith("/index"):
                p = p[: -len("/index")] or "/"
            found[p] = full

    keep, disclaimed = [], []
    for p in sorted(found):
        if p in EXCLUDE_EXACT:
            continue
        if any(p == pre or p.startswith(pre + "/") for pre in EXCLUDE_PREFIXES):
            continue

        with open(found[p], encoding="utf-8") as f:
            m = re.search(CANONICAL_RE, f.read())
        if m:
            own = BASE + ("/" if p == "/" else p)
            if m.group(1).rstrip("/") != own.rstrip("/"):
                disclaimed.append((p, m.group(1)))
                continue
        keep.append(p)
    return keep, disclaimed


def orphans(paths: list[str]) -> list[str]:
    """Sider ingen anden side linker til.

    /festlyd, /lydudstyr og /kobenhavn stod sådan: med i sitemap.xml, men uden
    ét eneste internt link. En side, der kun kan nås via sitemap'et, crawles
    sjældnere og arver ingen linkværdi — og det var netop Ads-landingssider.
    Rapporteres ved hver bygning, så det ikke skal opdages ved et tilfælde igen.
    """
    import re

    linked: set[str] = set()
    for dirpath, _, names in os.walk(OUT_DIR):
        for n in names:
            if not n.endswith(".html"):
                continue
            with open(os.path.join(dirpath, n), encoding="utf-8") as f:
                for href in re.findall(r'href="(/[^"#?]*)"', f.read()):
                    linked.add(href.rstrip("/") or "/")

    # Forsiden linker sig selv via logoet; /book er forsiden med bookingen åben.
    undtaget = {"/", "/book", "/en/book"}
    return [p for p in paths if p not in undtaget and (p.rstrip("/") or "/") not in linked]


def dead_links() -> dict[str, list[str]]:
    """Interne links der peger på en side, der ikke findes.

    Tre af dem lå på sitet uopdaget: /headset, /mikrofon og /tradlos-mikrofon —
    "Se trådløs mikrofon"-knapper på tre produktsider, der sendte kunden i en
    404. De findes kun ved at sammenholde hvert href med de sider, bygningen
    rent faktisk producerede, så det gøres her.
    """
    import re

    sider, redirects = set(), set()
    for dirpath, _, names in os.walk(OUT_DIR):
        for n in names:
            if n.endswith(".html"):
                rel = os.path.relpath(os.path.join(dirpath, n), OUT_DIR)
                p = "/" + rel[: -len(".html")]
                sider.add((p[: -len("/index")] or "/") if p.endswith("/index") else p)

    red_fil = os.path.join(OUT_DIR, "_redirects")
    if os.path.exists(red_fil):
        for line in open(red_fil, encoding="utf-8"):
            dele = line.split()
            if dele and dele[0].startswith("/"):
                redirects.add(dele[0].rstrip("/"))

    doede: dict[str, list[str]] = {}
    for dirpath, _, names in os.walk(OUT_DIR):
        for n in names:
            if not n.endswith(".html"):
                continue
            rel = os.path.relpath(os.path.join(dirpath, n), OUT_DIR)
            if any(x in rel for x in ("404", "admin", "accounting")):
                continue
            with open(os.path.join(dirpath, n), encoding="utf-8") as f:
                for href in set(re.findall(r'href="(/[^"#?]*)"', f.read())):
                    h = href.rstrip("/") or "/"
                    if h in sider or h in redirects or h.startswith("/_next"):
                        continue
                    if "." in os.path.basename(h):  # filer, ikke sider
                        continue
                    doede.setdefault(h, []).append(rel)
    return doede


def priority(p: str) -> str:
    if p in PRIORITY:
        return PRIORITY[p]
    if any(p.startswith(pre) for pre in LOW_PRIORITY_PREFIXES):
        return "0.5"
    return DEFAULT_PRIORITY


def build_xml(paths: list[str]) -> str:
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for p in paths:
        loc = BASE + ("/" if p == "/" else p)
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        lines.append(f"    <changefreq>{'weekly' if p in FREQUENT else 'monthly'}</changefreq>")
        lines.append(f"    <priority>{priority(p)}</priority>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate sitemap.xml from out/.")
    ap.add_argument("--write", action="store_true")
    args = ap.parse_args()

    if not os.path.isdir(OUT_DIR):
        print("out/ not found — run `npm run build` first.", file=sys.stderr)
        return 1

    paths, disclaimed = discover()
    if not paths:
        print("No pages found in out/.", file=sys.stderr)
        return 1

    old = set()
    if os.path.exists(SITEMAP):
        import re

        old = set(re.findall(rf"<loc>{re.escape(BASE)}(/[^<]*)</loc>", open(SITEMAP).read()))
        old = {o.rstrip("/") or "/" for o in old}

    new = {p.rstrip("/") or "/" for p in paths}
    added, removed = sorted(new - old), sorted(old - new)

    print(f"{len(paths)} sider (var {len(old)})")
    if disclaimed:
        print(f"\nUdeladt — canonical peger et andet sted ({len(disclaimed)}):")
        for p, c in disclaimed:
            print(f"    {p}  →  {c}")
    doede = dead_links()
    if doede:
        print(f"\nADVARSEL — interne links til sider der ikke findes ({len(doede)}):")
        for h, hvor in sorted(doede.items()):
            print(f"    {h}  ← {', '.join(sorted(hvor))}")

    forladte = orphans(paths)
    if forladte:
        print(f"\nADVARSEL — ingen intern link peger på ({len(forladte)}):")
        for p in forladte:
            print("   ", p)

    if added:
        print(f"\nTilføjet ({len(added)}):")
        for p in added:
            print("   ", p)
    if removed:
        print(f"\nFjernet ({len(removed)}):")
        for p in removed:
            print("   ", p)

    if args.write:
        xml = build_xml(paths)
        # public/ is the source of truth, but it is copied into out/ *during*
        # the build — and this runs after it. Writing only public/ would leave
        # the deploy one build behind, so out/ is updated too.
        written = []
        for target in (SITEMAP, os.path.join(OUT_DIR, "sitemap.xml")):
            with open(target, "w", encoding="utf-8") as f:
                f.write(xml)
            written.append(os.path.relpath(target, PROJECT_DIR))
        print("\nSkrevet: " + ", ".join(written))
    else:
        print("\nRapport — intet skrevet. Tilføj --write.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
