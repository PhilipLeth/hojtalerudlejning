"use client";

import { useCallback, useEffect, useState } from "react";

type ChannelStatus = "not_started" | "ready" | "connected" | "live" | "paused" | "skipped";

interface ChannelDef {
  id: string;
  name: string;
  type: string;
  description: string;
  setupUrl?: string;
  contactEmail?: string;
}

interface ChannelState {
  id: string;
  status: ChannelStatus;
  notes?: string;
  lastRunAt?: string;
  externalUrl?: string;
}

interface ChannelsPayload {
  defs: ChannelDef[];
  channels: ChannelState[];
  productCount: number;
  products: Array<{ id: string; title: string; price: number; availability: string }>;
  hasCatalog: boolean;
  usingFallback?: boolean;
  feedXmlUrl: string;
  feedCsvUrl: string;
  lastSetupRunAt?: string;
}

const STATUS_LABEL: Record<ChannelStatus, string> = {
  not_started: "Ikke startet",
  ready: "Klar til connect",
  connected: "Forbundet",
  live: "Live",
  paused: "Pauseret",
  skipped: "Skippet",
};

const STATUS_COLOR: Record<ChannelStatus, string> = {
  not_started: "#888",
  ready: "#0070f3",
  connected: "#7c3aed",
  live: "#16a34a",
  paused: "#ca8a04",
  skipped: "#aaa",
};

const navLink: React.CSSProperties = {
  padding: "6px 14px",
  fontSize: "13px",
  background: "#f0f0f0",
  border: "1px solid #ddd",
  borderRadius: "6px",
  textDecoration: "none",
  color: "#111",
};

