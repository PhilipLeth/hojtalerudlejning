"use client";

import AdminNav from "@/components/AdminNav";

import { useState, useEffect, useCallback } from "react";

interface SoldOutEntry {
  id: string;
  booked: number;
  total: number;
}

interface SoldOutDay {
  date: string;
  soldOut: SoldOutEntry[];
  blocked?: string[];
}

interface SoldOutResponse {
  from: string;
  to: string;
  today: string;
  inventory: Record<string, number>;
  days: SoldOutDay[];
  error?: string;
}

const PRODUCT_LABELS: Record<string, string> = {
  thumpgo: "Mackie Thump GO",
  party: "Lille højtalerpakke",
  soundboks: "Soundboks 4",
  festival: "Stor højtalerpakke",
  festival_bas: "Stor højtalerpakke + bas",
  lys: "Lys-pakke",
  rog: "Røgmaskine",
  stativer: "Stativer",
  taske: "Bæretaske",
  subwoofer: "Subwoofer 12\"",
};

function label(id: string): string {
  return PRODUCT_LABELS[id] || id;
}

function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("da-DK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function UdsolgtPage() {
  const [secret, setSecret] = useState("");
  const [from, setFrom] = useState(() => isoDaysFromToday(-60));
  const [to, setTo] = useState(() => isoDaysFromToday(90));
  const [data, setData] = useState<SoldOutResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("admin_secret");
    if (stored) setSecret(stored);
    else window.location.href = "/admin";
  }, []);

  const fetchSoldOut = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/soldout?secret=${encodeURIComponent(secret)}&from=${from}&to=${to}`
      );
      const json: SoldOutResponse = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("admin_secret");
          window.location.href = "/admin";
          return;
        }
        setError(json.error || "Kunne ikke hente oversigt");
        return;
      }
      setData(json);
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret, from, to]);

  useEffect(() => {
    fetchSoldOut();
  }, [fetchSoldOut]);

  if (!secret) return null;

  const today = data?.today ?? new Date().toISOString().slice(0, 10);
  const pastDays = (data?.days ?? []).filter((d) => d.date < today);
  const futureDays = (data?.days ?? []).filter((d) => d.date >= today);

  // Opsummering pr. produkt: antal udsolgte dage (fortid/fremtid)
  const summary: Record<string, { past: number; future: number }> = {};
  for (const day of data?.days ?? []) {
    for (const so of day.soldOut) {
      const s = (summary[so.id] ??= { past: 0, future: 0 });
      if (day.date < today) s.past++;
      else s.future++;
    }
  }

  const cardStyle = {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    padding: "20px",
    marginBottom: "24px",
  } as const;

  const renderDayList = (days: SoldOutDay[], future: boolean) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {days.map((d) => (
        <div
          key={d.date}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            padding: "8px 12px",
            background: future ? "#fef3f2" : "#f7f7f7",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <span style={{ fontWeight: 600, minWidth: "150px" }}>{formatDate(d.date)}</span>
          {d.soldOut.map((so) => (
            <span
              key={so.id}
              style={{
                padding: "2px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                background: future ? "#fbe0de" : "#e8e8e8",
                color: future ? "#b3261e" : "#555",
                border: `1px solid ${future ? "#e5928c" : "#ccc"}`,
              }}
            >
              {label(so.id)} {so.booked}/{so.total}
            </span>
          ))}
          {d.blocked && (
            <span
              style={{
                padding: "2px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                background: "#fff3cd",
                color: "#856404",
                border: "1px solid #ffc107",
              }}
            >
              Blokeret: {d.blocked.length ? d.blocked.map(label).join(", ") : "alle produkter"}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <AdminNav title="Udsolgt" />

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
        {/* Periode */}
        <div style={cardStyle}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>Fra</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ padding: "6px 10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "6px", color: "#111" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>Til</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ padding: "6px 10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "6px", color: "#111" }} />
            </div>
            <span style={{ fontSize: "13px", color: "#888", paddingBottom: "8px" }}>
              {loading ? "Henter..." : data ? `${data.days.length} dage med udsolgt/blokeret i perioden` : ""}
            </span>
          </div>
          <p style={{ margin: "12px 0 0", fontSize: "12px", color: "#aaa" }}>
            En dag tælles som udsolgt når antal bookinger ≥ lagerantal. Alle bookinger tælles med
            (også afleverede), så fortiden viser hvad der reelt var udsolgt.
          </p>
        </div>

        {error && (
          <div style={{ ...cardStyle, background: "#fef3f2", color: "#b3261e" }}>{error}</div>
        )}

        {/* Opsummering pr. produkt */}
        {data && (
          <div style={cardStyle}>
            <h2 style={{ margin: "0 0 12px", fontSize: "18px" }}>Udsolgte dage pr. produkt</h2>
            {Object.keys(summary).length === 0 ? (
              <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
                Intet har været udsolgt i perioden 🎉
              </p>
            ) : (
              <table style={{ borderCollapse: "collapse", fontSize: "14px", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "6px 12px 6px 0", borderBottom: "1px solid #eee", color: "#888", fontWeight: 600 }}>Produkt</th>
                    <th style={{ textAlign: "right", padding: "6px 12px", borderBottom: "1px solid #eee", color: "#888", fontWeight: 600 }}>Lager</th>
                    <th style={{ textAlign: "right", padding: "6px 12px", borderBottom: "1px solid #eee", color: "#888", fontWeight: 600 }}>Udsolgte dage (fortid)</th>
                    <th style={{ textAlign: "right", padding: "6px 0 6px 12px", borderBottom: "1px solid #eee", color: "#888", fontWeight: 600 }}>Udsolgte dage (fremtid)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary)
                    .sort((a, b) => b[1].future - a[1].future || b[1].past - a[1].past)
                    .map(([pid, s]) => (
                      <tr key={pid}>
                        <td style={{ padding: "6px 12px 6px 0", borderBottom: "1px solid #f5f5f5", fontWeight: 600 }}>{label(pid)}</td>
                        <td style={{ padding: "6px 12px", borderBottom: "1px solid #f5f5f5", textAlign: "right" }}>{data.inventory[pid] ?? "—"}</td>
                        <td style={{ padding: "6px 12px", borderBottom: "1px solid #f5f5f5", textAlign: "right", color: "#888" }}>{s.past}</td>
                        <td style={{ padding: "6px 0 6px 12px", borderBottom: "1px solid #f5f5f5", textAlign: "right", fontWeight: 700, color: s.future > 0 ? "#b3261e" : "#28a745" }}>{s.future}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Fremtid — kræver handling (større lager / flere enheder) */}
        {data && futureDays.length > 0 && (
          <div style={cardStyle}>
            <h2 style={{ margin: "0 0 12px", fontSize: "18px" }}>
              Kommende udsolgte dage <span style={{ fontSize: "13px", color: "#b3261e", fontWeight: 600 }}>({futureDays.length})</span>
            </h2>
            {renderDayList(futureDays, true)}
          </div>
        )}

        {/* Fortid */}
        {data && pastDays.length > 0 && (
          <div style={cardStyle}>
            <h2 style={{ margin: "0 0 12px", fontSize: "18px" }}>
              Tidligere udsolgte dage <span style={{ fontSize: "13px", color: "#888", fontWeight: 600 }}>({pastDays.length})</span>
            </h2>
            {renderDayList(pastDays, false)}
          </div>
        )}
      </main>
    </div>
  );
}
