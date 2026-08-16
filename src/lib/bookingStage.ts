/**
 * Sagsstatus for admin-overblikket.
 *
 * En booking har to spor der kører uafhængigt af hinanden:
 *
 *   Udstyr:   Bestilt → Bekræftet → Pakket → Udleveret → Returneret  (+ tjekket ved retur)
 *   Betaling: leje betalt eller ej (online/MobilePay/kontant) + evt. depositum
 *
 * Sagen er først lukket når begge spor er i mål — ikke når datoen er passeret.
 * Datoerne kommer fra lejeperioden (pickup/returnDate), ikke fra oprettelsen.
 */

import { isFullyPaid, paymentStatus, outstanding, type PayableBooking } from "@/lib/payments";

export type DepositState = "afventer" | "modtaget" | "tilbagebetalt";
export type PaidMethod = "mobilepay" | "kontant" | "bank";

/** Minimum af felter fra en booking som statuslogikken har brug for */
export interface StageBooking {
  id: string;
  createdAt: string;
  status: string;
  days: number;
  /** Lejeperiodens start/slut som ISO — sat af kalenderen ved booking */
  pickup?: string;
  returnDate?: string;
  /** Ordrens beløb — betalingsstatus regnes mod det */
  total?: number;
  /** Indbetalinger (kan være flere, med hver sin metode) */
  payments?: PayableBooking["payments"];
  /** Faktureret men ikke betalt tæller stadig som udestående */
  invoice?: PayableBooking["invoice"];
  /** Betalt online via Stripe */
  paid?: boolean;
  /** Admin har kvitteret for MobilePay/kontant/bank */
  paidManual?: boolean;
  paidMethod?: PaidMethod;
  /** Depositum i kr — 0/undefined betyder at der ikke er taget depositum */
  depositAmount?: number;
  depositState?: DepositState;
  /** Udstyret er tjekket og fundet i orden ved retur */
  inspected?: boolean;
}

// ---------------------------------------------------------------- udstyrssporet

/**
 * Trinnene udstyret går igennem. Ids er uændrede fra det oprindelige flow,
 * fordi gamle bookinger i KV bruger dem — kun visningen er ny. "pakket" er
 * tilføjet som valgfrit trin mellem bekræftelse og udlevering.
 */
export const EQUIPMENT_STEPS = [
  { id: "ny", label: "Bestilt", icon: "📋", bg: "#fff3cd", text: "#856404", border: "#ffc107" },
  { id: "bekraeftet", label: "Bekræftet", icon: "✅", bg: "#cce5ff", text: "#004085", border: "#4dabf7" },
  { id: "pakket", label: "Pakket", icon: "📦", bg: "#ede4ff", text: "#4b2ea3", border: "#7c5cd6" },
  { id: "afhentet", label: "Udleveret", icon: "🚚", bg: "#d4edda", text: "#155724", border: "#28a745" },
  { id: "afleveret", label: "Returneret", icon: "↩️", bg: "#e2e3e5", text: "#383d41", border: "#6c757d" },
] as const;

export const CANCEL_STEPS = [
  { id: "annulleret_kunde", label: "Annulleret af kunde", icon: "⛔", bg: "#fdecea", text: "#c0392b", border: "#dc3545" },
  { id: "annulleret_admin", label: "Annulleret af admin", icon: "⛔", bg: "#f8d7da", text: "#721c24", border: "#dc3545" },
] as const;

export type StepMeta = { id: string; label: string; icon: string; bg: string; text: string; border: string };

const STEP_BY_ID: Record<string, StepMeta> = Object.fromEntries(
  [...EQUIPMENT_STEPS, ...CANCEL_STEPS].map((s) => [s.id, s as StepMeta]),
);

export function stepMeta(status: string): StepMeta {
  return STEP_BY_ID[status] ?? { id: status, label: status, icon: "•", bg: "#f0f0f0", text: "#555", border: "#ccc" };
}

