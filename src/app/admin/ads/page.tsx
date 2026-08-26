"use client";

import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";

import { useState, useEffect, useCallback } from "react";

interface LinkedAdGroup {
  id: string;
  name: string | null;
  status: "ENABLED" | "PAUSED" | "REMOVED" | null;
  campaignName: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  inventory: number | null;
  economics: { purchasePrice?: number; costPerRental?: number; note?: string };
  contributionPerRental: number | null;
  marginPct: number | null;
  bookings: number;
  revenue: number;
  avgOrderValue: number | null;
  soldOutDays: string[];
  soldOutNext60: number;
  weekend: { from: string; days: string[]; soldOutDays: string[]; fullyBooked: boolean };
  adGroups: LinkedAdGroup[];
}

interface AdGroup {
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED";
  campaignName: string;
}

interface AdsResponse {
  today: string;
  weekend: { from: string; to: string; days: string[] };
  products: Product[];
  adGroups: AdGroup[];
  mapping: Record<string, string[]>;
  adsConfigured: boolean;
  adsError: string | null;
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
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "10px",
  fontSize: "13px",
  borderBottom: "1px solid #f2f2f2",
  verticalAlign: "top",
};

function dk(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("da-DK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function StatusPill({ status }: { status: string | null }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    ENABLED: { bg: "#e6f4ea", fg: "#1e7e34", label: "Aktiv" },
    PAUSED: { bg: "#f1f3f5", fg: "#6c757d", label: "Pauset" },
    REMOVED: { bg: "#fdecea", fg: "#c0392b", label: "Fjernet" },
  };
  const s = status ? map[status] : null;
  if (!s) return <span style={{ color: "#bbb", fontSize: "12px" }}>ukendt</span>;
  return (
    <span style={{ background: s.bg, color: s.fg, padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

export default function AdsPage() {
  const { secret, user, ready, isLoggedIn, logout, unauthorized } = useAdminAuth();
  const [data, setData] = useState<AdsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftCost, setDraftCost] = useState<string>("");
  const [draftLinks, setDraftLinks] = useState<string[]>([]);


  const load = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/ads?secret=${encodeURIComponent(secret)}`);
      const json: AdsResponse = await res.json();
      if (!res.ok) {
        if (res.status === 401) { unauthorized(); return; }
        setError(json.error || "Kunne ikke hente oversigt");
        return;
      }
      setData(json);
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    load();
  }, [load]);

  async function post(body: unknown, key: string) {
    setBusy(key);
    try {
      const res = await fetch(`/api/ads?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error || "Handlingen fejlede");
        return false;
      }
      await load();
      return true;
    } catch {
      setError("Netværksfejl");
      return false;
    } finally {
      setBusy(null);
    }
  }

  function startEdit(p: Product) {
    setEditing(p.id);
    setDraftCost(p.economics.costPerRental != null ? String(p.economics.costPerRental) : "");
    setDraftLinks(p.adGroups.map((g) => g.id));
  }

  async function saveEdit(p: Product) {
    if (!data) return;
    const economics: Record<string, { costPerRental?: number }> = {};
    for (const prod of data.products) {
      const cost = prod.id === p.id ? Number(draftCost) : prod.economics.costPerRental;
      if (typeof cost === "number" && !Number.isNaN(cost) && draftCost !== "") {
        economics[prod.id] = { ...prod.economics, costPerRental: cost };
      } else if (prod.id !== p.id && prod.economics.costPerRental != null) {
        economics[prod.id] = prod.economics;
      }
    }
    const mapping = { ...data.mapping, [p.id]: draftLinks };
    const ok = await post({ action: "save_economics", economics }, `save-${p.id}`);
    if (ok) await post({ action: "save_mapping", mapping }, `save-${p.id}`);
    setEditing(null);
  }

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Ads" />;

  const products = data?.products ?? [];
  const weekend = data?.weekend;

  return (
    <>
      <AdminNav
        actions={
          <button onClick={load} disabled={loading} style={{ ...navLink, cursor: "pointer", border: "1px solid #ddd" }}>
            {loading ? "Henter…" : "↺ Opdater"}
          </button>
        }
      />
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>

      <p style={{ color: "#888", fontSize: "12px", margin: "0 0 16px" }}>
        Intet slukkes automatisk. Knapperne herunder ændrer status i Google Ads med det samme, når du trykker.
        Mangler et produkt annoncer, kan du bygge dem på{" "}
        <a href="/admin/ads/opret" style={{ color: "#1e7e34", fontWeight: 600 }}>Byg annoncer</a>.
      </p>

      {error && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
          {error}
        </div>
      )}

      {data && !data.adsConfigured && (
        <div style={{ background: "#fff8e1", color: "#8a6d3b", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
          <strong>Google Ads er ikke forbundet.</strong> {data.adsError} — produkttal vises stadig, men annoncestatus er tom.
        </div>
      )}
      {data?.adsConfigured && data.adsError && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
          Google Ads svarede ikke: {data.adsError}
        </div>
      )}

      {weekend && (
        <div style={{ background: "#f8f9fa", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", color: "#555" }}>
          Kommende weekend: <strong>{weekend.days.map(dk).join(" · ")}</strong>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr>
              <th style={th}>Produkt</th>
              <th style={th}>Pris</th>
              <th style={th}>Omk./udlejning</th>
              <th style={th}>DB</th>
              <th style={th}>Lager</th>
              <th style={th}>Bookinger</th>
              <th style={th}>Omsætning</th>
              <th style={th}>Gns. ordre</th>
              <th style={th}>Kommende weekend</th>
              <th style={th}>Annoncegrupper</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isEditing = editing === p.id;
              return (
                <tr key={p.id} style={{ background: p.weekend.fullyBooked ? "#fffaf5" : undefined }}>
                  <td style={{ ...td, fontWeight: 600 }}>
                    {p.name}
                    <div style={{ color: "#aaa", fontSize: "11px", fontWeight: 400 }}>{p.id}</div>
                  </td>
                  <td style={td}>{p.price} kr</td>
                  <td style={td}>
                    {isEditing ? (
                      <input
                        value={draftCost}
                        onChange={(e) => setDraftCost(e.target.value)}
                        placeholder="fx 40"
                        style={{ width: "70px", padding: "4px 6px", fontSize: "13px", border: "1px solid #ddd", borderRadius: "4px" }}
                      />
                    ) : p.economics.costPerRental != null ? (
                      `${p.economics.costPerRental} kr`
                    ) : (
                      <span style={{ color: "#ccc" }}>—</span>
                    )}
                  </td>
                  <td style={td}>
                    {p.contributionPerRental != null ? (
                      <>
                        <strong>{p.contributionPerRental} kr</strong>
                        <div style={{ color: "#888", fontSize: "11px" }}>{p.marginPct}%</div>
                      </>
                    ) : (
                      <span style={{ color: "#ccc" }}>—</span>
                    )}
                  </td>
                  <td style={td}>{p.inventory ?? <span style={{ color: "#ccc" }}>—</span>}</td>
                  <td style={td}>{p.bookings}</td>
                  <td style={td}>{p.revenue.toLocaleString("da-DK")} kr</td>
                  <td style={td}>{p.avgOrderValue != null ? `${p.avgOrderValue} kr` : <span style={{ color: "#ccc" }}>—</span>}</td>
                  <td style={td}>
                    {p.weekend.soldOutDays.length === 0 ? (
                      <span style={{ color: "#1e7e34" }}>Ledig</span>
                    ) : (
                      <>
                        <span style={{ color: "#c0392b", fontWeight: 600 }}>
                          Udsolgt {p.weekend.soldOutDays.length}/{p.weekend.days.length}
                        </span>
                        <div style={{ color: "#888", fontSize: "11px" }}>{p.weekend.soldOutDays.map(dk).join(", ")}</div>
                      </>
                    )}
                    {p.soldOutNext60 > 0 && (
                      <div style={{ color: "#aaa", fontSize: "11px" }}>{p.soldOutNext60} udsolgte dage/60</div>
                    )}
                  </td>
                  <td style={td}>
                    {isEditing ? (
                      <select
                        multiple
                        value={draftLinks}
                        onChange={(e) => setDraftLinks(Array.from(e.target.selectedOptions, (o) => o.value))}
                        style={{ minWidth: "230px", height: "120px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "4px" }}
                      >
                        {(data?.adGroups ?? []).map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    ) : p.adGroups.length === 0 ? (
                      <span style={{ color: "#ccc" }}>ikke koblet</span>
                    ) : (
                      p.adGroups.map((g) => (
                        <div key={g.id} style={{ marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <StatusPill status={g.status} />
                          <span style={{ fontSize: "12px" }}>{g.name ?? `#${g.id}`}</span>
                          {g.status === "ENABLED" && (
                            <button
                              onClick={() => post({ action: "set_ad_group_status", adGroupId: g.id, status: "PAUSED" }, g.id)}
                              disabled={busy === g.id}
                              style={{ padding: "2px 8px", fontSize: "11px", background: "#fff", color: "#c0392b", border: "1px solid #c0392b", borderRadius: "5px", cursor: "pointer" }}
                            >
                              Sluk
                            </button>
                          )}
                          {g.status === "PAUSED" && (
                            <button
                              onClick={() => post({ action: "set_ad_group_status", adGroupId: g.id, status: "ENABLED" }, g.id)}
                              disabled={busy === g.id}
                              style={{ padding: "2px 8px", fontSize: "11px", background: "#fff", color: "#1e7e34", border: "1px solid #1e7e34", borderRadius: "5px", cursor: "pointer" }}
                            >
                              Tænd
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </td>
                  <td style={td}>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => saveEdit(p)} disabled={busy === `save-${p.id}`} style={{ ...navLink, cursor: "pointer", fontSize: "12px" }}>
                          Gem
                        </button>
                        <button onClick={() => setEditing(null)} style={{ ...navLink, cursor: "pointer", fontSize: "12px", color: "#999" }}>
                          Fortryd
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(p)} style={{ ...navLink, cursor: "pointer", fontSize: "12px" }}>
                        Rediger
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.adGroups.length > 0 && (
        <p style={{ color: "#aaa", fontSize: "12px", marginTop: "14px" }}>
          {data.adGroups.length} annoncegrupper hentet fra Google Ads.
        </p>
      )}
      </div>
    </>
  );
}