export default function AdminKanalerPage() {
  const [secret, setSecret] = useState("");
  const [inputSecret, setInputSecret] = useState("");
  const [data, setData] = useState<ChannelsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [steps, setSteps] = useState<Array<{ channelId: string; title: string; done: boolean; action: string }>>([]);
  const [pastePack, setPastePack] = useState<Array<{ id: string; title: string; paste: string }>>([]);
  const [emails, setEmails] = useState<Array<{ channel: string; email?: string; message: string }>>([]);
  const [emailDrafts, setEmailDrafts] = useState<
    Array<{ channel: string; to: string; subject: string; body: string }>
  >([]);
  const [expandedPaste, setExpandedPaste] = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("admin_secret");
    if (s) setSecret(s);
  }, []);

  const load = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/channels?secret=${encodeURIComponent(secret)}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Kunne ikke hente kanaler");
        if (res.status === 401) {
          localStorage.removeItem("admin_secret");
          setSecret("");
        }
        return;
      }
      setData(json);
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    if (secret) load();
  }, [secret, load]);

  const runSetup = async () => {
    setRunning(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/channels?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run_setup" }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Setup fejlede");
        return;
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              ...json.doc,
              defs: json.defs,
              productCount: json.productCount,
              feedXmlUrl: json.feedXmlUrl,
              feedCsvUrl: json.feedCsvUrl,
              lastSetupRunAt: json.doc.lastSetupRunAt,
            }
          : null
      );
      setSteps(json.steps || []);
      setPastePack(json.pastePack || []);
      setEmails(json.nextExternal || []);
      setEmailDrafts(json.emailDrafts || []);
      setMessage(
        `Setup kørt: ${json.productCount} produkter klar i feed. Log ind på DBA/GulogGratis/Meta og indsæt feed-URL — så oprettes produkterne dér.`
      );
      await load();
    } catch {
      setError("Netværksfejl ved setup");
    } finally {
      setRunning(false);
    }
  };

  const updateStatus = async (channelId: string, status: ChannelStatus) => {
    try {
      const res = await fetch(`/api/channels?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_channel", channelId, status }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Opdatering fejlede");
        return;
      }
      await load();
    } catch {
      alert("Netværksfejl");
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Kopieret");
    } catch {
      prompt("Kopiér:", text);
    }
  };

  if (!secret) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputSecret.trim()) {
              localStorage.setItem("admin_secret", inputSecret.trim());
              setSecret(inputSecret.trim());
            }
          }}
          style={{ background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", maxWidth: "400px", width: "100%" }}
        >
          <h1 style={{ margin: "0 0 8px", fontSize: "24px" }}>Kanaler</h1>
          <p style={{ margin: "0 0 24px", color: "#666" }}>Indtast adgangskode</p>
          <input type="password" value={inputSecret} onChange={(e) => setInputSecret(e.target.value)} placeholder="Adgangskode" style={{ width: "100%", padding: "12px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "16px", boxSizing: "border-box", color: "#111" }} />
          <button type="submit" style={{ width: "100%", padding: "12px", fontSize: "16px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            Log ind
          </button>
        </form>
      </div>
    );
  }

  const stateById = new Map(data?.channels.map((c) => [c.id, c]) || []);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Marketing-kanaler</h1>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#888" }}>
            Alle konti: info@lejhojtaler.dk
            {data ? ` · ${data.productCount} produkter i feed` : ""}
            {data?.lastSetupRunAt ? ` · Sidste run: ${new Date(data.lastSetupRunAt).toLocaleString("da-DK")}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <a href="/admin" style={navLink}>Bookinger</a>
          <a href="/admin/produkter" style={navLink}>Produkter</a>
          <a href="/admin/lager" style={navLink}>Lager</a>
          <button onClick={load} disabled={loading} style={{ ...navLink, border: "none", cursor: "pointer" }}>
            {loading ? "Henter..." : "Opdater"}
          </button>
          <button
            onClick={runSetup}
            disabled={running}
            style={{ padding: "8px 18px", fontSize: "14px", fontWeight: 700, background: "#111", color: "#fff", border: "none", borderRadius: "6px", cursor: running ? "wait" : "pointer" }}
          >
            {running ? "Kører setup..." : "▶ Run setup"}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 16px" }}>
        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "8px", marginBottom: "12px" }}>{error}</div>}
        {message && <div style={{ background: "#d4edda", color: "#155724", padding: "12px 16px", borderRadius: "8px", marginBottom: "12px" }}>{message}</div>}

        {data?.usingFallback && (
          <div style={{ background: "#fff3cd", color: "#856404", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>
            Feed bruger standard-katalog (KV tom). Gem gerne i <a href="/admin/produkter">Produkter</a> så admin-ændringer også kommer i feedet.
          </div>
        )}

        {data && !data.hasCatalog && !data.usingFallback && (
          <div style={{ background: "#fff3cd", color: "#856404", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>
            Ingen katalog i KV endnu. Gå til <a href="/admin/produkter">Produkter</a> og klik &quot;Gem ændringer&quot; én gang, så feedet virker.
          </div>
        )}

        {/* Feed URLs */}
        <section style={{ background: "#fff", borderRadius: "10px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: "15px" }}>Produktfeeds (peg partnere hertil)</h2>
          <div style={{ display: "grid", gap: "8px" }}>
            {[
              { label: "XML (DBA / GulogGratis)", url: data?.feedXmlUrl || "https://lejhojtaler.dk/api/feeds/products?format=xml" },
              { label: "CSV (Meta Catalog)", url: data?.feedCsvUrl || "https://lejhojtaler.dk/api/feeds/products?format=csv" },
              { label: "Facebook Marketplace CSV", url: "https://lejhojtaler.dk/api/feeds/products?format=facebook" },
            ].map((f) => (
              <div key={f.label} style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", fontSize: "13px" }}>
                <span style={{ minWidth: "180px", color: "#666" }}>{f.label}</span>
                <code style={{ flex: 1, background: "#f5f5f5", padding: "6px 10px", borderRadius: "6px", wordBreak: "break-all" }}>{f.url}</code>
                <button type="button" onClick={() => copy(f.url)} style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", cursor: "pointer" }}>
                  Kopiér
                </button>
                <a href={f.url} target="_blank" rel="noreferrer" style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", textDecoration: "none", color: "#111" }}>
                  Åbn
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Channel table */}
        <section style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #eee" }}>
            <h2 style={{ margin: 0, fontSize: "15px" }}>Kanal-oversigt</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#fafafa", textAlign: "left" }}>
                <th style={{ padding: "10px 16px", color: "#888", fontSize: "11px", textTransform: "uppercase" }}>Kanal</th>
                <th style={{ padding: "10px 16px", color: "#888", fontSize: "11px", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "10px 16px", color: "#888", fontSize: "11px", textTransform: "uppercase" }}>Note</th>
                <th style={{ padding: "10px 16px", color: "#888", fontSize: "11px", textTransform: "uppercase" }}>Handling</th>
              </tr>
            </thead>
            <tbody>
              {(data?.defs || []).map((def) => {
                const st = stateById.get(def.id);
                const status = (st?.status || "not_started") as ChannelStatus;
                return (
                  <tr key={def.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                      <div style={{ fontWeight: 600 }}>{def.name}</div>
                      <div style={{ color: "#888", fontSize: "12px", marginTop: "2px" }}>{def.description}</div>
                      {def.setupUrl && (
                        <a href={def.setupUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#0070f3" }}>
                          Åbn partner →
                        </a>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: "#fff", background: STATUS_COLOR[status] }}>
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "top", color: "#555", maxWidth: "280px" }}>{st?.notes || "—"}</td>
                    <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                      {status !== "skipped" && (
                        <select
                          value={status}
                          onChange={(e) => updateStatus(def.id, e.target.value as ChannelStatus)}
                          style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "6px", border: "1px solid #ddd" }}
                        >
                          {(["not_started", "ready", "connected", "live", "paused"] as ChannelStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Setup steps from last run */}
        {steps.length > 0 && (
          <section style={{ background: "#fff", borderRadius: "10px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: "0 0 12px", fontSize: "15px" }}>Setup-tjekliste (fra sidste Run)</h2>
            <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", lineHeight: 1.6 }}>
              {steps.map((s) => (
                <li key={s.channelId} style={{ marginBottom: "8px", color: s.done ? "#16a34a" : "#333" }}>
                  <strong>{s.title}</strong> — {s.action}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Connect steps from last run */}
        {emails.length > 0 && (
          <section style={{ background: "#fff", borderRadius: "10px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "15px" }}>Opret produkter på kanalerne</h2>
            <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#888" }}>
              Prøv selvbetjening først. Brug mailudkast nedenfor hvis Boost/erhverv kræver kontakt.
            </p>
            {emails.map((e) => (
              <div key={e.channel} style={{ marginBottom: "12px", padding: "12px", background: "#fafafa", borderRadius: "8px" }}>
                <div style={{ fontWeight: 600, marginBottom: "6px", fontSize: "13px" }}>{e.channel}</div>
                <pre style={{ margin: "0 0 8px", whiteSpace: "pre-wrap", fontSize: "12px", fontFamily: "inherit" }}>{e.message}</pre>
                <button type="button" onClick={() => copy(e.message)} style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", cursor: "pointer" }}>
                  Kopiér trin
                </button>
              </div>
            ))}
          </section>
        )}

        {emailDrafts.length > 0 && (
          <section style={{ background: "#fff", borderRadius: "10px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "15px" }}>Mailudkast</h2>
            <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#888" }}>
              Send fra info@lejhojtaler.dk. Meta kræver ingen mail (selvbetjening).
            </p>
            {emailDrafts.map((d) => {
              const full = `Til: ${d.to}\nEmne: ${d.subject}\n\n${d.body}`;
              return (
                <div key={d.channel} style={{ marginBottom: "12px", padding: "12px", background: "#fafafa", borderRadius: "8px" }}>
                  <div style={{ fontWeight: 600, marginBottom: "4px", fontSize: "13px" }}>{d.channel}</div>
                  <div style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>
                    <strong>Til:</strong> {d.to}
                    <br />
                    <strong>Emne:</strong> {d.subject}
                  </div>
                  <pre style={{ margin: "0 0 8px", whiteSpace: "pre-wrap", fontSize: "12px", fontFamily: "inherit" }}>{d.body}</pre>
                  <button
                    type="button"
                    onClick={() => copy(full)}
                    style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", cursor: "pointer" }}
                  >
                    Kopiér mail
                  </button>
                </div>
              );
            })}
          </section>
        )}

        {/* Hygglo paste */}
        {pastePack.length > 0 && (
          <section style={{ background: "#fff", borderRadius: "10px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "15px" }}>Hygglo paste-pakke</h2>
            <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#888" }}>Kopiér tekst → opret opslag på Hygglo → marker kanal Live når synlig</p>
            {pastePack.map((p) => (
              <div key={p.id} style={{ borderTop: "1px solid #eee", padding: "10px 0" }}>
                <button
                  type="button"
                  onClick={() => setExpandedPaste(expandedPaste === p.id ? null : p.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px", padding: 0 }}
                >
                  {expandedPaste === p.id ? "▼" : "▶"} {p.title}
                </button>
                {expandedPaste === p.id && (
                  <div style={{ marginTop: "8px" }}>
                    <pre style={{ background: "#f5f5f5", padding: "12px", borderRadius: "8px", fontSize: "12px", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{p.paste}</pre>
                    <button type="button" onClick={() => copy(p.paste)} style={{ marginTop: "6px", padding: "6px 12px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", cursor: "pointer" }}>
                      Kopiér
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Products in feed */}
        {data && data.products?.length > 0 && (
          <section style={{ background: "#fff", borderRadius: "10px", padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: "0 0 12px", fontSize: "15px" }}>Produkter i feed ({data.products.length})</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px", fontSize: "13px" }}>
              {data.products.map((p) => (
                <div key={p.id} style={{ padding: "10px 12px", background: "#fafafa", borderRadius: "8px" }}>
                  <div style={{ fontWeight: 600 }}>{p.title}</div>
                  <div style={{ color: "#666" }}>{p.price} kr · {p.availability === "in stock" ? "På lager" : "Udsolgt"}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
