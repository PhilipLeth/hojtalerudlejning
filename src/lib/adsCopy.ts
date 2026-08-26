/* ───── Annoncetekst til en temagruppe ─────
 *
 * Google viser tre overskrifter ad gangen og vælger dem selv. Står lejeordet
 * kun i beskrivelsen, kan en søgning på "leje af lys til fest" derfor møde
 * "Lyspakke fra 495 kr.", som læser som et køb — det var præcis fejlen i de
 * gamle lysgrupper. Derfor er kravet her hårdt og tjekket i kode: temaets
 * frase skal stå i mindst én overskrift OG i mindst én beskrivelse.
 *
 * Alle beløb hentes fra kataloget. Ingen pris skrives som tal i denne fil —
 * det var sådan røgmaskinen kom til at stå 245 kr fem steder, længe efter den
 * var steget til 595.
 */

// Relative importer: filen læses også af Pages Functions, som ikke kender @/-aliaset
import { addons, PAUSEDE_SIDER } from "./products";
import type { IntentTheme } from "./adsIntent";

export const HEADLINE_MAX = 30;
export const DESCRIPTION_MAX = 90;
export const HEADLINE_MIN_COUNT = 3;
export const HEADLINE_MAX_COUNT = 15;
export const DESCRIPTION_MIN_COUNT = 2;
export const DESCRIPTION_MAX_COUNT = 4;

const SITE = "https://lejhojtaler.dk";
const BRAND = "Lejhøjtaler.dk";
/** Byen i afhentningsadressen. Kort form, fordi overskrifter har 30 tegn. */
const CITY = "København";

/**
 * Leveringsprisen kommer fra kørsels-tilvalget i kataloget, ikke fra et tal
 * skrevet i hånden. Serveren sender den levende pris fra KV med; standarden
 * her er kodens egen, så biblioteket også kan bruges uden KV.
 */
export const DEFAULT_DELIVERY_PRICE = addons.find((a) => a.id === "levering_ud")?.price ?? 0;

export interface AdCopyProduct {
  /** Produktnavnet som kunden kender det, fx "Røgmaskine". */
  name: string;
  price: number;
  /** Dansk sti fra kataloget, fx "/roeg". */
  page: string;
  contents?: string[];
}

export interface AdCopy {
  headlines: string[];
  descriptions: string[];
  finalUrl: string;
  path1?: string;
}

/**
 * Hvert ord med stort, som i kontoens eksisterende annoncer.
 *
 * `preserve` er produktnavnet: keywordet er skrevet med småt, så uden det
 * ville "lej mackie thump go" blive til "Lej Mackie Thump Go" i en annonce
 * for et produkt, der hedder Mackie Thump GO.
 */
function titleCase(text: string, preserve = ""): string {
  const casing = new Map<string, string>();
  for (const w of preserve.split(/\s+/)) if (w) casing.set(w.toLowerCase(), w);
  return text.replace(/\p{Letter}[\p{Letter}\p{Number}]*/gu, (w) =>
    casing.get(w.toLowerCase()) ?? w[0].toUpperCase() + w.slice(1),
  );
}

/**
 * "i København" bag et keyword der allerede siger København læser som en
 * fejl — og geo-temaets fraser gør netop det.
 */
function inCity(kw: string): string {
  return kw.toLowerCase().includes(CITY.toLowerCase()) ? "" : ` i ${CITY}`;
}

function fits(text: string, max: number): boolean {
  return text.length > 0 && text.length <= max;
}

/** Første unikke linjer der overholder tegngrænsen. */
function pick(candidates: string[], max: number, limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of candidates) {
    const clean = c.replace(/\s+/g, " ").trim();
    if (!fits(clean, max)) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
    if (out.length === limit) break;
  }
  return out;
}

function contains(lines: string[], keyword: string): boolean {
  const needle = keyword.toLowerCase();
  return lines.some((l) => l.toLowerCase().includes(needle));
}

/** URL-stien efter domænet, fx "roeg". Google tillader 15 tegn. */
function pathSegment(page: string): string | undefined {
  const slug = page.replace(/^\/+|\/+$/g, "").split("/")[0];
  return slug && slug.length <= 15 ? slug : undefined;
}

/**
 * Annoncetekst for ét tema.
 *
 * Kandidatlisterne er længere end der er plads til — `pick` tager de første,
 * der holder sig under tegngrænsen. Det er med vilje: et langt produktnavn
 * skubber de brede linjer ud i stedet for at give en tom annonce.
 */
