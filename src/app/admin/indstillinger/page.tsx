"use client";

import AdminNav from "@/components/AdminNav";
import BackupPanel from "@/components/admin/BackupPanel";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";

import { useState, useEffect, useCallback } from "react";
import { phoneFromInput } from "@/lib/phone";
import { clearSiteSettingsCache } from "@/lib/useSiteSettings";
import { DEFAULT_PICKUP_ADDRESS } from "@/lib/pickup";
import { DEFAULT_COMPANY, formatCompanyLine, normalizeCompany, type CompanyInfo } from "@/lib/siteInfo";
import {
  DAY_PURPOSES,
  DEFAULT_OPENING_HOURS,
  WEEKDAYS,
  dayName,
  formatDateLine,
  formatAfterHours,
  formatOneLine,
  formatShortDate,
  isIsoDate,
  normalizeOpeningHours,
  openDays,
  purposeName,
  type DayHours,
  type DayPurpose,
  type HoursException,
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

/**
 * En særlig dato: 30. december åben, eller en helligdag lukket. Datoen slår
 * ugedagen ud — både i footeren og i kalenderen i checkout.
 */
function ExceptionRow({ value, onChange, onRemove }: {
  value: HoursException;
  onChange: (next: HoursException) => void;
  onRemove: () => void;
}) {
  const iDag = new Date().toISOString().slice(0, 10);
  const overstået = value.date < iDag;

  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #f5f5f5", opacity: overstået ? 0.5 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="date"
          value={value.date}
          onChange={(e) => onChange({ ...value, date: e.target.value })}
          aria-label="Dato"
          style={timeInput}
        />
        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!value.closed}
            onChange={(e) => onChange({ ...value, closed: !e.target.checked })}
            aria-label={`Åben ${value.date}`}
          />
          {value.closed ? "Lukket" : "Åben"}
        </label>

        {!value.closed && (
          <>
            <input
              type="time"
              value={value.open}
              onChange={(e) => onChange({ ...value, open: e.target.value })}
              aria-label={`${value.date} åbner`}
              style={timeInput}
            />
            <span style={{ color: "#aaa" }}>–</span>
            <input
              type="time"
              value={value.close}
              onChange={(e) => onChange({ ...value, close: e.target.value })}
              aria-label={`${value.date} lukker`}
              style={timeInput}
            />
            <select
              value={value.purpose}
              onChange={(e) => onChange({ ...value, purpose: e.target.value as DayPurpose })}
              aria-label={`${value.date} formål`}
              style={{ ...timeInput, cursor: "pointer" }}
            >
              {DAY_PURPOSES.map((pp) => (
                <option key={pp || "ingen"} value={pp}>{pp ? purposeName(pp) : "— intet formål —"}</option>
              ))}
            </select>
          </>
        )}

        <button
          type="button"
          onClick={onRemove}
          title="Fjern datoen"
          style={{ marginLeft: "auto", background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "13px" }}
        >
          Fjern
        </button>
      </div>
      <input
        type="text"
        value={value.note}
        maxLength={120}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
        placeholder="Info til kunden — fx »Nytår: hent 30. dec, aflever 2. jan«"
        aria-label={`Note ${value.date}`}
        style={{ width: "100%", marginTop: "6px", padding: "8px 10px", fontSize: "13px", border: "1px solid #ddd", borderRadius: "6px", boxSizing: "border-box", color: "#111" }}
      />
      {overstået && (
        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#aaa" }}>Datoen er passeret — kan fjernes</p>
      )}
    </div>
  );
}

