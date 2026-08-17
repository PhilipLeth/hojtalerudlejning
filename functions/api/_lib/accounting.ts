/**
 * Regnskabstal ud af bookingerne.
 *
 * Ren logik uden KV, så den kan testes: ind kommer bookinger, en pristabel og
 * en periode — ud kommer omsætning, betalt, udestående, fordeling pr. produkt,
 * pr. weekend og pr. betalingsmetode.
 *
 * Omsætningen kan tælles på to måder, og forskellen er ikke akademisk:
 *
 *   booket — datoen ordren kom ind. Det er den man skal holde op mod
 *            annonceudgiften: en annoncekrone brugt i august giver bookinger i
 *            august, også selvom festen først er i september.
 *   leje   — lejeperiodens første dag. Det er den man skal bruge til at se
 *            hvornår udstyret var i arbejde.
 */
import {
  paidAmount,
  outstanding,
  paymentStatus,
  paymentsOf,
  type PayableBooking,
  type PaymentMethod,
} from "../../../src/lib/payments";

export interface AccountingBooking extends PayableBooking {
  id: string;
  name?: string;
  company?: string;
  status?: string;
  createdAt?: string;
  pickup?: string;
  returnDate?: string;
  period?: string;
  speaker?: string;
  speakerId?: string;
  addons?: string[];
  addonIds?: string[];
  cartItems?: Array<{ name?: string; price?: number; productId?: string }>;
}

export interface ProductRevenue {
  id: string;
  name: string;
  /** Antal gange produktet er lejet ud i perioden */
  count: number;
  revenue: number;
}

export interface WeekendRevenue {
  /** Fredagen i weekenden (YYYY-MM-DD) */
  friday: string;
  orders: number;
  revenue: number;
  paid: number;
  outstanding: number;
}

export interface UnpaidOrder {
  id: string;
  name: string;
  company?: string;
  period: string;
  pickup: string;
  total: number;
  paid: number;
  outstanding: number;
  status: "delvis" | "ubetalt";
  invoiceNumber?: string;
  dueDate?: string;
  overdue: boolean;
  daysSincePickup: number;
}

export interface AccountingSummary {
  from: string;
  to: string;
  basis: RevenueBasis;
  orders: number;
  /** Fakturerbar omsætning i perioden (ordrernes totaler) */
  revenue: number;
  paid: number;
  outstanding: number;
  averageOrder: number;
  cancelled: number;
  byProduct: ProductRevenue[];
  byWeekend: WeekendRevenue[];
  byMethod: Array<{ method: PaymentMethod; amount: number }>;
  unpaid: UnpaidOrder[];
}

export function isCancelled(b: AccountingBooking): boolean {
  return String(b.status || "").startsWith("annulleret");
}

function daysBetween(a: string, b: string): number {
  const x = Date.parse(`${a}T00:00:00Z`);
  const y = Date.parse(`${b}T00:00:00Z`);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
  return Math.round((y - x) / 86400000);
}

