"use client";

/* ───── Bekræftelsen på en godkendt ordre ─────
 *
 * Teksten kunden får, når ordren sættes til bekræftet. Redigeres her, så den
 * kan rettes uden en deploy, og forhåndsvisningen bruger præcis samme kode som
 * serveren sender med.
 *
 * Gemmer via samme endepunkt som mailskabelonen ovenfor, men henter
 * indstillingerne forfra først og rører kun sine egne felter — ellers ville to
 * åbne editorer på siden kunne overskrive hinanden.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adminFetch } from "@/lib/useAdminAuth";
import {
  DEFAULT_SETTINGS,
  SHORTCODES,
  buildConfirmationMail,
  signatureFor,
  type CommSettings,
  type CommTemplate,
} from "@/lib/commTemplates";

/** Eksempelordre — sådan ser mailen ud hos en rigtig kunde */
const PREVIEW = {
  fornavn: "Agnes",
  navn: "Agnes Dahle Stæhr",
  produkter: "Stor højtalerpakke, Lys-pakke",
  periode: "fre 21. aug → man 24. aug",
  sted: "Du henter hos os: Halvtolv 9, 1. th, 1436 København K",
  betaling: "I alt 1.995 kr — betales ved afhentning med MobilePay.",
  total: 1995,
  telefon: "31 13 28 52",
  besked: "Husk at I gerne må hente allerede torsdag aften.",
};

/** Shortcodes der giver mening i en bekræftelse — resten hører til opfølgningen */
const KEYS = ["fornavn", "navn", "produkter", "periode", "sted", "betaling", "total", "telefon", "besked", "hilsen"];

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

export default function ConfirmationMail({ secret }: { secret: string }) {
  const [template, setTemplate] = useState<CommTemplate>(DEFAULT_SETTINGS.confirmation);
  const [autoSend, setAutoSend] = useState(true);
  const [staff, setStaff] = useState(DEFAULT_SETTINGS.staff);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    if (!secret) return;
    const r = await adminFetch("/api/kommunikation", secret);
    if ("error" in r || !r.res.ok) return;
    const settings = (r.data as { settings?: CommSettings }).settings;
    if (!settings) return;
    setTemplate(settings.confirmation ?? DEFAULT_SETTINGS.confirmation);
    setAutoSend(settings.confirmationAutoSend !== false);
    setStaff(settings.staff ?? DEFAULT_SETTINGS.staff);
    setDirty(false);
  }, [secret]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setError("");
    setNotice("");
    // Hent forfra og rør kun bekræftelsen — den anden editor på siden må ikke
    // miste det, den har gemt imens
    const fresh = await adminFetch("/api/kommunikation", secret);
    if ("error" in fresh || !fresh.res.ok) {
      setSaving(false);
      setError("Kunne ikke hente de gældende indstillinger");
      return;
    }
    const settings = (fresh.data as { settings?: CommSettings }).settings ?? DEFAULT_SETTINGS;

    const r = await adminFetch("/api/kommunikation", secret, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, confirmation: template, confirmationAutoSend: autoSend }),
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
    setNotice("Bekræftelsen er gemt");
    setDirty(false);
  }

  function insert(key: string) {
    const el = bodyRef.current;
    const token = `{{${key}}}`;
    setDirty(true);
    if (!el) {
      setTemplate((t) => ({ ...t, body: t.body + token }));
      return;
    }
    const { selectionStart: a, selectionEnd: b, value } = el;
    setTemplate((t) => ({ ...t, body: value.slice(0, a) + token + value.slice(b) }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + token.length, a + token.length);
    });
  }

  const preview = useMemo(() => {
    const ansvarlig = staff[0]?.name;
    return buildConfirmationMail(
      { ...DEFAULT_SETTINGS, confirmation: template },
      { ...PREVIEW, ansvarlig, hilsen: signatureFor({ ...DEFAULT_SETTINGS, staff }, ansvarlig) },
    );
  }, [template, staff]);

  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "10px", padding: "14px 16px", marginBottom: "18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
        <strong style={{ fontSize: "14px" }}>Bekræftelse på godkendt ordre</strong>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={autoSend}
            onChange={(e) => {
              setAutoSend(e.target.checked);
              setDirty(true);
            }}
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
          />
          Send når ordren sættes til bekræftet
        </label>
      </div>
      <p style={{ fontSize: "11px", color: "#999", margin: "0 0 10px", lineHeight: 1.5 }}>
        Kunden har kun fået »vi vender tilbage« ved bestillingen. Det er den her mail, der gør aftalen fast —
        og den, han finder frem igen fredag eftermiddag for at se, hvor han skal hente. Sendes én gang pr.
        ordre; et skift frem og tilbage sender ikke igen.
      </p>

      {error && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "8px 11px", borderRadius: "7px", fontSize: "12px", marginBottom: "10px" }}>
          {error}
        </div>
      )}
      {notice && (
        <div style={{ background: "#eaf6ec", color: "#2f7a4d", padding: "8px 11px", borderRadius: "7px", fontSize: "12px", marginBottom: "10px" }}>
          {notice}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,320px)", gap: "14px", alignItems: "start" }}>
        <div>
          <label style={label}>Emne</label>
          <input
            value={template.subject}
            onChange={(e) => {
              setTemplate((t) => ({ ...t, subject: e.target.value }));
              setDirty(true);
            }}
            style={{ ...input, width: "100%", boxSizing: "border-box", marginBottom: "10px" }}
          />

          <label style={label}>Tekst</label>
          <textarea
            ref={bodyRef}
            value={template.body}
            onChange={(e) => {
              setTemplate((t) => ({ ...t, body: e.target.value }));
              setDirty(true);
            }}
            rows={16}
            style={{ ...input, width: "100%", boxSizing: "border-box", lineHeight: 1.5, resize: "vertical" }}
          />

          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "8px" }}>
            {SHORTCODES.filter((s) => KEYS.includes(s.key)).map((s) => (
              <button
                key={s.key}
                onClick={() => insert(s.key)}
                title={`${s.label} — fx "${s.example}"`}
                style={{ padding: "3px 9px", fontSize: "11px", fontFamily: "ui-monospace, monospace", background: "#f4f4f4", color: "#444", border: "1px solid #e2e2e2", borderRadius: "20px", cursor: "pointer" }}
              >
                {`{{${s.key}}}`}
              </button>
            ))}
          </div>

          <button
            onClick={save}
            disabled={saving || !dirty}
            style={{ marginTop: "12px", padding: "8px 18px", fontSize: "13px", fontWeight: 600, background: dirty ? "#111" : "#eee", color: dirty ? "#fff" : "#999", border: "none", borderRadius: "6px", cursor: dirty ? "pointer" : "default" }}
          >
            {saving ? "Gemmer…" : dirty ? "Gem bekræftelsen" : "Gemt"}
          </button>
        </div>

        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "6px" }}>Sådan ser den ud</div>
          <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ background: "#fafafa", borderBottom: "1px solid #eee", padding: "9px 12px" }}>
              <div style={{ fontSize: "11px", color: "#999" }}>Emne</div>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>{preview.subject}</div>
            </div>
            <div style={{ padding: "12px", fontSize: "13px" }} dangerouslySetInnerHTML={{ __html: preview.html }} />
          </div>
          <p style={{ fontSize: "11px", color: "#aaa", marginTop: "6px", lineHeight: 1.5 }}>
            Sted og betaling udfyldes fra den enkelte ordre — om I kører ud, og hvad der mangler at blive betalt.
          </p>
        </div>
      </div>
    </div>
  );
}
