"use client";

import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";

import { useState, useEffect, useCallback } from "react";
import { phoneFromInput } from "@/lib/phone";
import { clearSiteSettingsCache } from "@/lib/useSiteSettings";
import {
  DAY_PURPOSES,
  DEFAULT_OPENING_HOURS,
  WEEKDAYS,
  dayName,
  formatOneLine,
  normalizeOpeningHours,
  openDays,
  purposeName,
  type DayHours,
  type DayPurpose,
  type OpeningHours,
  type Weekday,
} from "@/lib/openingHours";

const navLink: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: "13px",
  color: "#555",
  textDecoration: "none",
  border: "1px solid #ddd",
  borderRadius: "6px",
  background: "#fff",
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: "10px",
  padding: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  marginBottom: "20px",
};

const knap: React.CSSProperties = {
  marginTop: "16px",
  padding: "10px 18px",
  fontSize: "14px",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const timeInput: React.CSSProperties = {
  padding: "6px 8px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  color: "#111",
  background: "#fff",
};

/** Én dag: åben/lukket, tider og hvad dagen bruges til */
function DayRow({ day, value, onChange }: {
  day: Weekday;
  value: DayHours;
  onChange: (next: DayHours) => void;
}) {
  const lukket = value.closed;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid #f5f5f5", flexWrap: "wrap" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "8px", width: "150px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={!lukket}
          onChange={(e) => onChange({ ...value, closed: !e.target.checked })}
          aria-label={`Åben ${dayName(day).toLowerCase()}`}
        />
        <span style={{ fontSize: "14px", fontWeight: lukket ? 400 : 600, color: lukket ? "#aaa" : "#111" }}>
          {dayName(day)}
        </span>
      </label>

      {lukket ? (
        <span style={{ fontSize: "13px", color: "#bbb" }}>Lukket</span>
      ) : (
        <>
          <input
            type="time"
            value={value.open}
            onChange={(e) => onChange({ ...value, open: e.target.value })}
            aria-label={`${dayName(day)} åbner`}
            style={timeInput}
          />
          <span style={{ color: "#aaa" }}>–</span>
          <input
            type="time"
            value={value.close}
            onChange={(e) => onChange({ ...value, close: e.target.value })}
            aria-label={`${dayName(day)} lukker`}
            style={timeInput}
          />
          <select
            value={value.purpose}
            onChange={(e) => onChange({ ...value, purpose: e.target.value as DayPurpose })}
            aria-label={`${dayName(day)} formål`}
            style={{ ...timeInput, cursor: "pointer" }}
          >
            {DAY_PURPOSES.map((p) => (
              <option key={p || "ingen"} value={p}>
                {p ? purposeName(p) : "— intet formål —"}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}

export default function IndstillingerPage() {
  const { secret, ready, isLoggedIn, unauthorized } = useAdminAuth();
  const [phone, setPhone] = useState("");
  const [savedDisplay, setSavedDisplay] = useState("");
  const [hours, setHours] = useState<OpeningHours>(DEFAULT_OPENING_HOURS);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<"phone" | "hours" | null>(null);
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
        hours?: unknown;
        updatedAt?: string | null;
      };
      setPhone(json.display || json.phone || "");
      setSavedDisplay(json.display || "");
      setHours(normalizeOpeningHours(json.hours));
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

  /** Gem enten telefon eller åbningstider — serveren tager imod ét felt ad gangen */
  async function save(what: "phone" | "hours") {
    setSaving(what);
    setError("");
    setOk("");
    try {
      const res = await fetch(`/api/site-settings?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(what === "phone" ? { phone } : { hours }),
      });
      const json = (await res.json()) as { error?: string; display?: string; hours?: unknown; updatedAt?: string };
      if (!res.ok) {
        if (res.status === 401) { unauthorized(); return; }
        setError(json.error || "Kunne ikke gemme");
        return;
      }
      if (what === "phone") {
        setSavedDisplay(json.display || phoneFromInput(phone).display);
        setPhone(json.display || phone);
        setOk(`Gemt — sitet viser nu ${json.display}. Ingen deploy nødvendig.`);
      } else {
        setHours(normalizeOpeningHours(json.hours));
        setOk("Åbningstiderne er gemt — de står på sitet med det samme.");
      }
      setUpdatedAt(json.updatedAt ?? null);
      clearSiteSettingsCache();
    } catch {
      setError("Netværksfejl");
    } finally {
      setSaving(null);
    }
  }

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Indstillinger" />;

  const preview = phoneFromInput(phone);
  const setDay = (day: Weekday, next: DayHours) =>
    setHours((prev) => ({ ...prev, days: { ...prev.days, [day]: next } }));

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
          Ændringer slår igennem med det samme på hjemmesiden (header, footer, book-knap
          og åbningstiderne på forsiden).
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

        <form onSubmit={(e) => { e.preventDefault(); save("phone"); }} style={card}>
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
          <button type="submit" disabled={saving !== null} style={knap}>
            {saving === "phone" ? "Gemmer…" : "Gem nummer"}
          </button>
        </form>

        <form onSubmit={(e) => { e.preventDefault(); save("hours"); }} style={card}>
          <h2 style={{ margin: "0 0 4px", fontSize: "16px" }}>Åbningstider</h2>
          <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#888" }}>
            Slå en dag til for at åbne den. Formålet står i parentes på sitet, så kunden
            kan se hvornår der hentes og hvornår der afleveres.
          </p>

          {WEEKDAYS.map((day) => (
            <DayRow key={day} day={day} value={hours.days[day]} onChange={(next) => setDay(day, next)} />
          ))}

          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, margin: "16px 0 6px" }}>
            Linjen under tiderne
          </label>
          <input
            type="text"
            value={hours.other}
            maxLength={200}
            onChange={(e) => setHours((prev) => ({ ...prev, other: e.target.value }))}
            placeholder="Andre tidspunkter efter aftale — skriv i kommentarfeltet ved booking."
            style={{ width: "100%", padding: "10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "8px", boxSizing: "border-box" }}
          />

          <div style={{ marginTop: "14px", padding: "10px 12px", background: "#fafafa", border: "1px solid #eee", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Sådan står det i footeren
            </div>
            <div style={{ fontSize: "13px", marginTop: "4px" }}>
              {openDays(hours).length ? formatOneLine(hours) : <span style={{ color: "#c0392b" }}>Ingen åbne dage — footeren viser ingen åbningstider</span>}
            </div>
            {hours.other && <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{hours.other}</div>}
          </div>

          <button type="submit" disabled={saving !== null} style={knap}>
            {saving === "hours" ? "Gemmer…" : "Gem åbningstider"}
          </button>

          {/* Ærligt forbehold: to steder følger IKKE med automatisk */}
          <p style={{ margin: "14px 0 0", fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
            <strong>To steder skal rettes særskilt:</strong> Googles strukturerede data
            (åbningstiderne i sidens kode) opdateres først ved næste deploy, og
            åbningstiderne på Google Business Profile skal rettes i hånden. Sig til,
            hvis tiderne skal ændres permanent — så følger de med i koden.
          </p>
        </form>

        {updatedAt && (
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#aaa" }}>
            Sidst gemt {new Date(updatedAt).toLocaleString("da-DK")}
          </p>
        )}
      </div>
    </>
  );
}
