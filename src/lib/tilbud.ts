/**
 * Tilbud: en kurv, der er sat sammen af os og sendt til kunden.
 *
 * Philip, 6. okt 2026: "Så min kollega hurtigt kan generere et tilbud til en
 * kunde … 4 uplights, 3 højtalere, div. stativer, 2 timer tekniker, levering
 * og opsætning … en QR-kode som kunden kan klikke for at booke og betale …
 * fuldt integreret med kurven."
 *
 * Derfor er et tilbud IKKE et dokument med priser skrevet ind. Det er en liste
 * af katalog-id'er og antal — samme ting som kurven består af. Priserne slås
 * op i kataloget, når tilbuddet vises, og igen på serveren, når kunden betaler.
 * Så kan tilbuddet aldrig love et beløb, kassen ikke opkræver.
 *
 * Filen bruges både af admin, af kundens side og af Pages Functions.
 */

import { DJ_ID } from "./dj";
import {
  DELIVERY_ADDON_IDS,
  erForespoergsel,
  type Addon,
  type RentalProduct,
  type Speaker,
} from "./products";

/** Lydmanden er teknikeren: antallet på linjen er timer */
export const TEKNIKER_ID = "lydmand";
/** "Diverse forbrugsmaterialer", 100 kr/stk., kun til tilbud og admin-ordrer */
export const FORBRUG_ID = "forbrugsmaterialer";

export const TILBUD_PREFIX = "tilbud_";
export const TILBUD_INDEX_KEY = "tilbud_index";
export const TILBUD_SEQ_KEY = "tilbud_seq";
/** Første tilbudsnummer, så serien ikke starter på "Tilbud nr. 1" */
export const TILBUD_FOERSTE_NR = 1001;
/** Så mange dage står et nyt tilbud ved magt */
export const TILBUD_GYLDIG_DAGE = 14;

export type TilbudStatus = "kladde" | "sendt" | "set" | "booket";

export interface TilbudLinje {
  /** Katalog-id — produkt, pakke, tilvalg eller ydelse */
  id: string;
  /** Stk. — for teknikeren er det timer */
  antal: number;
}

/** Et billede i "Sådan kan det se ud" — uploadet, AI-genereret eller fra kunden */
export interface TilbudBillede {
  /** /api/image/… (R2) eller /images/… (sitets egne) */
  src: string;
  kilde: "upload" | "ai" | "kunde" | "site";
  /** Prompten for et AI-billede, så det kan laves om med en rettelse */
  prompt?: string;
}

/** Højst så mange billeder på et tilbud */
export const MAX_TILBUD_BILLEDER = 8;

/**
 * Standard i "Sådan kan det se ud", når tilbuddet ingen egne billeder har:
 * forsidens to fotos af rigtige opstillinger (EventHeroGallery). Philip, 6. okt
 * 2026: de generelle stemningsbilleder "ser ikke godt ud" her.
 */
export const STANDARD_INSPIRATION = ["/images/events/reception-detail-v2.webp", "/images/events/reception-front-v2.webp"];

export function gyldigBilledSti(src: unknown): src is string {
  return typeof src === "string" && src.length < 300 && /^\/(api\/image\/[A-Za-z0-9_-]+|images\/[A-Za-z0-9_./-]+\.(webp|jpe?g|png))$/.test(src);
}

