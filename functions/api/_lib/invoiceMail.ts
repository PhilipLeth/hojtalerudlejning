/**
 * Fakturamail til kunden.
 *
 * Bruges når en ordre skal betales bagud — typisk erhverv, der beder om
 * bankoverførsel. Mailen er selve fakturaen: ordrelinjer, beløb, hvad der
 * allerede er betalt, hvad der mangler, og hvordan man betaler.
 */

import { DEFAULT_COMPANY, formatAddress } from "../../../src/lib/siteInfo";
import { DEFAULT_PHONE } from "../../../src/lib/phone";

export interface InvoiceLine {
  label: string;
  qty: number;
  amount?: number;
}

export interface InvoiceMailData {
  invoiceNumber: string;
  issuedAt: string;
  dueDate: string;
  customerName: string;
  company?: string;
  email: string;
  address?: string;
  period: string;
  lines: InvoiceLine[];
  total: number;
  alreadyPaid: number;
  amountDue: number;
  /** Betalingsoplysninger fra regnskabsindstillingerne */
  bankReg?: string;
  bankKonto?: string;
  mobilePay?: string;
  note?: string;
  /** Fast fodnote fra regnskabsindstillingerne, fx moms-oplysning */
  footer?: string;
  /** Sælgeren — udelades den, bruges standarden fra koden */
  seller?: InvoiceSeller;
}

/**
 * Sælgeren på fakturaen. Standarden er koden, men invoice.ts sender de levende
 * oplysninger fra /admin/indstillinger med, så en flytning eller en ny mail
 * også står på fakturaen.
 */
export interface InvoiceSeller {
  name: string;
  address: string;
  cvr: string;
  email: string;
  phone: string;
}

export const DEFAULT_SELLER: InvoiceSeller = {
  name: `${DEFAULT_COMPANY.name} (lejhøjtaler.dk)`,
  address: formatAddress(DEFAULT_COMPANY),
  cvr: DEFAULT_COMPANY.cvr,
  email: DEFAULT_COMPANY.email,
  phone: DEFAULT_PHONE.display,
};

function kr(n: number): string {
  return `${new Intl.NumberFormat("da-DK").format(Math.round(n))} kr`;
}

function dkDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
}

export function invoiceSubject(data: InvoiceMailData): string {
  return `Faktura ${data.invoiceNumber} — Lejhøjtaler.dk (${kr(data.amountDue)})`;
}

export function invoiceHtml(data: InvoiceMailData): string {
  // Sælgeren kommer fra /admin/indstillinger; standarden er koden
  const seller = data.seller ?? DEFAULT_SELLER;
  const rows = data.lines
    .map(
      (l) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${l.qty > 1 ? `${l.qty}× ` : ""}${l.label}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${
            typeof l.amount === "number" ? kr(l.amount) : ""
          }</td>
        </tr>`,
    )
    .join("");

  const paidRow =
    data.alreadyPaid > 0
      ? `<tr>
           <td style="padding:6px 0;color:#1e7e34;">Allerede betalt</td>
           <td style="padding:6px 0;text-align:right;color:#1e7e34;white-space:nowrap;">− ${kr(data.alreadyPaid)}</td>
         </tr>`
      : "";

  const betalingsmuligheder = [
    data.bankReg && data.bankKonto
      ? `<li style="margin-bottom:4px;"><strong>Bankoverførsel:</strong> reg. ${data.bankReg} konto ${data.bankKonto} — anfør <strong>${data.invoiceNumber}</strong></li>`
      : "",
    data.mobilePay ? `<li style="margin-bottom:4px;"><strong>MobilePay:</strong> ${data.mobilePay} — anfør ${data.invoiceNumber}</li>` : "",
  ]
    .filter(Boolean)
    .join("");

  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;color:#111;">
    <div style="border-bottom:3px solid #111;padding-bottom:12px;margin-bottom:20px;">
      <h1 style="margin:0;font-size:22px;">Faktura ${data.invoiceNumber}</h1>
      <p style="margin:4px 0 0;color:#666;font-size:13px;">
        Udstedt ${dkDate(data.issuedAt)} · Forfalder <strong style="color:#111;">${dkDate(data.dueDate)}</strong>
      </p>
    </div>

    <table style="width:100%;font-size:13px;color:#444;margin-bottom:20px;">
      <tr>
        <td style="vertical-align:top;">
          <strong style="color:#111;">Faktureres til</strong><br />
          ${data.company ? `${data.company}<br />` : ""}
          ${data.customerName}<br />
          ${data.address ? `${data.address}<br />` : ""}
          ${data.email}
        </td>
        <td style="vertical-align:top;text-align:right;">
          <strong style="color:#111;">${seller.name}</strong><br />
          ${seller.address}<br />
          CVR ${seller.cvr}<br />
          ${seller.email} · ${seller.phone}
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:13px;color:#666;"><strong style="color:#111;">Lejeperiode:</strong> ${data.period}</p>

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${rows}
      <tr>
        <td style="padding:10px 0 6px;font-weight:bold;">I alt</td>
        <td style="padding:10px 0 6px;text-align:right;font-weight:bold;white-space:nowrap;">${kr(data.total)}</td>
      </tr>
      ${paidRow}
      <tr>
        <td style="padding:10px 0;border-top:2px solid #111;font-size:17px;font-weight:bold;">At betale</td>
        <td style="padding:10px 0;border-top:2px solid #111;text-align:right;font-size:17px;font-weight:bold;white-space:nowrap;">${kr(data.amountDue)}</td>
      </tr>
    </table>

    <div style="background:#f7f7f7;border-radius:8px;padding:14px;margin:20px 0;font-size:13px;">
      <p style="margin:0 0 8px;font-weight:bold;">Betaling senest ${dkDate(data.dueDate)}</p>
      ${betalingsmuligheder ? `<ul style="margin:0;padding-left:18px;color:#444;">${betalingsmuligheder}</ul>` : `<p style="margin:0;color:#444;">Kontakt os på ${seller.email} for betalingsoplysninger.</p>`}
    </div>

    ${data.note ? `<p style="font-size:13px;color:#444;">${data.note}</p>` : ""}

    <p style="font-size:13px;color:#444;">Spørgsmål til fakturaen? Svar på denne mail, så kigger vi på det.</p>
    <p style="margin-top:20px;color:#999;font-size:12px;">
      ${seller.name} · ${seller.address} · CVR ${seller.cvr}${data.footer ? `<br />${data.footer}` : ""}
    </p>
  </div>`;
}
