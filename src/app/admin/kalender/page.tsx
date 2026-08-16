"use client";

import AdminNav from "@/components/AdminNav";

import { useState, useEffect, useCallback, useMemo } from "react";

interface OccBooking {
  bookingId: string;
  customerName: string;
  phone?: string;
  pickup: string;
  returnDate: string;
  start: string;
  end: string;
  lane: number;
  overflow: boolean;
}

interface OccProduct {
  id: string;
  name: string;
  category: string;
  stock: number;
  bookings: OccBooking[];
  peak: number;
}

interface BlockedDay {
  date: string;
  reason: string;
  products: string[];
}

interface OccupancyResponse {
  from: string;
  to: string;
  days: string[];
  products: OccProduct[];
  blocked: BlockedDay[];
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

const CAT_LABEL: Record<string, string> = {
  lyd: "Lyd",
  lys: "Lys",
  roeg: "Røg",
  av: "AV",
  øvrigt: "Øvrigt",
};

const DAY_NAMES = ["sø", "ma", "ti", "on", "to", "fr", "lø"];

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayMeta(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return {
    dow: DAY_NAMES[d.getDay()],
    date: d.getDate(),
    weekend: d.getDay() === 0 || d.getDay() === 6,
  };
}

function colIndex(days: string[], iso: string): number {
  return days.indexOf(iso);
}

const LANE_COLORS = ["#3b82f6", "#8b5cf6", "#059669", "#d97706", "#db2777", "#0891b2"];

export default function KalenderPage() {
  const [secret, setSecret] = useState("");
  const [horizon, setHorizon] = useState(30);
  const [from, setFrom] = useState(todayIso);
  const [data, setData] = useState<OccupancyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<string>("alle");
  const [onlyBooked, setOnlyBooked] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<OccBooking | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin_secret");
    if (stored) setSecret(stored);
    else window.location.href = "/admin";
  }, []);

  const to = useMemo(() => addDaysIso(from, horizon - 1), [from, horizon]);

  const load = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/occupancy?from=${from}&to=${to}&secret=${encodeURIComponent(secret)}`,
      );
      const json: OccupancyResponse = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("admin_secret");
          window.location.href = "/admin";
          return;
        }
        setError(json.error || "Kunne ikke hente belægning");
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
    load();
  }, [load]);

  const blockedSet = useMemo(() => {
    const m = new Map<string, BlockedDay>();
    for (const b of data?.blocked || []) m.set(b.date, b);
    return m;
  }, [data]);

  const products = useMemo(() => {
    let list = data?.products || [];
    if (category !== "alle") list = list.filter((p) => p.category === category);
    if (onlyBooked) list = list.filter((p) => p.bookings.length > 0);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.includes(q) ||
          p.bookings.some((b) => b.customerName.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [data, category, onlyBooked, search]);

  if (!secret) return null;

  const days = data?.days || [];
  const colW = 36;
  const labelW = 160;
  const laneH = 22;
  const laneGap = 2;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <AdminNav />

      <main style={{ padding: "16px 20px", maxWidth: "1400px", margin: "0 auto" }}>
        <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#666" }}>
          Produkter lodret, dage vandret. Hver bane = én enhed i lageret. Bookinger lægges i den første ledige bane.
        </p>

        <div
          style={{
            background: "#fff",
            borderRadius: "10px",
            padding: "12px 14px",
            marginBottom: "14px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <label style={{ fontSize: "12px", color: "#666" }}>
            Fra{" "}
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value || todayIso())}
              style={{ marginLeft: 4, padding: "4px 6px", border: "1px solid #ddd", borderRadius: 6 }}
            />
          </label>
          <div style={{ display: "flex", gap: 4 }}>
            {[7, 14, 30, 60].map((n) => (
              <button
                key={n}
                onClick={() => setHorizon(n)}
                style={{
                  padding: "5px 10px",
                  fontSize: 12,
                  fontWeight: horizon === n ? 700 : 400,
                  background: horizon === n ? "#111" : "#f0f0f0",
                  color: horizon === n ? "#fff" : "#555",
                  border: "none",
                  borderRadius: 16,
                  cursor: "pointer",
                }}
              >
                {n} dage
              </button>
            ))}
          </div>
          <button
            onClick={() => setFrom(todayIso())}
            style={{ ...navLink, cursor: "pointer", fontSize: 12 }}
          >
            I dag
          </button>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: "5px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13 }}
          >
            <option value="alle">Alle kategorier</option>
            {Object.entries(CAT_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={onlyBooked} onChange={(e) => setOnlyBooked(e.target.checked)} />
            Kun med bookinger
          </label>
          <input
            type="search"
            placeholder="Søg produkt eller kunde…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, minWidth: 180 }}
          />
        </div>

        {error && (
          <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
            {error}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div style={{ background: "#fff", padding: 40, borderRadius: 10, textAlign: "center", color: "#888" }}>
            Ingen produkter matcher filtrene i perioden.
          </div>
        )}

        {days.length > 0 && products.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              overflow: "auto",
              maxHeight: "calc(100vh - 220px)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: `${labelW}px repeat(${days.length}, ${colW}px)`, minWidth: labelW + days.length * colW }}>
              {/* Header */}
              <div
                style={{
                  position: "sticky",
                  left: 0,
                  top: 0,
                  zIndex: 3,
                  background: "#fafafa",
                  borderBottom: "1px solid #eee",
                  borderRight: "1px solid #eee",
                  padding: "8px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#888",
                }}
              >
                Produkt
              </div>
              {days.map((day) => {
                const m = dayMeta(day);
                const blocked = blockedSet.has(day);
                return (
                  <div
                    key={day}
                    title={day + (blocked ? ` — blokeret: ${blockedSet.get(day)?.reason || ""}` : "")}
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: blocked ? "#fce8e6" : m.weekend ? "#f7f7ff" : "#fafafa",
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #f0f0f0",
                      textAlign: "center",
                      padding: "4px 0",
                      fontSize: 10,
                      color: m.weekend ? "#6366f1" : "#666",
                    }}
                  >
                    <div style={{ textTransform: "uppercase", fontWeight: 600 }}>{m.dow}</div>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{m.date}</div>
                  </div>
                );
              })}

              {/* Rows */}
              {products.map((p) => {
                const lanes = Math.max(p.stock, 1, ...p.bookings.map((b) => b.lane + 1));
                const rowH = lanes * (laneH + laneGap) + 8;
                const full = p.peak >= p.stock && p.stock > 0;
                const partial = p.peak > 0 && !full;

                return (
                  <div key={p.id} style={{ display: "contents" }}>
                    <div
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        background: "#fff",
                        borderBottom: "1px solid #f0f0f0",
                        borderRight: "1px solid #eee",
                        padding: "8px 10px",
                        minHeight: rowH,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                        {p.stock} stk
                        {p.bookings.length > 0 && (
                          <span style={{ marginLeft: 6, color: full ? "#c0392b" : partial ? "#d97706" : "#888" }}>
                            · peak {p.peak}/{p.stock || "?"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        gridColumn: `2 / span ${days.length}`,
                        position: "relative",
                        borderBottom: "1px solid #f0f0f0",
                        minHeight: rowH,
                        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent ${colW - 1}px, #f0f0f0 ${colW - 1}px, #f0f0f0 ${colW}px)`,
                      }}
                    >
                      {/* Blocked overlay per day for this product */}
                      {days.map((day, di) => {
                        const bl = blockedSet.get(day);
                        if (!bl) return null;
                        if (bl.products.length && !bl.products.includes(p.id)) return null;
                        return (
                          <div
                            key={`bl-${day}`}
                            title={bl.reason || "Blokeret"}
                            style={{
                              position: "absolute",
                              left: di * colW,
                              top: 0,
                              width: colW,
                              height: "100%",
                              background: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(192,57,43,0.08) 4px, rgba(192,57,43,0.08) 8px)",
                              pointerEvents: "none",
                            }}
                          />
                        );
                      })}

                      {p.bookings.map((b) => {
                        const si = colIndex(days, b.start);
                        const ei = colIndex(days, b.end);
                        if (si < 0 || ei < 0) return null;
                        const color = b.overflow
                          ? "#c0392b"
                          : LANE_COLORS[b.lane % LANE_COLORS.length];
                        return (
                          <button
                            key={`${b.bookingId}-${b.lane}`}
                            type="button"
                            onClick={() => setSelected(b)}
                            title={`${b.customerName}\n${b.pickup} → ${b.returnDate}${b.overflow ? "\n⚠ Over booking" : ""}`}
                            style={{
                              position: "absolute",
                              left: si * colW + 2,
                              width: (ei - si + 1) * colW - 4,
                              top: 4 + b.lane * (laneH + laneGap),
                              height: laneH,
                              background: color,
                              border: "none",
                              borderRadius: 4,
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "0 4px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              cursor: "pointer",
                              textAlign: "left",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                            }}
                          >
                            {b.customerName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selected && (
          <div
            onClick={() => setSelected(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                maxWidth: 360,
                width: "100%",
                boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
              }}
            >
              <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>{selected.customerName}</h2>
              {selected.phone && (
                <p style={{ margin: "0 0 6px", fontSize: 13 }}>
                  <a href={`tel:${selected.phone}`} style={{ color: "#2563eb" }}>{selected.phone}</a>
                </p>
              )}
              <p style={{ margin: "0 0 6px", fontSize: 13, color: "#555" }}>
                {selected.pickup} → {selected.returnDate}
              </p>
              <p style={{ margin: "0 0 14px", fontSize: 12, color: "#888" }}>
                Bane {selected.lane + 1}
                {selected.overflow ? " · overbooking" : ""}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href="/admin"
                  onClick={() => {
                    try {
                      sessionStorage.setItem("admin_focus_booking", selected.bookingId);
                    } catch { /* ignore */ }
                  }}
                  style={{
                    ...navLink,
                    background: "#111",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Åbn bookinger
                </a>
                <button onClick={() => setSelected(null)} style={{ ...navLink, cursor: "pointer" }}>
                  Luk
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
