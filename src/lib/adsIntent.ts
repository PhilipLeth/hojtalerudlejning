/* ───── Intent-grammatik til Google Ads ─────
 *
 * Én søgning efter "soundboks" og én efter "lej soundboks" er ikke den samme
 * kunde. Kontoens egne tal siger det tydeligt: "diskokugle" gav 238 visninger
 * og 3 klik, mens "lej soundboks" gav 167 visninger og 24 klik. Det er
 * lejeordet der adskiller en der vil leje fra en der vil købe en lampe.
 *
 * Modulet her laver ét produkts søgetermer om til de temaer, en dansker
 * faktisk skriver i søgefeltet. Mønstrene er ikke fundet på — de er aflæst af
 * søgetermerapporten for kontoen (441-020-7627, seneste 180 dage):
 *
 *   lej soundboks           167 visninger    soundboks leje          100
 *   lej en soundboks        118              soundboks udlejning      40
 *   leje soundboks           74              lej soundboks københavn  18
 *   leje af soundboks        50              soundboks til leje       12
 *
 * Fraserne er phrase match. Det er grunden til at lejeordet skal stå i selve
 * frasen: "lyseffekter til fest" fanger ikke "leje af lyseffekter", så en
 * kombinatorisk generering ud fra produktnavnet ville lave grupper der aldrig
 * viser noget. Fraser uden lejeord får `bofu: false` og er fravalgt som
 * udgangspunkt.
 */

/** Tema = én annoncegruppe. Fem er standardsættet; de sidste to er tilvalg. */
export type ThemeKey = "lej" | "leje" | "suffix" | "udlejning" | "geo" | "anledning" | "en";

export interface IntentKeyword {
  text: string;
  matchType: "PHRASE";
  /**
   * Står der et lejeord i frasen? Uden det er søgningen lige så meget et køb
   * som en leje, og phrase match kan ikke skelne.
   */
  bofu: boolean;
}

export interface IntentTheme {
  key: ThemeKey;
  /** Menneskelæsbart tema, bruges i annoncegruppens navn. */
  label: string;
  /** Den frase annoncens overskrift og beskrivelse skal bære. */
  primary: string;
  keywords: IntentKeyword[];
}

export interface IntentOptions {
  /** Byer der sættes bag geo-fraserne. Kontoen kører på København. */
  geo?: string[];
  /** Anledninger til anledningstemaet. */
  occasions?: string[];
  /** Tag det engelske tema med. Kun når produktet har en engelsk side. */
  english?: boolean;
}

const DEFAULT_GEO = ["københavn"];
const DEFAULT_OCCASIONS = ["fest"];

/**
 * Ord der gør en frase til en lejesøgning.
 *
 * Matches på hele ord, ikke på tekststumper — ellers ville "lejlighed" tælle
 * som et lejeord, og "leje" ville skjule sig i "lejemål".
 */
const RENTAL_WORDS = new Set([
  "lej", "leje", "lejer", "lejes",
  "udlejning", "udlej", "udlejes",
  "lån", "låne",
  "rent", "rents", "rental", "hire",
]);

/** Små ord der ikke skal gøre en frase unik når vi luger dubletter ud. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Indeholder frasen et lejeord som selvstændigt ord? */
export function hasRentalWord(text: string): boolean {
  return normalize(text).split(/[\s-]+/).some((w) => RENTAL_WORDS.has(w));
}

/**
 * Søgetermer som udgangspunkt for et produktnavn.
 *
 * Kun et udgangspunkt: produktnavne er ikke søgefraser. "Soundboks 4" hedder
 * "soundboks" i søgefeltet, og halvdelen staver det "soundbox". Listen er
 * ment til at blive rettet i hånden (gemmes pr. produkt i KV `ads_terms`).
 */
export function seedTerms(name: string): string[] {
  const base = normalize(name)
    // Modelnumre søger ingen på: "Soundboks 4" → "soundboks"
    .replace(/\s+\d+(\s|$)/g, " ")
    .trim();
  const out = [base];
  for (const [from, to] of Object.entries(SPELLING_VARIANTS)) {
    if (base.includes(from)) out.push(base.replace(from, to));
  }
  return dedupe(out).filter(Boolean);
}