export default function IndstillingerPage() {
  const { secret, ready, isLoggedIn, unauthorized } = useAdminAuth();
  const [phone, setPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState(DEFAULT_PICKUP_ADDRESS);
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [savedDisplay, setSavedDisplay] = useState("");
  const [hours, setHours] = useState<OpeningHours>(DEFAULT_OPENING_HOURS);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<"kontakt" | "hours" | "company" | null>(null);
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
        pickupAddress?: string;
        company?: unknown;
        updatedAt?: string | null;
      };
      setPhone(json.display || json.phone || "");
      setPickupAddress(json.pickupAddress || DEFAULT_PICKUP_ADDRESS);
      setCompany(normalizeCompany(json.company));
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
  async function save(what: "kontakt" | "hours" | "company") {
    setSaving(what);
    setError("");
    setOk("");
    try {
      const res = await fetch(`/api/site-settings?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          what === "kontakt" ? { phone, pickupAddress } : what === "company" ? { company } : { hours },
        ),
      });
      const json = (await res.json()) as { error?: string; display?: string; hours?: unknown; updatedAt?: string };
      if (!res.ok) {
        if (res.status === 401) { unauthorized(); return; }
        setError(json.error || "Kunne ikke gemme");
        return;
      }
      if (what === "kontakt") {
        setSavedDisplay(json.display || phoneFromInput(phone).display);
        setPhone(json.display || phone);
        setOk(`Gemt — sitet viser nu ${json.display} og ${pickupAddress}. Ingen deploy nødvendig.`);
      } else if (what === "company") {
        setCompany(normalizeCompany((json as { company?: unknown }).company));
        setOk("Firmaoplysningerne er gemt — de står i footeren, på fakturaen og i mails.");
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

  const setException = (i: number, next: HoursException) =>
    setHours((prev) => ({ ...prev, exceptions: prev.exceptions.map((e, idx) => (idx === i ? next : e)) }));
  const removeException = (i: number) =>
    setHours((prev) => ({ ...prev, exceptions: prev.exceptions.filter((_, idx) => idx !== i) }));
  const addException = () =>
    setHours((prev) => ({
      ...prev,
      exceptions: [
        ...prev.exceptions,
        // Tom dato: admin vælger den. Tiderne er fredagens, som er de mest brugte.
        { date: "", closed: false, open: prev.days.fri.open, close: prev.days.fri.close, purpose: "", note: "" },
      ],
    }));

  // Datoer uden dato er ikke gemt endnu — de må ikke sendes til serveren
  const ufuldstændigeDatoer = hours.exceptions.some((e) => !isIsoDate(e.date));

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

      {/* KV har ingen fortryd — kopierne skal kunne ses, ikke bare tages */}
      <BackupPanel secret={secret} />
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

        <form onSubmit={(e) => { e.preventDefault(); save("kontakt"); }} style={card}>
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
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, margin: "18px 0 6px" }}>
            Afhentningsadresse
          </label>
          <input
            type="text"
            value={pickupAddress}
            maxLength={120}
            onChange={(e) => setPickupAddress(e.target.value)}
            placeholder={DEFAULT_PICKUP_ADDRESS}
            style={{ width: "100%", padding: "12px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "8px", boxSizing: "border-box" }}
          />
          <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
            Står hvor kunden skal bruge den: i booking-flowet, i FAQ, på kvitteringssiden og
            ved "jeg henter selv". <strong>Firmaadressen</strong> i footeren, lejevilkårene og
            på fakturaen er noget andet og følger ikke med her.
          </p>

          <button type="submit" disabled={saving !== null} style={knap}>
            {saving === "kontakt" ? "Gemmer…" : "Gem nummer og adresse"}
          </button>
        </form>

        <form onSubmit={(e) => { e.preventDefault(); save("company"); }} style={card}>
          <h2 style={{ margin: "0 0 4px", fontSize: "16px" }}>Firmaoplysninger</h2>
          <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
            Står i footeren, i lejevilkårene, i privatlivspolitikken, på lejesedlen, i bunden
            af hver mail vi sender, på fakturaen og i den markup Google læser. Er det den
            adresse CVR-nummeret er registreret på, skal den også rettes hos Erhvervsstyrelsen
            og på Google Business Profile.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Firmanavn</label>
              <input
                type="text"
                value={company.name}
                onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))}
                style={{ width: "100%", padding: "10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "8px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>CVR</label>
              <input
                type="text"
                inputMode="numeric"
                value={company.cvr}
                onChange={(e) => setCompany((c) => ({ ...c, cvr: e.target.value.replace(/\D/g, "").slice(0, 8) }))}
                style={{ width: "100%", padding: "10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "8px", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Adresse</label>
              <input
                type="text"
                value={company.street}
                onChange={(e) => setCompany((c) => ({ ...c, street: e.target.value }))}
                style={{ width: "100%", padding: "10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "8px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Postnummer</label>
              <input
                type="text"
                value={company.postalCode}
                onChange={(e) => setCompany((c) => ({ ...c, postalCode: e.target.value }))}
                style={{ width: "100%", padding: "10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "8px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>By</label>
              <input
                type="text"
                value={company.city}
                onChange={(e) => setCompany((c) => ({ ...c, city: e.target.value }))}
                style={{ width: "100%", padding: "10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "8px", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Mailadresse</label>
              <input
                type="text"
                value={company.email}
                onChange={(e) => setCompany((c) => ({ ...c, email: e.target.value }))}
                style={{ width: "100%", padding: "10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "8px", boxSizing: "border-box" }}
              />
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#777" }}>
                Nye ordrer og beskeder fra kontaktformularen sendes hertil. Adressen står
                også på sitet og som svaradresse i mails til kunder. Flere modtagere
                adskilles med komma.
              </p>
            </div>
          </div>

          <div style={{ marginTop: "14px", padding: "10px 12px", background: "#fafafa", border: "1px solid #eee", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Sådan står det i mails og på fakturaen
            </div>
            <div style={{ fontSize: "13px", marginTop: "4px" }}>{formatCompanyLine(company)}</div>
          </div>

          <button type="submit" disabled={saving !== null} style={knap}>
            {saving === "company" ? "Gemmer…" : "Gem firmaoplysninger"}
          </button>
        </form>

        <form onSubmit={(e) => { e.preventDefault(); save("hours"); }} style={card}>
          <h2 style={{ margin: "0 0 4px", fontSize: "16px" }}>Åbningstider</h2>
          <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#888" }}>
            Slå en dag til for at åbne den. Man kan både hente og aflevere på alle åbne
            dage — formålet er kun til de tilfælde, hvor en dag undtagelsesvis kun er til
            det ene. Står det tomt, skriver sitet bare tiderne.
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

          {/* Særlige datoer — det tekniske OG teksten, samme sted */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "14px" }}>Særlige datoer</h3>
            <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
              En dato her slår ugedagen ud. Åbn fx <strong>30. december</strong> til afhentning,
              så nytårsgæsterne kan vælge den i kalenderen — eller luk en helligdag. Noten står
              hos kunden ved datoen i checkout.
            </p>

            {hours.exceptions.length === 0 && (
              <p style={{ fontSize: "13px", color: "#aaa", margin: "0 0 10px" }}>Ingen særlige datoer</p>
            )}
            {hours.exceptions.map((e, i) => (
              <ExceptionRow
                key={`${e.date}_${i}`}
                value={e}
                onChange={(next) => setException(i, next)}
                onRemove={() => removeException(i)}
              />
            ))}

            <button
              type="button"
              onClick={addException}
              style={{ marginTop: "10px", padding: "6px 12px", fontSize: "13px", background: "#fff", color: "#111", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer" }}
            >
              + Tilføj særlig dato
            </button>
          </div>

          {/* Uden for åbningstid: vi møder gerne op, det koster bare et gebyr */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "14px" }}>Uden for åbningstid</h3>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", marginBottom: "10px" }}>
              <input
                type="checkbox"
                checked={hours.afterHours.enabled}
                onChange={(e) =>
                  setHours((prev) => ({ ...prev, afterHours: { ...prev.afterHours, enabled: e.target.checked } }))
                }
              />
              <strong>Vi møder også uden for åbningstid mod gebyr</strong>
            </label>

            {hours.afterHours.enabled && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "13px", color: "#666" }}>Fra</span>
                <input
                  type="time"
                  value={hours.afterHours.from}
                  onChange={(e) => setHours((prev) => ({ ...prev, afterHours: { ...prev.afterHours, from: e.target.value } }))}
                  aria-label="Uden for åbningstid fra"
                  style={timeInput}
                />
                <span style={{ fontSize: "13px", color: "#666" }}>til</span>
                <input
                  type="time"
                  value={hours.afterHours.to}
                  onChange={(e) => setHours((prev) => ({ ...prev, afterHours: { ...prev.afterHours, to: e.target.value } }))}
                  aria-label="Uden for åbningstid til"
                  style={timeInput}
                />
                <span style={{ fontSize: "13px", color: "#666", marginLeft: "8px" }}>Gebyr</span>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={hours.afterHours.fee}
                  onChange={(e) =>
                    setHours((prev) => ({ ...prev, afterHours: { ...prev.afterHours, fee: Math.max(0, Math.round(Number(e.target.value) || 0)) } }))
                  }
                  aria-label="Gebyr uden for åbningstid"
                  style={{ ...timeInput, width: "80px", textAlign: "center" }}
                />
                <span style={{ fontSize: "13px", color: "#666" }}>kr</span>
              </div>
            )}
            <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
              Noten står i checkout, når kunden vælger datoer — og på kvitteringssiden.
              Gebyret lægges <strong>ikke</strong> automatisk på ordren; det aftales og
              tilføjes som en betaling, hvis kunden bruger det.
            </p>
          </div>

          {/* Den tekniske del: må kunden kun vælge de dage vi har åbent? */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "14px" }}>Booking-kalenderen</h3>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={hours.onlyOpenDays}
                onChange={(e) => setHours((prev) => ({ ...prev, onlyOpenDays: e.target.checked }))}
                style={{ marginTop: "2px" }}
              />
              <span>
                <strong>Kun åbne dage kan vælges</strong>
                <br />
                <span style={{ color: "#888" }}>
                  Slået fra: kunden kan vælge enhver dato og aftale tidspunktet i kommentarfeltet
                  (som hidtil) — åbningstiderne står som information ved datoen. Slået til:
                  kalenderen spærrer de dage vi har lukket, og kun åbne dage og særlige datoer
                  kan vælges.
                </span>
              </span>
            </label>
          </div>

          <div style={{ marginTop: "14px", padding: "10px 12px", background: "#fafafa", border: "1px solid #eee", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Sådan står det i footeren
            </div>
            <div style={{ fontSize: "13px", marginTop: "4px" }}>
              {openDays(hours).length ? formatOneLine(hours) : <span style={{ color: "#c0392b" }}>Ingen åbne dage — footeren viser ingen åbningstider</span>}
            </div>
            {hours.other && <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{hours.other}</div>}
            {formatAfterHours(hours) && (
              <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{formatAfterHours(hours)}</div>
            )}
            {hours.exceptions.filter((e) => isIsoDate(e.date)).map((e) => (
              <div key={e.date} style={{ fontSize: "12px", color: "#4b2ea3", marginTop: "2px" }}>
                {formatShortDate(e.date)}: {e.closed ? "lukket" : formatDateLine(hours, e.date)}
                {e.note ? ` · ${e.note}` : ""}
              </div>
            ))}
          </div>

          <button type="submit" disabled={saving !== null || ufuldstændigeDatoer} style={knap}>
            {saving === "hours" ? "Gemmer…" : "Gem åbningstider"}
          </button>
          {ufuldstændigeDatoer && (
            <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#c0392b" }}>
              Vælg en dato på den særlige åbning — eller fjern linjen.
            </p>
          )}

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
