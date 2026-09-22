/**
 * Søgning efter produkter på sitet.
 *
 * Sortimentet er vokset til 55 produkter fordelt på 38 produktsider plus et
 * dusin kategorisider. Menuen er bevidst en vej ind og ikke et katalog, så den
 * viser kun et udvalg — og den der ved præcis hvad han leder efter ("røgmaskine",
 * "lærred", "Soundboks") skulle før gætte sig til hvilken kategori den lå under.
 *
 * Indekset bygges af kataloget, ikke af en liste nogen skal vedligeholde:
 * priser og navne følger dermed det admin har rettet i KV, ligesom resten af
 * sitet. Kategorisiderne kommer fra NAV_CATEGORIES, som i forvejen er stedet
 * hvor menuen defineres.
 */
import { NAV_CATEGORIES, POPULAERE_IDS, erForespoergsel, forespoergselHref } from "@/lib/products";
import { localizedHref } from "@/lib/enPages";
import { bookHref } from "@/lib/bookUrl";
import type { Catalog } from "@/lib/useProducts";
import type { Locale } from "@/lib/i18n";

export interface SearchResult {
  href: string;
  title: string;
  /** Kort forklaring under titlen — produktbeskrivelse eller hvad siden er */
  hint?: string;
  /** Weekendpris i kr. Mangler på kategorisider. */
  price?: number;
  kind: "produkt" | "side";
  /** Prisenhed når den ikke er weekendprisen, fx "kr/time" */
  priceUnit?: string;
  /** Forespørgselsvare: ingen fast weekendpris, knappen fører til formularen */
  foresporg?: boolean;
}

interface Entry extends SearchResult {
  /** Alt der kan søges i, normaliseret. Se toNormalised for hvorfor der er to. */
  haystack: string;
  /** Titlen alene — et hit her vejer tungere end et hit i beskrivelsen */
  titleHay: string;
}

/**
 * To normaliseringer, fordi danskere skriver æ/ø/å på to måder når de har
 * travlt: "højtaler" tastes som både "hojtaler" og "hoejtaler". Indekset
 * rummer begge former, og søgeordet prøves i begge — ellers finder "hojtaler"
 * ikke højtaleren, og "roegmaskine" ikke røgmaskinen.
 */
function toNormalised(text: string): [string, string] {
  const lower = text.toLowerCase();

  // æ/ø/å skal erstattes FØR NFD, ikke efter: NFD skiller ringen fra "å", så
  // bogstavet er allerede blevet til "a" når man leder efter det — og den
  // lange form ("aa") ville aldrig blive dannet.
  const variant = (ae: string, oe: string, aa: string) =>
    lower
      .replaceAll("æ", ae)
      .replaceAll("ø", oe)
      .replaceAll("å", aa)
      // Resten af verdens accenter (é, ü) foldes ned til grundbogstavet
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // c og k er samme lyd på dansk, og folk staver derefter: "diskokugle"
      // om et produkt der hedder Discokugle. Foldes på BEGGE sider, så det
      // hverken kræver en synonymliste eller kan komme ud af sync.
      .replaceAll("c", "k")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  return [variant("a", "o", "a"), variant("ae", "oe", "aa")];
}

/** Begge former samlet — bruges som indeksets søgetekst. */
function haystackOf(...dele: Array<string | undefined>): string {
  const tekst = dele.filter(Boolean).join(" ");
  const [kort, langt] = toNormalised(tekst);
  return kort === langt ? kort : `${kort} ${langt}`;
}

function entry(r: SearchResult, ekstra?: string): Entry {
  return {
    ...r,
    titleHay: haystackOf(r.title),
    // Stien tages med: slugs som "roegmaskine" og "haandholdt-mikrofon" er
    // netop den stavemåde, folk taster når de undgår æ/ø/å.
    haystack: haystackOf(r.title, r.hint, r.href, ekstra),
  };
}

/**
 * Alt der kan findes, på det sprog brugeren læser.
 *
 * Kategorisiderne kommer kun med på dansk — de findes ikke på engelsk, og en
 * dansk overskrift i en engelsk resultatliste er værre end ingen. Produkterne
 * findes derimod på begge sprog i kataloget, og det er dem, søgningen handler om.
 */
export function buildSearchIndex(catalog: Catalog, locale: Locale): Entry[] {
  const set = new Map<string, Entry>();

  const add = (e: Entry) => {
    // Et produkt slår en kategoriside på samme sti — det har pris med
    const eksisterende = set.get(e.href);
    if (eksisterende && eksisterende.kind === "produkt") return;
    set.set(e.href, e);
  };

  for (const s of catalog.speakers) {
    if (!s.page) continue;
    const t = s[locale];
    add(entry(
      { href: localizedHref(s.page, locale), title: t.name, hint: t.size, price: s.price, kind: "produkt" },
      `${t.desc} ${t.capacity} ${s.contents?.join(" ") ?? ""} ${s.da.name} ${s.en.name}`,
    ));
  }

  for (const a of catalog.addons) {
    if (a.intern) continue; // faktureringsgebyr o.l. lægges på fra admin
    const t = a[locale];
    if (!a.page && a.ydelse) {
      // En ydelse har ingen produktside — den vælges til i bookingen
      add(entry(
        { href: bookHref(a.id, locale), title: t.label, hint: t.desc, price: a.price, kind: "produkt", priceUnit: a.priceUnit?.[locale] },
        `${a.da.label} ${a.en.label} lydtekniker tekniker sound technician`,
      ));
      continue;
    }
    if (!a.page) continue;
    add(entry(
      { href: localizedHref(a.page, locale), title: t.label, hint: t.desc, price: a.price, kind: "produkt", priceUnit: a.priceUnit?.[locale] },
      `${a.contents?.join(" ") ?? ""} ${a.da.label} ${a.en.label}${a.ydelse ? " lydtekniker tekniker sound technician" : ""}`,
    ));
  }

  for (const r of catalog.rentalProducts) {
    if (!r.page) continue;
    const navn = locale === "en" ? r.name_en : r.name_da;
    const desc = locale === "en" ? r.desc_en : r.desc_da;
    const foresporg = erForespoergsel(r.id);
    add(entry(
      { href: localizedHref(r.page, locale), title: navn, hint: desc, price: foresporg && r.price <= 0 ? undefined : r.price, kind: "produkt", foresporg },
      `${r.contents?.join(" ") ?? ""} ${r.name_da} ${r.name_en} ${r.category}`,
    ));
  }

  if (locale === "da") {
    for (const kat of NAV_CATEGORIES) {
      add(entry({ href: kat.href, title: kat.title, kind: "side" }));
      for (const l of kat.links) {
        add(entry({ href: l.href, title: l.label, kind: "side" }));
      }
    }
    // Sider der bevidst ikke står i menuen, men som folk søger efter.
    // soegning.test.ts fejler, hvis en af stierne ikke længere findes.
    for (const [href, title, ord] of EKSTRA_SIDER) {
      add(entry({ href, title, kind: "side" }, ord));
    }
  }

  return [...set.values()];
}

