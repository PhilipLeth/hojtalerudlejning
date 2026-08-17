"use client";

import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";

import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/lib/useIsMobile";

interface CodeInfo {
  code: string;
  pct: number;
  source: "standard" | "egen";
  active: boolean;
}

interface CodesResponse {
  codes: CodeInfo[];
  usage: Record<string, number>;
  defaults: Record<string, number>;
  error?: string;
}

const navLink: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: "13px",
  color: "#555",
  textDecoration: "none",
  border: "1px solid #ddd",
  borderRadius: "6px",
  background: "#fff",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#888",
  borderBottom: "1px solid #eee",
};

const td: React.CSSProperties = {
  padding: "10px",
  fontSize: "13px",
  borderBottom: "1px solid #f2f2f2",
  verticalAlign: "middle",
};

export default function RabatkoderPage() {
  const { secret, user, ready, isLoggedIn, logout, unauthorized } = useAdminAuth();
  const [data, setData] = useState<CodesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newPct, setNewPct] = useState("");
  const [editPct, setEditPct] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();


  const load = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/discount-codes?secret=${encodeURIComponent(secret)}`);
      const json: CodesResponse = await res.json();
      if (!res.ok) {
        if (res.status === 401) { unauthorized(); return; }
        setError(json.error || "Kunne ikke hente rabatkoder");
        return;
      }
      setData(json);
      setEditPct({});
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    load();
  }, [load]);

  /** Byg det KV-map serveren skal gemme, ud fra nuværende visning + ændringer. */
  function buildCustomMap(changes: Record<string, number>, remove?: string): Record<string, number> {
    const map: Record<string, number> = {};
    for (const c of data?.codes ?? []) {
      if (c.code === remove) continue;
      const defaultPct = data?.defaults[c.code];
      const current = c.active ? c.pct : 0;
      // kun det der afviger fra standard skal i KV
      if (defaultPct === undefined || current !== defaultPct) map[c.code] = current;
    }
    return { ...map, ...changes };
  }

  async function save(changes: Record<string, number>, remove?: string) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/discount-codes?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes: buildCustomMap(changes, remove) }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error || "Kunne ikke gemme");
        return false;
      }
      await load();
      return true;
    } catch {
      setError("Netværksfejl");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function addCode() {
    const pct = Number(newPct);
    if (!newCode.trim() || !Number.isFinite(pct)) return;
    const ok = await save({ [newCode.trim().toLowerCase()]: pct });
    if (ok) {
      setNewCode("");
      setNewPct("");
    }
  }

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Rabatkoder" />;

  const codes = data?.codes ?? [];
  const aktive = codes.filter((c) => c.active).length;
  const brugtIAlt = codes.reduce((sum, c) => sum + (data?.usage[c.code] ?? 0), 0);

  /** Knapperne til én kode — samme sæt i tabel og på kort */
  function CodeActions({ c }: { c: CodeInfo }) {
    const editing = editPct[c.code] !== undefined;
    const btn: React.CSSProperties = {
      padding: isMobile ? "9px 14px" : "4px 10px",
      fontSize: isMobile ? "14px" : "12px",
      borderRadius: "6px",
      background: "#fff",
      cursor: "pointer",
    };
    if (editing) {
      return (
        <span style={{ display: "inline-flex", gap: "6px" }}>
          <button onClick={() => save({ [c.code]: Number(editPct[c.code]) })} disabled={saving} style={{ ...btn, border: "1px solid #0070f3", color: "#0070f3", fontWeight: 600 }}>
            Gem
          </button>
          <button onClick={() => setEditPct((p) => { const q = { ...p }; delete q[c.code]; return q; })} style={{ ...btn, border: "1px solid #ddd", color: "#777" }}>
            Fortryd
          </button>
        </span>
      );
    }
    return (
      <span style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap" }}>
        <button onClick={() => setEditPct((p) => ({ ...p, [c.code]: String(c.pct) }))} style={{ ...btn, border: "1px solid #ddd", color: "#333" }}>
          Ret %
        </button>
        {c.active ? (
          <button onClick={() => save({ [c.code]: 0 })} disabled={saving} style={{ ...btn, border: "1px solid #c0392b", color: "#c0392b" }}>
            Slå fra
          </button>
        ) : (
          <button onClick={() => save({ [c.code]: data?.defaults[c.code] ?? c.pct })} disabled={saving} style={{ ...btn, border: "1px solid #1e7e34", color: "#1e7e34" }}>
            Slå til
          </button>
        )}
        {c.source === "egen" && (
          <button onClick={() => { if (confirm(`Slet koden "${c.code}"?`)) save({}, c.code); }} disabled={saving} style={{ ...btn, border: "1px solid #ccc", color: "#999" }}>
            Slet
          </button>
        )}
      </span>
    );
  }

  function PctField({ c }: { c: CodeInfo }) {
    if (editPct[c.code] === undefined) return <strong>{c.pct} %</strong>;
    return (
      <span style={{ whiteSpace: "nowrap" }}>
        <input
          type="number"
          min={1}
          max={99}
          value={editPct[c.code]}
          onChange={(e) => setEditPct((p) => ({ ...p, [c.code]: e.target.value }))}
          style={{ width: "70px", padding: "6px 8px", border: "1px solid #ddd", borderRadius: "6px" }}
        />{" "}
        %
      </span>
    );
  }

  function StatusPill({ active }: { active: boolean }) {
    return (
      <span style={{
        fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px",
        background: active ? "#d4edda" : "#eee", color: active ? "#155724" : "#777",
        border: `1px solid ${active ? "#28a745" : "#ddd"}`, whiteSpace: "nowrap",
      }}>
        {active ? "AKTIV" : "SLÅET FRA"}
      </span>
    );
  }

  return (
    <div>
      <AdminNav
        actions={
          <button onClick={load} disabled={loading} style={{ ...navLink, cursor: "pointer" }}>
            {loading ? "Henter…" : "↺ Opdater"}
          </button>
        }
      />

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: isMobile ? "14px 12px 40px" : "20px" }}>
        <p style={{ color: "#666", fontSize: "13px", margin: "0 0 12px", lineHeight: 1.5 }}>
          Kunden taster koden i bookingen, og procenten trækkes fra totalen — beløbet regnes altid ud på
          serveren. Æ/ø/å oversættes automatisk (&quot;genkøb&quot; virker for &quot;genkoeb&quot;).
          <br />
          <strong>Standard</strong> er koder der ligger fast i koden og kun kan slås fra.{" "}
          <strong>Egen</strong> er koder du selv har oprettet her — dem kan du slette.
        </p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px", fontSize: "13px", color: "#555" }}>
          <span style={{ background: "#fff", border: "1px solid #eee", borderRadius: "20px", padding: "4px 12px" }}>
            <strong>{codes.length}</strong> koder
          </span>
          <span style={{ background: "#fff", border: "1px solid #eee", borderRadius: "20px", padding: "4px 12px" }}>
            <strong style={{ color: "#155724" }}>{aktive}</strong> aktive
          </span>
          <span style={{ background: "#fff", border: "1px solid #eee", borderRadius: "20px", padding: "4px 12px" }}>
            <strong>{brugtIAlt}</strong> bookinger med rabat
          </span>
        </div>

        {error && (
          <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
            {error}
          </div>
        )}

        {!loading && codes.length === 0 && (
          <p style={{ color: "#888", textAlign: "center", margin: "30px 0" }}>Ingen rabatkoder endnu</p>
        )}

        {isMobile ? (
          /* Kort på telefon — en tabel med seks kolonner kan ikke læses der */
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {codes.map((c) => (
              <div key={c.code} style={{ background: "#fff", borderRadius: "10px", padding: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", opacity: c.active ? 1 : 0.65 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, fontSize: "17px" }}>{c.code}</span>
                  <StatusPill active={c.active} />
                </div>
                <div style={{ margin: "8px 0", fontSize: "15px" }}>
                  <PctField c={c} />
                  <span style={{ color: "#888", fontSize: "13px" }}> rabat · {c.source === "standard" ? "standardkode" : "egen kode"}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>
                  Brugt i {data?.usage[c.code] ?? 0} booking{(data?.usage[c.code] ?? 0) === 1 ? "" : "er"}
                </div>
                <CodeActions c={c} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: "auto", background: "#fff", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#fafafa" }}>
                <tr>
                  <th style={th}>Kode</th>
                  <th style={th}>Rabat</th>
                  <th style={th}>Type</th>
                  <th style={th}>Status</th>
                  <th style={th}>Brugt</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.code} style={{ opacity: c.active ? 1 : 0.6 }}>
                    <td style={{ ...td, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{c.code}</td>
                    <td style={td}><PctField c={c} /></td>
                    <td style={td}>
                      <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: c.source === "standard" ? "#e8f0fe" : "#f3e8fd", color: c.source === "standard" ? "#174ea6" : "#7b2ff2" }}>
                        {c.source === "standard" ? "standard" : "egen"}
                      </span>
                    </td>
                    <td style={td}><StatusPill active={c.active} /></td>
                    <td style={td}>{data?.usage[c.code] ?? 0} bookinger</td>
                    <td style={{ ...td, whiteSpace: "nowrap", textAlign: "right" }}><CodeActions c={c} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: "20px", padding: "14px", background: "#fff", border: "1px solid #eee", borderRadius: "10px" }}>
          <p style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 700 }}>Opret ny kode</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="fx sommerfest"
              style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", flex: isMobile ? "1 1 100%" : "0 0 200px" }}
            />
            <input
              type="number"
              min={1}
              max={99}
              value={newPct}
              onChange={(e) => setNewPct(e.target.value)}
              placeholder="%"
              style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", width: "90px" }}
            />
            <button
              onClick={addCode}
              disabled={saving || !newCode.trim() || !newPct}
              style={{ padding: "10px 20px", fontSize: "15px", fontWeight: 600, background: "#0070f3", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", opacity: saving || !newCode.trim() || !newPct ? 0.5 : 1 }}
            >
              {saving ? "Gemmer…" : "Opret"}
            </button>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#888" }}>
            2-30 tegn, bogstaver/tal/bindestreg. Egne koder kan slettes; standardkoderne kan kun slås fra.
          </p>
        </div>
      </main>
    </div>
  );
}
