/* ───── Intent-grammatik: klassificering, ikke generering ─────
 *
 * Filen genererede tidligere keywords ud af produktnavnet: "lej {navn}",
 * "{navn} udlejning", "lej {navn} til fest" og så videre. Det gav nitten
 * fraser for Mackie Thump GO — og nul søgninger på dem alle. Google siger
 * 40 om måneden på produktnavnet selv og 210 på "lej højtaler". Kunden
 * søger på kategorien, ikke på modellen, og det kan ingen permutation vide.
 *
 * Keywords kommer nu fra Google (`keywordIdeas`) og fra kontoens egne
 * søgetermer. Grammatikken herunder bruges til det, den er god til: at
 * genkende HVILKEN slags lejesøgning en frase er, så de valgte keywords kan
 * samles i stramme annoncegrupper.
 *
 * Mønstrene er aflæst af kontoens søgetermerapport:
 *   lej soundboks 167 visn.   soundboks leje 100    soundboks udlejning 40
 *   lej en soundboks 118      leje af soundboks 50  lej soundboks kbh 18
 */

export type ThemeKey = "lej" | "leje" | "suffix" | "udlejning" | "geo" | "anledning" | "en" | "generisk";

export const THEME_LABELS: Record<ThemeKey, string> = {
  lej: "Lej",
  leje: "Leje af",
  suffix: "Til leje",
  udlejning: "Udlejning",
  geo: "Geo",
  anledning: "Anledning",
  en: "Rental (EN)",
  generisk: "Uden lejeord",
};

/**
 * Ord der gør en frase til en lejesøgning.
 * Matches på hele ord — ellers ville "lejlighed" tælle med.
 */
const RENTAL_WORDS = new Set([
  "lej", "leje", "lejer", "lejes",
  "udlejning", "udlej", "udlejes", "udlejer",
  "lån", "låne",
  "rent", "rents", "rental", "hire",
]);

/** Byer vi kender i kontoens søgetermer. */
const GEO_WORDS = new Set([
  "københavn", "kbh", "frederiksberg", "amager", "roskilde", "valby",
  "nørrebro", "østerbro", "vesterbro", "hellerup", "gentofte", "sjælland",
]);

/** Anledninger fra kontoens egne søgetermer og landingssider. */
const OCCASION_WORDS = new Set([
  "fest", "bryllup", "konfirmation", "fødselsdag", "julefrokost",
  "nytår", "polterabend", "havefest", "firmafest", "student", "studenterfest",
]);

const ENGLISH_WORDS = new Set(["rent", "rents", "rental", "hire", "a"]);

export function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, " ")
    .split(/[\s-]+/)
    .filter(Boolean);
}

/** Indeholder frasen et lejeord som selvstændigt ord? */
export function hasRentalWord(text: string): boolean {
  return words(text).some((w) => RENTAL_WORDS.has(w));
}

/**
 * Hvilken slags lejesøgning er det her?
 *
 * Rækkefølgen betyder noget: en frase med både lejeord og by er en
 * geo-søgning, for det er byen der gør annoncen anderledes.
 */
export function classify(text: string): ThemeKey {
  const w = words(text);
  if (!w.length) return "generisk";

  if (w.some((x) => ENGLISH_WORDS.has(x) && x !== "a")) return "en";
  if (!hasRentalWord(text)) return "generisk";
  if (w.some((x) => GEO_WORDS.has(x))) return "geo";
  if (w.some((x) => OCCASION_WORDS.has(x))) return "anledning";
  if (w.includes("udlejning") || w.includes("udlej") || w.includes("udlejes")) return "udlejning";

  // Står lejeordet først, er det "lej X"; står det sidst, er det "X leje"
  if (w[0] === "lej") return "lej";
  if (w[0] === "leje") return "leje";
  if (RENTAL_WORDS.has(w[w.length - 1])) return "suffix";
  return "leje";
}

/** Ord der beskriver intentionen frem for produktet. */
const INTENT_NOISE = new Set([
  ...RENTAL_WORDS, ...GEO_WORDS, ...OCCASION_WORDS, ...ENGLISH_WORDS,
  "af", "til", "en", "et", "og", "i", "på", "med", "the", "for",
]);

/**
 * Produktordene i frasen — det frasen egentlig handler om.
 * "leje af højtaler københavn" → "højtaler".
 */
export function headTerm(text: string): string {
  return words(text).filter((w) => !INTENT_NOISE.has(w)).join(" ");
}

