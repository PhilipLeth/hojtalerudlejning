"use client";

import { useState, useEffect, useCallback } from "react";
import {
  speakers as defaultSpeakers,
  addons as defaultAddons,
  type Speaker,
  type Addon,
} from "@/lib/products";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  boxSizing: "border-box",
  color: "#111",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#666",
  marginBottom: "4px",
};

function Field({
  label,
  value,
  onChange,
  textarea,
  type,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea rows={2} value={String(value)} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
      ) : (
        <input type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  );
}

export default function AdminProdukterPage() {
  const [secret, setSecret] = useState("");
  const [inputSecret, setInputSecret] = useState("");
  const [speakers, setSpeakers] = useState<Speaker[]>(defaultSpeakers);
  const [addons, setAddons] = useState<Addon[]>(defaultAddons);
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("admin_secret");
    if (stored) setSecret(stored);
  }, []);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data.speakers) && data.speakers.length) {
        setSpeakers(data.speakers);
        setAddons(Array.isArray(data.addons) && data.addons.length ? data.addons : defaultAddons);
        setIsCustom(true);
      } else {
        setSpeakers(defaultSpeakers);
        setAddons(defaultAddons);
        setIsCustom(false);
      }
    } catch {
      setError("Kunne ikke hente produkter — viser standard-kataloget");
      setSpeakers(defaultSpeakers);
      setAddons(defaultAddons);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSecret.trim()) {
      localStorage.setItem("admin_secret", inputSecret.trim());
      setSecret(inputSecret.trim());
      setInputSecret("");
    }
  };

  const updateSpeaker = (i: number, patch: Partial<Speaker>) => {
    setSpeakers((prev) => prev.map((sp, idx) => (idx === i ? { ...sp, ...patch } : sp)));
  };
  const updateSpeakerText = (i: number, loc: "da" | "en", field: string, value: string) => {
    setSpeakers((prev) =>
      prev.map((sp, idx) => (idx === i ? { ...sp, [loc]: { ...sp[loc], [field]: value } } : sp))
    );
  };
  const updateAddon = (i: number, patch: Partial<Addon>) => {
    setAddons((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  };
  const updateAddonText = (i: number, loc: "da" | "en", field: string, value: string) => {
    setAddons((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, [loc]: { ...a[loc], [field]: value } } : a))
    );
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/products?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speakers, addons }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kunne ikke gemme");
        if (res.status === 401) {
          localStorage.removeItem("admin_secret");
          setSecret("");
        }
        return;
      }
      setIsCustom(true);
      setMessage("Gemt! Ændringerne er live med det samme.");
    } catch {
      setError("Netvaerksfejl");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!confirm("Nulstil til standard-kataloget fra koden? Dine ændringer i admin slettes.")) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/products?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Kunne ikke nulstille");
        return;
      }
      setSpeakers(defaultSpeakers);
      setAddons(defaultAddons);
      setIsCustom(false);
      setMessage("Nulstillet til standard-kataloget.");
    } catch {
      setError("Netvaerksfejl");
    } finally {
      setSaving(false);
    }
  };

  if (!secret) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
        <form onSubmit={handleLogin} style={{ background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", maxWidth: "400px", width: "100%" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "24px", color: "#111" }}>Produkter</h1>
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
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "20px" }}>Produkter</h1>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#888" }}>
            {isCustom ? "Live-katalog: redigeret i admin (gemt i KV)" : "Live-katalog: standard fra koden"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <a href="/admin" style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111" }}>
            Bookinger
          </a>
          <a href="/admin/lager" style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111" }}>
            Lager
          </a>
          <button onClick={reset} disabled={saving} style={{ padding: "8px 16px", fontSize: "14px", background: "#fff", border: "1px solid #dc3545", color: "#dc3545", borderRadius: "6px", cursor: "pointer" }}>
            Nulstil til standard
          </button>
          <button onClick={save} disabled={saving || loading} style={{ padding: "8px 20px", fontSize: "14px", fontWeight: 600, background: "#28a745", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            {saving ? "Gemmer..." : "Gem ændringer"}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>{error}</div>}
        {message && <div style={{ background: "#d4edda", color: "#155724", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>{message}</div>}
        {loading && <p style={{ textAlign: "center", color: "#888" }}>Henter produkter...</p>}

        <h2 style={{ fontSize: "17px", margin: "8px 0 12px" }}>Højtalere ({speakers.length})</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
          {speakers.map((sp, i) => (
            <details key={sp.id} style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "16px 20px", opacity: sp.hidden ? 0.55 : 1 }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>
                  {sp.da.name} <span style={{ color: "#888", fontWeight: 400 }}>({sp.id})</span>
                  {sp.hidden && <span style={{ marginLeft: "8px", fontSize: "12px", color: "#dc3545" }}>SKJULT</span>}
                </span>
                <span style={{ color: "#0070f3" }}>{sp.price} kr</span>
              </summary>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "16px" }}>
                <Field label="Pris (kr)" type="number" value={sp.price} onChange={(v) => updateSpeaker(i, { price: Number(v) || 0 })} />
                <Field label="Vægt" value={sp.weight} onChange={(v) => updateSpeaker(i, { weight: v })} />
                <div>
                  <label style={labelStyle}>Strøm</label>
                  <select value={sp.power} onChange={(e) => updateSpeaker(i, { power: e.target.value as Speaker["power"] })} style={inputStyle}>
                    <option value="batteri">Batteri (mobil)</option>
                    <option value="kabel">Kabel (230V)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Størrelse</label>
                  <select value={sp.sizeClass} onChange={(e) => updateSpeaker(i, { sizeClass: e.target.value as Speaker["sizeClass"] })} style={inputStyle}>
                    <option value="lille">Lille</option>
                    <option value="stor">Stor</option>
                  </select>
                </div>
                <Field label="Produktbillede (sti)" value={sp.product} onChange={(v) => updateSpeaker(i, { product: v })} />
                <Field label="Stemningsbillede (sti)" value={sp.mood} onChange={(v) => updateSpeaker(i, { mood: v })} />
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", alignSelf: "end", paddingBottom: "8px" }}>
                  <input type="checkbox" checked={!!sp.hidden} onChange={(e) => updateSpeaker(i, { hidden: e.target.checked })} />
                  Skjul på siden
                </label>
              </div>
              {(["da", "en"] as const).map((loc) => (
                <div key={loc} style={{ marginTop: "16px", borderTop: "1px solid #eee", paddingTop: "12px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: "#444" }}>{loc === "da" ? "🇩🇰 Dansk" : "🇬🇧 Engelsk"}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                    <Field label="Navn" value={sp[loc].name} onChange={(v) => updateSpeakerText(i, loc, "name", v)} />
                    <Field label="Størrelse/model" value={sp[loc].size} onChange={(v) => updateSpeakerText(i, loc, "size", v)} />
                    <Field label="Kapacitet" value={sp[loc].capacity} onChange={(v) => updateSpeakerText(i, loc, "capacity", v)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                    <Field label="Beskrivelse" textarea value={sp[loc].desc} onChange={(v) => updateSpeakerText(i, loc, "desc", v)} />
                    <Field label="Ekstra info" textarea value={sp[loc].extra} onChange={(v) => updateSpeakerText(i, loc, "extra", v)} />
                  </div>
                </div>
              ))}
            </details>
          ))}
        </div>

        <h2 style={{ fontSize: "17px", margin: "8px 0 12px" }}>Tilvalg ({addons.length})</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {addons.map((a, i) => (
            <details key={a.id} style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "16px 20px", opacity: a.hidden ? 0.55 : 1 }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>
                  {a.da.label} <span style={{ color: "#888", fontWeight: 400 }}>({a.id})</span>
                  {a.hidden && <span style={{ marginLeft: "8px", fontSize: "12px", color: "#dc3545" }}>SKJULT</span>}
                </span>
                <span style={{ color: "#0070f3" }}>{a.price} kr</span>
              </summary>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "16px" }}>
                <Field label="Pris (kr)" type="number" value={a.price} onChange={(v) => updateAddon(i, { price: Number(v) || 0 })} />
                <Field label="Billede (sti, tom = intet)" value={a.image ?? ""} onChange={(v) => updateAddon(i, { image: v || null })} />
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", alignSelf: "end", paddingBottom: "8px" }}>
                  <input type="checkbox" checked={!!a.hidden} onChange={(e) => updateAddon(i, { hidden: e.target.checked })} />
                  Skjul på siden
                </label>
              </div>
              {(["da", "en"] as const).map((loc) => (
                <div key={loc} style={{ marginTop: "16px", borderTop: "1px solid #eee", paddingTop: "12px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: "#444" }}>{loc === "da" ? "🇩🇰 Dansk" : "🇬🇧 Engelsk"}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                    <Field label="Navn" value={a[loc].label} onChange={(v) => updateAddonText(i, loc, "label", v)} />
                    <Field label="Beskrivelse" value={a[loc].desc} onChange={(v) => updateAddonText(i, loc, "desc", v)} />
                  </div>
                </div>
              ))}
            </details>
          ))}
        </div>

        <p style={{ marginTop: "24px", fontSize: "13px", color: "#888" }}>
          Ændringer gemmes i Cloudflare KV og slår igennem på hele sitet med det samme — booking-flow, forside, priser og sammenligningstabel (dansk + engelsk). &quot;Nulstil til standard&quot; sletter admin-kataloget og går tilbage til koden.
        </p>
      </main>
    </div>
  );
}
