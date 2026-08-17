/**
 * Betaling: delbetalinger, flere metoder, faktura og regnskab.
 *
 * Frederik 16. aug 2026: "Betaling skal være betalt, delvis betalt og ikke
 * betalt. Betalingsmetoder kan der være flere af." — og en faktureret ordre
 * er ikke betalt, den er faktureret.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  paymentsOf,
  paidAmount,
  outstanding,
  overpaid,
  paymentStatus,
  isInvoiced,
  isOverdue,
  byMethod,
  paymentSummaryText,
  nextInvoiceNumber,
  type Payment,
} from "@/lib/payments";
import { buildAccounting, allocateRevenue, weekendFriday, revenueDate } from "../../functions/api/_lib/accounting";
import { microsToMajor } from "../../functions/api/_lib/googleads";

const pay = (amount: number, method: Payment["method"], paidAt = "2026-08-15T10:00:00Z"): Payment => ({
  id: `p${amount}${method}`, amount, method, paidAt, source: "manuel",
});

describe("Betalingsstatus", () => {
  it("er ubetalt uden indbetalinger", () => {
    expect(paymentStatus({ total: 1480 })).toBe("ubetalt");
    expect(outstanding({ total: 1480 })).toBe(1480);
  });

  it("er delvis betalt når der mangler penge", () => {
    const b = { total: 1480, payments: [pay(500, "kontant")] };
    expect(paymentStatus(b)).toBe("delvis");
    expect(paidAmount(b)).toBe(500);
    expect(outstanding(b)).toBe(980);
    expect(paymentSummaryText(b)).toBe("Mangler 980 kr af 1480 kr");
  });

  it("er betalt når summen af flere metoder rammer totalen", () => {
    const b = { total: 1480, payments: [pay(500, "kontant"), pay(980, "mobilepay")] };
    expect(paymentStatus(b)).toBe("betalt");
    expect(outstanding(b)).toBe(0);
    expect(paymentSummaryText(b)).toBe("Kontant + MobilePay");
  });

  it("online betalt ordre med tilkøb bliver delvis betalt igen", () => {
    // Betalt 895 online, derefter lagt en røgmaskine til i døren
    const b = { total: 1140, payments: [{ ...pay(895, "kort"), source: "stripe" as const }] };
    expect(paymentStatus(b)).toBe("delvis");
    expect(outstanding(b)).toBe(245);
  });

  it("opdager overbetaling uden at gøre restbeløbet negativt", () => {
    const b = { total: 900, payments: [pay(1000, "bank")] };
    expect(outstanding(b)).toBe(0);
    expect(overpaid(b)).toBe(100);
    expect(paymentStatus(b)).toBe("betalt");
  });

  it("tåler 1 krones afrunding fra Stripe", () => {
    expect(paymentStatus({ total: 1480, payments: [pay(1479, "kort")] })).toBe("betalt");
  });
});

describe("Gamle bookinger", () => {
  it("tæller stadig som betalt efter modelskiftet", () => {
    expect(paymentStatus({ total: 1480, paidManual: true, paidMethod: "mobilepay" })).toBe("betalt");
    expect(paymentStatus({ total: 1480, paid: true, paidAmount: 148000 })).toBe("betalt");
    expect(outstanding({ total: 1480, paidManual: true })).toBe(0);
  });

  it("oversættes til én indbetaling med den rigtige metode", () => {
    const legacy = paymentsOf({ total: 1480, paid: true, paidAmount: 148000, paidAt: "2026-08-01T09:00:00Z" });
    expect(legacy).toHaveLength(1);
    expect(legacy[0]).toMatchObject({ amount: 1480, method: "kort", source: "stripe" });
  });

  it("lader betalingslisten vinde når den findes", () => {
    const b = { total: 1000, paidManual: true, payments: [pay(400, "kontant")] };
    expect(paymentStatus(b)).toBe("delvis");
    expect(paidAmount(b)).toBe(400);
  });
});

describe("Faktura", () => {
  const faktureret = {
    total: 2400,
    invoice: { number: "2026-004", dueDate: "2026-08-24", amount: 2400 },
  };

  it("er ikke en betaling — ordren er stadig ubetalt", () => {
    expect(paymentStatus(faktureret)).toBe("ubetalt");
    expect(isInvoiced(faktureret)).toBe(true);
    expect(paymentSummaryText(faktureret)).toContain("Faktureret");
  });

  it("holder op med at være udestående når pengene kommer", () => {
    const betalt = { ...faktureret, payments: [pay(2400, "bank")] };
    expect(paymentStatus(betalt)).toBe("betalt");
    expect(isInvoiced(betalt)).toBe(false);
  });

  it("er forfalden når fristen er passeret", () => {
    expect(isOverdue(faktureret, "2026-08-25")).toBe(true);
    expect(isOverdue(faktureret, "2026-08-20")).toBe(false);
  });

  it("nummererer løbende pr. år", () => {
    expect(nextInvoiceNumber([], 2026)).toBe("2026-001");
    expect(nextInvoiceNumber(["2026-001", "2026-009", "2025-014"], 2026)).toBe("2026-010");
  });
});

describe("Betalingsmetoder på tværs af ordrer", () => {
  it("lægger sammen pr. metode", () => {
    const sums = byMethod([
      { total: 1000, payments: [pay(600, "kontant"), pay(400, "mobilepay")] },
      { total: 500, payments: [pay(500, "mobilepay")] },
      { total: 895, paid: true, paidAmount: 89500 },
    ]);
    expect(sums.kontant).toBe(600);
    expect(sums.mobilepay).toBe(900);
    expect(sums.kort).toBe(895);
    expect(sums.bank).toBe(0);
  });
});

// ───────────────────────────────────────────────────────── regnskab

const priceOf = (id: string) =>
  ({
    festival: { name: "Stor højtalerpakke", price: 495 },
    lys: { name: "Lys-pakke", price: 495 },
    rog: { name: "Røgmaskine", price: 245 },
    lyskaeder: { name: "Lyskæde varm hvid", price: 195 },
  })[id];

describe("Regnskab", () => {
  const bookings = [
    {
      id: "booking_1", name: "Julie", total: 1235, pickup: "2026-08-21", period: "fre → man",
      speakerId: "festival", addonIds: ["lys", "rog"], addons: ["Lys-pakke", "Røgmaskine"],
      payments: [pay(500, "kontant"), pay(735, "mobilepay")],
    },
    {
      id: "booking_2", name: "Peter", company: "Novo", total: 2000, pickup: "2026-08-22",
      period: "lør → man", speakerId: "festival",
      invoice: { number: "2026-002", dueDate: "2026-08-20", amount: 2000 },
    },
    {
      id: "booking_3", name: "Annulleret", total: 900, pickup: "2026-08-21",
      status: "annulleret_kunde", speakerId: "lyskaeder",
    },
    {
      id: "booking_4", name: "Uden for perioden", total: 5000, pickup: "2026-09-30", speakerId: "festival",
    },
  ];

  // Testdata har kun pickup-datoer, så opgørelsen køres på lejeperioden
  const sum = buildAccounting(bookings, priceOf, "2026-08-01", "2026-08-31", "2026-08-25", "leje");

  it("tæller kun ordrer i perioden og springer annullerede over", () => {
    expect(sum.orders).toBe(2);
    expect(sum.cancelled).toBe(1);
    expect(sum.revenue).toBe(3235);
  });

  it("holder styr på betalt og udestående", () => {
    expect(sum.paid).toBe(1235);
    expect(sum.outstanding).toBe(2000);
    expect(sum.averageOrder).toBe(1618);
  });

  it("fordeler ordren på produkter efter katalogpriserne", () => {
    const festival = sum.byProduct.find((p) => p.id === "festival")!;
    const rog = sum.byProduct.find((p) => p.id === "rog")!;
    expect(festival.count).toBe(2);
    expect(rog.count).toBe(1);
    // Summen af fordelingen er ordrernes total — ingen omsætning opfundet
    expect(sum.byProduct.reduce((s, p) => s + p.revenue, 0)).toBe(sum.revenue);
  });

  it("samler ordrer på deres weekend", () => {
    // 21. aug 2026 er en fredag; lørdag den 22. hører til samme weekend
    expect(sum.byWeekend).toHaveLength(1);
    expect(sum.byWeekend[0]).toMatchObject({ friday: "2026-08-21", orders: 2, revenue: 3235 });
  });

  it("lister ubetalte med faktura og forfald", () => {
    expect(sum.unpaid).toHaveLength(1);
    expect(sum.unpaid[0]).toMatchObject({
      name: "Peter", outstanding: 2000, status: "ubetalt",
      invoiceNumber: "2026-002", overdue: true,
    });
  });

  it("opgør betalingsmetoder", () => {
    expect(sum.byMethod).toEqual([
      { method: "mobilepay", amount: 735 },
      { method: "kontant", amount: 500 },
    ]);
  });
});

describe("Fordeling af rabat", () => {
  it("skalerer linjerne ned så de rammer ordrens faktiske total", () => {
    // Listepris 990, men ordren blev solgt til 890 (rabatkode)
    const lines = allocateRevenue(
      { id: "x", total: 890, speakerId: "festival", addonIds: ["lys"], addons: ["Lys-pakke"] },
      priceOf,
    );
    expect(lines.reduce((s, l) => s + l.amount, 0)).toBe(890);
  });

  it("mister ikke en ordre uden kendte produkter", () => {
    const lines = allocateRevenue({ id: "y", total: 400 }, () => undefined);
    expect(lines).toEqual([{ id: "ukendt", name: "Uspecificeret", amount: 400 }]);
  });
});

describe("Bogføringsdato", () => {
  const ordre = { id: "z", total: 0, pickup: "2026-08-21T00:00:00Z", createdAt: "2026-07-01T10:00:00Z" };

  it("bogfører på bestillingsdatoen som standard — det er den annoncerne skal måles mod", () => {
    expect(revenueDate(ordre)).toBe("2026-07-01");
    expect(revenueDate(ordre, "booket")).toBe("2026-07-01");
  });

  it("kan i stedet bogføre på lejeperiodens start", () => {
    expect(revenueDate(ordre, "leje")).toBe("2026-08-21");
  });

  it("falder tilbage på den anden dato når én mangler", () => {
    expect(revenueDate({ id: "z", total: 0, createdAt: "2026-07-01T10:00:00Z" }, "leje")).toBe("2026-07-01");
    expect(revenueDate({ id: "z", total: 0, pickup: "2026-08-21T00:00:00Z" })).toBe("2026-08-21");
  });

  it("holder en juli-booking til en august-fest ude af august, når man måler på booket", () => {
    const juliOrdre = { id: "j", total: 2000, createdAt: "2026-07-28T09:00:00Z", pickup: "2026-08-21" };
    const august = buildAccounting([juliOrdre], priceOf, "2026-08-01", "2026-08-31", "2026-08-17", "booket");
    const augustLeje = buildAccounting([juliOrdre], priceOf, "2026-08-01", "2026-08-31", "2026-08-17", "leje");
    expect(august.orders).toBe(0);
    expect(augustLeje.orders).toBe(1);
  });

  it("lægger lørdag og søndag på fredagen", () => {
    expect(weekendFriday("2026-08-22")).toBe("2026-08-21");
    expect(weekendFriday("2026-08-23")).toBe("2026-08-21");
    expect(weekendFriday("2026-08-21")).toBe("2026-08-21");
  });
});

describe("Annonceforbrug", () => {
  it("regner mikroenheder om til kroner", () => {
    expect(microsToMajor(1_000_000)).toBe(1);
    expect(microsToMajor("12345678")).toBe(12.35);
    expect(microsToMajor(undefined)).toBe(0);
  });
});

describe("API'erne bag betaling og faktura", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("validerer beløb og metode før en betaling gemmes", () => {
    const src = read("functions/api/bookings-update.ts");
    expect(src).toContain("add_payment");
    expect(src).toContain("delete_payment");
    expect(src).toContain("PAYMENT_METHODS");
    expect(src).toMatch(/amount <= 0 \|\| amount > 1000000/);
  });

  it("giver fakturaen et løbenummer og kræver forfaldsdato", () => {
    const src = read("functions/api/bookings-update.ts");
    expect(src).toContain("invoice_seq_");
    expect(src).toContain("Forfaldsdato skal være YYYY-MM-DD");
  });

  it("sender fakturamail med linjer, restbeløb og betalingsoplysninger", () => {
    const mail = read("functions/api/_lib/invoiceMail.ts");
    expect(mail).toContain("At betale");
    expect(mail).toContain("Allerede betalt");
    expect(mail).toContain("bankReg");
    expect(mail).toContain("mobilePay");

    const api = read("functions/api/invoice.ts");
    expect(api).toContain("ADMIN_SECRET");
    expect(api).toContain("resend.com/emails");
    // Fakturaen skal logges, så man kan se hvad kunden har fået
    expect(api).toMatch(/communications[\s\S]{0,200}faktura/);
  });

  it("kræver adminnøgle på regnskabstallene", () => {
    const src = read("functions/api/accounting.ts");
    expect(src).toContain("requireAdmin");
    expect(src).toContain("buildAccounting");
  });

  it("henter annonceforbrug pr. kampagne for perioden", () => {
    const lib = read("functions/api/_lib/googleads.ts");
    expect(lib).toContain("campaignSpend");
    expect(lib).toContain("metrics.cost_micros");
    expect(lib).toContain("segments.date BETWEEN");
    // Én række pr. dag pr. kampagne — de skal lægges sammen
    expect(lib).toMatch(/row\.cost \+= microsToMajor/);

    const api = read("functions/api/ads-spend.ts");
    // requireAdmin, ikke en egen sammenligning mod ADMIN_SECRET. Endpointet
    // importerede requireAdmin uden at kalde den og tjekkede stadig query-
    // parameteren mod den fælles hemmelighed. Efter overgangen til navngivne
    // brugere sender admin et session-token, så tjekket fejlede altid — og
    // annonceforbruget så ud til at mangle på /accounting.
    expect(api).toContain("requireAdmin(context, cors)");
    expect(api).not.toMatch(/searchParams\.get\("secret"\) !== context\.env\.ADMIN_SECRET/);
    expect(api).toContain("AdsNotConfigured");
    // Regnskabstallene må ikke falde med Google Ads
    expect(read("functions/api/accounting.ts")).not.toContain("campaignSpend");
  });

  it("lægger Stripe-betalinger på betalingslisten", () => {
    const src = read("functions/api/stripe/webhook.ts");
    expect(src).toContain("booking.payments = payments");
    expect(src).toContain('method: "kort"');
  });
});