/**
 * Grov stamme, kun til at lægge ental og flertal i samme bunke.
 *
 * Hvordan stammen ser ud er ligegyldigt — det eneste krav er, at "højtaler"
 * og "højtalere" lander samme sted. Derfor skrælles der gentagne gange:
 * ét gennemløb gav "højtal" og "højtaler", altså to grupper for det samme
 * produkt. Bunden på fire tegn holder korte ord som "lys" og "bar" hele.
 */
function stem(word: string): string {
  const ENDINGS = ["erne", "ene", "er", "e", "r"];
  let out = word;
  let changed = true;
  while (changed) {
    changed = false;
    for (const end of ENDINGS) {
      if (out.length - end.length >= 4 && out.endsWith(end)) {
        out = out.slice(0, -end.length);
        changed = true;
        break;
      }
    }
  }
  return out;
}

/**
 * Produktordene i en frase, som stammer — grundlaget for at afgøre, om to
 * fraser handler om det samme.
 */
export function productWords(text: string): Set<string> {
  return new Set(headTerm(text).split(" ").filter(Boolean).map(canonical).map(stem));
}

/**
 * Samme produkt, samme ord — uanset stavemåde.
 *
 * Uden det her matcher "diskokugle udlejning" ikke frøet "discokugle
 * udlejning", og et lovligt keyword bliver sorteret fra, fordi kunden staver
 * med k og produktnavnet med c. Skrives før stammen skrælles, så også
 * bøjninger som "diskokugler" rammer.
 */
function canonical(word: string): string {
  for (const [a, b] of SPELLING_PAIRS) {
    if (word.includes(b)) return word.replace(b, a);
  }
  return word;
}

/**
 * Handler frasen om det samme produkt som `terms`?
 *
 * Sammenligningen sker på PRODUKTORD, ikke på hele frasen. Det er hele
 * pointen: et frø som "discokugle udlejning" indeholder både produktordet og
 * lejeordet, og måler man på begge, matcher "musik udlejning", "fest lys
 * udlejning" og "udlejning af soundbox" — de deler jo "udlejning". Sådan
 * blev der 28. august 2026 oprettet en annoncegruppe ved navn
 * "Discokugle 40 cm — Udlejning: soundbox", der pegede på /discokugle.
 *
 * headTerm() skræller lejeord, byer, anledninger og småord af, så kun
 * produktet står tilbage. Så matcher "discokugle udlejning" og "diskokugle
 * leje", men ikke "musik udlejning".
 */
export function samhandler(text: string, terms: string[]): boolean {
  const mine = productWords(text);
  if (!mine.size) return false;
  for (const t of terms) {
    for (const w of productWords(t)) {
      if (mine.has(w)) return true;
    }
  }
  return false;
}

function bucketKey(text: string): string {
  // Samme normalisering som samhandler(): stavemåde først, så stamme. Uden
  // det blev "lej discokugle" og "lej en diskokugle" til to annoncegrupper
  // om det samme, med hver sin annonce.
  return `${classify(text)}|${[...productWords(text)].sort().join(" ")}`;
}

export interface KeywordInput {
  text: string;
  volume?: number;
}

export interface Cluster {
  key: ThemeKey;
  /** Produktordene gruppen deler, fx "højtaler". */
  head: string;
  label: string;
  /** Frasen annoncen skal bære — den mest søgte i gruppen. */
  primary: string;
  keywords: string[];
  /** Summeret søgevolumen. Nul betyder: lad være med at bygge gruppen. */
  volume: number;
}

/**
 * Saml valgte keywords i stramme annoncegrupper.
 *
 * Én gruppe = samme produktord og samme slags lejesøgning. "lej højtaler" og
 * "leje af højtaler" hører sammen; "højtaler udlejning" og "lej højtaler
 * københavn" gør ikke — de fortjener hver deres annoncetekst, og det er hele
 * pointen med at dele op.
 */
export function clusterKeywords(input: Array<KeywordInput | string>): Cluster[] {
  const rows = input
    .map((k) => (typeof k === "string" ? { text: k, volume: 0 } : { text: k.text, volume: k.volume ?? 0 }))
    .map((k) => ({ ...k, text: k.text.trim().toLowerCase() }))
    .filter((k) => k.text);

  const buckets = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = bucketKey(row.text);
    const list = buckets.get(key) ?? [];
    if (!list.some((r) => r.text === row.text)) list.push(row);
    buckets.set(key, list);
  }

  const out: Cluster[] = [];
  for (const list of buckets.values()) {
    const sorted = [...list].sort((a, b) => b.volume - a.volume || a.text.localeCompare(b.text, "da"));
    const key = classify(sorted[0].text);
    out.push({
      key,
      head: headTerm(sorted[0].text),
      label: THEME_LABELS[key],
      primary: sorted[0].text,
      keywords: sorted.map((r) => r.text),
      volume: sorted.reduce((sum, r) => sum + r.volume, 0),
    });
  }
  return out.sort((a, b) => b.volume - a.volume);
}

