#!/usr/bin/env python3
"""
Generate public/llms.txt from the pages the build actually produced.

llms.txt is the plain-text index answer engines (ChatGPT-søgning, Perplexity,
Claude) look for when they need to know what a site is and what it sells,
without parsing 80 pages of markup. Sitemap.xml gives them URLs; llms.txt gives
them URLs *with meaning*, and — for a rental business — the prices.

Everything here is derived, nothing is typed by hand:

  * firmaoplysninger, telefon, adresse og åbningstider kommer fra
    LocalBusiness-markup'en på forsiden, som selv bygges af site_settings
  * priserne kommer fra Product-markup'en på hver produktside
  * inddelingen kommer fra hvilken markup siden bærer — en side med Product er
    et produkt, en side med FAQPage er en guide, /blog er blog

En håndholdt liste ville drive fra sitet præcis som sitemap.xml gjorde, da den
blev vedligeholdt i hånden (55 URL'er mod 89 byggede sider).

Kør efter `npm run build`, da den læser out/.

  python3 scripts/generate-llms-txt.py            # rapport
  python3 scripts/generate-llms-txt.py --write
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
OUT_DIR = os.path.join(PROJECT_DIR, "out")
TARGET = os.path.join(PROJECT_DIR, "public", "llms.txt")

BASE = "https://lejhojtaler.dk"

# Bagkontor og kvitteringssider — samme udeladelser som sitemap.xml.
EXCLUDE_PREFIXES = ("/admin", "/accounting")
EXCLUDE_EXACT = {"/404", "/book/tak", "/en/book/tak"}

# Prisen for begge veje står ingen steder i markup'en — kun én vej gør, via
# Product-markup'ens shippingRate. Tallet her skal svare til addon'en
# "levering_begge" i src/lib/products.ts; faq-markup.test.ts fejler, hvis det
# ikke længere findes i kataloget.
DELIVERY_BOTH_WAYS = 795

DAYS_DA = {
    "Monday": "mandag",
    "Tuesday": "tirsdag",
    "Wednesday": "onsdag",
    "Thursday": "torsdag",
    "Friday": "fredag",
    "Saturday": "lørdag",
    "Sunday": "søndag",
}

LD_RE = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.S)
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.S)
DESC_RE = re.compile(r'<meta name="description" content="(.*?)"', re.S)
CANONICAL_RE = re.compile(r'rel="canonical"\s+href="([^"]+)"')


class Page:
    def __init__(self, path: str, markup: str):
        self.path = path
        self.title = self._clean(TITLE_RE.search(markup))
        self.description = self._clean(DESC_RE.search(markup))
        self.canonical = m.group(1) if (m := CANONICAL_RE.search(markup)) else None
        self.ld = self._parse_ld(markup)

    @staticmethod
    def _clean(match) -> str:
        if not match:
            return ""
        return html.unescape(match.group(1)).replace("\n", " ").strip()

    @staticmethod
    def _parse_ld(markup: str) -> list[dict]:
        blocks = []
        for raw in LD_RE.findall(markup):
            try:
                blocks.append(json.loads(raw))
            except json.JSONDecodeError:
                continue
        return blocks

    def of_type(self, wanted: str) -> dict | None:
        for block in self.ld:
            if block.get("@type") == wanted:
                return block
        return None

    @property
    def url(self) -> str:
        return BASE + ("/" if self.path == "/" else self.path)

    @property
    def price(self) -> int | None:
        """Weekendprisen fra Product-markup, hvis siden er en produktside."""
        product = self.of_type("Product")
        if not product:
            return None
        offers = product.get("offers") or {}
        try:
            return int(float(offers.get("price")))
        except (TypeError, ValueError):
            return None

    @property
    def paused(self) -> bool:
        """Er produktet sat på pause?

        Product-markup'en siger OutOfStock på de sider, hvis produkt er
        `hidden` i kataloget (se PAUSEDE_PRODUKTER i src/lib/products.ts).
        Et indeks, der lover en projektor til 495 kr, som ikke kan bookes,
        er værre end intet indeks — så de ryger ud her.
        """
        product = self.of_type("Product")
        if not product:
            return False
        offers = product.get("offers") or {}
        return str(offers.get("availability", "")).endswith("OutOfStock")

    @property
    def short_title(self) -> str:
        """"Lej Soundboks 4 København | Fra 595 kr | Lejhøjtaler.dk" → "Lej Soundboks 4 København"."""
        return self.title.split("|")[0].strip() or self.path


def discover() -> list[Page]:
    pages: list[Page] = []
    for dirpath, _, names in os.walk(OUT_DIR):
        for name in names:
            if not name.endswith(".html"):
                continue
            rel = os.path.relpath(os.path.join(dirpath, name), OUT_DIR)
            path = "/" + rel[: -len(".html")]
            if path.endswith("/index"):
                path = path[: -len("/index")] or "/"

            if path in EXCLUDE_EXACT:
                continue
            if any(path == p or path.startswith(p + "/") for p in EXCLUDE_PREFIXES):
                continue

            with open(os.path.join(dirpath, name), encoding="utf-8") as f:
                page = Page(path, f.read())

            # Sider hvis canonical peger et andet sted (fx /book → forsiden) hører
            # ikke hjemme i et indeks; de er den samme side under et andet navn.
            if page.canonical and page.canonical.rstrip("/") != page.url.rstrip("/"):
                continue
            if page.paused:
                continue
            pages.append(page)
    return sorted(pages, key=lambda p: p.path)


def one_way_price(pages: list[Page]) -> int | None:
    """Leveringsprisen som den står i Product-markup'ens shippingRate."""
    for page in pages:
        product = page.of_type("Product")
        rate = ((product or {}).get("offers") or {}).get("shippingDetails", {}).get("shippingRate", {})
        try:
            return int(float(rate.get("value")))
        except (TypeError, ValueError, AttributeError):
            continue
    return None