/**
 * Hvad søgefeltet viser, før der er skrevet noget.
 *
 * Dialogen åbnede med et tomt felt, en tom liste og en grå linje nederst —
 * den lignede en fejl mere end et søgefelt. Nu står de mest lejede produkter
 * der som klikbare rækker, så feltet er en genvej fra første sekund, også for
 * den der åbnede det uden at vide hvad han ledte efter.
 *
 * Bygget af kataloget som resten af indekset. Et produkt uden produktside
 * (fx Elegant festpakke) peger på bookingen — det er stadig et sted at
 * komme hen.
 */
export function populaere(catalog: Catalog, locale: Locale, limit = 6): SearchResult[] {
  const ud: SearchResult[] = [];
  for (const id of POPULAERE_IDS) {
    if (ud.length >= limit) break;
    const s = catalog.speakers.find((p) => p.id === id);
    const a = catalog.addons.find((p) => p.id === id);
    const r = catalog.rentalProducts.find((p) => p.id === id);
    if (s) {
      ud.push({ href: localizedHref(s.page ?? "", locale) || bookHref(s.id, locale), title: s[locale].name, hint: s[locale].size, price: s.price, kind: "produkt" });
    } else if (a) {
      ud.push({ href: a.page ? localizedHref(a.page, locale) : bookHref(a.id, locale), title: a[locale].label, hint: a[locale].desc, price: a.price, kind: "produkt", priceUnit: a.priceUnit?.[locale] });
    } else if (r) {
      ud.push({ href: r.page ? localizedHref(r.page, locale) : bookHref(r.id, locale), title: locale === "en" ? r.name_en : r.name_da, hint: (locale === "en" ? r.desc_en : r.desc_da) ?? undefined, price: r.price, kind: "produkt" });
    }
  }
  return ud;
}

/** [sti, titel, ekstra søgeord] */
export const EKSTRA_SIDER: Array<[string, string, string]> = [
  ["/festlyd", "Lyd til fest", "festlyd musik anlæg"],
  ["/lydudstyr", "PA-anlæg og lydudstyr", "pa anlaeg lydudstyr højttaler"],
  ["/lydanlaeg", "Lydanlæg efter antal gæster", "anlæg gæster pakke"],
  ["/kobenhavn", "Højtalerudlejning i København", "billig udlejning københavn"],
  ["/erhverv", "Erhverv og firmaevents", "firma konference event tilbud"],
  ["/halloween", "Halloween-pakker", "halloween heksetimen monsterfesten midnatsklubben"],
  ["/julefrokost", "Lyd til julefrokost", "julefrokost firmafest fredagsbar december hygge"],
  ["/lys-ai", "AI-lys i lokalet", "lys ai visualiser uplight lyskæde lyseffekt"],
];

/**
 * Søg. Alle ord i søgningen skal findes — "trådløs mikrofon" må ikke give
 * hvert eneste produkt med "mikrofon" i.
 */
export function search(index: Entry[], query: string, limit = 8): SearchResult[] {
  const [kort, langt] = toNormalised(query);
  if (kort.length < 2) return [];

  const ord = kort.split(" ").filter(Boolean);
  const ordLangt = langt.split(" ").filter(Boolean);

  const hits: Array<{ e: Entry; score: number }> = [];
  for (const e of index) {
    const matcher = (i: number) => e.haystack.includes(ord[i]) || e.haystack.includes(ordLangt[i]);
    if (!ord.every((_, i) => matcher(i))) continue;

    // Rangering: titlen vejer tungest, og et ord i starten af titlen tungere
    // end et inde i den. Ellers lander "Karaokepakken" over "Karaokemaskine",
    // når man har skrevet "karaokemaskine".
    let score = 1;
    if (e.titleHay.includes(kort) || e.titleHay.includes(langt)) score = 3;
    if (e.titleHay.startsWith(kort) || e.titleHay.startsWith(langt)) score = 5;
    // Produkter før kategorisider ved samme score — man søger efter en ting
    if (e.kind === "produkt") score += 0.5;
    hits.push({ e, score });
  }

  return hits
    .sort((a, b) => b.score - a.score || a.e.title.localeCompare(b.e.title, "da"))
    .slice(0, limit)
    .map(({ e }) => ({ href: e.href, title: e.title, hint: e.hint, price: e.price, kind: e.kind, priceUnit: e.priceUnit, foresporg: e.foresporg }));
}
