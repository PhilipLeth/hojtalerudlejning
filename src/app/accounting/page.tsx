"use client";

/**
 * Regnskab: hvad kom der ind, hvad mangler, og hvor kommer det fra.
 *
 * Tallene regnes i /api/accounting ud fra bookingerne — omsætning bogføres på
 * lejeperiodens start, ikke på hvornår ordren blev oprettet, fordi det er dér
 * udstyret rent faktisk tjener penge.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminNav from "@/components/AdminNav";
import { useIsMobile } from "@/lib/useIsMobile";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_ICONS, type PaymentMethod } from "@/lib/payments";

interface ProductRevenue { id: string; name: string; count: number; revenue: number }
interface WeekendRevenue { friday: string; orders: number; revenue: number; paid: number; outstanding: number }
interface UnpaidOrder {
  id: string; name: string; company?: string; period: string; pickup: string;
  total: number; paid: number; outstanding: number; status: "delvis" | "ubetalt";
  invoiceNumber?: string; dueDate?: string; overdue: boolean; daysSincePickup: number;
}
interface Settings {
  monthlyTarget: number; bankReg: string; bankKonto: string;
  mobilePay: string; paymentTermsDays: number; invoiceFooter: string;
}
interface Summary {
  from: string; to: string; today: string;
  orders: number; revenue: number; paid: number; outstanding: number;
  averageOrder: number; cancelled: number;
  byProduct: ProductRevenue[];
  byWeekend: WeekendRevenue[];
  byMethod: Array<{ method: PaymentMethod; amount: number }>;
  unpaid: UnpaidOrder[];
  settings: Settings;
  error?: string;
}

const card: React.CSSProperties = {
  background: "#fff", borderRadius: "12px", padding: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "16px",
};

const th: React.CSSProperties = {
  textAlign: "left", padding: "8px 10px", fontSize: "11px", fontWeight: 700,
  color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #eee",
};
const td: React.CSSProperties = { padding: "9px 10px", fontSize: "13px", borderBottom: "1px solid #f5f5f5" };
const num: React.CSSProperties = { ...td, textAlign: "right", whiteSpace: "nowrap" };

function kr(n: number): string {
  return `${new Intl.NumberFormat("da-DK").format(Math.round(n || 0))} kr`;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Periodeknapperne: indeværende måned, sidste måned, i år, sidste 90 dage */
function periodPresets(today: string) {
  const t = new Date(`${today}T00:00:00Z`);
  const y = t.getUTCFullYear();
  const m = t.getUTCMonth();
  const monthStart = new Date(Date.UTC(y, m, 1));
  const lastMonthStart = new Date(Date.UTC(y, m - 1, 1));
  const lastMonthEnd = new Date(Date.UTC(y, m, 0));
  const yearStart = new Date(Date.UTC(y, 0, 1));
  const ago90 = new Date(t);
  ago90.setUTCDate(t.getUTCDate() - 89);
  return [
    { id: "maaned", label: "Denne måned", from: iso(monthStart), to: today },
    { id: "sidste", label: "Sidste måned", from: iso(lastMonthStart), to: iso(lastMonthEnd) },
    { id: "90", label: "90 dage", from: iso(ago90), to: today },
    { id: "aar", label: "I år", from: iso(yearStart), to: today },
  ];
}

function Bar({ value, max, color = "#111" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ background: "#f0f0f0", borderRadius: 4, height: 6, overflow: "hidden", minWidth: 60 }}>
      <div style={{ width: `${pct}%`, background: color, height: "100%" }} />
    </div>
  );
}