export interface Tilbud {
  /** Uforudsigelig nøgle; står i kundens link */
  id: string;
  /** Løbenummeret kunden ser: "Tilbud nr. 1042" */
  nr: number;
  status: TilbudStatus;
  locale: "da" | "en";
  kunde: {
    navn: string;
    firma?: string;
    email?: string;
    telefon?: string;
  };
  /** Overskriften på forsiden, fx "Lyd og lys til julefrokosten" */
  titel: string;
  /** Det personlige brev på side 2 */
  intro: string;
  /** Lejeperiodens første og sidste dag, "YYYY-MM-DD" */
  fra?: string;
  til?: string;
  sted?: string;
  gaester?: number;
  /** Stemningsbilledet på forsiden — et af FORSIDE_BILLEDER eller et af tilbuddets egne */
  forside: string;
  /** "Sådan kan det se ud". Tom = STANDARD_INSPIRATION */
  billeder?: TilbudBillede[];
  linjer: TilbudLinje[];
  /** Adressen vi kører ud til, når der er levering på */
  leveringsadresse?: string;
  /** Rabatkode, som lægges på i kurven af sig selv */
  rabat?: { code: string; pct: number } | null;
  /** Sidste dag tilbuddet gælder, "YYYY-MM-DD" */
  gyldigTil: string;
  /** Kun til os — vises aldrig for kunden */
  note?: string;
  oprettet: string;
  opdateret: string;
  /** Hvem der har lavet det — kundens kontaktperson på tilbuddet */
  oprettetAf?: string;
  sendtAt?: string;
  sendtTil?: string;
  /** Første gang kunden åbnede linket */
  setAt?: string;
  booketAt?: string;
  bookingId?: string;
}

/** Det, listen i admin viser, uden at hente hvert tilbud */
export interface TilbudResume {
  id: string;
  nr: number;
  status: TilbudStatus;
  kunde: string;
  titel: string;
  fra?: string;
  total: number;
  opdateret: string;
  oprettetAf?: string;
}

/** Stemningsbilleder kollegaen kan vælge til forsiden */
export const FORSIDE_BILLEDER: Array<{ src: string; navn: string }> = [
  { src: "/images/hero/firmafestpakke-57132438.webp", navn: "Firmafest" },
  { src: "/images/hero/bryllup-4ce41b95.webp", navn: "Bryllup" },
  { src: "/images/hero/foedselsdag-8db59f95.webp", navn: "Fødselsdag" },
  { src: "/images/hero/konfirmation-5f847c70.webp", navn: "Konfirmation" },
  { src: "/images/hero/havefest-053a7238.webp", navn: "Havefest" },
  { src: "/images/hero/julehyggen-9fc96331.webp", navn: "Julefrokost" },
  { src: "/images/hero/festpakke-stor.webp", navn: "Stor fest" },
  { src: "/images/hero/lysshow-61984525.webp", navn: "Lysshow" },
  { src: "/images/hero/uplights-5d9f84e9.webp", navn: "Uplights" },
  { src: "/images/hero/stemningslys-2c3232bd.webp", navn: "Stemningslys" },
  { src: "/images/hero/lydmand-cea469a2.webp", navn: "Tekniker" },
  { src: "/images/hero/kobenhavn-d99e51c9.webp", navn: "København" },
];

export const STANDARD_FORSIDE = FORSIDE_BILLEDER[0].src;

/* ───── Katalogopslag ───── */

export interface KatalogLike {
  speakers: Speaker[];
  addons: Addon[];
  rentalProducts: RentalProduct[];
}

export interface TilbudVare {
  id: string;
  navn: string;
  beskrivelse?: string;
  /** Pris pr. stk. (eller pr. time), inkl. moms */
  pris: number;
  billede: string | null;
  side?: string;
  enhed: "stk" | "timer";
  slags: "hojtaler" | "udstyr" | "pakke" | "tilvalg" | "ydelse" | "levering";
  /** Kategori fra kataloget, bruges til shoppens faner */
  kategori?: string;
}

const erLevering = (id: string) => (DELIVERY_ADDON_IDS as readonly string[]).includes(id);

/**
 * Kan varen stå på et tilbud? DJ'en kræver anlæg og et tidsrum, og en
 * forespørgselsvare kan ikke betales online, så ingen af dem kan gå gennem
 * kurven. Dem laver vi som før: i telefonen.
 */
export function kanTilbydes(id: string): boolean {
  return id !== DJ_ID && !erForespoergsel(id);
}

