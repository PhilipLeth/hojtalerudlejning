import { describe, it, expect } from "vitest";
import { invoiceHtml, type InvoiceMailData } from "../../functions/api/_lib/invoiceMail";

const base: InvoiceMailData = {
  invoiceNumber: "TEST-2026-001",
  issuedAt: "2026-11-26T12:00:00Z",
  dueDate: "2026-12-04",
  customerName: "Testkunde",
  email: "kunde@example.com",
  period: "23.–26. november 2026",
  lines: [{ label: "Testleje", qty: 1, amount: 1250 }],
  total: 1250,
  alreadyPaid: 0,
  amountDue: 1250,
};

function cells(data: InvoiceMailData, label: string) {
  const document = new DOMParser().parseFromString(invoiceHtml(data), "text/html");
  const row = [...document.querySelectorAll("tr")].find((tr) => tr.cells[0]?.textContent?.trim() === label);
  return row?.cells[1]?.textContent?.trim();
}

describe("Moms på fakturaen", () => {
  it.each([
    [1250, "250,00 kr"],
    [999, "199,80 kr"],
    [980, "196,00 kr"],
    [999.99, "200,00 kr"],
    [0, "0,00 kr"],
  ])("viser moms af hele totalen %s", (total, moms) => {
    expect(cells({ ...base, total, amountDue: total }, "Heraf moms (25 %)" )).toBe(moms);
  });

  it("bevarer momsgrundlaget ved delbetaling", () => {
    const data = { ...base, alreadyPaid: 500, amountDue: 750 };
    expect(cells(data, "I alt inkl. moms")).toBe("1.250 kr");
    expect(cells(data, "Heraf moms (25 %)")).toBe("250,00 kr");
    expect(cells(data, "Allerede betalt")).toBe("− 500 kr");
    expect(cells(data, "At betale")).toBe("750 kr");
  });

  it("bevarer øre i fakturatotal og restbeløb", () => {
    const data = { ...base, total: 999.99, alreadyPaid: 500, amountDue: 499.99 };
    expect(cells(data, "I alt inkl. moms")).toBe("999,99 kr");
    expect(cells(data, "At betale")).toBe("499,99 kr");
  });
});
