/* ───── Fejlrapporter fra kundernes browsere ─────
 *
 * Endepunktet er offentligt — det skal det være, for fejlen sker hos en kunde
 * der ikke er logget ind. Derfor er al validering her, og alt er begrænset:
 * felternes længde, hvor mange rapporter en enkelt browser kan sende, og hvor
 * længe de gemmes.
 *
 * Der gemmes ALDRIG navn, mail, telefon eller IP. Kun hvad der gik galt.
 */

export const FEJL_PREFIX = "fejl_";
/** En måned er nok til at se et mønster, og til at en fejl kan nå at blive rettet */
export const FEJL_TTL_SEK = 60 * 60 * 24 * 30;
/** Pr. IP pr. time — nok til en ægte fejlramt kunde, for lidt til at fylde KV */
export const MAX_PR_TIME = 20;

const TYPER = [
  "booking_fejlede",
  "betaling_fejlede",
  "ledighed_fejlede",
  "udsolgt",
  "javascript",
  "promise",
] as const;
export type FejlType = (typeof TYPER)[number];

export interface Fejlrapport {
  type: FejlType;
  besked: string;
  enhed: string;
  ua: string;
  bredde: number;
  side: string;
  trin?: number;
  produkt?: string;
  fra?: string;
  til?: string;
  status?: number;
  svar?: string;
  /** Sat af serveren, ikke af klienten */
  tid: string;
  land?: string;
}

const tekst = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * Klientens indhold → en rapport vi tør gemme. Returnerer null når typen er
 * ukendt eller beskeden er tom: en rapport uden indhold er kun støj.
 */
export function parseFejlrapport(raw: unknown, tid: string, land?: string): Fejlrapport | null {
  const o = (raw ?? {}) as Record<string, unknown>;
  const type = TYPER.find((t) => t === o.type);
  const besked = tekst(o.besked, 300);
  if (!type || !besked) return null;

  const trin = Number(o.trin);
  const status = Number(o.status);
  const bredde = Number(o.bredde);

  return {
    type,
    besked,
    enhed: tekst(o.enhed, 60),
    ua: tekst(o.ua, 200),
    bredde: Number.isFinite(bredde) && bredde > 0 && bredde < 10000 ? Math.round(bredde) : 0,
    side: tekst(o.side, 200),
    ...(Number.isFinite(trin) && trin >= 0 && trin <= 9 ? { trin } : {}),
    ...(o.produkt ? { produkt: tekst(o.produkt, 40) } : {}),
    ...(o.fra ? { fra: tekst(o.fra, 10) } : {}),
    ...(o.til ? { til: tekst(o.til, 10) } : {}),
    ...(Number.isFinite(status) && status > 0 && status < 600 ? { status } : {}),
    ...(o.svar ? { svar: tekst(o.svar, 300) } : {}),
    ...(land ? { land } : {}),
    tid,
  };
}

/** Nøglen sorterer nyeste sidst i KV's alfabetiske liste */
export function fejlNøgle(tid: string, tilfældig: string): string {
  return `${FEJL_PREFIX}${tid}_${tilfældig}`;
}

/**
 * Hvilke fejl fortjener en besked på telefonen med det samme?
 *
 * En mislykket booking eller betaling er penge på vej ud ad døren — dem skal
 * Frederik vide om nu. JavaScript-fejl og "udsolgt" samles op i oversigten.
 */
export function børVække(type: FejlType): boolean {
  return type === "booking_fejlede" || type === "betaling_fejlede";
}

export interface FejlOpsummering {
  type: string;
  antal: number;
  senest: string;
  /** De enheder fejlen er set på — svarer på "er det kun mobil?" */
  enheder: string[];
  besked: string;
}

/** Fejl grupperet efter type og besked, nyeste først — sådan læser man et mønster */
export function opsummer(rapporter: Fejlrapport[]): FejlOpsummering[] {
  const grupper = new Map<string, FejlOpsummering>();
  for (const r of rapporter) {
    const nøgle = `${r.type}::${r.besked}`;
    const eksisterende = grupper.get(nøgle);
    if (eksisterende) {
      eksisterende.antal++;
      if (r.tid > eksisterende.senest) eksisterende.senest = r.tid;
      if (r.enhed && !eksisterende.enheder.includes(r.enhed)) eksisterende.enheder.push(r.enhed);
    } else {
      grupper.set(nøgle, {
        type: r.type,
        besked: r.besked,
        antal: 1,
        senest: r.tid,
        enheder: r.enhed ? [r.enhed] : [],
      });
    }
  }
  return [...grupper.values()].sort((a, b) => b.senest.localeCompare(a.senest));
}
