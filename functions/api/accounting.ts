/**
 * GET  /api/accounting?from=&to=&secret=  — regnskabstal for en periode
 * POST /api/accounting?secret=            — gem regnskabsindstillinger
 *
 * Tallene regnes server-side ud fra bookingerne i KV, så /accounting-siden
 * ikke skal hente og gennemgå alle ordrer i browseren.
 */
import { loadPriceTable } from "./_lib/pricing";
import { buildAccounting, type AccountingBooking, type RevenueBasis } from "./_lib/accounting";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const SETTINGS_KEY = "accounting_settings";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

function unauthorized(context: { request: Request; env: Env }): boolean {
  const secret = new URL(context.request.url).searchParams.get("secret");
  return !context.env.ADMIN_SECRET || secret !== context.env.ADMIN_SECRET;
}

export interface AccountingSettings {
  /** Månedsmål i kr — 0 betyder intet mål */
  monthlyTarget: number;
  bankReg: string;
  bankKonto: string;
  mobilePay: string;
  /** Standard betalingsfrist i dage på fakturaer */
  paymentTermsDays: number;
  /** Fodnote på fakturaen, fx moms-oplysning */
  invoiceFooter: string;
}

const DEFAULT_SETTINGS: AccountingSettings = {
  monthlyTarget: 0,
  bankReg: "",
  bankKonto: "",
  mobilePay: "31 13 28 52",
  paymentTermsDays: 8,
  invoiceFooter: "",
};

async function readSettings(kv: KVNamespace): Promise<AccountingSettings> {
  try {
    const raw = await kv.get(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (unauthorized(context)) return json({ error: "Unauthorized" }, 401);

  const url = new URL(context.request.url);
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = `${today.slice(0, 7)}-01`;
  const from = url.searchParams.get("from") || monthStart;
  const to = url.searchParams.get("to") || today;

  if (!isIsoDate(from) || !isIsoDate(to)) return json({ error: "from/to skal være YYYY-MM-DD" }, 400);
  // booket = datoen ordren kom ind (den man holder op mod annonceudgiften),
  // leje = lejeperiodens start (den man bruger til at se hvornår udstyret var ude)
  const basis: RevenueBasis = url.searchParams.get("basis") === "leje" ? "leje" : "booket";
  if (to < from) return json({ error: "to skal være >= from" }, 400);

  try {
    const [settings, table] = await Promise.all([
      readSettings(context.env.BOOKINGS),
      loadPriceTable(context.env.BOOKINGS),
    ]);

    const priceOf = (id: string) => {
      const hit = table.get(id);
      return hit ? { name: hit.name, price: Math.round(hit.unitAmount / 100) } : undefined;
    };

    const bookings: AccountingBooking[] = [];
    const list = await context.env.BOOKINGS.list({ prefix: "booking_" });
    for (const key of list.keys) {
      const value = await context.env.BOOKINGS.get(key.name);
      if (!value) continue;
      try {
        bookings.push({ ...JSON.parse(value), id: key.name });
      } catch {
        /* spring ulæselige poster over */
      }
    }

    const summary = buildAccounting(bookings, priceOf, from, to, today, basis);
    console.log("[accounting]", basis, from, "→", to, "ordrer=", summary.orders, "omsætning=", summary.revenue);

    return json({ ...summary, today, settings });
  } catch (e) {
    console.error("[accounting] error:", e);
    return json({ error: "Kunne ikke hente regnskabstal" }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (unauthorized(context)) return json({ error: "Unauthorized" }, 401);

  let body: Partial<AccountingSettings>;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const current = await readSettings(context.env.BOOKINGS);
  const next: AccountingSettings = {
    monthlyTarget: Math.max(0, Math.round(Number(body.monthlyTarget ?? current.monthlyTarget)) || 0),
    bankReg: String(body.bankReg ?? current.bankReg).slice(0, 20),
    bankKonto: String(body.bankKonto ?? current.bankKonto).slice(0, 30),
    mobilePay: String(body.mobilePay ?? current.mobilePay).slice(0, 30),
    paymentTermsDays: Math.min(60, Math.max(0, Math.round(Number(body.paymentTermsDays ?? current.paymentTermsDays)) || 0)),
    invoiceFooter: String(body.invoiceFooter ?? current.invoiceFooter).slice(0, 300),
  };

  await context.env.BOOKINGS.put(SETTINGS_KEY, JSON.stringify(next));
  return json({ ok: true, settings: next });
};
