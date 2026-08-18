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
import { displayPhone, findLinks, smsLength, toE164Dk } from "@/lib/sms";
import {
  DEFAULT_SMS_SETTINGS,
  SMS_TYPES,
  buildSms,
  buildSnippet,
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
  /** Åbn med det samme — brugt af SmsModal fra overblikket */
  startOpen?: boolean;
  /** Modalen har selv ramme og lukkeknap */
  hideToggle?: boolean;
}

export default function SendSmsBox({ booking, secret, onUpdated, startOpen, hideToggle }: Props) {
  const [open, setOpen] = useState(!!startOpen);
  const [config, setConfig] = useState<SmsConfig>({ settings: DEFAULT_SMS_SETTINGS });
  // "snippet:paa_vej" eller en skabelon-type. Hurtigbeskederne står øverst,
  // fordi det er dem der bruges, når man står med en kunde.
  const [choice, setChoice] = useState<string>("");
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
  const snippets = config.settings.snippets ?? DEFAULT_SMS_SETTINGS.snippets;
  // Uden et valg: den første hurtigbesked — den bruges oftest
  const active = choice || (snippets[0] ? `snippet:${snippets[0].id}` : "bekraeftet");
  const type: SmsTypeId | "manuel" = active.startsWith("snippet:") ? "manuel" : (active as SmsTypeId);

  const suggestion = useMemo(() => {
    if (active.startsWith("snippet:")) return buildSnippet(config.settings, active.slice(8), vars)?.text ?? "";
    return buildSms(config.settings, active as SmsTypeId, vars).text;
  }, [config.settings, active, vars]);

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
    <div
      style={
        hideToggle
          ? { gridColumn: "1 / -1" }
          : { gridColumn: "1 / -1", background: "#fffdf6", border: "1px solid #e2dcc8", borderRadius: "8px", padding: "10px 12px" }
      }
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        <strong style={{ fontSize: "12px" }}>💬 {to ? displayPhone(to) : "—"}</strong>
        <select
          value={active}
          onChange={(e) => {
            setChoice(e.target.value);
            setTouched(false);
          }}
          style={{ fontSize: "12px", padding: "4px 8px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", color: "#111", cursor: "pointer" }}
        >
          <optgroup label="Dine skabeloner">
            {snippets.map((sn) => (
              <option key={sn.id} value={`snippet:${sn.id}`}>
                {sn.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Samme tekst som automatikken">
            {SMS_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </optgroup>
        </select>
        {!hideToggle && (
          <button
            onClick={() => setOpen(false)}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: "16px" }}
            title="Luk"
          >
            ×
          </button>
        )}
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

      {findLinks(text).length > 0 && (
        <div style={{ fontSize: "11px", color: "#c0392b", marginTop: "6px" }}>
          {findLinks(text).join(", ")} er en webadresse — den bliver afvist, medmindre domænet er godkendt
          hos din SMS-udbyder.
        </div>
      )}
      {error && <div style={{ fontSize: "11px", color: "#c0392b", marginTop: "6px" }}>{error}</div>}
      {sent && <div style={{ fontSize: "11px", color: "#2f7a4d", marginTop: "6px" }}>{sent}</div>}
    </div>
  );
}

/**
 * SMS fra overblikket: samme felt, lagt oven på listen.
 *
 * Det er sådan beskeder faktisk sendes — man står med én ordre og skal sige én
 * ting. At folde hele bookingen ud først er et skridt for meget, når man har
 * en højtaler under den anden arm.
 */
export function SmsModal({
  booking,
  secret,
  onClose,
  onUpdated,
}: {
  booking: (SmsBooking & { id: string; name?: unknown }) | null;
  secret: string;
  onClose: () => void;
  onUpdated?: (booking: Record<string, unknown>) => void;
}) {
  useEffect(() => {
    if (!booking) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [booking, onClose]);

  if (!booking) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 12px", zIndex: 1000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: "12px", padding: "14px", width: "100%", maxWidth: "460px", boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "10px" }}>
          <strong style={{ fontSize: "14px" }}>SMS til {String(booking.name ?? "kunden")}</strong>
          <button
            onClick={onClose}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}
            title="Luk (Esc)"
          >
            ×
          </button>
        </div>
        <SendSmsBox booking={booking} secret={secret} onUpdated={onUpdated} startOpen hideToggle />
      </div>
    </div>
  );
}
