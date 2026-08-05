"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

interface Booking {
  id: string;
  paid?: boolean;
  paidAmount?: number;
  speaker: string;
  speakerSize: string;
  period: string;
  days: number;
  addons: string[];
  deliveryAddress?: string;
  total: number;
  name: string;
  email: string;
  phone: string;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  reviewMailSentAt?: string;
  communications?: Array<{ type: string; label: string; to?: string; sentAt: string; note?: string }>;
}

const STATUS_FLOW = ["ny", "bekraeftet", "afhentet", "afleveret"];
const STATUS_LABELS: Record<string, string> = { ny: "Ny", bekraeftet: "Bekræftet", afhentet: "Afhentet", afleveret: "Afleveret" };
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ny: { bg: "#fff3cd", text: "#856404", border: "#ffc107" },
  bekraeftet: { bg: "#cce5ff", text: "#004085", border: "#4dabf7" },
  afhentet: { bg: "#d4edda", text: "#155724", border: "#28a745" },
  afleveret: { bg: "#e2e3e5", text: "#383d41", border: "#6c757d" },
};

type FilterPeriod = "alle" | "7dage" | "maaned" | "kommende";
type SortField = "dato" | "weekend" | "total" | "navn";

function pickupDateFromBooking(b: Booking): Date {
  const m = b.id.match(/^(\d{4})(\d{2})(\d{2})/);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}`);
  return new Date(b.createdAt);
}

function weekendFriday(b: Booking): Date {
  const d = pickupDateFromBooking(b);
  const day = d.getDay();
  const daysToFri = (5 - day + 7) % 7;
  const fri = new Date(d);
  fri.setDate(d.getDate() + (daysToFri === 0 ? 0 : daysToFri));
  return fri;
}

function weekendKey(b: Booking): string {
  const fri = weekendFriday(b);
  return `${fri.getFullYear()}-${String(fri.getMonth() + 1).padStart(2, "0")}-${String(fri.getDate()).padStart(2, "0")}`;
}

function formatWeekendLabel(key: string): string {
  const fri = new Date(key);
  const sun = new Date(fri); sun.setDate(fri.getDate() + 2);
  const fmtFri = fri.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
  const fmtSun = sun.toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });
  return `${fmtFri} – ${fmtSun}`;
}

const navLink: React.CSSProperties = {
  padding: "6px 14px", fontSize: "13px", background: "#f0f0f0",
  border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111",
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [inputSecret, setInputSecret] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("kommende");
  const [filterStatus, setFilterStatus] = useState<string>("alle");
  const [sortBy, setSortBy] = useState<SortField>("weekend");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin_secret");
    if (stored) setSecret(stored);
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kunne ikke hente bookinger");
        if (res.status === 401) { localStorage.removeItem("admin_secret"); setSecret(""); }
        return;
      }
      setBookings(data.bookings || []);
    } catch { setError("Netværksfejl"); }
    finally { setLoading(false); }
  }, [secret]);

  useEffect(() => {
    if (secret) {
      fetchBookings();
      const interval = setInterval(fetchBookings, 30000);
      return () => clearInterval(interval);
    }
  }, [secret, fetchBookings]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/bookings-update?secret=${encodeURIComponent(secret)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
      else { const data = await res.json(); alert(data.error || "Opdatering fejlede"); }
    } catch { alert("Netværksfejl"); }
    finally { setUpdating(null); }
  };

  const deleteBooking = async (id: string, name: string) => {
    // Dobbelt-tjek mod fejlklik: bekræft + skriv SLET
    if (!confirm(`Slet bookingen fra "${name}"?\n\nDette fjerner den permanent og kan ikke fortrydes.`)) return;
    const typed = prompt(`Skriv SLET for at bekræfte sletning af "${name}":`);
    if (typed?.trim().toUpperCase() !== "SLET") return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/bookings-update?secret=${encodeURIComponent(secret)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });
      if (res.ok) setBookings((prev) => prev.filter((b) => b.id !== id));
      else { const data = await res.json(); alert(data.error || "Sletning fejlede"); }
    } catch { alert("Netværksfejl"); }
    finally { setUpdating(null); }
  };

  const getNextStatus = (current: string) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const filtered = useMemo(() => {
    const now = new Date();
    const in7 = new Date(now); in7.setDate(now.getDate() + 7);
    const inMonth = new Date(now); inMonth.setDate(now.getDate() + 30);

    return bookings
      .filter((b) => {
        const d = pickupDateFromBooking(b);
        if (filterPeriod === "7dage") return d >= now && d <= in7;
        if (filterPeriod === "maaned") return d >= now && d <= inMonth;
        if (filterPeriod === "kommende") return d >= new Date(now.getTime() - 86400000 * 2); // include ongoing
        return true;
      })
      .filter((b) => filterStatus === "alle" || b.status === filterStatus)
      .sort((a, b) => {
        if (sortBy === "weekend") return weekendKey(a).localeCompare(weekendKey(b));
        if (sortBy === "dato") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === "total") return b.total - a.total;
        if (sortBy === "navn") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [bookings, filterPeriod, filterStatus, sortBy]);

  // Group filtered bookings by weekend
  const grouped = useMemo(() => {
    if (sortBy !== "weekend") return null;
    const map = new Map<string, Booking[]>();
    for (const b of filtered) {
      const key = weekendKey(b);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return [...map.entries()].map(([key, bs]) => ({ key, label: formatWeekendLabel(key), bookings: bs }));
  }, [filtered, sortBy]);

  if (!secret) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
        <form onSubmit={(e) => { e.preventDefault(); if (inputSecret.trim()) { localStorage.setItem("admin_secret", inputSecret.trim()); setSecret(inputSecret.trim()); setInputSecret(""); } }} style={{ background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", maxWidth: "400px", width: "100%" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "24px" }}>Admin</h1>
          <p style={{ margin: "0 0 24px", color: "#666" }}>Indtast adgangskode</p>
          <input type="password" value={inputSecret} onChange={(e) => setInputSecret(e.target.value)} placeholder="Adgangskode" style={{ width: "100%", padding: "12px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "16px", boxSizing: "border-box", color: "#111" }} />
          <button type="submit" style={{ width: "100%", padding: "12px", fontSize: "16px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Log ind</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Bookinger</h1>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <a href="/admin/lager" style={navLink}>Lager</a>
          <a href="/admin/udsolgt" style={navLink}>Udsolgt</a>
          <a href="/admin/produkter" style={navLink}>Produkter</a>
          <a href="/admin/kanaler" style={navLink}>Kanaler</a>
          <a href="/admin/nyhedsbrev" style={navLink}>Nyhedsbrev</a>
          <a href="/admin/lejeseddel" style={navLink}>Lejeseddel</a>
          <button onClick={fetchBookings} disabled={loading} style={{ ...navLink, cursor: "pointer", border: "none" as React.CSSProperties["border"] }}>
            {loading ? "Henter..." : "↺ Opdater"}
          </button>
          <button onClick={() => { localStorage.removeItem("admin_secret"); setSecret(""); setBookings([]); }} style={{ fontSize: "13px", background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>Log ud</button>
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 16px" }}>
        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px" }}>{error}</div>}

        {/* Filters */}
        <div style={{ background: "#fff", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {(["kommende", "7dage", "maaned", "alle"] as FilterPeriod[]).map((p) => (
              <button key={p} onClick={() => setFilterPeriod(p)} style={{ padding: "5px 12px", fontSize: "12px", fontWeight: filterPeriod === p ? 700 : 400, background: filterPeriod === p ? "#111" : "#f0f0f0", color: filterPeriod === p ? "#fff" : "#555", border: "none", borderRadius: "20px", cursor: "pointer" }}>
                {{ kommende: "Kommende", "7dage": "7 dage", maaned: "30 dage", alle: "Alle" }[p]}
              </button>
            ))}
          </div>
          <div style={{ width: "1px", height: "20px", background: "#eee" }} />
          <div style={{ display: "flex", gap: "4px" }}>
            {["alle", ...STATUS_FLOW].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "5px 12px", fontSize: "12px", fontWeight: filterStatus === s ? 700 : 400, background: filterStatus === s ? (STATUS_COLORS[s]?.bg ?? "#111") : "#f0f0f0", color: filterStatus === s ? (STATUS_COLORS[s]?.text ?? "#fff") : "#555", border: filterStatus === s ? `1px solid ${STATUS_COLORS[s]?.border ?? "#111"}` : "1px solid transparent", borderRadius: "20px", cursor: "pointer" }}>
                {s === "alle" ? "Alle statusser" : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#888" }}>
            Sortér:
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortField)} style={{ fontSize: "12px", padding: "4px 8px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff" }}>
              <option value="weekend">Weekend</option>
              <option value="dato">Oprettelsesdato</option>
              <option value="total">Beløb</option>
              <option value="navn">Navn</option>
            </select>
            <span style={{ color: "#bbb" }}>{filtered.length} booking{filtered.length !== 1 ? "er" : ""}</span>
          </div>
        </div>

        {/* Table or weekend groups */}
        {filtered.length === 0 && !loading && (
          <p style={{ textAlign: "center", color: "#aaa", marginTop: "60px" }}>Ingen bookinger matcher filteret</p>
        )}

        {grouped ? (
          grouped.map(({ key, label, bookings: group }) => (
            <div key={key} style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ background: "#111", color: "#fff", borderRadius: "6px", padding: "2px 10px", fontSize: "12px", fontWeight: 700 }}>Weekend</span>
                <span style={{ fontWeight: 600, fontSize: "14px" }}>{label}</span>
                <span style={{ color: "#aaa", fontSize: "12px" }}>{group.length} booking{group.length !== 1 ? "er" : ""}</span>
              </div>
              <BookingTable bookings={group} expanded={expanded} setExpanded={setExpanded} updateStatus={updateStatus} deleteBooking={deleteBooking} updating={updating} getNextStatus={getNextStatus} secret={secret} />
            </div>
          ))
        ) : (
          <BookingTable bookings={filtered} expanded={expanded} setExpanded={setExpanded} updateStatus={updateStatus} deleteBooking={deleteBooking} updating={updating} getNextStatus={getNextStatus} secret={secret} />
        )}
      </main>
    </div>
  );
}

function BookingTable({ bookings, expanded, setExpanded, updateStatus, deleteBooking, updating, getNextStatus, secret }: {
  bookings: Booking[];
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  updateStatus: (id: string, status: string) => void;
  deleteBooking: (id: string, name: string) => void;
  updating: string | null;
  getNextStatus: (s: string) => string | null;
  secret: string;
}) {
  if (bookings.length === 0) return null;

  const thStyle: React.CSSProperties = { padding: "8px 12px", fontSize: "11px", fontWeight: 700, textAlign: "left", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #eee", whiteSpace: "nowrap" };
  const tdStyle: React.CSSProperties = { padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #f5f5f5", verticalAlign: "middle" };

  return (
    <div style={{ background: "#fff", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#fafafa" }}>
          <tr>
            <th style={thStyle}>Navn</th>
            <th style={thStyle}>Produkt</th>
            <th style={thStyle}>Periode</th>
            <th style={thStyle}>Total</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Handling</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const colors = STATUS_COLORS[b.status] || STATUS_COLORS.ny;
            const nextStatus = getNextStatus(b.status);
            const isExpanded = expanded === b.id;
            return (
              <>
                <tr key={b.id} style={{ cursor: "pointer", background: isExpanded ? "#fafffe" : "transparent" }} onClick={() => setExpanded(isExpanded ? null : b.id)}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{b.name}</div>
                    <div style={{ fontSize: "11px", color: "#aaa" }}>{new Date(b.createdAt).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </td>
                  <td style={tdStyle}>
                    <div>{b.speaker}</div>
                    {b.addons?.length > 0 && <div style={{ fontSize: "11px", color: "#aaa" }}>{b.addons.join(", ")}</div>}
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{b.period}</td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{b.total} kr</td>
                  <td style={tdStyle}>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                      {STATUS_LABELS[b.status] || b.status}
                    </span>
                    {b.paid && (
                      <span style={{ display: "inline-block", marginLeft: "6px", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: "#d1f7e3", color: "#0a7a43", border: "1px solid #28a745" }}>
                        Betalt online{b.paidAmount ? ` · ${Math.round(b.paidAmount / 100)} kr` : ""}
                      </span>
                    )}
                    {b.reviewMailSentAt && (
                      <div style={{ fontSize: "10px", color: "#aaa", marginTop: "3px" }} title={`Anmeldelsesmail sendt ${new Date(b.reviewMailSentAt).toLocaleString("da-DK")}`}>
                        ⭐ Review-mail sendt
                      </div>
                    )}
                  </td>
                  <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "nowrap" }}>
                      {nextStatus && (
                        <button onClick={() => updateStatus(b.id, nextStatus)} disabled={updating === b.id} style={{ padding: "4px 10px", fontSize: "11px", fontWeight: 600, background: STATUS_COLORS[nextStatus].border, color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap", opacity: updating === b.id ? 0.6 : 1 }}>
                          {updating === b.id ? "..." : STATUS_LABELS[nextStatus]}
                        </button>
                      )}
                      <a href="/admin/lejeseddel" onClick={() => sessionStorage.setItem("lejeseddel_booking", JSON.stringify(b))} style={{ padding: "4px 10px", fontSize: "11px", background: "#f0f0f0", color: "#555", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", whiteSpace: "nowrap" }}>
                        Print
                      </a>
                      <button onClick={() => deleteBooking(b.id, b.name)} disabled={updating === b.id} title="Slet booking" style={{ padding: "4px 10px", fontSize: "11px", background: "#fff", color: "#dc3545", border: "1px solid #dc3545", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap", opacity: updating === b.id ? 0.6 : 1 }}>
                        Slet
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${b.id}-detail`}>
                    <td colSpan={6} style={{ padding: "0 12px 16px", background: "#fafffe", borderBottom: "1px solid #eee" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px 24px", fontSize: "13px", paddingTop: "12px" }}>
                        <div><strong>Email:</strong> <a href={`mailto:${b.email}`} style={{ color: "#0070f3" }}>{b.email}</a></div>
                        <div><strong>Telefon:</strong> <a href={`tel:${b.phone}`} style={{ color: "#0070f3" }}>{b.phone}</a></div>
                        <div><strong>Dage:</strong> {b.days}</div>
                        {b.deliveryAddress && <div><strong>Levering:</strong> {b.deliveryAddress}</div>}
                        {b.comment && <div style={{ gridColumn: "1 / -1" }}><strong>Kommentar:</strong> {b.comment}</div>}
                        <div style={{ gridColumn: "1 / -1" }}>
                          <strong>Sendte mails:</strong>
                          {(b.communications?.length ?? 0) === 0 ? (
                            <span style={{ color: "#aaa" }}>
                              {" "}
                              {b.reviewMailSentAt
                                ? `Anmeldelsesmail sendt ${new Date(b.reviewMailSentAt).toLocaleString("da-DK")}`
                                : "Ingen registreret (booking fra før loggen blev indført)"}
                            </span>
                          ) : (
                            <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                              {b.communications!.map((m, i) => (
                                <li key={i} style={{ fontSize: "12px", color: "#555", marginBottom: "2px" }}>
                                  <span style={{ fontWeight: 600 }}>{m.label}</span>
                                  {" · "}
                                  {new Date(m.sentAt).toLocaleString("da-DK")}
                                  {m.to ? ` · ${m.to}` : ""}
                                  {m.note ? (
                                    <span style={{ color: "#888" }}> · {m.note}</span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div style={{ gridColumn: "1 / -1", fontSize: "11px", color: "#aaa" }}>ID: {b.id}</div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
