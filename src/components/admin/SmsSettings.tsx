"use client";

/* ───── SMS-indstillinger i /admin/kommunikation ─────
 *
 * Én besked pr. type, teksten redigeres direkte, og tegntælleren viser hvor
 * mange beskeder den bliver til — én SMS koster penge, og et enkelt emoji
 * halverer grænsen fra 160 til 70 tegn. Forhåndsvisningen bruger præcis samme
 * kode som serveren sender med.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch } from "@/lib/useAdminAuth";
import { SMS_PROVIDERS, findLinks, smsLength, type SmsBalance, type SmsProvider } from "@/lib/sms";
import {
  DEFAULT_SMS_SETTINGS,
  SMS_SHORTCODES,
  SMS_TYPES,
  buildSms,
  renderSms,
  smsVarsFor,
  type SmsSettings as Settings,
  type SmsTypeId,
} from "@/lib/smsTemplates";

/** Eksempelordre — sådan ser beskederne ud hos en rigtig kunde */
const PREVIEW_BOOKING = {
  name: "Agnes Dahle Stæhr",
  period: "fre 21. aug → man 24. aug",
  pickup: "2026-08-21",
  returnDate: "2026-08-24",
  speaker: "Stor højtalerpakke",
  cartItems: [{ name: "Lys-pakke" }],
  total: 1995,
};

/** Fyldes med serverens egne værdier, så forhåndsvisningen viser det rigtige
 *  telefonnummer og anmeldelseslink — ikke et gæt fra klienten. */
function previewVars(telefon?: string, link?: string) {
  return smsVarsFor(PREVIEW_BOOKING, { telefon, link });
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: "10px",
  padding: "14px 16px",
  marginBottom: "18px",
};

const input: React.CSSProperties = {
  padding: "7px 9px",
  fontSize: "13px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  color: "#111",
  fontFamily: "inherit",
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#666",
  marginBottom: "5px",
};

interface SmsGetResponse {
  configured: boolean;
  devMode: boolean;
  /** Hvilken udbyder nøglerne i Cloudflare peger på */
  provider: SmsProvider | null;
  settings: Settings;
  balance: SmsBalance | null;
  /** Vores nummer og anmeldelseslinket, som serveren fylder dem i */
  telefon?: string;
  link?: string;
  error?: string;
}

interface ReminderRun {
  dryRun: boolean;
  forDate: string;
  due: number;
  sent: Array<{ id: string; type: string }>;
  failed: Array<{ id: string; type: string; error: string }>;
  skipped: Array<{ id: string; type: string; reason: string }>;
}

