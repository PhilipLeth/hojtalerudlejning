"use client";

import { useState, useEffect, useCallback } from "react";

interface Booking {
  id: string;
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
}

const STATUS_FLOW = ["ny", "bekraeftet", "afhentet", "afleveret"];

const STATUS_LABELS: Record<string, string> = {
  ny: "Ny",
  bekraeftet: "Bekraeftet",
  afhentet: "Afhentet",
  afleveret: "Afleveret",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ny: { bg: "#fff3cd", text: "#856404", border: "#ffc107" },
  bekraeftet: { bg: "#cce5ff", text: "#004085", border: "#4dabf7" },
  afhentet: { bg: "#d4edda", text: "#155724", border: "#28a745" },
  afleveret: { bg: "#e2e3e5", text: "#383d41", border: "#6c757d" },
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [inputSecret, setInputSecret] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

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
        if (res.status === 401) {
          localStorage.removeItem("admin_secret");
          setSecret("");
        }
        return;
      }
      setBookings(data.bookings || []);
    } catch {
      setError("Netvaerksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    if (secret) {
      fetchBookings();
      const interval = setInterval(fetchBookings, 30000);
      return () => clearInterval(interval);
    }
  }, [secret, fetchBookings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSecret.trim()) {
      localStorage.setItem("admin_secret", inputSecret.trim());
      setSecret(inputSecret.trim());
      setInputSecret("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_secret");
    setSecret("");
    setBookings([]);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/bookings-update?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
      } else {
        const data = await res.json();
        alert(data.error || "Opdatering fejlede");
      }
    } catch {
      alert("Netvaerksfejl");
    } finally {
      setUpdating(null);
    }
  };

  const getNextStatus = (current: string): string | null => {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  };

  if (!secret) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
        <form onSubmit={handleLogin} style={{ background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", maxWidth: "400px", width: "100%" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "24px", color: "#111" }}>Admin</h1>
          <p style={{ margin: "0 0 24px", color: "#666" }}>Indtast adgangskode</p>
          <input
            type="password"
            value={inputSecret}
            onChange={(e) => setInputSecret(e.target.value)}
            placeholder="Adgangskode"
            style={{ width: "100%", padding: "12px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "16px", boxSizing: "border-box", color: "#111" }}
          />
          <button type="submit" style={{ width: "100%", padding: "12px", fontSize: "16px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            Log ind
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: "20px" }}>Bookinger</h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "14px", color: "#666" }}>{bookings.length} booking{bookings.length !== 1 ? "er" : ""}</span>
          <a href="/admin/lager" style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111" }}>
            Lager
          </a>
          <a href="/admin/produkter" style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111" }}>
            Produkter
          </a>
          <a href="/admin/nyhedsbrev" style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111" }}>
            Nyhedsbrev
          </a>
          <a href="/admin/lejeseddel" style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111" }}>
            Lejeseddel
          </a>
          <button onClick={fetchBookings} disabled={loading} style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", color: "#111" }}>
            {loading ? "Henter..." : "Opdater"}
          </button>
          <button onClick={handleLogout} style={{ padding: "8px 16px", fontSize: "14px", background: "#fff", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", color: "#888" }}>
            Log ud
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
        {error && (
          <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {loading && bookings.length === 0 && <p style={{ textAlign: "center", color: "#888" }}>Henter bookinger...</p>}

        {!loading && bookings.length === 0 && !error && (
          <p style={{ textAlign: "center", color: "#888", marginTop: "60px" }}>Ingen bookinger endnu</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {bookings.map((b) => {
            const colors = STATUS_COLORS[b.status] || STATUS_COLORS.ny;
            const nextStatus = getNextStatus(b.status);
            return (
              <div key={b.id} style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px", fontSize: "18px" }}>{b.name}</h3>
                      <p style={{ margin: 0, color: "#888", fontSize: "13px" }}>
                        {new Date(b.createdAt).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                      {STATUS_LABELS[b.status] || b.status}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: "14px", marginBottom: "16px" }}>
                    <div><strong>Hojtaler:</strong> {b.speaker} ({b.speakerSize})</div>
                    <div><strong>Periode:</strong> {b.period}</div>
                    <div><strong>Dage:</strong> {b.days}</div>
                    <div><strong>Total:</strong> {b.total} kr</div>
                    <div><strong>Tilvalg:</strong> {b.addons?.length > 0 ? b.addons.join(", ") : "Ingen"}</div>
                    {b.deliveryAddress && <div><strong>Levering:</strong> {b.deliveryAddress}</div>}
                    <div><strong>Email:</strong> <a href={`mailto:${b.email}`} style={{ color: "#0070f3" }}>{b.email}</a></div>
                    <div><strong>Telefon:</strong> <a href={`tel:${b.phone}`} style={{ color: "#0070f3" }}>{b.phone}</a></div>
                    {b.comment && <div style={{ gridColumn: "1 / -1" }}><strong>Kommentar:</strong> {b.comment}</div>}
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {nextStatus && (
                    <button
                      onClick={() => updateStatus(b.id, nextStatus)}
                      disabled={updating === b.id}
                      style={{
                        padding: "8px 20px",
                        fontSize: "14px",
                        fontWeight: 600,
                        background: STATUS_COLORS[nextStatus].border,
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: updating === b.id ? "wait" : "pointer",
                        opacity: updating === b.id ? 0.6 : 1,
                      }}
                    >
                      {updating === b.id ? "Opdaterer..." : `Marker som ${STATUS_LABELS[nextStatus]}`}
                    </button>
                  )}
                  <a
                    href="/admin/lejeseddel"
                    onClick={() => sessionStorage.setItem("lejeseddel_booking", JSON.stringify(b))}
                    style={{ display: "inline-block", padding: "8px 20px", fontSize: "14px", fontWeight: 500, background: "#f0f0f0", color: "#333", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", cursor: "pointer" }}
                  >
                    Print lejeseddel
                  </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
