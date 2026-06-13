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

interface BlockedDate {
  date: string;
  reason: string;
  products: string[];
}

const PRODUCT_IDS = ["party", "festival", "lys"];
const PRODUCT_LABELS: Record<string, string> = {
  party: "Party",
  festival: "Festival",
  lys: "Lys",
};

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

  // Inventory state
  const [inventory, setInventory] = useState<Record<string, number>>({ party: 1, festival: 1, lys: 2 });
  const [inventoryDraft, setInventoryDraft] = useState<Record<string, number>>({ party: 1, festival: 1, lys: 2 });
  const [savingInventory, setSavingInventory] = useState(false);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockProducts, setBlockProducts] = useState<string[]>([]);
  const [blockingSaving, setBlockingSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("admin_secret");
    if (stored) {
      setSecret(stored);
    }
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

  const fetchInventory = useCallback(async () => {
    try {
      const today = new Date();
      const from = today.toISOString().slice(0, 10);
      const future = new Date(today);
      future.setDate(future.getDate() + 90);
      const to = future.toISOString().slice(0, 10);
      const res = await fetch(`/api/availability?from=${from}&to=${to}`);
      const data = await res.json();
      if (data.inventory) {
        setInventory(data.inventory);
        setInventoryDraft(data.inventory);
      }
      if (data.blocked_dates) {
        setBlockedDates(data.blocked_dates);
      }
    } catch {
      // silent
    }
  }, []);

  const saveInventory = async () => {
    setSavingInventory(true);
    try {
      const res = await fetch(`/api/inventory?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_inventory", inventory: inventoryDraft }),
      });
      if (res.ok) {
        setInventory(inventoryDraft);
      } else {
        const data = await res.json();
        alert(data.error || "Kunne ikke gemme");
      }
    } catch {
      alert("Netvaerksfejl");
    } finally {
      setSavingInventory(false);
    }
  };

  const addBlockedDate = async () => {
    if (!blockDate) return;
    setBlockingSaving(true);
    try {
      const res = await fetch(`/api/inventory?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "block_date", date: blockDate, reason: blockReason, products: blockProducts }),
      });
      if (res.ok) {
        setBlockedDates((prev) => [...prev, { date: blockDate, reason: blockReason, products: blockProducts }].sort((a, b) => a.date.localeCompare(b.date)));
        setBlockDate("");
        setBlockReason("");
        setBlockProducts([]);
      } else {
        const data = await res.json();
        alert(data.error || "Kunne ikke blokere dato");
      }
    } catch {
      alert("Netvaerksfejl");
    } finally {
      setBlockingSaving(false);
    }
  };

  const removeBlockedDate = async (date: string) => {
    try {
      const res = await fetch(`/api/inventory?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unblock_date", date }),
      });
      if (res.ok) {
        setBlockedDates((prev) => prev.filter((b) => b.date !== date));
      }
    } catch {
      alert("Netvaerksfejl");
    }
  };

  useEffect(() => {
    if (secret) {
      fetchBookings();
      fetchInventory();
      const interval = setInterval(fetchBookings, 30000);
      return () => clearInterval(interval);
    }
  }, [secret, fetchBookings, fetchInventory]);

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
            style={{ width: "100%", padding: "12px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "16px", boxSizing: "border-box" }}
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
          <span style={{ fontSize: "14px", color: "#888" }}>{bookings.length} booking{bookings.length !== 1 ? "er" : ""}</span>
          <button onClick={fetchBookings} disabled={loading} style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer" }}>
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

        {/* ── Inventory Management ── */}
        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "20px", marginBottom: "24px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "18px" }}>Lagerbeholdning</h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "12px" }}>
            {PRODUCT_IDS.map((pid) => (
              <div key={pid} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600 }}>{PRODUCT_LABELS[pid]}:</label>
                <input
                  type="number"
                  min={0}
                  value={inventoryDraft[pid] ?? 0}
                  onChange={(e) => setInventoryDraft((prev) => ({ ...prev, [pid]: parseInt(e.target.value) || 0 }))}
                  style={{ width: "60px", padding: "6px 8px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "6px", textAlign: "center" }}
                />
              </div>
            ))}
            <button
              onClick={saveInventory}
              disabled={savingInventory || JSON.stringify(inventory) === JSON.stringify(inventoryDraft)}
              style={{
                padding: "6px 16px",
                fontSize: "14px",
                fontWeight: 600,
                background: JSON.stringify(inventory) === JSON.stringify(inventoryDraft) ? "#e0e0e0" : "#000",
                color: JSON.stringify(inventory) === JSON.stringify(inventoryDraft) ? "#999" : "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: savingInventory ? "wait" : "pointer",
              }}
            >
              {savingInventory ? "Gemmer..." : "Gem"}
            </button>
          </div>
        </div>

        {/* ── Block Dates ── */}
        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "20px", marginBottom: "24px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "18px" }}>Blokerede datoer</h2>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>Dato</label>
              <input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                style={{ padding: "6px 10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "6px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>Aarsag</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="F.eks. vedligeholdelse"
                style={{ padding: "6px 10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "6px", width: "200px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>Produkter</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {PRODUCT_IDS.map((pid) => (
                  <label key={pid} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={blockProducts.includes(pid)}
                      onChange={(e) => {
                        if (e.target.checked) setBlockProducts((prev) => [...prev, pid]);
                        else setBlockProducts((prev) => prev.filter((p) => p !== pid));
                      }}
                    />
                    {PRODUCT_LABELS[pid]}
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={addBlockedDate}
              disabled={!blockDate || blockingSaving}
              style={{
                padding: "6px 16px",
                fontSize: "14px",
                fontWeight: 600,
                background: !blockDate ? "#e0e0e0" : "#c0392b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: blockingSaving ? "wait" : "pointer",
                opacity: !blockDate ? 0.5 : 1,
              }}
            >
              {blockingSaving ? "Blokerer..." : "Bloker"}
            </button>
          </div>

          {blockedDates.length === 0 && (
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Ingen blokerede datoer</p>
          )}

          {blockedDates.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {blockedDates.map((bd) => (
                <div key={bd.date} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", background: "#fef3f2", borderRadius: "8px", fontSize: "14px" }}>
                  <span style={{ fontWeight: 600 }}>{bd.date}</span>
                  {bd.reason && <span style={{ color: "#666" }}>{bd.reason}</span>}
                  {bd.products.length > 0 && (
                    <span style={{ color: "#888", fontSize: "12px" }}>({bd.products.map((p) => PRODUCT_LABELS[p] || p).join(", ")})</span>
                  )}
                  {bd.products.length === 0 && (
                    <span style={{ color: "#888", fontSize: "12px" }}>(alle produkter)</span>
                  )}
                  <button
                    onClick={() => removeBlockedDate(bd.date)}
                    style={{ marginLeft: "auto", padding: "2px 10px", fontSize: "12px", background: "#fff", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", color: "#c0392b" }}
                  >
                    Fjern
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