export function isCancelled(b: StageBooking): boolean {
  return String(b.status).startsWith("annulleret");
}

export function isHandedOut(b: StageBooking): boolean {
  return b.status === "afhentet" || b.status === "afleveret";
}

export function isReturned(b: StageBooking): boolean {
  return b.status === "afleveret";
}

/** Næste trin i udstyrssporet, eller null når det er i mål */
export function nextStep(status: string): StepMeta | null {
  const idx = EQUIPMENT_STEPS.findIndex((s) => s.id === status);
  if (idx < 0 || idx >= EQUIPMENT_STEPS.length - 1) return null;
  return EQUIPMENT_STEPS[idx + 1] as StepMeta;
}

// -------------------------------------------------------------- betalingssporet

export const PAID_METHOD_LABELS: Record<PaidMethod, string> = {
  mobilepay: "MobilePay",
  kontant: "Kontant",
  bank: "Bankoverførsel",
};

/**
 * Er lejen betalt fuldt ud. En ordre med kun en delbetaling tæller IKKE som
 * betalt — den mangler stadig penge, og sagen kan ikke lukkes.
 */
export function isPaid(b: StageBooking): boolean {
  return isFullyPaid(b as PayableBooking);
}

/** Hvad der mangler at komme ind på ordren */
export function missingAmount(b: StageBooking): number {
  return outstanding(b as PayableBooking);
}

export function hasDeposit(b: StageBooking): boolean {
  return (b.depositAmount ?? 0) > 0;
}

/** Depositum er afklaret når der ikke er noget, eller når det er betalt tilbage */
export function depositSettled(b: StageBooking): boolean {
  return !hasDeposit(b) || b.depositState === "tilbagebetalt";
}

/** Begge dele af betalingssporet er i mål */
export function paymentSettled(b: StageBooking): boolean {
  return isPaid(b) && depositSettled(b);
}

// --------------------------------------------------------------------- stadier

export type Stage = "afslut" | "igangvaerende" | "kommende" | "afsluttet" | "annulleret";

export const STAGE_META: Record<Stage, { label: string; hint: string; order: number; bg: string; text: string; border: string }> = {
  afslut: { label: "Skal afsluttes", hint: "Mangler retur, betaling eller depositum", order: 0, bg: "#f8d7da", text: "#721c24", border: "#dc3545" },
  igangvaerende: { label: "Igangværende", hint: "Udstyret er ude nu", order: 1, bg: "#d4edda", text: "#155724", border: "#28a745" },
  kommende: { label: "Kommende", hint: "Endnu ikke udleveret", order: 2, bg: "#cce5ff", text: "#004085", border: "#4dabf7" },
  afsluttet: { label: "Afsluttet", hint: "Returneret og betalt", order: 3, bg: "#e2e3e5", text: "#383d41", border: "#6c757d" },
  annulleret: { label: "Annulleret", hint: "Datoerne er frigivet igen", order: 4, bg: "#fdecea", text: "#c0392b", border: "#dc3545" },
};

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseDate(v?: string): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Lejeperiodens første dag. Nye bookinger bærer pickup fra kalenderen;
 * gamle uden pickup falder tilbage på id-præfikset (= oprettelsesdato).
 */
export function pickupDateFromBooking(b: StageBooking): Date {
  const d = parseDate(b.pickup);
  if (d) return startOfDay(d);
  const m = b.id.match(/^(\d{4})(\d{2})(\d{2})/);
  if (m) return startOfDay(new Date(`${m[1]}-${m[2]}-${m[3]}`));
  return startOfDay(new Date(b.createdAt));
}

/** Afleveringsdagen — udstyret er ude til og med dagen før */
export function returnDateFromBooking(b: StageBooking): Date {
  const d = parseDate(b.returnDate);
  if (d) return startOfDay(d);
  const p = pickupDateFromBooking(b);
  p.setDate(p.getDate() + Math.max(1, b.days || 1));
  return p;
}

