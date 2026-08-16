/**
 * Betaling på en ordre — én sandhed for admin, sagsstatus og regnskab.
 *
 * En ordre betales ikke nødvendigvis i én bid med én metode: 500 kontant ved
 * afhentning og resten på MobilePay bagefter, eller online betaling og så
 * tilkøb i døren. Derfor er betaling en LISTE af indbetalinger, og status
 * regnes ud fra summen — ikke ét flueben.
 *
 * Fakturering er en tilstand, ikke en betaling: en faktureret ordre er stadig
 * ubetalt, indtil pengene er der.
 */

export type PaymentMethod = "mobilepay" | "kontant" | "bank" | "kort" | "andet";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mobilepay: "MobilePay",
  kontant: "Kontant",
  bank: "Bankoverførsel",
  kort: "Kort (online)",
  andet: "Andet",
};

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  mobilepay: "📱",
  kontant: "💵",
  bank: "🏦",
  kort: "💳",
  andet: "•",
};

export interface Payment {
  id: string;
  /** Beløb i kr — altid positivt */
  amount: number;
  method: PaymentMethod;
  /** Hvornår pengene kom ind */
  paidAt: string;
  note?: string;
  /** stripe = registreret af webhooken, manuel = tastet i admin */
  source?: "stripe" | "manuel";
}

export interface Invoice {
  /** Løbenummer, fx 2026-014 */
  number: string;
  /** Sat når fakturaen er sendt til kunden */
  sentAt?: string;
  /** Betalingsfrist (ISO-dato) */
  dueDate: string;
  /** Beløb der blev faktureret */
  amount: number;
}

/** De felter betalingslogikken har brug for — nye som gamle bookinger */
export interface PayableBooking {
  total: number;
  payments?: Payment[];
  invoice?: Invoice | null;
  /** Gammel model: Stripe-betaling */
  paid?: boolean;
  paidAmount?: number;
  paidAt?: string;
  /** Gammel model: admin kvitterede for kontant/MobilePay/bank */
  paidManual?: boolean;
  paidMethod?: string;
}

export type PaymentStatus = "betalt" | "delvis" | "ubetalt";

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; short: string; bg: string; text: string; border: string }> = {
  betalt: { label: "Betalt", short: "BETALT", bg: "#d4edda", text: "#155724", border: "#28a745" },
  delvis: { label: "Delvis betalt", short: "DELVIS BETALT", bg: "#fff3cd", text: "#8a5b00", border: "#f0ad4e" },
  ubetalt: { label: "Ikke betalt", short: "IKKE BETALT", bg: "#fdecea", text: "#c0392b", border: "#e74c3c" },
};

/** Øre → kr, uden at et manglende beløb bliver til 0 kr. */
function oreToKr(ore: number | undefined, fallback: number): number {
  if (typeof ore !== "number" || !Number.isFinite(ore) || ore <= 0) return fallback;
  return Math.round(ore / 100);
}

/**
 * Ordrens indbetalinger. Bookinger fra før betalingslisten oversættes til
 * én syntetisk indbetaling, så gamle ordrer ikke pludselig står som ubetalte.
 */
export function paymentsOf(b: PayableBooking): Payment[] {
  if (Array.isArray(b.payments) && b.payments.length) {
    return [...b.payments].sort((x, y) => String(x.paidAt).localeCompare(String(y.paidAt)));
  }
  const legacy: Payment[] = [];
  if (b.paid) {
    legacy.push({
      id: "legacy-stripe",
      amount: oreToKr(b.paidAmount, b.total || 0),
      method: "kort",
      paidAt: b.paidAt || "",
      source: "stripe",
      note: "Registreret af Stripe (før betalingslisten)",
    });
  } else if (b.paidManual) {
    const method = (["mobilepay", "kontant", "bank", "kort", "andet"] as PaymentMethod[]).includes(b.paidMethod as PaymentMethod)
      ? (b.paidMethod as PaymentMethod)
      : "kontant";
    legacy.push({
      id: "legacy-manuel",
      amount: b.total || 0,
      method,
      paidAt: b.paidAt || "",
      source: "manuel",
      note: "Kvitteret i admin (før betalingslisten)",
    });
  }
  return legacy;
}

export function paidAmount(b: PayableBooking): number {
  return paymentsOf(b).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

/** Hvad der mangler at blive betalt — aldrig negativt */
export function outstanding(b: PayableBooking): number {
  if (legacyFullyPaid(b)) return 0;
  return Math.max(0, Math.round((b.total || 0) - paidAmount(b)));
}

/** Har kunden betalt for meget (fx annulleret tilkøb)? */
export function overpaid(b: PayableBooking): number {
  return Math.max(0, Math.round(paidAmount(b) - (b.total || 0)));
}

/** Gammel model: fluebenet betød "fuldt betalt", uanset hvad beløbet var */
function legacyFullyPaid(b: PayableBooking): boolean {
  const hasList = Array.isArray(b.payments) && b.payments.length > 0;
  return !hasList && (!!b.paid || !!b.paidManual);
}

export function paymentStatus(b: PayableBooking): PaymentStatus {
  if (legacyFullyPaid(b)) return "betalt";
  const paid = paidAmount(b);
  if (paid <= 0) return "ubetalt";
  // 1 kr slør, så afrundinger fra Stripe ikke efterlader en "delvis" ordre
  return paid >= (b.total || 0) - 1 ? "betalt" : "delvis";
}

export function isFullyPaid(b: PayableBooking): boolean {
  return paymentStatus(b) === "betalt";
}

/** Faktureret men ikke betalt — pengene skal stadig hjem */
export function isInvoiced(b: PayableBooking): boolean {
  return !!b.invoice && !isFullyPaid(b);
}

export function isOverdue(b: PayableBooking, today: string): boolean {
  return isInvoiced(b) && !!b.invoice?.dueDate && b.invoice.dueDate < today;
}

/** Sum pr. betalingsmetode — bruges i regnskabet */
export function byMethod(bookings: PayableBooking[]): Record<PaymentMethod, number> {
  const out = { mobilepay: 0, kontant: 0, bank: 0, kort: 0, andet: 0 } as Record<PaymentMethod, number>;
  for (const b of bookings) {
    for (const p of paymentsOf(b)) {
      const m = (out[p.method] === undefined ? "andet" : p.method) as PaymentMethod;
      out[m] += Number(p.amount) || 0;
    }
  }
  return out;
}

/** Kort opsummering til en linje i admin: "1.480 kr · mangler 900 kr" */
export function paymentSummaryText(b: PayableBooking): string {
  const status = paymentStatus(b);
  if (status === "betalt") {
    const methods = [...new Set(paymentsOf(b).map((p) => PAYMENT_METHOD_LABELS[p.method] ?? p.method))];
    return methods.length ? methods.join(" + ") : "Betalt";
  }
  if (status === "delvis") return `Mangler ${outstanding(b)} kr af ${b.total} kr`;
  return b.invoice ? `Faktureret — forfalder ${b.invoice.dueDate}` : "Intet modtaget";
}

/** Fakturanummer: løbenummer pr. år, fx 2026-014 */
export function nextInvoiceNumber(existing: string[], year: number): string {
  const prefix = `${year}-`;
  const numbers = existing
    .filter((n) => typeof n === "string" && n.startsWith(prefix))
    .map((n) => Number(n.slice(prefix.length)))
    .filter((n) => Number.isFinite(n));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}