/** Fredagen i den weekend en dato hører til. Lør/søn peger tilbage. */
export function weekendFriday(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (isNaN(d.getTime())) return iso;
  const dow = d.getUTCDay(); // 0 = søn
  const offset = dow === 0 ? -2 : dow === 6 ? -1 : 5 - dow;
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

export type RevenueBasis = "booket" | "leje";

const isoDay = (v: unknown): string => {
  const d = String(v || "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : "";
};

/** Datoen udstyret er ude — bruges til weekendgrupperingen uanset opgørelse */
export function rentalDate(b: AccountingBooking): string {
  return isoDay(b.pickup) || isoDay(b.createdAt);
}

/** Datoen omsætningen bogføres på for den valgte opgørelse */
export function revenueDate(b: AccountingBooking, basis: RevenueBasis = "booket"): string {
  if (basis === "leje") return isoDay(b.pickup) || isoDay(b.createdAt);
  return isoDay(b.createdAt) || isoDay(b.pickup);
}

export interface PriceLookup {
  (id: string): { name: string; price: number } | undefined;
}

/**
 * Ordrens beløb fordelt på produkter. Katalogpriserne fortæller forholdet
 * mellem linjerne; summen skaleres til ordrens faktiske total, så rabatter og
 * manuelle justeringer ikke får regnskabet til at vise mere end der kom ind.
 */
export function allocateRevenue(
  b: AccountingBooking,
  priceOf: PriceLookup,
): Array<{ id: string; name: string; amount: number }> {
  const lines: Array<{ id: string; name: string; list: number }> = [];

  const push = (id: string | undefined, fallbackName: string, listPrice?: number) => {
    if (!id) return;
    const cat = priceOf(id);
    const price = typeof listPrice === "number" && listPrice > 0 ? listPrice : cat?.price ?? 0;
    lines.push({ id, name: cat?.name || fallbackName || id, list: price });
  };

  if (b.speakerId && b.speakerId !== "effects-only") push(b.speakerId, b.speaker || b.speakerId);
  for (const item of b.cartItems || []) push(item?.productId, item?.name || "", item?.price);
  (b.addonIds || []).forEach((id, i) => push(id, (b.addons || [])[i] || id));

  const total = Number(b.total) || 0;
  if (!lines.length) return total > 0 ? [{ id: "ukendt", name: "Uspecificeret", amount: total }] : [];

  const listSum = lines.reduce((s, l) => s + l.list, 0);
  if (listSum <= 0) {
    // Ingen kendte priser: fordel ligeligt, så ordren stadig tælles med
    const each = Math.round(total / lines.length);
    return lines.map((l) => ({ id: l.id, name: l.name, amount: each }));
  }

  const factor = total / listSum;
  const out = lines.map((l) => ({ id: l.id, name: l.name, amount: Math.round(l.list * factor) }));
  // Afrundingsrest lægges på den dyreste linje, så summen rammer totalen præcist
  const diff = total - out.reduce((s, l) => s + l.amount, 0);
  if (diff !== 0 && out.length) {
    const biggest = out.reduce((a, b2) => (b2.amount > a.amount ? b2 : a), out[0]);
    biggest.amount += diff;
  }
  return out;
}

export function buildAccounting(
  bookings: AccountingBooking[],
  priceOf: PriceLookup,
  from: string,
  to: string,
  today: string,
  basis: RevenueBasis = "booket",
): AccountingSummary {
  const inPeriod = bookings.filter((b) => {
    const d = revenueDate(b, basis);
    return d && d >= from && d <= to;
  });

  const live = inPeriod.filter((b) => !isCancelled(b));
  const cancelled = inPeriod.length - live.length;

  const products = new Map<string, ProductRevenue>();
  const weekends = new Map<string, WeekendRevenue>();
  const unpaid: UnpaidOrder[] = [];

  let revenue = 0;
  let paid = 0;
  let outstandingSum = 0;

  for (const b of live) {
    const total = Number(b.total) || 0;
    const bPaid = paidAmount(b);
    const bOut = outstanding(b);
    revenue += total;
    paid += bPaid;
    outstandingSum += bOut;

    for (const line of allocateRevenue(b, priceOf)) {
      const row = products.get(line.id) ?? { id: line.id, name: line.name, count: 0, revenue: 0 };
      row.count += 1;
      row.revenue += line.amount;
      row.name = line.name || row.name;
      products.set(line.id, row);
    }

    const friday = weekendFriday(rentalDate(b));
    const w = weekends.get(friday) ?? { friday, orders: 0, revenue: 0, paid: 0, outstanding: 0 };
    w.orders += 1;
    w.revenue += total;
    w.paid += bPaid;
    w.outstanding += bOut;
    weekends.set(friday, w);

    const status = paymentStatus(b);
    if (status !== "betalt") {
      const pickup = rentalDate(b);
      unpaid.push({
        id: b.id,
        name: b.name || "",
        company: b.company,
        period: b.period || "",
        pickup,
        total,
        paid: bPaid,
        outstanding: bOut,
        status,
        invoiceNumber: b.invoice?.number,
        dueDate: b.invoice?.dueDate,
        overdue: !!b.invoice?.dueDate && b.invoice.dueDate < today,
        daysSincePickup: pickup ? daysBetween(pickup, today) : 0,
      });
    }
  }

  const methodTotals = new Map<PaymentMethod, number>();
  for (const b of live) {
    for (const p of paymentsOf(b)) {
      methodTotals.set(p.method, (methodTotals.get(p.method) || 0) + (Number(p.amount) || 0));
    }
  }

  return {
    from,
    to,
    basis,
    orders: live.length,
    revenue,
    paid,
    outstanding: outstandingSum,
    averageOrder: live.length ? Math.round(revenue / live.length) : 0,
    cancelled,
    byProduct: [...products.values()].sort((a, b) => b.revenue - a.revenue),
    byWeekend: [...weekends.values()].sort((a, b) => a.friday.localeCompare(b.friday)),
    byMethod: [...methodTotals.entries()]
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => b.amount - a.amount),
    unpaid: unpaid.sort((a, b) => b.outstanding - a.outstanding),
  };
}
