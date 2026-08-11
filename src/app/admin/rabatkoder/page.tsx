"use client";

import { useState, useEffect, useCallback } from "react";

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
  const [secret, setSecret] = useState("");
  const [data, setData] = useState<CodesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newPct, setNewPct] = useState("");
  const [editPct, setEditPct] = useState<Record<string, string>>({});

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
      const res = await fetch(`/api/discount-codes?secret=${encodeURIComponent(secret)}`);
      const json: CodesResponse = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("admin_secret");
          window.location.href = "/admin";
          return;
        }
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

  if (!secret) return null;

  const codes = data?.codes ?? [];

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Rabatkoder</h1>
        <a href="/admin" style={navLink}>Bookinger</a>
        <a href="/admin/ads" style={navLink}>Ads</a>
        <a href="/admin/regler" style={navLink}>Regler</a>
        <button onClick={load} disabled={loading} style={{ ...navLink, cursor: "pointer" }}>
          {loading ? "Henter…" : "Opdater"}
        </button>
      </div>

      <p style={{ color: "#888", fontSize: "12px", margin: "0 0 16px" }}>
        Koden tastes af kunden i bookingflowet. Procenten trækkes fra totalen — valideres altid på serveren.
        Æ/ø/å oversættes automatisk (&quot;genkøb&quot; virker for &quot;genkoeb&quot;).
      </p>

      {error && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
          {error}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
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
            {codes.map((c) => {
              const editing = editPct[c.code] !== undefined;
              return (
                <tr key={c.code} style={{ opacity: c.active ? 1 : 0.5 }}>
                  <td style={{ ...td, fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>{c.code}</td>
                  <td style={td}>
                    {editing ? (
                      <span style={{ whiteSpace: "nowrap" }}>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={editPct[c.code]}
                          onChange={(e) => setEditPct((p) => ({ ...p, [c.code]: e.target.value }))}
                          style={{ width: "60px", padding: "4px 6px", fontSize: "13px", border: "1px solid #ddd", borderRadius: "4px" }}
                        />{" "}
                        %
                      </span>
                    ) : (
                      <strong>{c.pct} %</strong>
                    )}
                  </td>
                  <td style={td}>
                    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: c.source === "standard" ? "#e8f0fe" : "#f3e8fd", color: c.source === "standard" ? "#174ea6" : "#7b2ff2" }}>
                      {c.source}
                    </span>
                  </td>
                  <td style={td}>{c.active ? <span style={{ color: "#1e7e34" }}>aktiv</span> : <span style={{ color: "#999" }}>slået fra</span>}</td>
                  <td style={td}>{data?.usage[c.code] ?? 0} bookinger</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    {editing ? (
                      <>
                        <button
                          onClick={() => save({ [c.code]: Number(editPct[c.code]) })}
                          disabled={saving}
                          style={{ ...navLink, cursor: "pointer", fontSize: "12px", marginRight: "6px" }}
                        >
                          Gem
                        </button>
                        <button
                          onClick={() => setEditPct((p) => { const q = { ...p }; delete q[c.code]; return q; })}
                          style={{ ...navLink, cursor: "pointer", fontSize: "12px", color: "#999" }}
                        >
                          Fortryd
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditPct((p) => ({ ...p, [c.code]: String(c.pct) }))}
                          style={{ ...navLink, cursor: "pointer", fontSize: "12px", marginRight: "6px" }}
                        >
                          Ret %
                        </button>
                        {c.active ? (
                          <button
                            onClick={() => save({ [c.code]: 0 })}
                            disabled={saving}
                            style={{ padding: "4px 10px", fontSize: "12px", background: "#fff", color: "#c0392b", border: "1px solid #c0392b", borderRadius: "6px", cursor: "pointer", marginRight: "6px" }}
                          >
                            Slå fra
                          </button>
                        ) : (
                          <button
                            onClick={() => save({ [c.code]: data?.defaults[c.code] ?? c.pct })}
                            disabled={saving}
                            style={{ padding: "4px 10px", fontSize: "12px", background: "#fff", color: "#1e7e34", border: "1px solid #1e7e34", borderRadius: "6px", cursor: "pointer", marginRight: "6px" }}
                          >
                            Slå til
                          </button>
                        )}
                        {c.source === "egen" && (
                          <button
                            onClick={() => { if (confirm(`Slet koden "${c.code}"?`)) save({}, c.code); }}
                            disabled={saving}
                            style={{ padding: "4px 10px", fontSize: "12px", background: "#fff", color: "#999", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer" }}
                          >
                            Slet
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px", padding: "14px", background: "#f8f9fa", borderRadius: "8px" }}>
        <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 600 }}>Ny kode</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="fx sommerfest"
            style={{ padding: "8px 10px", fontSize: "13px", border: "1px solid #ddd", borderRadius: "6px", width: "180px" }}
          />
          <input
            type="number"
            min={1}
            max={99}
            value={newPct}
            onChange={(e) => setNewPct(e.target.value)}
            placeholder="%"
            style={{ padding: "8px 10px", fontSize: "13px", border: "1px solid #ddd", borderRadius: "6px", width: "70px" }}
          />
          <button
            onClick={addCode}
            disabled={saving || !newCode.trim() || !newPct}
            style={{ ...navLink, cursor: "pointer", background: "#0070f3", color: "#fff", border: "1px solid #0070f3" }}
          >
            {saving ? "Gemmer…" : "Opret"}
          </button>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#888" }}>
          2-30 tegn, bogstaver/tal/bindestreg. Egne koder kan slettes; standardkoderne kan kun slås fra.
        </p>
      </div>
    </div>
  );
}