/** Slå en vare op i kataloget, på det sprog tilbuddet er skrevet på */
export function findVare(katalog: KatalogLike, id: string, locale: "da" | "en" = "da"): TilbudVare | null {
  const sp = katalog.speakers.find((s) => s.id === id && !s.hidden);
  if (sp) {
    const tekst = sp[locale] ?? sp.da;
    return {
      id,
      navn: tekst.name,
      beskrivelse: tekst.capacity || tekst.desc,
      pris: sp.price,
      billede: sp.product,
      side: sp.page,
      enhed: "stk",
      slags: "hojtaler",
      kategori: "lyd",
    };
  }
  const rp = katalog.rentalProducts.find((r) => r.id === id && !r.hidden);
  if (rp) {
    return {
      id,
      navn: locale === "en" ? rp.name_en : rp.name_da,
      beskrivelse: (locale === "en" ? rp.desc_en : rp.desc_da) ?? undefined,
      pris: rp.price,
      billede: rp.image,
      side: rp.page,
      enhed: "stk",
      slags: rp.bundle?.parts?.length ? "pakke" : "udstyr",
      kategori: rp.category,
    };
  }
  const ad = katalog.addons.find((a) => a.id === id && !a.hidden);
  if (ad) {
    const tekst = ad[locale] ?? ad.da;
    return {
      id,
      navn: tekst.label,
      beskrivelse: tekst.desc,
      pris: ad.price,
      billede: ad.image,
      side: ad.page,
      enhed: id === TEKNIKER_ID ? "timer" : "stk",
      slags: erLevering(id) ? "levering" : ad.ydelse || ad.intern ? "ydelse" : "tilvalg",
    };
  }
  return null;
}

export interface PrissatLinje extends TilbudLinje {
  vare: TilbudVare | null;
  /** antal × pris, 0 når varen ikke findes længere */
  beloeb: number;
}

export interface TilbudSum {
  linjer: PrissatLinje[];
  subtotal: number;
  rabatBeloeb: number;
  total: number;
  /** Heraf moms — priserne er inkl. 25 % moms */
  moms: number;
  /** Linjer hvis vare er udgået af kataloget */
  ukendte: string[];
}

/** Rabatten regnes som i kurven: procent af det hele, rundet til hele kroner */
export function prissaet(t: Pick<Tilbud, "linjer" | "rabat" | "locale">, katalog: KatalogLike): TilbudSum {
  const linjer = t.linjer.map((l) => {
    const vare = findVare(katalog, l.id, t.locale);
    return { ...l, vare, beloeb: vare ? vare.pris * l.antal : 0 };
  });
  const subtotal = linjer.reduce((s, l) => s + l.beloeb, 0);
  const total = t.rabat?.pct ? Math.round(subtotal * (1 - t.rabat.pct / 100)) : subtotal;
  return {
    linjer,
    subtotal,
    rabatBeloeb: subtotal - total,
    total,
    moms: Math.round(total * 0.2),
    ukendte: linjer.filter((l) => !l.vare).map((l) => l.id),
  };
}

/* ───── Kurven: tilbuddet som det, bookingflowet forstår ───── */

export interface KurvFraTilbud {
  /** Én post pr. enhed, som kurven gemmer dem */
  enheder: Array<{ productId: string; name: string; price: number }>;
  /** Teknikertimer, 0 = ingen tekniker */
  teknikerTimer: number;
  levering: string | null;
}

/**
 * Fold tilbuddets linjer ud til kurvens repræsentation: hver fysisk enhed er
 * sin egen kurvlinje (så lager, Stripe og −/+ i kurven virker som altid),
 * teknikeren er timer på lydmand-tilvalget, og kørslen er ordrens kørselsvalg.
 */
export function kurvFraTilbud(t: Pick<Tilbud, "linjer" | "locale">, katalog: KatalogLike): KurvFraTilbud {
  const enheder: KurvFraTilbud["enheder"] = [];
  let teknikerTimer = 0;
  let levering: string | null = null;
  for (const l of t.linjer) {
    if (l.id === TEKNIKER_ID) {
      teknikerTimer += l.antal;
      continue;
    }
    if (erLevering(l.id)) {
      levering = l.id;
      continue;
    }
    const vare = findVare(katalog, l.id, t.locale);
    if (!vare || !kanTilbydes(l.id)) continue;
    for (let i = 0; i < l.antal; i++) enheder.push({ productId: l.id, name: vare.navn, price: vare.pris });
  }
  return { enheder, teknikerTimer, levering };
}

