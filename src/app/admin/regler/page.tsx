"use client";

import AdminNav from "@/components/AdminNav";

import { useState, useEffect, useCallback } from "react";

type Trigger = "udsolgt_weekend" | "udsolgt_naeste_dage" | "lager_nul";

interface Rule {
  id: string;
  productId: string;
  trigger: Trigger;
  windowDays?: number;
  autoResume: boolean;
  note?: string;
}

interface Evaluation {
  ruleId: string;
  productId: string;
  shouldPause: boolean;
  because: string;
  availableAgain: string | null;
  adGroupIds: string[];
  applied: boolean;
}

interface RulesResponse {
  today: string;
  weekend: { from: string; days: string[] };
  rules: Rule[];
  evaluations: Evaluation[];
  engineActive: boolean;
  note: string;
  error?: string;
}

interface AdsResponse {
  products: Array<{ id: string; name: string }>;
  mapping: Record<string, string[]>;
  error?: string;
}

const TRIGGER_LABELS: Record<Trigger, string> = {
  udsolgt_weekend: "Udsolgt i den kommende weekend",
  udsolgt_naeste_dage: "Udsolgt inden for X dage",
  lager_nul: "Lagerbeholdning er 0",
};

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
  verticalAlign: "top",
};

function dk(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export default function ReglerPage() {
  const [secret, setSecret] = useState("");
  const [data, setData] = useState<RulesResponse | null>(null);
  const [products, setProducts] = useState<AdsResponse["products"]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

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
      const [rulesRes, adsRes] = await Promise.all([
        fetch(`/api/ads-rules?secret=${encodeURIComponent(secret)}`),
        fetch(`/api/ads?secret=${encodeURIComponent(secret)}`),
      ]);
      const rulesJson: RulesResponse = await rulesRes.json();
      if (!rulesRes.ok) {
        if (rulesRes.status === 401) {
          localStorage.removeItem("admin_secret");
          window.location.href = "/admin";
          return;
        }
        setError(rulesJson.error || "Kunne ikke hente regler");
        return;
      }
      setData(rulesJson);
      setRules(rulesJson.rules);
      setDirty(false);
      if (adsRes.ok) {
        const adsJson: AdsResponse = await adsRes.json();
        setProducts(adsJson.products ?? []);
      }
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    load();
  }, [load]);

  function update(id: string, patch: Partial<Rule>) {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setDirty(true);
  }

  function addRule() {
    setRules((rs) => [
      ...rs,
      {
        id: `r${Date.now()}`,
        productId: products[0]?.id ?? "",
        trigger: "udsolgt_weekend",
        windowDays: 7,
        autoResume: true,
        note: "",
      },
    ]);
    setDirty(true);
  }

  function removeRule(id: string) {
    setRules((rs) => rs.filter((r) => r.id !== id));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/ads-rules?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error || "Kunne ikke gemme");
        return;
      }
      await load();
    } catch {
      setError("Netværksfejl");
    } finally {
      setSaving(false);
    }
  }

  if (!secret) return null;

  const evalById = new Map((data?.evaluations ?? []).map((e) => [e.ruleId, e]));
  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? id;

  return (
    <>
      <AdminNav
        actions={
          <button onClick={load} disabled={loading} style={{ ...navLink, cursor: "pointer" }}>
            {loading ? "Henter…" : "↺ Opdater"}
          </button>
        }
      />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>

      <div style={{ background: "#e8f0fe", color: "#174ea6", padding: "12px 14px", borderRadius: "8px", margin: "0 0 18px", fontSize: "13px" }}>
        <strong>Reglerne kører ikke.</strong> De gemmes og evalueres, så du kan se hvad de <em>ville</em> gøre.
        Ingen annoncegruppe ændres automatisk. Kolonnen &quot;Ville gøre nu&quot; er facit på om logikken rammer rigtigt.
      </div>

      {error && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
          {error}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr>
              <th style={th}>Produkt</th>
              <th style={th}>Sluk når</th>
              <th style={th}>Vindue</th>
              <th style={th}>Tænd igen</th>
              <th style={th}>Ville gøre nu</th>
              <th style={th}>Note</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 && (
              <tr>
                <td style={{ ...td, color: "#aaa" }} colSpan={7}>
                  Ingen regler defineret endnu.
                </td>
              </tr>
            )}
            {rules.map((r) => {
              const ev = evalById.get(r.id);
              return (
                <tr key={r.id}>
                  <td style={td}>
                    <select
                      value={r.productId}
                      onChange={(e) => update(r.id, { productId: e.target.value })}
                      style={{ padding: "5px 6px", fontSize: "13px", border: "1px solid #ddd", borderRadius: "4px", minWidth: "160px" }}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={td}>
                    <select
                      value={r.trigger}
                      onChange={(e) => update(r.id, { trigger: e.target.value as Trigger })}
                      style={{ padding: "5px 6px", fontSize: "13px", border: "1px solid #ddd", borderRadius: "4px", minWidth: "220px" }}
                    >
                      {(Object.keys(TRIGGER_LABELS) as Trigger[]).map((t) => (
                        <option key={t} value={t}>
                          {TRIGGER_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={td}>
                    {r.trigger === "udsolgt_naeste_dage" ? (
                      <input
                        type="number"
                        min={1}
                        value={r.windowDays ?? 7}
                        onChange={(e) => update(r.id, { windowDays: Number(e.target.value) })}
                        style={{ width: "60px", padding: "5px 6px", fontSize: "13px", border: "1px solid #ddd", borderRadius: "4px" }}
                      />
                    ) : (
                      <span style={{ color: "#ccc" }}>—</span>
                    )}
                  </td>
                  <td style={td}>
                    <label style={{ fontSize: "12px", color: "#555", display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="checkbox"
                        checked={r.autoResume}
                        onChange={(e) => update(r.id, { autoResume: e.target.checked })}
                      />
                      når ledig igen
                    </label>
                  </td>
                  <td style={td}>
                    {!ev ? (
                      <span style={{ color: "#ccc" }}>gem for at evaluere</span>
                    ) : ev.shouldPause ? (
                      <>
                        <strong style={{ color: "#c0392b" }}>Sluk</strong>
                        {ev.availableAgain && (
                          <div style={{ fontSize: "12px", color: "#555" }}>indtil {dk(ev.availableAgain)}</div>
                        )}
                        <div style={{ fontSize: "11px", color: "#888" }}>{ev.because}</div>
                        <div style={{ fontSize: "11px", color: "#aaa" }}>
                          {ev.adGroupIds.length} annoncegruppe(r) berørt
                        </div>
                      </>
                    ) : (
                      <>
                        <span style={{ color: "#1e7e34" }}>Lad stå</span>
                        <div style={{ fontSize: "11px", color: "#888" }}>{ev.because}</div>
                      </>
                    )}
                  </td>
                  <td style={td}>
                    <input
                      value={r.note ?? ""}
                      onChange={(e) => update(r.id, { note: e.target.value })}
                      placeholder="valgfri"
                      style={{ width: "150px", padding: "5px 6px", fontSize: "13px", border: "1px solid #ddd", borderRadius: "4px" }}
                    />
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => removeRule(r.id)}
                      style={{ padding: "4px 10px", fontSize: "12px", background: "#fff", color: "#c0392b", border: "1px solid #c0392b", borderRadius: "5px", cursor: "pointer" }}
                    >
                      Slet
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "16px", alignItems: "center" }}>
        <button onClick={addRule} style={{ ...navLink, cursor: "pointer" }}>
          + Tilføj regel
        </button>
        <button
          onClick={save}
          disabled={saving || !dirty}
          style={{
            ...navLink,
            cursor: dirty ? "pointer" : "default",
            background: dirty ? "#0070f3" : "#f5f5f5",
            color: dirty ? "#fff" : "#aaa",
            border: dirty ? "1px solid #0070f3" : "1px solid #ddd",
          }}
        >
          {saving ? "Gemmer…" : "Gem regler"}
        </button>
        {dirty && <span style={{ fontSize: "12px", color: "#c0392b" }}>ikke gemt</span>}
      </div>

      {data?.weekend && (
        <p style={{ color: "#aaa", fontSize: "12px", marginTop: "18px" }}>
          Evalueret mod {dk(data.today)}. Kommende weekend: {data.weekend.days.map(dk).join(" · ")}.
        </p>
      )}
      </div>
    </>
  );
}