export default function AccountingPage() {
  const [secret, setSecret] = useState("");
  const today = useMemo(() => iso(new Date()), []);
  const presets = useMemo(() => periodPresets(today), [today]);
  const [from, setFrom] = useState(presets[0].from);
  const [to, setTo] = useState(presets[0].to);
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const stored = localStorage.getItem("admin_secret");
    if (stored) setSecret(stored);
    else window.location.href = "/admin";
  }, []);

  const load = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/accounting?from=${from}&to=${to}&secret=${encodeURIComponent(secret)}`);
      const json: Summary = await res.json();
      if (!res.ok) {
        if (res.status === 401) { localStorage.removeItem("admin_secret"); window.location.href = "/admin"; return; }
        setError(json.error || "Kunne ikke hente regnskabstal");
        return;
      }
      setData(json);
      setDraft(json.settings);
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret, from, to]);

  useEffect(() => { load(); }, [load]);

  async function saveSettings() {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/accounting?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Kunne ikke gemme"); return; }
      setData((d) => (d ? { ...d, settings: json.settings } : d));
      setShowSettings(false);
    } catch {
      setError("Netværksfejl");
    } finally {
      setSaving(false);
    }
  }

  function exportCsv() {
    if (!data) return;
    const rows = [
      ["Regnskab", `${data.from} til ${data.to}`],
      [],
      ["Nøgletal", "Beløb"],
      ["Omsætning", data.revenue],
      ["Betalt", data.paid],
      ["Udestående", data.outstanding],
      ["Ordrer", data.orders],
      ["Gennemsnitsordre", data.averageOrder],
      [],
      ["Produkt", "Antal", "Omsætning"],
      ...data.byProduct.map((p) => [p.name, p.count, p.revenue]),
      [],
      ["Weekend (fredag)", "Ordrer", "Omsætning", "Betalt", "Udestående"],
      ...data.byWeekend.map((w) => [w.friday, w.orders, w.revenue, w.paid, w.outstanding]),
      [],
      ["Betalingsmetode", "Beløb"],
      ...data.byMethod.map((m) => [PAYMENT_METHOD_LABELS[m.method] ?? m.method, m.amount]),
      [],
      ["Ubetalt: kunde", "Periode", "Total", "Betalt", "Mangler", "Faktura", "Forfalder"],
      ...data.unpaid.map((u) => [u.name, u.period, u.total, u.paid, u.outstanding, u.invoiceNumber ?? "", u.dueDate ?? ""]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `regnskab-${data.from}-${data.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!secret) return null;

  const target = data?.settings.monthlyTarget ?? 0;
  const maxProduct = Math.max(1, ...(data?.byProduct.map((p) => p.revenue) ?? [1]));
  const maxWeekend = Math.max(1, ...(data?.byWeekend.map((w) => w.revenue) ?? [1]));
  const maxMethod = Math.max(1, ...(data?.byMethod.map((m) => m.amount) ?? [1]));

  return (
    <div className="admin-shell">
      <AdminNav
        title="Regnskab"
        actions={
          <>
            <button onClick={exportCsv} disabled={!data} style={{ padding: "8px 14px", fontSize: "13px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", color: "#111" }}>
              ⭳ CSV
            </button>
            <button onClick={() => setShowSettings((v) => !v)} style={{ padding: "8px 14px", fontSize: "13px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", color: "#111" }}>
              Indstillinger
            </button>
            <button onClick={load} disabled={loading} style={{ padding: "8px 14px", fontSize: "13px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", color: "#111" }}>
              {loading ? "Henter…" : "↺ Opdater"}
            </button>
          </>
        }
      />

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: isMobile ? "12px 10px 50px" : "20px 16px 60px" }}>
        {error && (
          <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{error}</div>
        )}

        {/* Periode */}
        <div style={{ ...card, display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", padding: "12px 14px" }}>
          {presets.map((p) => {
            const active = p.from === from && p.to === to;
            return (
              <button
                key={p.id}
                onClick={() => { setFrom(p.from); setTo(p.to); }}
                style={{
                  padding: isMobile ? "8px 14px" : "6px 12px", fontSize: 12, borderRadius: 20, cursor: "pointer",
                  fontWeight: active ? 700 : 400, background: active ? "#111" : "#f0f0f0",
                  color: active ? "#fff" : "#555", border: "none", whiteSpace: "nowrap",
                }}
              >
                {p.label}
              </button>
            );
          })}
          <span style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "#888" }}>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ padding: "5px 6px", border: "1px solid #ddd", borderRadius: 6 }} />
            →
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ padding: "5px 6px", border: "1px solid #ddd", borderRadius: 6 }} />
          </span>
        </div>

        {showSettings && draft && (
          <div style={card}>
            <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 14 }}>Regnskabsindstillinger</p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
              {([
                ["monthlyTarget", "Månedsmål (kr)", "number"],
                ["paymentTermsDays", "Betalingsfrist (dage)", "number"],
                ["bankReg", "Bank reg.nr.", "text"],
                ["bankKonto", "Bank kontonr.", "text"],
                ["mobilePay", "MobilePay", "text"],
                ["invoiceFooter", "Fodnote på faktura", "text"],
              ] as Array<[keyof Settings, string, string]>).map(([key, label, type]) => (
                <label key={key} style={{ fontSize: 12, color: "#666" }}>
                  {label}
                  <input
                    type={type}
                    value={String(draft[key] ?? "")}
                    onChange={(e) => setDraft({ ...draft, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
                    style={{ display: "block", width: "100%", marginTop: 4, padding: "9px 10px", border: "1px solid #ddd", borderRadius: 8, boxSizing: "border-box" }}
                  />
                </label>
              ))}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 11, color: "#888" }}>
              Bank og MobilePay står på fakturamailen, så kunden ved hvor pengene skal hen.
            </p>
            <button onClick={saveSettings} disabled={saving} style={{ marginTop: 12, padding: "10px 18px", fontSize: 14, fontWeight: 600, background: "#111", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
              {saving ? "Gemmer…" : "Gem"}
            </button>
          </div>
        )}

        {/* Nøgletal */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Omsætning", value: data?.revenue ?? 0, hint: `${data?.orders ?? 0} ordrer` },
            { label: "Betalt", value: data?.paid ?? 0, hint: "modtaget", color: "#155724" },
            { label: "Udestående", value: data?.outstanding ?? 0, hint: `${data?.unpaid.length ?? 0} ordrer mangler`, color: (data?.outstanding ?? 0) > 0 ? "#c0392b" : "#155724" },
            { label: "Gns. ordre", value: data?.averageOrder ?? 0, hint: data?.cancelled ? `${data.cancelled} annulleret` : "pr. booking" },
          ].map((k) => (
            <div key={k.label} style={{ ...card, marginBottom: 0, padding: "14px" }}>
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>{k.label}</div>
              <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: k.color ?? "#111", marginTop: 4 }}>{kr(k.value)}</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>{k.hint}</div>
            </div>
          ))}
        </div>

        {/* Månedsmål */}
        {target > 0 && data && (
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <strong>Mål for perioden</strong>
              <span style={{ color: data.revenue >= target ? "#155724" : "#666" }}>
                {kr(data.revenue)} af {kr(target)} ({Math.round((data.revenue / target) * 100)}%)
              </span>
            </div>
            <Bar value={data.revenue} max={target} color={data.revenue >= target ? "#28a745" : "#111"} />
          </div>
        )}

        {/* Ubetalte */}
        <div style={card}>
          <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 14 }}>
            Ubetalte ordrer{data?.unpaid.length ? ` (${data.unpaid.length})` : ""}
          </p>
          {!data?.unpaid.length ? (
            <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Alt er betalt i perioden 🎉</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Kunde</th>
                    <th style={th}>Periode</th>
                    <th style={{ ...th, textAlign: "right" }}>Total</th>
                    <th style={{ ...th, textAlign: "right" }}>Betalt</th>
                    <th style={{ ...th, textAlign: "right" }}>Mangler</th>
                    <th style={th}>Faktura</th>
                  </tr>
                </thead>
                <tbody>
                  {data.unpaid.map((u) => (
                    <tr key={u.id}>
                      <td style={td}>
                        <a href={`/admin?booking=${encodeURIComponent(u.id)}`} style={{ color: "#0070f3", textDecoration: "none", fontWeight: 600 }}>
                          {u.company || u.name}
                        </a>
                        {u.daysSincePickup > 0 && (
                          <div style={{ fontSize: 11, color: u.daysSincePickup > 14 ? "#c0392b" : "#aaa" }}>
                            {u.daysSincePickup} dage siden afhentning
                          </div>
                        )}
                      </td>
                      <td style={{ ...td, whiteSpace: "nowrap", color: "#666" }}>{u.period}</td>
                      <td style={num}>{kr(u.total)}</td>
                      <td style={{ ...num, color: u.paid > 0 ? "#155724" : "#bbb" }}>{u.paid > 0 ? kr(u.paid) : "—"}</td>
                      <td style={{ ...num, fontWeight: 700, color: "#c0392b" }}>{kr(u.outstanding)}</td>
                      <td style={td}>
                        {u.invoiceNumber ? (
                          <span style={{ color: u.overdue ? "#c0392b" : "#666", fontSize: 12 }}>
                            {u.invoiceNumber}
                            {u.dueDate && <> · {u.overdue ? "forfaldt" : "forfalder"} {u.dueDate}</>}
                          </span>
                        ) : (
                          <span style={{ color: "#bbb", fontSize: 12 }}>ikke faktureret</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          {/* Pr. produkt */}
          <div style={card}>
            <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 14 }}>Omsætning pr. produkt</p>
            {!data?.byProduct.length ? (
              <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Ingen ordrer i perioden</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {data.byProduct.map((p) => (
                    <tr key={p.id}>
                      <td style={td}>
                        {p.name}
                        <div style={{ fontSize: 11, color: "#aaa" }}>{p.count} udlejninger</div>
                      </td>
                      <td style={{ ...td, width: "30%" }}><Bar value={p.revenue} max={maxProduct} /></td>
                      <td style={{ ...num, fontWeight: 700 }}>{kr(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pr. weekend */}
          <div style={card}>
            <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 14 }}>Omsætning pr. weekend</p>
            {!data?.byWeekend.length ? (
              <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Ingen ordrer i perioden</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {data.byWeekend.map((w) => (
                    <tr key={w.friday}>
                      <td style={td}>
                        {new Date(`${w.friday}T12:00:00`).toLocaleDateString("da-DK", { day: "numeric", month: "short" })}
                        <div style={{ fontSize: 11, color: "#aaa" }}>
                          {w.orders} ordrer{w.outstanding > 0 && <span style={{ color: "#c0392b" }}> · {kr(w.outstanding)} mangler</span>}
                        </div>
                      </td>
                      <td style={{ ...td, width: "30%" }}><Bar value={w.revenue} max={maxWeekend} /></td>
                      <td style={{ ...num, fontWeight: 700 }}>{kr(w.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Betalingsmetoder */}
        <div style={card}>
          <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 14 }}>Betalingsmetoder</p>
          {!data?.byMethod.length ? (
            <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Ingen registrerede betalinger i perioden</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {data.byMethod.map((m) => (
                  <tr key={m.method}>
                    <td style={td}>
                      {PAYMENT_METHOD_ICONS[m.method] ?? "•"} {PAYMENT_METHOD_LABELS[m.method] ?? m.method}
                    </td>
                    <td style={{ ...td, width: "40%" }}><Bar value={m.amount} max={maxMethod} color="#0070f3" /></td>
                    <td style={{ ...num, fontWeight: 700 }}>{kr(m.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.6 }}>
          Omsætning bogføres på lejeperiodens første dag. Beløb pr. produkt er ordrens total fordelt efter
          katalogpriserne, så rabatter tælles med der hvor de blev givet. Annullerede ordrer indgår ikke.
        </p>
      </main>
    </div>
  );
}
