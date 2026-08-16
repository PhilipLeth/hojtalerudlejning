"use client";

/**
 * Betalingen på én ordre: status, de enkelte indbetalinger, faktura og
 * depositum. Bruges både i admin-tabellen og på mobilkortet.
 *
 * En ordre kan betales ad flere gange og med flere metoder — 500 kontant i
 * døren og resten på MobilePay dagen efter — så panelet viser en liste, ikke
 * et flueben, og regner selv ud hvad der mangler.
 */

import { useState } from "react";
import {
  paymentsOf,
  paidAmount,
  outstanding,
  overpaid,
  paymentStatus,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
  PAYMENT_STATUS_META,
  type PayableBooking,
  type PaymentMethod,
} from "@/lib/payments";

export interface PaymentPanelBooking extends PayableBooking {
  id: string;
  depositAmount?: number;
  depositState?: string | null;
}

const METHODS: PaymentMethod[] = ["mobilepay", "kontant", "bank", "kort", "andet"];

const btn: React.CSSProperties = {
  padding: "6px 10px",
  fontSize: "12px",
  borderRadius: "6px",
  background: "#fff",
  cursor: "pointer",
  border: "1px solid #ddd",
  color: "#333",
};

function dk(n: number): string {
  return new Intl.NumberFormat("da-DK").format(Math.round(n));
}

function shortDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
}

export default function PaymentPanel({
  booking,
  busy,
  onAddPayment,
  onDeletePayment,
  onSendInvoice,
  onClearInvoice,
  children,
}: {
  booking: PaymentPanelBooking;
  busy?: boolean;
  onAddPayment: (id: string, payment: { amount: number; method: PaymentMethod; note?: string }) => void;
  onDeletePayment: (id: string, paymentId: string) => void;
  /** Sender fakturamail — opretter fakturaen hvis den ikke findes */
  onSendInvoice: (id: string) => void;
  onClearInvoice: (id: string) => void;
  /** Depositum-kontrollen, som ligger uden for selve betalingen */
  children?: React.ReactNode;
}) {
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("mobilepay");

  const status = paymentStatus(booking);
  const meta = PAYMENT_STATUS_META[status];
  const payments = paymentsOf(booking);
  const rest = outstanding(booking);
  const over = overpaid(booking);
  const invoice = booking.invoice;

  const openForm = () => {
    setAmount(String(rest > 0 ? rest : booking.total || 0));
    setAdding(true);
  };

  const submit = () => {
    const value = Math.round(Number(amount));
    if (!Number.isFinite(value) || value <= 0) return;
    onAddPayment(booking.id, { amount: value, method });
    setAdding(false);
    setAmount("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start", minWidth: "190px" }}>
      <span
        title={`Betalt ${dk(paidAmount(booking))} kr af ${dk(booking.total || 0)} kr`}
        style={{
          padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
          background: meta.bg, color: meta.text, border: `1px solid ${meta.border}`, whiteSpace: "nowrap",
        }}
      >
        {meta.short}
        {status === "delvis" && ` · mangler ${dk(rest)} kr`}
        {status === "ubetalt" && invoice && " · faktureret"}
      </span>

      {over > 0 && (
        <span style={{ fontSize: "10px", color: "#8a5b00" }}>Betalt {dk(over)} kr for meget</span>
      )}

      {payments.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: "11px", color: "#555" }}>
          {payments.map((p) => (
            <li key={p.id} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "1px 0" }}>
              <span>{PAYMENT_METHOD_ICONS[p.method] ?? "•"}</span>
              <strong>{dk(p.amount)} kr</strong>
              <span style={{ color: "#999" }}>{PAYMENT_METHOD_LABELS[p.method] ?? p.method}</span>
              {p.paidAt && <span style={{ color: "#bbb" }}>{shortDate(p.paidAt)}</span>}
              {p.source !== "stripe" && !p.id.startsWith("legacy") && (
                <button
                  onClick={() => { if (confirm(`Fjern indbetalingen på ${dk(p.amount)} kr?`)) onDeletePayment(booking.id, p.id); }}
                  title="Fjern indbetaling"
                  style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: "12px", padding: 0 }}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setAdding(false); }}
            aria-label="Beløb i kr"
            autoFocus
            style={{ width: "78px", padding: "5px 6px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "5px" }}
          />
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            aria-label="Betalingsmetode"
            style={{ padding: "5px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "5px" }}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>{PAYMENT_METHOD_ICONS[m]} {PAYMENT_METHOD_LABELS[m]}</option>
            ))}
          </select>
          <button onClick={submit} disabled={busy} style={{ ...btn, borderColor: "#111", background: "#111", color: "#fff", fontWeight: 600 }}>
            Gem
          </button>
          <button onClick={() => setAdding(false)} style={{ ...btn, border: "none", color: "#999" }}>Fortryd</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {status !== "betalt" && (
            <button onClick={openForm} disabled={busy} style={{ ...btn, borderColor: "#28a745", color: "#1e7e34", fontWeight: 600 }}>
              + Registrér betaling
            </button>
          )}
          {status === "betalt" && (
            <button onClick={openForm} disabled={busy} style={{ ...btn, fontSize: "11px", border: "none", color: "#999" }}>
              + Tilføj betaling
            </button>
          )}
        </div>
      )}

      {/* Faktura: en tilstand, ikke en betaling — ordren er stadig ubetalt */}
      {invoice ? (
        <div style={{ fontSize: "11px", color: "#555", display: "flex", flexDirection: "column", gap: "2px" }}>
          <span>
            🧾 <strong>Faktura {invoice.number}</strong>
            {invoice.dueDate && <> · forfalder {invoice.dueDate}</>}
          </span>
          <span style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => onSendInvoice(booking.id)} disabled={busy} style={{ ...btn, padding: "3px 8px", fontSize: "11px" }}>
              Send igen
            </button>
            <button
              onClick={() => { if (confirm("Fjern fakturaen fra ordren?")) onClearInvoice(booking.id); }}
              style={{ background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: "11px" }}
            >
              Fjern
            </button>
          </span>
        </div>
      ) : (
        status !== "betalt" && (
          <button
            onClick={() => { if (confirm("Send faktura til kunden på mail?")) onSendInvoice(booking.id); }}
            disabled={busy}
            title="Opretter fakturanummer og sender fakturaen på mail. Ordren står som ubetalt indtil pengene er registreret."
            style={{ ...btn, fontSize: "11px", padding: "4px 8px" }}
          >
            🧾 Send faktura
          </button>
        )
      )}

      {children}
    </div>
  );
}
