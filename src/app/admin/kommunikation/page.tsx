"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import SmsSettings from "@/components/admin/SmsSettings";
import { useAdminAuth } from "@/lib/useAdminAuth";
import {
  DEFAULT_SETTINGS,
  SHORTCODES,
  buildFollowUpMail,
  signatureFor,
  type CommSettings,
} from "@/lib/commTemplates";

interface CommResponse {
  settings: CommSettings;
  saleActive: boolean;
  error?: string;
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

/** Eksempelordre til forhåndsvisningen — det er sådan mailen kommer til at se ud */
const PREVIEW = {
  fornavn: "Agnes",
  navn: "Agnes Dahle Stæhr",
  produkter: "Stor højtalerpakke, Lys-pakke",
  periode: "fre 21. aug → man 24. aug",
  besked: "Fedt I fik gang i dansegulvet — kom endelig igen!",
  reviewUrl: "https://g.page/r/CbIkmN4b8vjGEBM/review",
};

export default function KommunikationPage() {
  const { secret, user, ready, isLoggedIn, logout, unauthorized } = useAdminAuth();
  const [settings, setSettings] = useState<CommSettings>(DEFAULT_SETTINGS);
  const [saleActive, setSaleActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);


  const load = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/kommunikation?secret=${encodeURIComponent(secret)}`);
      const json: CommResponse = await res.json();
      if (!res.ok) {
        if (res.status === 401) { unauthorized(); return; }
        setError(json.error || "Kunne ikke hente indstillingerne");
        return;
      }
      setSettings(json.settings);
      setSaleActive(json.saleActive);
      setDirty(false);
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => { load(); }, [load]);

  function patch(p: Partial<CommSettings>) {
    setSettings((s) => ({ ...s, ...p }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/kommunikation?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error || "Kunne ikke gemme");
        return;
      }
      await load();
    } catch {
      setError("Netværksfejl");
    } finally {
      setSaving(false);
    }
  }

  /** Indsæt shortcode hvor markøren står — hurtigere end at skrive den af */
  function insert(key: string) {
    const el = bodyRef.current;
    const token = `{{${key}}}`;
    if (!el) {
      patch({ followUp: { ...settings.followUp, body: settings.followUp.body + token } });
      return;
    }
    const { selectionStart: a, selectionEnd: b, value } = el;
    const next = value.slice(0, a) + token + value.slice(b);
    patch({ followUp: { ...settings.followUp, body: next } });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + token.length, a + token.length);
    });
  }

  // Forhåndsvisningen bruger præcis samme kode som serveren sender med
  const preview = useMemo(() => {
    const ansvarlig = settings.staff[0]?.name;
    return buildFollowUpMail(settings, {
      ...PREVIEW,
      ansvarlig,
      hilsen: signatureFor(settings, ansvarlig),
      rabatkode: settings.referralCode,
      rabatpct: settings.referralPct,
      udsalg: saleActive
        ? "PS: Vi har weekendudsalg lige nu — se hvad der står ledigt til weekenden."
        : "",
    });
  }, [settings, saleActive]);

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Kommunikation" />;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "system-ui, sans-serif", color: "#111" }}>
      <AdminNav
        title="Kommunikation"
        actions={
          <button
            onClick={load}
            disabled={loading}
            style={{ padding: "6px 12px", fontSize: "13px", color: "#555", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", cursor: "pointer" }}
          >
            {loading ? "Henter…" : "Opdater"}
          </button>
        }
      />

      <div style={{ background: "#e8f0fe", color: "#174ea6", padding: "12px 14px", borderRadius: "8px", margin: "0 0 18px", fontSize: "13px" }}>
        <strong>Opfølgning efter ordre.</strong> Mailen sendes automatisk, når du markerer udstyret som
        returneret — én gang pr. ordre. Teksten herunder er den, kunden får; shortcodes udfyldes fra ordren.
        {saleActive
          ? " Weekendudsalget er tændt, så {{udsalg}} har noget at sige lige nu."
          : " Weekendudsalget er slukket, så {{udsalg}} er tomt og dets afsnit falder helt væk."}
      </div>

      {error && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,420px)", gap: "18px", alignItems: "start" }}>
        <div>
          {/* Skabelonen */}
          <div style={card}>
            <label style={label}>Emne</label>
            <input
              value={settings.followUp.subject}
              onChange={(e) => patch({ followUp: { ...settings.followUp, subject: e.target.value } })}
              style={{ ...input, width: "100%", boxSizing: "border-box", marginBottom: "12px" }}
            />

            <label style={label}>Tekst</label>
            <textarea
              ref={bodyRef}
              value={settings.followUp.body}
              onChange={(e) => patch({ followUp: { ...settings.followUp, body: e.target.value } })}
              rows={18}
              style={{ ...input, width: "100%", boxSizing: "border-box", lineHeight: 1.5, resize: "vertical" }}
            />
            <p style={{ fontSize: "11px", color: "#999", margin: "6px 0 10px" }}>
              Tom linje starter et nyt afsnit. Et afsnit, hvor alle shortcodes er tomme, forsvinder helt —
              så en ordre uden personlig besked ikke får et hul midt i mailen.
            </p>

            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {SHORTCODES.map((s) => (
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
          </div>

          {/* Hvem står for udlejningen */}
          <div style={card}>
            <label style={label}>Hvem kan stå for en udlejning</label>
            <p style={{ fontSize: "11px", color: "#999", margin: "0 0 10px" }}>
              Navnene her bliver til dropdownen på ordren. Underskriften er den, mailen slutter med, når
              personen står som ansvarlig — {"{{hilsen}}"}.
            </p>
            {settings.staff.map((person, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  value={person.name}
                  placeholder="Navn"
                  onChange={(e) => {
                    const staff = settings.staff.map((s, j) => (j === i ? { ...s, name: e.target.value } : s));
                    patch({ staff });
                  }}
                  style={{ ...input, width: "140px" }}
                />
                <input
                  value={person.signature}
                  placeholder="Underskrift, fx »Frederik fra Lejhøjtaler.dk«"
                  onChange={(e) => {
                    const staff = settings.staff.map((s, j) => (j === i ? { ...s, signature: e.target.value } : s));
                    patch({ staff });
                  }}
                  style={{ ...input, flex: 1 }}
                />
                <button
                  onClick={() => patch({ staff: settings.staff.filter((_, j) => j !== i) })}
                  title="Fjern"
                  style={{ background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: "16px" }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => patch({ staff: [...settings.staff, { name: "", signature: "" }] })}
              style={{ background: "none", border: "none", color: "#0070f3", cursor: "pointer", fontSize: "12px", padding: 0 }}
            >
              + Tilføj person
            </button>
          </div>

          {/* Delekoden */}
          <div style={card}>
            <label style={label}>Kode kunden kan dele med venner</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                value={settings.referralCode}
                onChange={(e) => patch({ referralCode: e.target.value })}
                style={{ ...input, width: "150px", textTransform: "uppercase" }}
              />
              <span style={{ fontSize: "13px" }}>giver</span>
              <input
                type="number"
                min={1}
                max={99}
                value={settings.referralPct}
                onChange={(e) => patch({ referralPct: Number(e.target.value) })}
                style={{ ...input, width: "62px" }}
              />
              <span style={{ fontSize: "13px" }}>%</span>
            </div>
            <p style={{ fontSize: "11px", color: "#999", margin: "8px 0 0" }}>
              Koden oprettes som rigtig rabatkode, når du gemmer — så den virker i booking-flowet med det
              samme. Den kan ses og ændres under Rabatkoder.
            </p>
          </div>

          <div style={{ ...card, display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.autoSend}
                onChange={(e) => patch({ autoSend: e.target.checked })}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              Send automatisk ved retur
            </label>
            <button
              onClick={save}
              disabled={saving || !dirty}
              style={{ marginLeft: "auto", padding: "8px 18px", fontSize: "13px", fontWeight: 600, background: dirty ? "#111" : "#eee", color: dirty ? "#fff" : "#999", border: "none", borderRadius: "6px", cursor: dirty ? "pointer" : "default" }}
            >
              {saving ? "Gemmer…" : dirty ? "Gem" : "Gemt"}
            </button>
          </div>

          {/* SMS har sine egne skabeloner og sin egen afbryder — gemmes for sig */}
          <SmsSettings secret={secret} />
        </div>

        {/* Forhåndsvisning */}
        <div style={{ position: "sticky", top: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "6px" }}>
            Sådan ser den ud hos kunden
          </div>
          <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ background: "#fafafa", borderBottom: "1px solid #eee", padding: "10px 14px" }}>
              <div style={{ fontSize: "11px", color: "#999" }}>Emne</div>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>{preview.subject}</div>
            </div>
            <div style={{ padding: "14px" }} dangerouslySetInnerHTML={{ __html: preview.html }} />
          </div>
          <p style={{ fontSize: "11px", color: "#aaa", marginTop: "8px", lineHeight: 1.5 }}>
            Eksempelordre. Den personlige besked kommer fra feltet på den enkelte ordre — er det tomt,
            falder afsnittet væk.
          </p>
        </div>
      </div>
    </div>
  );
}