/**
 * Stavemåder danskerne rent faktisk bruger, målt på søgetermerne.
 * "højtaler" slår den korrekte stavemåde "højttaler" 13:1 i kontoens data,
 * så begge skal med — vi retter ikke kunden.
 *
 * Kun ægte stavevarianter står her, ikke flertalsformer. Phrase match dækker
 * selv ental/flertal, og "røgmaskiner" som selvstændig term gav mønstret
 * "lej en røgmaskiner", som ingen skriver.
 */
const SPELLING_VARIANTS: Record<string, string> = {
  soundboks: "soundbox",
  diskokugle: "discokugle",
  højtaler: "højttaler",
};

function dedupe(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const key = normalize(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

/** Mønstrene pr. tema. `{t}` er søgetermen. */
const PATTERNS: Record<Exclude<ThemeKey, "geo" | "anledning">, { label: string; forms: string[] }> = {
  lej: { label: "Lej", forms: ["lej {t}", "lej en {t}"] },
  leje: { label: "Leje af", forms: ["leje {t}", "leje af {t}"] },
  suffix: { label: "Til leje", forms: ["{t} leje", "{t} til leje", "{t} lej"] },
  udlejning: { label: "Udlejning", forms: ["{t} udlejning", "udlejning af {t}"] },
  en: { label: "Rental (EN)", forms: ["rent {t}", "rent a {t}", "{t} rental", "{t} hire"] },
};

function build(forms: string[], terms: string[]): IntentKeyword[] {
  const texts = dedupe(terms.flatMap((t) => forms.map((f) => f.replace("{t}", t))));
  return texts.map((text) => ({ text, matchType: "PHRASE" as const, bofu: hasRentalWord(text) }));
}

/**
 * Temaerne for ét produkt.
 *
 * Rækkefølgen er bevidst: de fem første er standardsættet man tænder, og de
 * er sorteret efter hvor meget trafik mønstret har vist i kontoen.
 */
export function intentThemes(terms: string[], opts: IntentOptions = {}): IntentTheme[] {
  const t = dedupe(terms);
  if (!t.length) return [];

  const geo = opts.geo ?? DEFAULT_GEO;
  const occasions = opts.occasions ?? DEFAULT_OCCASIONS;

  const themes: IntentTheme[] = [
    theme("lej", PATTERNS.lej.label, build(PATTERNS.lej.forms, t)),
    theme("leje", PATTERNS.leje.label, build(PATTERNS.leje.forms, t)),
    theme("suffix", PATTERNS.suffix.label, build(PATTERNS.suffix.forms, t)),
    theme("udlejning", PATTERNS.udlejning.label, build(PATTERNS.udlejning.forms, t)),
    theme(
      "geo",
      "Geo",
      build(geo.flatMap((by) => [`lej {t} ${by}`, `{t} leje ${by}`]), t),
    ),
    theme(
      "anledning",
      "Anledning",
      build(occasions.flatMap((a) => [`lej {t} til ${a}`, `leje af {t} til ${a}`]), t),
    ),
  ];

  if (opts.english) {
    themes.push(theme("en", PATTERNS.en.label, build(PATTERNS.en.forms, t)));
  }

  // Samme frase må kun optræde i ét tema — ellers byder vi mod os selv i
  // auktionen, præcis som AG 1 gør mod AG 4 på "leje af soundbox" i dag.
  const seen = new Set<string>();
  return themes
    .map((th) => ({
      ...th,
      keywords: th.keywords.filter((k) => !seen.has(k.text) && (seen.add(k.text), true)),
    }))
    .filter((th) => th.keywords.length > 0);
}

function theme(key: ThemeKey, label: string, keywords: IntentKeyword[]): IntentTheme {
  return { key, label, primary: keywords[0]?.text ?? "", keywords };
}

/** Annoncegruppens navn. Fast konvention, så den kan læses i Google Ads-UI'et. */
export function adGroupName(productName: string, theme: IntentTheme): string {
  return `${productName} — ${theme.label}`;
}