/* ───── Validering ───── */

const ISO_DAG = /^\d{4}-\d{2}-\d{2}$/;
const tekst = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "";
const dag = (v: unknown): string | undefined => (typeof v === "string" && ISO_DAG.test(v) ? v : undefined);

export function iDag(): string {
  return new Date().toISOString().slice(0, 10);
}

export function plusDage(isoDag: string, dage: number): string {
  const d = new Date(`${isoDag}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dage);
  return d.toISOString().slice(0, 10);
}

/** Uforudsigeligt id uden tegn, der kan forveksles (0/O, 1/l/I) */
export function nytTilbudId(): string {
  const alfabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alfabet[b % alfabet.length]).join("");
}

export function gyldigtTilbudId(id: unknown): id is string {
  return typeof id === "string" && /^[a-z0-9]{8,24}$/.test(id);
}

/**
 * Rens et tilbud fra admin. Linjerne slås sammen pr. id, så "3 + 1 højtaler"
 * står som 4, og der kan kun være ét kørselsvalg — de udelukker hinanden i
 * kurven, og tilbuddet må ikke love noget, kurven ikke kan.
 */
export function normaliserTilbud(input: unknown, eksisterende?: Tilbud | null): Omit<Tilbud, "id" | "nr" | "oprettet" | "opdateret"> {
  const r = (input ?? {}) as Record<string, unknown>;
  const k = (r.kunde ?? {}) as Record<string, unknown>;

  const samlet = new Map<string, number>();
  let levering: string | null = null;
  for (const raw of Array.isArray(r.linjer) ? r.linjer : []) {
    const l = raw as Record<string, unknown>;
    const id = typeof l?.id === "string" ? l.id.trim() : "";
    const antal = Math.floor(Number(l?.antal));
    if (!id || !/^[a-z0-9_-]{1,60}$/i.test(id) || !kanTilbydes(id)) continue;
    if (!Number.isFinite(antal) || antal < 1) continue;
    if (erLevering(id)) {
      levering = id;
      continue;
    }
    samlet.set(id, Math.min(999, (samlet.get(id) ?? 0) + antal));
  }
  const linjer: TilbudLinje[] = [...samlet].map(([id, antal]) => ({ id, antal }));
  if (levering) linjer.push({ id: levering, antal: 1 });

  const rabatRaw = r.rabat as { code?: unknown; pct?: unknown } | null | undefined;
  const pct = Math.round(Number(rabatRaw?.pct));
  const code = tekst(rabatRaw?.code, 30);
  const rabat = code && pct >= 1 && pct <= 99 ? { code, pct } : null;

  const gaester = Math.floor(Number(r.gaester));
  const fra = dag(r.fra);
  let til = dag(r.til);
  if (fra && til && til < fra) til = fra;

  const status: TilbudStatus = eksisterende?.status ?? "kladde";
  return {
    status,
    locale: r.locale === "en" ? "en" : "da",
    kunde: {
      navn: tekst(k.navn, 100),
      firma: tekst(k.firma, 100) || undefined,
      email: tekst(k.email, 200) || undefined,
      telefon: tekst(k.telefon, 30) || undefined,
    },
    titel: tekst(r.titel, 120),
    intro: tekst(r.intro, 3000),
    fra,
    til,
    sted: tekst(r.sted, 200) || undefined,
    gaester: Number.isFinite(gaester) && gaester > 0 ? Math.min(gaester, 100000) : undefined,
    forside: gyldigBilledSti(r.forside) ? r.forside : STANDARD_FORSIDE,
    billeder: normaliserBilleder(r.billeder),
    linjer,
    leveringsadresse: levering ? tekst(r.leveringsadresse, 300) || undefined : undefined,
    rabat,
    gyldigTil: dag(r.gyldigTil) ?? plusDage(iDag(), TILBUD_GYLDIG_DAGE),
    note: tekst(r.note, 2000) || undefined,
    oprettetAf: eksisterende?.oprettetAf,
    sendtAt: eksisterende?.sendtAt,
    sendtTil: eksisterende?.sendtTil,
    setAt: eksisterende?.setAt,
    booketAt: eksisterende?.booketAt,
    bookingId: eksisterende?.bookingId,
  };
}

function normaliserBilleder(input: unknown): TilbudBillede[] {
  const ud: TilbudBillede[] = [];
  for (const raw of Array.isArray(input) ? input : []) {
    const b = raw as Record<string, unknown>;
    if (!gyldigBilledSti(b?.src) || ud.some((x) => x.src === b.src)) continue;
    const kilde = b.kilde === "ai" || b.kilde === "kunde" || b.kilde === "site" ? b.kilde : "upload";
    ud.push({ src: b.src, kilde, ...(kilde === "ai" && typeof b.prompt === "string" ? { prompt: b.prompt.slice(0, 2000) } : {}) });
    if (ud.length >= MAX_TILBUD_BILLEDER) break;
  }
  return ud;
}

/** Det kunden får at se — uden vores egen note */
export function offentligtTilbud(t: Tilbud): Omit<Tilbud, "note"> {
  const { note: _note, ...resten } = t;
  return resten;
}

export function erUdloebet(t: Pick<Tilbud, "gyldigTil">, idag = iDag()): boolean {
  return t.gyldigTil < idag;
}

/* ───── Links ───── */

export const SITE_URL = "https://lejhojtaler.dk";

export function tilbudSti(id: string, locale: "da" | "en" = "da"): string {
  return `${locale === "en" ? "/en" : ""}/tilbud?id=${encodeURIComponent(id)}`;
}

/** Linket i QR-koden og på knappen: kurven med tilbuddet lagt i */
export function tilbudBookSti(id: string, locale: "da" | "en" = "da"): string {
  return `${locale === "en" ? "/en" : ""}/book?tilbud=${encodeURIComponent(id)}`;
}

/** Standardbrevet, når kollegaen ikke selv har skrevet et */
export function standardIntro(t: Pick<Tilbud, "kunde" | "locale">, afsender?: string): string {
  const fornavn = t.kunde.navn.split(/\s+/)[0] || "";
  if (t.locale === "en") {
    return [
      `Dear ${fornavn || "customer"},`,
      "",
      "Thank you for your enquiry. Below is our proposal for sound and light for your event, put together for your venue and number of guests.",
      "",
      "You can book and pay directly from this offer. Scan the QR code or press the button, and everything is already in your cart. You are welcome to adjust quantities or add more before you pay.",
      "",
      "Best regards",
      afsender || "Lejhøjtaler.dk",
    ].join("\n");
  }
  return [
    `Kære ${fornavn || "kunde"}`,
    "",
    "Tak for jeres henvendelse. Her er vores forslag til lyd og lys til jeres arrangement, sat sammen efter lokalet og antallet af gæster.",
    "",
    "I kan booke og betale direkte fra tilbuddet. Scan QR-koden eller tryk på knappen, så ligger det hele allerede i kurven. I er velkomne til at rette antal eller lægge mere til, før I betaler.",
    "",
    "Venlig hilsen",
    afsender || "Lejhøjtaler.dk",
  ].join("\n");
}

export function tilbudResume(t: Tilbud, total: number): TilbudResume {
  return {
    id: t.id,
    nr: t.nr,
    status: t.status,
    kunde: t.kunde.firma ? `${t.kunde.navn} (${t.kunde.firma})` : t.kunde.navn,
    titel: t.titel,
    fra: t.fra,
    total,
    opdateret: t.opdateret,
    oprettetAf: t.oprettetAf,
  };
}