/**
 * Steder vi ikke kører til.
 *
 * Kontoen har betalt for klik på "soundboks leje odense", "soundboks
 * udlejning fyn", "lej soundboks aalborg" og "leje soundboks smukfest".
 * Efterspørgslen er ægte nok, men vi kan ikke levere, så det er penge ud af
 * vinduet — og en idéliste, der foreslår at bygge en annoncegruppe på dem,
 * gør skaden større. Listen er kun de steder, der faktisk er dukket op;
 * den skal vokse af erfaring, ikke af Danmarkskortet.
 *
 * Bemærk at Roskilde, Frederiksberg og Taastrup IKKE står her: de er dækket
 * af Yderområder-kampagnen.
 */
const UDENFOR_OMRAADET = new Set([
  "odense", "fyn", "aarhus", "århus", "aalborg", "ålborg", "jylland",
  "esbjerg", "randers", "kolding", "vejle", "horsens", "silkeborg",
  "herning", "sønderborg", "bornholm", "smukfest",
]);

/**
 * Peger frasen et sted hen, vi ikke kører til? Returnerer stedet, ellers null.
 * Sådan en frase er ikke en idé til en annoncegruppe — den er en kandidat
 * til et negativt keyword.
 */
export function udenforOmraadet(text: string): string | null {
  return words(text).find((w) => UDENFOR_OMRAADET.has(w)) ?? null;
}

/**
 * Dækker phrase match på `bred` også søgninger på `smal`?
 *
 * Phrase match kræver, at keywordets ord står i søgningen i samme rækkefølge
 * og uden fremmede ord imellem; til gengæld må der stå hvad som helst før og
 * efter. "lej højtaler" fanger derfor "lej højtaler til bryllup" af sig selv,
 * mens "lej en højtaler" IKKE dækkes — der er skudt et ord ind i midten.
 *
 * Bruges til at sige det højt, når en frase man skriver ind allerede er
 * dækket af en bredere, man har valgt. Så er den ekstra frase ikke forkert,
 * bare overflødig.
 */
export function phraseCovers(bred: string, smal: string): boolean {
  const b = words(bred);
  const sm = words(smal);
  if (!b.length || b.length >= sm.length) return false;
  for (let i = 0; i + b.length <= sm.length; i++) {
    if (b.every((w, j) => w === sm[i + j])) return true;
  }
  return false;
}

/**
 * Frø til Google — ikke keywords.
 *
 * Forskellen er hele forskellen: et frø er noget vi giver Google for at få
 * rigtige søgefraser tilbage. Produktnavnet er et fint frø og et elendigt
 * keyword.
 */
export function seedTerms(name: string): string[] {
  // Tal og måleenheder er ikke søgeord. "Discokugle 40 cm" gav før frøet
  // "discokugle cm", fordi kun tallet blev klippet — og et skævt frø får
  // Google til at svare med næsten ingenting.
  const base = words(name)
    .filter((w) => !/^\d+$/.test(w) && !UNIT_WORDS.has(w))
    .join(" ")
    .trim();
  const out = [base];
  for (const [a, b] of SPELLING_PAIRS) {
    if (base.includes(a)) out.push(base.replace(a, b));
    else if (base.includes(b)) out.push(base.replace(b, a));
  }
  return [...new Set(out.filter(Boolean))];
}

const UNIT_WORDS = new Set(["cm", "mm", "m", "tommer", "tomme", "stk", "pak", "w", "watt", "kg", "l", "liter"]);

/**
 * Stavemåder danskerne bruger — "højtaler" slår "højttaler" 13:1 i kontoen.
 * Parrene virker begge veje: produktet hedder "Discokugle", men halvdelen
 * søger "diskokugle".
 */
const SPELLING_PAIRS: Array<[string, string]> = [
  ["soundboks", "soundbox"],
  ["diskokugle", "discokugle"],
  ["højtaler", "højttaler"],
];

/** Annoncegruppens navn. Fast konvention, så den kan læses i Google Ads. */
export function adGroupName(productName: string, cluster: Cluster): string {
  return `${productName} — ${cluster.label}: ${cluster.head}`;
}