export function bookingStage(b: StageBooking, today: Date): Stage {
  if (isCancelled(b)) return "annulleret";
  if (isReturned(b)) return paymentSettled(b) ? "afsluttet" : "afslut";
  // Perioden er forbi uden at udstyret er registreret retur
  if (returnDateFromBooking(b) < today) return "afslut";
  if (b.status === "afhentet" || pickupDateFromBooking(b) <= today) return "igangvaerende";
  return "kommende";
}

/** En sag hører til det aktive overblik indtil den er lukket eller annulleret */
export function isActiveStage(stage: Stage): boolean {
  return stage === "afslut" || stage === "igangvaerende" || stage === "kommende";
}

export type IssueTrack = "udstyr" | "betaling";
export interface OpenIssue {
  track: IssueTrack;
  label: string;
}

/**
 * Hvad mangler der, før sagen kan lukkes. Hver sag hører til det spor der kan
 * løse den, så advarslen står ved den kontrol man skal bruge.
 *
 * Bemærk at "ikke registreret retur" først giver mening når udstyret rent
 * faktisk er udleveret — er det aldrig blevet det, er det udleveringen der
 * mangler at blive registreret.
 */
export function openIssues(b: StageBooking, today: Date): OpenIssue[] {
  if (isCancelled(b)) return [];
  const issues: OpenIssue[] = [];
  const overdue = returnDateFromBooking(b) < today;

  if (!isReturned(b) && overdue) {
    issues.push({
      track: "udstyr",
      label: b.status === "afhentet" ? "Ikke registreret retur" : "Aldrig registreret udleveret",
    });
  }
  if (isHandedOut(b) && !isPaid(b)) {
    const mangler = missingAmount(b);
    const delvis = paymentStatus(b as PayableBooking) === "delvis";
    issues.push({
      track: "betaling",
      label: delvis ? `Mangler ${mangler} kr` : b.invoice ? `Faktura ubetalt (${mangler} kr)` : "Betaling mangler",
    });
  }
  // De to depositum-advarsler udelukker hinanden: enten mangler pengene at
  // komme ind, eller også sidder vi på dem og skal give dem tilbage
  if (hasDeposit(b) && isHandedOut(b)) {
    if (b.depositState !== "modtaget" && b.depositState !== "tilbagebetalt") {
      issues.push({ track: "betaling", label: "Depositum ikke modtaget" });
    } else if (b.depositState === "modtaget" && isReturned(b)) {
      issues.push({ track: "betaling", label: "Depositum ikke tilbagebetalt" });
    }
  }
  return issues;
}

// ------------------------------------------------------------ weekendgruppering

/**
 * Weekenden en booking hører til: fredagen i lejeperiodens start.
 * Man–fre peger frem til ugens fredag; lør/søn peger tilbage på fredagen,
 * så en lørdagsafhentning ikke havner i weekenden efter.
 */
export function weekendFriday(b: StageBooking): Date {
  const d = pickupDateFromBooking(b);
  const day = d.getDay(); // 0 = søn, 5 = fre, 6 = lør
  const offset = day === 0 ? -2 : day === 6 ? -1 : 5 - day;
  const fri = new Date(d);
  fri.setDate(d.getDate() + offset);
  return fri;
}

export function weekendKey(b: StageBooking): string {
  const fri = weekendFriday(b);
  return `${fri.getFullYear()}-${String(fri.getMonth() + 1).padStart(2, "0")}-${String(fri.getDate()).padStart(2, "0")}`;
}

export function formatWeekendLabel(key: string): string {
  const fri = new Date(key);
  const sun = new Date(fri); sun.setDate(fri.getDate() + 2);
  const fmtFri = fri.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
  const fmtSun = sun.toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });
  return `${fmtFri} – ${fmtSun}`;
}
