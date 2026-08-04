"use client";

import { useState, useEffect, useCallback } from "react";

interface BlockedDate {
  date: string;
  reason: string;
  products: string[];
}

const PRODUCT_IDS = ["thumpgo", "party", "soundboks", "festival", "lys", "rog", "stativer", "taske", "subwoofer"];
const PRODUCT_LABELS: Record<string, string> = {
  thumpgo: "Thump GO",
  party: "Party",
  soundboks: "Soundboks",
  festival: "Festival",
  lys: "Lys",
  rog: "Røgmaskine",
  stativer: "Stativer",
  taske: "Taske",
  subwoofer: "Subwoofer 12\"",
};

export default function LagerPage() {
  const [secret, setSecret] = useState("");

  const [inventory, setInventory] = useState<Record<string, number>>({ thumpgo: 1, party: 1, soundboks: 1, festival: 1, lys: 2, rog: 1, stativer: 2, taske: 2 });
  const [inventoryDraft, setInventoryDraft] = useState<Record<string, number>>({ thumpgo: 1, party: 1, soundboks: 1, festival: 1, lys: 2, rog: 1, stativer: 2, taske: 2 });
  const [savingInventory, setSavingInventory] = useState(false);

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockProducts, setBlockProducts] = useState<string[]>([]);
  const [blockingSaving, setBlockingSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("admin_secret");
    if (stored) setSecret(stored);
    else window.location.href = "/admin";
  }, []);

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

  useEffect(() => {
    if (secret) fetchInventory();
  }, [secret, fetchInventory]);

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
      alert("Netværksfejl");
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
      alert("Netværksfejl");
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
      alert("Netværksfejl");
    }
  };

  if (!secret) return null;

  const inventoryChanged = JSON.stringify(inventory) !== JSON.stringify(inventoryDraft);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: "20px" }}>Lager &amp; blokering</h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <a href="/admin" style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111" }}>
            Bookinger
          </a>
          <a href="/admin/udsolgt" style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111" }}>
            Udsolgt
          </a>
          <a href="/admin/produkter" style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111" }}>
            Produkter
          </a>
          <a href="/admin/kanaler" style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111" }}>
            Kanaler
          </a>
          <a href="/admin/nyhedsbrev" style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111" }}>
            Nyhedsbrev
          </a>
          <a href="/admin/lejeseddel" style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111" }}>
            Lejeseddel
          </a>
        </div>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
        {/* Inventory */}
        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "20px", marginBottom: "24px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "18px" }}>Lagerbeholdning</h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "12px", alignItems: "center" }}>
            {PRODUCT_IDS.map((pid) => (
              <div key={pid} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600 }}>{PRODUCT_LABELS[pid]}:</label>
                <input
                  type="number"
                  min={0}
                  value={inventoryDraft[pid] ?? 0}
                  onChange={(e) => setInventoryDraft((prev) => ({ ...prev, [pid]: parseInt(e.target.value) || 0 }))}
                  style={{ width: "60px", padding: "6px 8px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "6px", textAlign: "center", color: "#111" }}
                />
              </div>
            ))}
            <button
              onClick={saveInventory}
              disabled={savingInventory || !inventoryChanged}
              style={{
                padding: "6px 16px",
                fontSize: "14px",
                fontWeight: 600,
                background: !inventoryChanged ? "#e0e0e0" : "#000",
                color: !inventoryChanged ? "#999" : "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: savingInventory ? "wait" : "pointer",
              }}
            >
              {savingInventory ? "Gemmer..." : "Gem"}
            </button>
          </div>
        </div>

        {/* Blocked dates */}
        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "20px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "18px" }}>Blokerede datoer</h2>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>Dato</label>
              <input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                style={{ padding: "6px 10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "6px", color: "#111" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>Årsag</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="F.eks. vedligeholdelse"
                style={{ padding: "6px 10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "6px", width: "200px", color: "#111" }}
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
      </main>
    </div>
  );
}
