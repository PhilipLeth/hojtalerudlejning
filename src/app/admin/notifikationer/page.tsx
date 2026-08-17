"use client";

import { useState, useEffect, useCallback } from "react";
import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { b64urlToBytes } from "@/lib/webpush";

interface PushStatus {
  configured: boolean;
  publicKey: string | null;
  devices: Array<{ host: string; endpoint: string }>;
  error?: string;
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: "10px",
  padding: "16px 18px",
  marginBottom: "16px",
};

const primary: React.CSSProperties = {
  padding: "10px 20px",
  fontSize: "14px",
  fontWeight: 600,
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

/** Kører siden som hjemmeskærms-app? Kun der virker push på iOS. */
function useStandalone(): boolean {
  const [standalone, setStandalone] = useState(true);
  useEffect(() => {
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
    setStandalone(window.matchMedia("(display-mode: standalone)").matches || iosStandalone === true);
  }, []);
  return standalone;
}

export default function NotifikationerPage() {
  const { secret, user, ready, isLoggedIn, logout, unauthorized } = useAdminAuth();
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [thisDevice, setThisDevice] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const standalone = useStandalone();

  useEffect(() => {
    setPermission(
      typeof Notification === "undefined" || !("serviceWorker" in navigator)
        ? "unsupported"
        : Notification.permission,
    );
  }, []);

  const load = useCallback(async () => {
    if (!secret) return;
    setError("");
    try {
      const res = await fetch(`/api/push?secret=${encodeURIComponent(secret)}`);
      const json: PushStatus = await res.json();
      if (!res.ok) {
        if (res.status === 401) { unauthorized(); return; }
        setError(json.error || "Kunne ikke hente status");
        return;
      }
      setStatus(json);
      // Er DENNE telefon allerede tilmeldt?
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        setThisDevice(sub?.endpoint ?? null);
      }
    } catch {
      setError("Netværksfejl");
    }
  }, [secret]);

  useEffect(() => { load(); }, [load]);

  async function enable() {
    setBusy("enable");
    setError("");
    setOk("");
    try {
      if (!status?.publicKey) throw new Error("VAPID-nøglerne mangler i Cloudflare");

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") throw new Error("Du sagde nej til beskeder. Slå dem til under Indstillinger → Lejhøjtaler.");

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Har telefonen et gammelt abonnement på en anden nøgle, skal det væk
      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: b64urlToBytes(status.publicKey) as BufferSource,
      });

      const res = await fetch(`/api/push?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", subscription: sub.toJSON() }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Kunne ikke gemme");

      setOk("Telefonen er tilmeldt. Prøv en testbesked.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noget gik galt");
    } finally {
      setBusy("");
    }
  }

  async function disable(endpoint: string) {
    setBusy(endpoint);
    try {
      if (endpoint === thisDevice) {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        await sub?.unsubscribe();
      }
      await fetch(`/api/push?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unsubscribe", endpoint }),
      });
      await load();
    } finally {
      setBusy("");
    }
  }

  async function test() {
    setBusy("test");
    setError("");
    setOk("");
    try {
      const res = await fetch(`/api/push?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Beskeden kunne ikke sendes");
        return;
      }
      setOk("Sendt. Den lander typisk inden for et par sekunder.");
      if (json.removed) await load();
    } catch {
      setError("Netværksfejl");
    } finally {
      setBusy("");
    }
  }

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Notifikationer" />;

  const subscribed = !!thisDevice && !!status?.devices.some((d) => d.endpoint === thisDevice);

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "20px", fontFamily: "system-ui, sans-serif", color: "#111" }}>
      <AdminNav title="Notifikationer" />

      {error && <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>{error}</div>}
      {ok && <div style={{ background: "#d4edda", color: "#155724", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>{ok}</div>}

      {status && !status.configured && (
        <div style={{ background: "#fff3cd", color: "#856404", padding: "12px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
          <strong>Push er ikke sat op endnu.</strong> VAPID-nøglerne mangler i Cloudflare. Se
          fremgangsmåden nederst på siden — det er en engangsopgave på to minutter.
        </div>
      )}

      {permission === "unsupported" && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "12px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
          Denne browser kan ikke tage imod push.
        </div>
      )}

      {!standalone && permission !== "unsupported" && (
        <div style={{ background: "#e8f0fe", color: "#174ea6", padding: "12px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", lineHeight: 1.6 }}>
          <strong>Læg først siden på hjemmeskærmen.</strong> På iPhone kan push kun sendes til en app,
          der ligger på hjemmeskærmen — ikke til en Safari-fane. Tryk på <strong>Del</strong>-knappen
          nederst i Safari, vælg <strong>Føj til hjemmeskærm</strong>, åbn appen derfra, og kom tilbage
          hertil. Så virker knappen nedenfor.
        </div>
      )}

      <div style={card}>
        <h2 style={{ margin: "0 0 6px", fontSize: "16px" }}>Denne telefon</h2>
        <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#666", lineHeight: 1.6 }}>
          {subscribed
            ? "Tilmeldt. Du får en besked, hver gang en booking lander — også når appen er lukket."
            : "Ikke tilmeldt endnu."}
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {!subscribed && (
            <button onClick={enable} disabled={!!busy || !status?.configured} style={{ ...primary, opacity: busy || !status?.configured ? 0.6 : 1 }}>
              {busy === "enable" ? "Tilmelder…" : "Slå beskeder til"}
            </button>
          )}
          {subscribed && (
            <button onClick={() => disable(thisDevice!)} disabled={!!busy} style={{ padding: "10px 18px", fontSize: "14px", background: "#fff", color: "#c0392b", border: "1px solid #dc3545", borderRadius: "8px", cursor: "pointer" }}>
              Slå fra på denne telefon
            </button>
          )}
          <button onClick={test} disabled={!!busy || !status?.devices.length} style={{ padding: "10px 18px", fontSize: "14px", background: "#f0f0f0", color: "#333", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", opacity: status?.devices.length ? 1 : 0.5 }}>
            {busy === "test" ? "Sender…" : "Send testbesked"}
          </button>
        </div>
      </div>

      <div style={card}>
        <h2 style={{ margin: "0 0 10px", fontSize: "16px" }}>Tilmeldte enheder ({status?.devices.length ?? 0})</h2>
        {!status?.devices.length && <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>Ingen endnu.</p>}
        {status?.devices.map((d) => (
          <div key={d.endpoint} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderTop: "1px solid #f2f2f2", fontSize: "13px" }}>
            <span style={{ flex: 1 }}>
              {d.host.includes("apple") ? "📱 iPhone/iPad" : d.host.includes("google") ? "🤖 Android/Chrome" : "💻 " + d.host}
              {d.endpoint === thisDevice && <strong style={{ color: "#0a7a43" }}> · denne enhed</strong>}
            </span>
            <button onClick={() => disable(d.endpoint)} disabled={busy === d.endpoint} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "12px" }}>
              Fjern
            </button>
          </div>
        ))}
      </div>

      <details style={{ ...card, fontSize: "13px", color: "#555" }}>
        <summary style={{ cursor: "pointer", fontWeight: 600, color: "#111" }}>
          Sådan sættes push op (engangsopgave)
        </summary>
        <p style={{ lineHeight: 1.7, marginTop: "12px" }}>
          Push kræver et nøglepar, som kun I har. Kør denne i en terminal:
        </p>
        <pre style={{ background: "#f6f6f6", padding: "12px", borderRadius: "6px", overflowX: "auto", fontSize: "12px", lineHeight: 1.5 }}>
{`node -e '
const c=require("crypto").webcrypto;
c.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign"]).then(async k=>{
  const pub=Buffer.from(await c.subtle.exportKey("raw",k.publicKey));
  const jwk=await c.subtle.exportKey("jwk",k.privateKey);
  const u=b=>b.toString("base64").replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/,"");
  console.log("VAPID_PUBLIC_KEY =",u(pub));
  console.log("VAPID_PRIVATE_KEY=",jwk.d);
})'`}
        </pre>
        <p style={{ lineHeight: 1.7 }}>
          Læg de to værdier ind som hemmeligheder på Pages-projektet <code>speaker-rental</code> —
          i Cloudflare under Settings → Environment variables, eller med:
        </p>
        <pre style={{ background: "#f6f6f6", padding: "12px", borderRadius: "6px", overflowX: "auto", fontSize: "12px" }}>
{`npx wrangler pages secret put VAPID_PUBLIC_KEY --project-name=speaker-rental
npx wrangler pages secret put VAPID_PRIVATE_KEY --project-name=speaker-rental`}
        </pre>
        <p style={{ lineHeight: 1.7, margin: 0 }}>
          Den private nøgle skal aldrig i git. Skifter I den senere, skal alle telefoner tilmeldes
          igen — gamle abonnementer er bundet til den gamle nøgle.
        </p>
      </details>

      <p style={{ fontSize: "12px", color: "#aaa", lineHeight: 1.6 }}>
        iOS kan trække abonnementet tilbage, hvis appen ikke har været åbnet i lang tid. Kommer der
        ingen beskeder, så åbn appen og tryk &quot;Slå beskeder til&quot; igen.
      </p>
    </div>
  );
}