export function buildAdCopy(
  product: AdCopyProduct,
  theme: IntentTheme,
  { deliveryPrice = DEFAULT_DELIVERY_PRICE }: { deliveryPrice?: number } = {},
): AdCopy {
  const kw = theme.primary;
  const navn = product.name;
  const pris = `${product.price} kr.`;
  // Kender vi ikke leveringsprisen, siger annoncen ingenting om levering
  // frem for at gætte på et beløb
  const levering = deliveryPrice > 0 ? `${deliveryPrice} kr.` : "";

  const headlines = pick(
    [
      // Frasen selv skal stå øverst — den er hele pointen med temaet
      titleCase(kw, navn),
      `${titleCase(kw, navn)} Fra ${pris}`,
      // Siger frasen allerede København, gentager overskriften det ikke
      inCity(kw) ? `${titleCase(kw, navn)} I ${CITY}` : "",
      `${navn} Til Leje`,
      `${navn} Udlejning`,
      `Leje Af ${navn}`,
      `${navn} Fra ${pris}`,
      "Book Online På 3 Minutter",
      "Betal Først Ved Afhentning",
      "Ingen Depositum",
      levering ? `Levering I ${CITY} ${levering}` : "",
      `Hent I ${CITY}`,
      "Alt Udstyr Inkluderet",
      "Nem Opsætning, Ingen Teknik",
      product.contents?.length ? titleCase(product.contents[0]) : "",
      "Klar Til Fest Og Bryllup",
      BRAND,
    ],
    HEADLINE_MAX,
    HEADLINE_MAX_COUNT,
  );

  const descriptions = pick(
    [
      `${capitalize(kw)}${inCity(kw)} fra ${pris} Afhent selv eller få leveret.`,
      // Kort reserve: den lange linje ovenfor falder ud på et langt
      // produktnavn, og så ville frasen mangle i beskrivelserne
      `${capitalize(kw)}${inCity(kw)}. Book online på 3 minutter.`,
      `${navn} til leje uden depositum. Betal først når du henter i ${CITY}.`,
      levering
        ? `Book ${navn.toLowerCase()} online på 3 minutter. Levering i ${CITY} fra ${levering}`
        : `Book ${navn.toLowerCase()} online på 3 minutter hos ${BRAND}.`,
      product.contents?.length
        ? `Med i prisen: ${product.contents.slice(0, 3).join(", ")}.`
        : "Kombiner med lyd og lys til den komplette festpakke.",
      "Kombiner med lyd og lys til den komplette festpakke.",
    ],
    DESCRIPTION_MAX,
    DESCRIPTION_MAX_COUNT,
  );

  return {
    headlines,
    descriptions,
    finalUrl: `${SITE}${product.page}`,
    path1: pathSegment(product.page),
  };
}

function capitalize(text: string): string {
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

/**
 * Alt det Google eller vi selv ville afvise, samlet ét sted.
 *
 * Returnerer en liste af fejl på dansk — tom liste betyder klar til upload.
 * Kaldes både af admin-UI'et og af serveren før noget skrives, fordi teksten
 * kan være rettet i hånden undervejs.
 */
export function validateAdCopy(
  copy: AdCopy,
  keyword: string,
  knownPages: string[],
  pausedPages: string[] = PAUSEDE_SIDER,
): string[] {
  const fejl: string[] = [];

  if (copy.headlines.length < HEADLINE_MIN_COUNT) {
    fejl.push(`Mindst ${HEADLINE_MIN_COUNT} overskrifter kræves (der er ${copy.headlines.length}).`);
  }
  if (copy.headlines.length > HEADLINE_MAX_COUNT) {
    fejl.push(`Højst ${HEADLINE_MAX_COUNT} overskrifter (der er ${copy.headlines.length}).`);
  }
  if (copy.descriptions.length < DESCRIPTION_MIN_COUNT) {
    fejl.push(`Mindst ${DESCRIPTION_MIN_COUNT} beskrivelser kræves (der er ${copy.descriptions.length}).`);
  }
  if (copy.descriptions.length > DESCRIPTION_MAX_COUNT) {
    fejl.push(`Højst ${DESCRIPTION_MAX_COUNT} beskrivelser (der er ${copy.descriptions.length}).`);
  }

  for (const h of copy.headlines) {
    if (!fits(h, HEADLINE_MAX)) fejl.push(`Overskrift over ${HEADLINE_MAX} tegn: "${h}" (${h.length}).`);
  }
  for (const d of copy.descriptions) {
    if (!fits(d, DESCRIPTION_MAX)) fejl.push(`Beskrivelse over ${DESCRIPTION_MAX} tegn: "${d}" (${d.length}).`);
  }

  if (!contains(copy.headlines, keyword)) {
    fejl.push(`Frasen "${keyword}" står ikke i nogen overskrift.`);
  }
  if (!contains(copy.descriptions, keyword)) {
    fejl.push(`Frasen "${keyword}" står ikke i nogen beskrivelse.`);
  }

  fejl.push(...validateFinalUrl(copy.finalUrl, knownPages, pausedPages));
  return fejl;
}

/**
 * Landingssiden skal findes, være vores egen, og ikke være sat på pause.
 *
 * Det sidste er ikke teoretisk: kontoen har annoncegrupper der peger på
 * /karaoke, /pakke-konference og /skaerm-32, og alle tre står i
 * PAUSEDE_PRODUKTER.
 *
 * `pausedPages` kan overskrives, fordi det levende katalog ligger i KV: et
 * produkt kan være skjult dér uden at være skjult i koden, og så er siden
 * lige så pauset.
 */
export function validateFinalUrl(
  finalUrl: string,
  knownPages: string[],
  pausedPages: string[] = PAUSEDE_SIDER,
): string[] {
  let path: string;
  try {
    const url = new URL(finalUrl);
    if (url.origin !== SITE) return [`Landingssiden peger uden for lejhojtaler.dk: ${finalUrl}`];
    path = url.pathname.replace(/\/$/, "") || "/";
  } catch {
    return [`Ugyldig landingsside: ${finalUrl}`];
  }

  if (!knownPages.includes(path)) return [`Landingssiden findes ikke: ${path}`];
  if (pausedPages.includes(path)) return [`Landingssiden er sat på pause: ${path}`];
  return [];
}