def format_phone(e164: str | None) -> str:
    """"+4531132852" → "31 13 28 52 (+45 31 13 28 52)" — læsbart for både folk og maskiner."""
    if not e164:
        return "—"
    digits = re.sub(r"\D", "", e164)
    national = digits[2:] if digits.startswith("45") and len(digits) == 10 else digits
    grouped = " ".join(national[i : i + 2] for i in range(0, len(national), 2))
    return f"{grouped} (+45 {grouped})" if national != digits else grouped


def facts(pages: list[Page]) -> list[str]:
    """Firmaoplysninger fra forsidens LocalBusiness-markup."""
    front = next((p for p in pages if p.path == "/"), None)
    biz = front.of_type("LocalBusiness") if front else None
    if not biz:
        return []

    address = biz.get("address") or {}
    one_way = one_way_price(pages)
    koersel = (
        f"Levering + opsætning {one_way} kr, levering og afhentning begge veje {DELIVERY_BOTH_WAYS} kr."
        if one_way
        else "Levering og opsætning kan tilvælges i bookingen."
    )
    lines = [
        f"- **Firma:** {biz.get('legalName') or biz.get('name')}"
        + (f" (CVR {biz['taxID'][2:]})" if str(biz.get("taxID", "")).startswith("DK") else ""),
        f"- **Afhentning:** {address.get('streetAddress')}, {address.get('postalCode')} {address.get('addressLocality')}",
        f"- **Telefon:** {format_phone(biz.get('telephone'))}",
        f"- **Mail:** {biz.get('email')}",
        f"- **Område:** hele København. {koersel}",
        "- **Lejeperiode:** 1-5 dage til samme pris. De fleste henter fredag og afleverer mandag.",
        "- **Betaling:** online med kort eller ved afhentning.",
    ]

    hours = biz.get("openingHoursSpecification") or []
    if hours:
        spans = []
        for h in hours:
            days = h.get("dayOfWeek") or []
            days = [d.rsplit("/", 1)[-1] for d in (days if isinstance(days, list) else [days])]
            days = [DAYS_DA.get(d, d) for d in days]
            spans.append(f"{', '.join(days)} {h.get('opens')}-{h.get('closes')}")
        lines.append("- **Åbningstider:** " + "; ".join(spans))
    return lines


def section_of(page: Page) -> str:
    """Inddelingen følger sidens egen markup — ikke en liste nogen skal vedligeholde."""
    if page.path == "/":
        return "Start her"
    # Præfikset skal være en hel sti-del. Uden skråstregen fangede "/en" også
    # /enkelt-lyseffekt, som endte under "In English".
    if page.path == "/en" or page.path.startswith("/en/"):
        return "In English"
    if page.path == "/blog" or page.path.startswith("/blog/"):
        return "Guides og artikler"
    if page.of_type("Product"):
        return "Produkter og priser"
    if page.of_type("FAQPage"):
        return "Vælg det rigtige udstyr"
    return "Praktisk"


SECTION_ORDER = [
    "Start her",
    "Produkter og priser",
    "Vælg det rigtige udstyr",
    "Guides og artikler",
    "Praktisk",
    "In English",
]


def build(pages: list[Page]) -> str:
    out = [
        "# Lejhøjtaler.dk",
        "",
        "> Udlejning af højtalere, festlys og røg i København. Book online, hent selv "
        "eller få det leveret. Samme pris for 1-5 dages leje, alle kabler inkluderet.",
        "",
    ]

    core = facts(pages)
    if core:
        out += ["## Fakta", "", *core, ""]

    grouped: dict[str, list[Page]] = {}
    for page in pages:
        grouped.setdefault(section_of(page), []).append(page)

    for section in SECTION_ORDER:
        items = grouped.pop(section, [])
        if not items:
            continue
        out += [f"## {section}", ""]
        for page in items:
            price = f" — {page.price} kr/weekend" if page.price else ""
            desc = f": {page.description}" if page.description else ""
            out.append(f"- [{page.short_title}]({page.url}){price}{desc}")
        out.append("")

    # Dukker der en ny slags side op, skal den med — ikke tabes lydløst.
    for section, items in grouped.items():
        out += [f"## {section}", ""]
        for page in items:
            out.append(f"- [{page.short_title}]({page.url})")
        out.append("")

    return "\n".join(out).rstrip() + "\n"


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate llms.txt from out/.")
    ap.add_argument("--write", action="store_true")
    args = ap.parse_args()

    if not os.path.isdir(OUT_DIR):
        print("out/ not found — run `npm run build` first.", file=sys.stderr)
        return 1

    pages = discover()
    if not pages:
        print("No pages found in out/.", file=sys.stderr)
        return 1

    text = build(pages)
    priced = sum(1 for p in pages if p.price)
    print(f"{len(pages)} sider, {priced} med pris")

    if not facts(pages):
        print("ADVARSEL: ingen LocalBusiness-markup på forsiden — fakta-blokken mangler", file=sys.stderr)

    if args.write:
        # Samme grund som i generate-sitemap.py: public/ kopieres ind i out/
        # under bygningen, og den er overstået her. Begge skal skrives, ellers
        # er deployet én bygning bagud.
        written = []
        for target in (TARGET, os.path.join(OUT_DIR, "llms.txt")):
            with open(target, "w", encoding="utf-8") as f:
                f.write(text)
            written.append(os.path.relpath(target, PROJECT_DIR))
        print("Skrevet: " + ", ".join(written))
    else:
        print("\nRapport — intet skrevet. Tilføj --write.\n")
        print(text[:1200])
    return 0


if __name__ == "__main__":
    sys.exit(main())
