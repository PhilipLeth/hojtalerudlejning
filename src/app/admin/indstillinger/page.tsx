"use client";

import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";

import { useState, useEffect, useCallback } from "react";
import { phoneFromInput } from "@/lib/phone";
import { clearSiteSettingsCache } from "@/lib/useSiteSettings";

const navLink: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: "13px",
  color: "#555",
  textDecoration: "none",
  border: "1px solid #ddd",
  borderRadius: "6px",
  background: "#fff",
};

export default function IndstillingerPage() {
  const { secret, user, ready, isLoggedIn, logout, unauthorized } = useAdminAuth();
  const [phone, setPhone] = useState("");
  const [savedDisplay, setSavedDisplay] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");


  const load = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/site-settings");
      const json = (await res.json()) as {
        display?: string;
        phone?: string;
        updatedAt?: string | null;
      };
      setPhone(json.display || json.phone || "");
      setSavedDisplay(json.display || "");
      setUpdatedAt(json.updatedAt ?? null);
    } catch {
      setError("Kunne ikke hente indstillinger");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    try {
      const res = await fetch(`/api/site-settings?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = (await res.json()) as { error?: string; display?: string; updatedAt?: string };
      if (!res.ok) {
        if (res.status === 401) { unauthorized(); return; }
        setError(json.error || "Kunne ikke gemme");
        return;
      }
      setSavedDisplay(json.display || phoneFromInput(phone).display);
      setUpdatedAt(json.updatedAt ?? null);
      setPhone(json.display || phone);
      clearSiteSettingsCache();
      setOk(`Gemt — sitet viser nu ${json.display}. Ingen deploy nødvendig.`);
    } catch {
      setError("Netværksfejl");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Indstillinger" />;

  const preview = phoneFromInput(phone);

  return (
    <>
      <AdminNav
        title="Indstillinger"
        actions={
          <button onClick={load} disabled={loading} style={{ ...navLink, cursor: "pointer" }}>
            {loading ? "Henter…" : "↺ Opdater"}
          </button>
        }
      />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "20px" }}>
      <p style={{ color: "#888", fontSize: "12px", margin: "0 0 20px" }}>
        Ændringer slår igennem med det samme på hjemmesiden (header, footer, book-knap).
      </p>

      {error && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
          {error}
        </div>
      )}
      {ok && (
        <div style={{ background: "#eaf8ee", color: "#1e7a3a", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
          {ok}
        </div>
      )}

      <form onSubmit={save} style={{ background: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
          Telefonnummer
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="31 13 28 52"
          style={{ width: "100%", padding: "12px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "8px", boxSizing: "border-box" }}
        />
        <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#888" }}>
          Visning: {preview.display} · klik: {preview.href}
          {savedDisplay ? ` · live nu: ${savedDisplay}` : ""}
        </p>
        {updatedAt && (
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#aaa" }}>
            Sidst gemt {new Date(updatedAt).toLocaleString("da-DK")}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          style={{ marginTop: "16px", padding: "10px 18px", fontSize: "14px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          {saving ? "Gemmer…" : "Gem"}
        </button>
      </form>
      </div>
    </>
  );
}