export default function SmsSettings({ secret }: { secret: string }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SMS_SETTINGS);
  const [configured, setConfigured] = useState(true);
  const [devMode, setDevMode] = useState(false);
  const [balance, setBalance] = useState<SmsBalance | null>(null);
  const [provider, setProvider] = useState<SmsProvider | null>(null);
  const [vars, setVars] = useState(() => previewVars());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testing, setTesting] = useState(false);
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState<ReminderRun | null>(null);
  const [focused, setFocused] = useState<SmsTypeId | null>(null);
  const areas = useRef<Partial<Record<SmsTypeId, HTMLTextAreaElement | null>>>({});

  const load = useCallback(async () => {
    if (!secret) return;
    const r = await adminFetch("/api/sms", secret);
    if ("error" in r) {
      setError(r.error);
      return;
    }
    const data = r.data as unknown as SmsGetResponse;
    if (!r.res.ok) {
      setError(data.error || "Kunne ikke hente SMS-indstillingerne");
      return;
    }
    setSettings(data.settings);
    setConfigured(data.configured);
    setDevMode(data.devMode);
    setBalance(data.balance ?? null);
    setProvider(data.provider ?? null);
    setVars(previewVars(data.telefon, data.link));
    setDirty(false);
    setError("");
  }, [secret]);

  useEffect(() => {
    load();
  }, [load]);

  function patch(p: Partial<Settings>) {
    setSettings((s) => ({ ...s, ...p }));
    setDirty(true);
  }

  function patchTemplate(id: SmsTypeId, p: Partial<Settings["templates"][SmsTypeId]>) {
    patch({ templates: { ...settings.templates, [id]: { ...settings.templates[id], ...p } } });
  }

  async function save() {
    setSaving(true);
    setError("");
    setNotice("");
    const r = await adminFetch("/api/sms", secret, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", settings }),
    });
    setSaving(false);
    if ("error" in r) {
      setError(r.error);
      return;
    }
    if (!r.res.ok) {
      setError(String(r.data.error || "Kunne ikke gemme"));
      return;
    }
    setNotice("SMS-indstillingerne er gemt");
    await load();
  }

  async function sendTest() {
    setTesting(true);
    setError("");
    setNotice("");
    const r = await adminFetch("/api/sms", secret, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test", phone: testPhone }),
    });
    setTesting(false);
    if ("error" in r) {
      setError(r.error);
      return;
    }
    if (!r.res.ok) {
      setError(String(r.data.error || "Testbeskeden blev ikke sendt"));
      return;
    }
    const d = r.data.delivery as { status?: string; error?: string } | null;
    if (d && d.status !== "DELIVERED") {
      // Gatewayen tog imod beskeden, men operatøren afviste den — det er
      // netop den fejl, der ellers først dukker op hos en kunde
      setError(`Udbyderen tog imod beskeden, men den blev ${d.status}: ${d.error || "ingen begrundelse"}`);
      return;
    }
    setNotice(`Testbesked ${d ? "leveret" : "sendt"} til ${r.data.to}`);
  }

  async function runReminders(dryRun: boolean) {
    if (!dryRun && !window.confirm("Send dagens påmindelser nu? Beskederne går ud til kunderne med det samme.")) return;
    setRunning(true);
    setError("");
    setNotice("");
    setRun(null);
    const r = await adminFetch(`/api/sms-paamindelser${dryRun ? "?dryRun=1" : ""}`, secret, { method: "POST" });
    setRunning(false);
    if ("error" in r) {
      setError(r.error);
      return;
    }
    if (!r.res.ok) {
      setError(String(r.data.error || "Kørslen fejlede"));
      return;
    }
    setRun(r.data as unknown as ReminderRun);
  }

  /** Indsæt shortcode hvor markøren står i den skabelon man arbejder i */
  function insert(id: SmsTypeId, key: string) {
    const el = areas.current[id];
    const token = `{{${key}}}`;
    if (!el) {
      patchTemplate(id, { text: settings.templates[id].text + token });
      return;
    }
    const { selectionStart: a, selectionEnd: b, value } = el;
    patchTemplate(id, { text: value.slice(0, a) + token + value.slice(b) });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + token.length, a + token.length);
    });
  }

  return (
    <div style={{ ...card, borderColor: "#e2dcc8", background: "#fffdf6" }}>
      <div style={{ fontSize: "12px", color: "#7a5c00", background: "#fdf6df", border: "1px solid #e8dca8", borderRadius: "8px", padding: "9px 11px", marginBottom: "12px" }}>
        <strong>SMS sendes fra ordren.</strong> Åbn en booking i overblikket og tryk 💬 ved
        telefonnummeret — hurtigbeskederne ligger klar. Teksterne herunder kan også vælges dér.
        Automatikken er slukket: intet går ud, uden at nogen har trykket. Vil du have en type til at
        sende af sig selv, så tænd den her.
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
        <strong style={{ fontSize: "14px" }}>SMS til kunden</strong>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => patch({ enabled: e.target.checked })}
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
          />
          Tillad automatiske beskeder
        </label>
        {balance && (
          <span style={{ fontSize: "12px", color: balance.credit < 50 ? "#c0392b" : "#2f7a4d" }}>
            Saldo: {balance.credit.toLocaleString("da-DK", { maximumFractionDigits: 2 })} {balance.currency}
          </span>
        )}
        {provider && (
          <span style={{ fontSize: "12px", color: "#666" }}>
            Udbyder: {SMS_PROVIDERS.find((p) => p.id === provider)?.label ?? provider}
          </span>
        )}
        {devMode && <span style={{ fontSize: "12px", color: "#8a6d3b" }}>Dev-tilstand: beskeder logges, sendes ikke</span>}
      </div>

      {!configured && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "12px" }}>
          <strong>SMS er ikke sat op endnu.</strong> Vælg en udbyder og læg nøglerne ind som secrets på
          Cloudflare Pages-projektet <code>speaker-rental</code>. Indtil da gemmes teksterne, men intet sendes.
          <ul style={{ margin: "8px 0 0", paddingLeft: "18px" }}>
            {SMS_PROVIDERS.map((p) => (
              <li key={p.id} style={{ marginBottom: "2px" }}>
                <strong>{p.label}</strong> — {p.note}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "6px" }}>
            Har du flere sæt nøgler liggende, afgør <code>SMS_PROVIDER</code> hvem der bruges.
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "9px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "12px" }}>
          {error}
        </div>
      )}
      {notice && (
        <div style={{ background: "#eaf6ec", color: "#2f7a4d", padding: "9px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "12px" }}>
          {notice}
        </div>
      )}

      {/* Skabelonerne Frederik selv skriver og bruger fra ordren */}
      <div style={{ border: "1px solid #e8dca8", background: "#fffdf6", borderRadius: "8px", padding: "11px 12px", marginBottom: "14px" }}>
        <strong style={{ fontSize: "13px" }}>Dine skabeloner</strong>
        <p style={{ fontSize: "11px", color: "#8a7a4a", margin: "3px 0 10px", lineHeight: 1.5 }}>
          Det er dem, der står i dropdownen, når du trykker 💬 på en ordre. Ingen af dem sender af sig selv —
          de er skrevet på forhånd, så en besked er ét tryk. Shortcodes udfyldes fra ordren.
        </p>

        {(settings.snippets ?? []).map((sn, i) => {
          const len = smsLength(renderSms(sn.text, vars));
          return (
            <div key={sn.id} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                <input
                  value={sn.label}
                  placeholder="Navn på skabelonen, fx »Vi er på vej«"
                  onChange={(e) => {
                    const snippets = settings.snippets.map((x, j) => (j === i ? { ...x, label: e.target.value } : x));
                    patch({ snippets });
                  }}
                  style={{ ...input, flex: 1, fontWeight: 600 }}
                />
                <span style={{ fontSize: "11px", color: len.segments > 1 ? "#c0392b" : "#aaa", whiteSpace: "nowrap" }}>
                  {len.chars} tegn · {len.segments} besked{len.segments === 1 ? "" : "er"}
                </span>
                <button
                  onClick={() => patch({ snippets: settings.snippets.filter((_, j) => j !== i) })}
                  title="Fjern skabelonen"
                  style={{ background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: "16px" }}
                >
                  ×
                </button>
              </div>
              <textarea
                value={sn.text}
                onChange={(e) => {
                  const snippets = settings.snippets.map((x, j) => (j === i ? { ...x, text: e.target.value } : x));
                  patch({ snippets });
                }}
                rows={2}
                maxLength={480}
                style={{ ...input, width: "100%", boxSizing: "border-box", lineHeight: 1.45, resize: "vertical" }}
              />
              <div style={{ fontSize: "11px", color: "#999", marginTop: "3px" }}>
                Hos kunden: {renderSms(sn.text, vars) || <span style={{ color: "#c0392b" }}>tom</span>}
              </div>
            </div>
          );
        })}

        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "8px" }}>
          {SMS_SHORTCODES.map((sc) => (
            <span
              key={sc.key}
              title={`${sc.label} — fx "${sc.example}"`}
              style={{ padding: "2px 8px", fontSize: "11px", fontFamily: "ui-monospace, monospace", background: "#f4f4f4", color: "#666", border: "1px solid #e2e2e2", borderRadius: "20px" }}
            >
              {`{{${sc.key}}}`}
            </span>
          ))}
        </div>

        <button
          onClick={() =>
            patch({
              snippets: [
                ...(settings.snippets ?? []),
                // Tidsstempel som id: sletter man en og tilføjer en ny, må de
                // to ikke kunne ende med samme id og skygge for hinanden
                { id: `egen_${Date.now().toString(36)}`, label: "Ny skabelon", text: "Hej {{fornavn}}! " },
              ],
            })
          }
          style={{ background: "none", border: "none", color: "#0070f3", cursor: "pointer", fontSize: "12px", padding: "8px 0 0" }}
        >
          + Tilføj skabelon
        </button>
      </div>

      <details style={{ marginBottom: "12px" }}>
        <summary style={{ cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#666" }}>
          Automatiske SMS'er (slukket)
        </summary>
        <p style={{ fontSize: "11px", color: "#999", margin: "6px 0 10px", lineHeight: 1.5 }}>
          Fem beskeder, der kan sendes af sig selv ved bestilling, godkendelse, afhentnings- og
          afleveringsdagen. De er slukket, fordi SMS sendes fra ordren — men teksterne kan vælges manuelt
          i samme dropdown som dine egne skabeloner.
        </p>
      {SMS_TYPES.map((def) => {
        const tpl = settings.templates[def.id];
        const built = buildSms(settings, def.id, vars);
        const len = built.length;
        const over = len.segments > 1;
        const typing = smsLength(tpl.text);
        return (
          <div
            key={def.id}
            style={{
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "10px 12px",
              marginBottom: "10px",
              background: tpl.enabled ? "#fff" : "#fafafa",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", flexWrap: "wrap" }}>
              <input
                type="checkbox"
                checked={tpl.enabled}
                onChange={(e) => patchTemplate(def.id, { enabled: e.target.checked })}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <strong>{def.label}</strong>
              <span style={{ color: "#999", fontSize: "11px" }}>{def.trigger}</span>
            </label>

            <textarea
              ref={(el) => {
                areas.current[def.id] = el;
              }}
              value={tpl.text}
              onChange={(e) => patchTemplate(def.id, { text: e.target.value })}
              onFocus={() => setFocused(def.id)}
              rows={3}
              maxLength={480}
              style={{ ...input, width: "100%", boxSizing: "border-box", marginTop: "8px", lineHeight: 1.45, resize: "vertical" }}
            />

            {focused === def.id && (
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                {SMS_SHORTCODES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => insert(def.id, s.key)}
                    title={`${s.label} — fx "${s.example}"`}
                    style={{ padding: "2px 8px", fontSize: "11px", fontFamily: "ui-monospace, monospace", background: "#f4f4f4", color: "#444", border: "1px solid #e2e2e2", borderRadius: "20px", cursor: "pointer" }}
                  >
                    {`{{${s.key}}}`}
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginTop: "8px", background: "#f7f7f9", border: "1px solid #ececf1", borderRadius: "8px", padding: "8px 10px" }}>
              <div style={{ fontSize: "11px", color: "#999", marginBottom: "3px" }}>Hos kunden</div>
              <div style={{ fontSize: "13px", lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{built.text}</div>
            </div>

            {findLinks(built.text).length > 0 && (
              <div style={{ marginTop: "5px", fontSize: "11px", color: "#c0392b" }}>
                Teksten indeholder {findLinks(built.text).join(", ")} — webadresser bliver afvist af
                operatørerne, medmindre domænet er godkendt hos din udbyder. Beskeden ser sendt ud, men når
                aldrig frem.
              </div>
            )}
            <div style={{ marginTop: "5px", fontSize: "11px", color: over ? "#c0392b" : "#999" }}>
              {len.chars} tegn · {len.segments} besked{len.segments === 1 ? "" : "er"}
              {len.unicode ? " · specialtegn/emoji sætter grænsen til 70 tegn" : ""}
              {over ? " — den koster dobbelt" : ""}
              {typing.chars !== len.chars ? ` (skabelon: ${typing.chars} tegn)` : ""}
            </div>
          </div>
        );
      })}

      </details>

      <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap", marginTop: "14px" }}>
        <div>
          <label style={label}>Afsender</label>
          <input
            value={settings.sender}
            onChange={(e) => patch({ sender: e.target.value })}
            maxLength={11}
            style={{ ...input, width: "130px" }}
          />
        </div>
        <p style={{ fontSize: "11px", color: "#999", margin: 0, flex: 1, minWidth: "180px" }}>
          Max 11 tegn, kun bogstaver og tal — det er navnet kunden ser som afsender. Beskeder fra et navn
          kan ikke besvares, så teksterne beder om et opkald.
        </p>
        <button
          onClick={save}
          disabled={saving || !dirty}
          style={{ padding: "8px 18px", fontSize: "13px", fontWeight: 600, background: dirty ? "#111" : "#eee", color: dirty ? "#fff" : "#999", border: "none", borderRadius: "6px", cursor: dirty ? "pointer" : "default" }}
        >
          {saving ? "Gemmer…" : dirty ? "Gem SMS-tekster" : "Gemt"}
        </button>
      </div>

      <div style={{ borderTop: "1px solid #eee", marginTop: "14px", paddingTop: "12px", display: "flex", gap: "8px", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <label style={label}>Send en testbesked</label>
          <input
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="31 13 28 52"
            style={{ ...input, width: "150px" }}
          />
        </div>
        <button
          onClick={sendTest}
          disabled={testing || !testPhone.trim()}
          style={{ padding: "8px 14px", fontSize: "13px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", color: "#111", cursor: testPhone.trim() ? "pointer" : "default" }}
        >
          {testing ? "Sender…" : "Send test"}
        </button>
      </div>

      <div style={{ borderTop: "1px solid #eee", marginTop: "14px", paddingTop: "12px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "6px" }}>
          Dagens påmindelser
        </div>
        <p style={{ fontSize: "11px", color: "#999", margin: "0 0 8px" }}>
          Kører automatisk kl. 9 hver morgen — til ordrer med afhentning eller aflevering i dag. En ordre
          der allerede har fået sin påmindelse får ikke en ny.
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => runReminders(true)}
            disabled={running}
            style={{ padding: "7px 13px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", color: "#111", cursor: "pointer" }}
          >
            {running ? "Tjekker…" : "Se hvad der ville blive sendt"}
          </button>
          <button
            onClick={() => runReminders(false)}
            disabled={running}
            style={{ padding: "7px 13px", fontSize: "12px", border: "1px solid #d8c88a", borderRadius: "6px", background: "#fdf6df", color: "#7a5c00", cursor: "pointer" }}
          >
            Send dagens påmindelser nu
          </button>
        </div>

        {run && (
          <div style={{ marginTop: "10px", fontSize: "12px", color: "#444" }}>
            <div>
              {run.dryRun ? "Ville sende" : "Sendt"}: <strong>{run.sent.length}</strong> · gælder{" "}
              {run.forDate}
              {run.failed.length > 0 && <span style={{ color: "#c0392b" }}> · {run.failed.length} fejlede</span>}
              {run.skipped.length > 0 && <span style={{ color: "#8a6d3b" }}> · {run.skipped.length} sprunget over</span>}
            </div>
            {[...run.failed, ...run.skipped].slice(0, 8).map((item, i) => (
              <div key={i} style={{ color: "#888", fontSize: "11px" }}>
                {item.type} · {item.id} · {"error" in item ? item.error : item.reason}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
