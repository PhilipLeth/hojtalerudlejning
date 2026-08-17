"use client";

/* ───── Send SMS på en ordre ─────
 *
 * Vælg en skabelon, ret teksten hvis der er noget særligt, og send. Teksten
 * bygges af samme skabeloner som de automatiske beskeder, så en besked skrevet
 * i hånden ligner de andre — og den havner i kommunikationsloggen på ordren med
 * sin fulde tekst, for en SMS kan ikke slås op nogen steder bagefter.
 */

import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/useAdminAuth";
import { displayPhone, smsLength, toE164Dk } from "@/lib/sms";
import {
  DEFAULT_SMS_SETTINGS,
  SMS_TYPES,
  buildSms,
  smsVarsFor,
  type SmsBooking,
  type SmsSettings,
  type SmsTypeId,
} from "@/lib/smsTemplates";

/**
 * Skabeloner, vores telefonnummer og anmeldelseslinket kommer fra serveren —
 * samme værdier som de automatiske beskeder fyldes med, så en besked skrevet i
 * hånden ikke sender et forældet nummer eller et tomt link. Ens for alle
 * ordrer, så det hentes én gang pr. sidevisning.
 */
interface SmsConfig {
  settings: SmsSettings;
  telefon?: string;
  link?: string;
}

let cached: Promise<SmsConfig | null> | null = null;

function loadConfig(secret: string): Promise<SmsConfig | null> {
  if (!cached) {
    cached = adminFetch("/api/sms", secret).then((r) => {
      if ("error" in r || !r.res.ok) return null;
      const data = r.data as { settings?: SmsSettings; telefon?: string; link?: string };
      if (!data.settings) return null;
      return { settings: data.settings, telefon: data.telefon, link: data.link };
    });
  }
  return cached;
}

interface Props {
  booking: SmsBooking & { id: string };
  secret: string;
  /** Ordren som den ser ud efter beskeden er skrevet i loggen */
  onUpdated?: (booking: Record<string, unknown>) => void;
}

export default function SendSmsBox({ booking, secret, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<SmsConfig>({ settings: DEFAULT_SMS_SETTINGS });
  const [type, setType] = useState<SmsTypeId>("bekraeftet");
  const [text, setText] = useState("");
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");

  const to = toE164Dk(booking.phone);

  useEffect(() => {
    if (!open) return;
    loadConfig(secret).then((c) => {
      if (c) setConfig(c);
    });
  }, [open, secret]);

  const vars = useMemo(
    () => smsVarsFor(booking, { telefon: config.telefon, link: config.link }),
    [booking, config.telefon, config.link],
  );
  const suggestion = useMemo(() => buildSms(config.settings, type, vars).text, [config.settings, type, vars]);

  // Skabelonen fylder feltet, indtil man selv har rettet i teksten
  useEffect(() => {
    if (!touched) setText(suggestion);
  }, [suggestion, touched]);

  const len = smsLength(text);

  async function send() {
    setSending(true);
    setError("");
    setSent("");
    const r = await adminFetch("/api/sms", secret, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", bookingId: booking.id, type, text }),
    });
    setSending(false);
    if ("error" in r) {
      setError(r.error);
      return;
    }
    if (!r.res.ok) {
      setError(String(r.data.error || "Beskeden blev ikke sendt"));
      return;
    }
    setSent(`Sendt til ${displayPhone(String(r.data.to || to || ""))}`);
    setTouched(false);
    if (r.data.booking && onUpdated) onUpdated(r.data.booking as Record<string, unknown>);
  }

  if (!open) {
    return (
      <div style={{ gridColumn: "1 / -1" }}>
        <button
          onClick={() => setOpen(true)}
          style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", color: "#111", cursor: "pointer" }}
        >
          💬 Send SMS{to ? "" : " (nummeret kan ikke bruges)"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ gridColumn: "1 / -1", background: "#fffdf6", border: "1px solid #e2dcc8", borderRadius: "8px", padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        <strong style={{ fontSize: "12px" }}>💬 SMS til {to ? displayPhone(to) : "—"}</strong>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as SmsTypeId);
            setTouched(false);
          }}
          style={{ fontSize: "12px", padding: "4px 8px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", color: "#111", cursor: "pointer" }}
        >
          {SMS_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setOpen(false)}
          style={{ marginLeft: "auto", background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: "16px" }}
          title="Luk"
        >
          ×
        </button>
      </div>

      {!to && (
        <div style={{ fontSize: "11px", color: "#c0392b", marginBottom: "8px" }}>
          Kundens nummer ({String(booking.phone ?? "—")}) kan ikke bruges til SMS. Ret det på ordren, eller ring i stedet.
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setTouched(true);
        }}
        rows={3}
        maxLength={480}
        style={{ width: "100%", boxSizing: "border-box", fontSize: "12px", padding: "6px 8px", border: "1px solid #ddd", borderRadius: "6px", color: "#111", fontFamily: "inherit", resize: "vertical" }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginTop: "6px" }}>
        <span style={{ fontSize: "11px", color: len.segments > 1 ? "#c0392b" : "#999" }}>
          {len.chars} tegn · {len.segments} besked{len.segments === 1 ? "" : "er"}
          {len.unicode ? " · emoji/specialtegn" : ""}
        </span>
        {touched && (
          <button
            onClick={() => setTouched(false)}
            style={{ background: "none", border: "none", color: "#0070f3", cursor: "pointer", fontSize: "11px", padding: 0 }}
          >
            Hent skabelonen igen
          </button>
        )}
        <button
          onClick={send}
          disabled={sending || !to || !text.trim()}
          style={{ marginLeft: "auto", padding: "6px 14px", fontSize: "12px", fontWeight: 600, background: to && text.trim() ? "#111" : "#eee", color: to && text.trim() ? "#fff" : "#999", border: "none", borderRadius: "6px", cursor: to && text.trim() ? "pointer" : "default" }}
        >
          {sending ? "Sender…" : "Send SMS"}
        </button>
      </div>

      {error && <div style={{ fontSize: "11px", color: "#c0392b", marginTop: "6px" }}>{error}</div>}
      {sent && <div style={{ fontSize: "11px", color: "#2f7a4d", marginTop: "6px" }}>{sent}</div>}
    </div>
  );
}
