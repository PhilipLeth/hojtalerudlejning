"use client";

/* ───── Byg annoncegrupper til et produkt ─────
 *
 * Vælg et produkt, se fem temagrupper med keywords, søgevolumen og færdig
 * annoncetekst, ret det der skal rettes, og upload.
 *
 * Siden validerer med præcis samme kode som serveren (adsCopy.validateAdCopy)
 * og med kataloglisterne serveren selv har sendt. Det er med vilje: fejlen
 * skal stå ved feltet mens man skriver, ikke komme retur fra Google bagefter.
 */

import AdminLogin from "@/components/AdminLogin";
import AdminNav from "@/components/AdminNav";
import { buildAdCopy, validateAdCopy } from "@/lib/adsCopy";
import type { ThemeKey } from "@/lib/adsIntent";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ProductRow {
  id: string;
  name: string;
  price: number;
  page: string | null;
  hidden: boolean;
  adGroupCount: number;
}

interface Keyword {
  text: string;
  matchType: "PHRASE";
  bofu: boolean;
  volume: number | null;
  duplicateIn: string | null;
  recommended: boolean;
}

interface Group {
  themeKey: string;
  label: string;
  name: string;
  primary: string;
  keywords: Keyword[];
  cpcBidMicros: number;
  finalUrl: string;
  path1?: string;
  headlines: string[];
  descriptions: string[];
  errors: string[];
}

interface BuildResponse {
  products: ProductRow[];
  product?: { id: string; name: string; price: number; page: string; contents: string[] };
  terms?: string[];
  seededTerms?: boolean;
  groups?: Group[];
  campaignId: string;
  existingAdGroupIds?: string[];
  knownPages?: string[];
  pausedPages?: string[];
  deliveryPrice?: number;
  adsConfigured?: boolean;
  adsError?: string | null;
  error?: string;
}

/** Redigerbar udgave af et forslag. */
interface Draft extends Group {
  include: boolean;
  selected: Set<string>;
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e6e6e6",
  borderRadius: "10px",
  padding: "16px",
  marginBottom: "14px",
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#888",
  marginBottom: "4px",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "7px 9px",
  fontSize: "13px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  background: "#fff",
  color: "#222",
};

const button: React.CSSProperties = {
  padding: "9px 16px",
  fontSize: "13px",
  fontWeight: 600,
  borderRadius: "7px",
  border: "1px solid #ddd",
  background: "#fff",
  color: "#222",
  cursor: "pointer",
};

const primaryButton: React.CSSProperties = {
  ...button,
  background: "#1e7e34",
  borderColor: "#1e7e34",
  color: "#fff",
};

const banner = (bg: string, fg: string): React.CSSProperties => ({
  background: bg,
  color: fg,
  padding: "10px 14px",
  borderRadius: "8px",
  marginBottom: "14px",
  fontSize: "13px",
});

const kr = (micros: number) => Math.round(micros / 10_000) / 100;

function toDraft(g: Group): Draft {
  return {
    ...g,
    include: g.keywords.some((k) => k.recommended),
    selected: new Set(g.keywords.filter((k) => k.recommended).map((k) => k.text)),
  };
}

/** Linjer i en textarea, tomme linjer luget væk. */
function lines(text: string): string[] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

export default function AdsOpretPage() {
  const { secret, ready, isLoggedIn, unauthorized } = useAdminAuth();

  const [data, setData] = useState<BuildResponse | null>(null);
  const [productId, setProductId] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [terms, setTerms] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<string[]>([]);

  const load = useCallback(
    async (id: string) => {
      if (!secret) return;
      setLoading(true);
      setError("");
      setResult([]);
      try {
        const q = new URLSearchParams({ secret });
        if (id) q.set("productId", id);
        const res = await fetch(`/api/ads-build?${q}`);
        const json: BuildResponse = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            unauthorized();
            return;
          }
          setError(json.error || "Kunne ikke hente forslag");
          if (json.products) setData((d) => ({ ...(d ?? json), products: json.products }));
          return;
        }
        setData(json);
        setDrafts((json.groups ?? []).map(toDraft));
        setTerms((json.terms ?? []).join(", "));
      } catch {
        setError("Netværksfejl");
      } finally {
        setLoading(false);
      }
    },
    [secret, unauthorized],
  );

  useEffect(() => {
    load(productId);
    // Produktskift henter et nyt forslag
  }, [load, productId]);

  const product = data?.product;
  const knownPages = useMemo(() => data?.knownPages ?? [], [data]);
  const pausedPages = useMemo(() => data?.pausedPages ?? [], [data]);

  /** Frasen annoncen skal bære: den første der stadig er valgt. */
  function primaryOf(d: Draft): string {
    return d.keywords.find((k) => d.selected.has(k.text))?.text ?? "";
  }

  /** Live-validering med samme regler som serveren. */
  function problemsOf(d: Draft): string[] {
    const primary = primaryOf(d);
    if (!d.selected.size) return ["Ingen keywords valgt — gruppen ville vise intet."];
    if (!d.name.trim()) return ["Gruppen mangler navn."];
    return validateAdCopy(
      { headlines: d.headlines, descriptions: d.descriptions, finalUrl: d.finalUrl, path1: d.path1 },
      primary,
      knownPages,
      pausedPages,
    );
  }

  function update(themeKey: string, patch: Partial<Draft>) {
    setDrafts((list) => list.map((d) => (d.themeKey === themeKey ? { ...d, ...patch } : d)));
  }

  function toggleKeyword(d: Draft, text: string) {
    const next = new Set(d.selected);
    if (next.has(text)) next.delete(text);
    else next.add(text);
    update(d.themeKey, { selected: next });
  }

  /**
   * Skriv annonceteksten om, så den bærer den frase der nu er valgt først.
   * buildAdCopy læser kun temaets `primary`, så resten af temaet er formalia.
   */
  function regenerate(d: Draft) {
    const primary = primaryOf(d);
    if (!product || !primary) return;
    const copy = buildAdCopy(
      { name: product.name, price: product.price, page: product.page, contents: product.contents },
      { key: d.themeKey as ThemeKey, label: d.label, primary, keywords: [] },
      { deliveryPrice: data?.deliveryPrice },
    );
    update(d.themeKey, { headlines: copy.headlines, descriptions: copy.descriptions });
  }

  const chosen = drafts.filter((d) => d.include);
  const blocking = chosen.flatMap((d) => problemsOf(d).map((p) => `${d.name}: ${p}`));

  async function send(action: "validate" | "create") {
    if (!product || !chosen.length) return;
    setBusy(action);
    setError("");
    setResult([]);
    try {
      const res = await fetch(`/api/ads-build?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          productId: product.id,
          groups: chosen.map((d) => ({
            name: d.name.trim(),
            themeKey: d.themeKey,
            primary: primaryOf(d),
            cpcBidMicros: d.cpcBidMicros,
            keywords: d.keywords.filter((k) => d.selected.has(k.text)).map((k) => ({ text: k.text })),
            headlines: d.headlines,
            descriptions: d.descriptions,
            finalUrl: d.finalUrl,
            path1: d.path1,
          })),
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        errors?: string[];
        warnings?: string[];
        created?: Array<{ name: string; adGroupId: string; keywords: number }>;
        groups?: number;
      };
      if (!res.ok) {
        setError(json.error ?? "");
        setResult(json.errors ?? []);
        return;
      }
      if (action === "validate") {
        setResult([`Google godkendte alle ${json.groups} grupper. Intet er oprettet endnu.`]);
        return;
      }
      setResult([
        ...(json.created ?? []).map((c) => `Oprettet (pauset): ${c.name} — ${c.keywords} keywords, id ${c.adGroupId}`),
        ...(json.warnings ?? []),
      ]);
      await load(product.id);
    } catch {
      setError("Netværksfejl");
    } finally {
      setBusy("");
    }
  }

  async function saveTerms() {
    if (!product) return;
    setBusy("terms");
    try {
      const res = await fetch(`/api/ads-build?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_terms",
          productId: product.id,
          terms: terms.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        setError("Kunne ikke gemme søgetermer");
        return;
      }
      await load(product.id);
    } finally {
      setBusy("");
    }
  }

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Byg annoncer" />;

  return (
    <>
      <AdminNav
        title="Byg annoncer"
        actions={
          <button onClick={() => load(productId)} disabled={loading} style={button}>
            {loading ? "Henter…" : "↺ Opdater"}
          </button>
        }
      />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px" }}>
        <p style={{ color: "#888", fontSize: "12px", margin: "0 0 16px" }}>
          Grupperne oprettes <strong>pauset</strong> i kampagnen og bindes til produktet med det samme.
          Tænd dem på <a href="/admin/ads" style={{ color: "#1e7e34" }}>Ads-oversigten</a>, når du har set dem efter.
        </p>

        {error && <div style={banner("#fdecea", "#c0392b")}>{error}</div>}

        {data && data.adsConfigured === false && (
          <div style={banner("#fff8e1", "#8a6d3b")}>
            <strong>Google Ads er ikke forbundet.</strong> {data.adsError} — forslaget vises uden søgevolumen
            og uden tjek for dubletter, og der kan ikke uploades.
          </div>
        )}
        {data?.adsConfigured && data.adsError && (
          <div style={banner("#fff8e1", "#8a6d3b")}>Google Ads svarede ikke: {data.adsError}</div>
        )}

        <div style={card}>
          <label style={label} htmlFor="produkt">
            Produkt
          </label>
          <select
            id="produkt"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            style={{ ...input, maxWidth: "460px" }}
          >
            <option value="">Vælg et produkt…</option>
            {(data?.products ?? []).map((p) => (
              <option key={p.id} value={p.id} disabled={!p.page}>
                {p.name}
                {p.hidden ? " (skjult)" : ""}
                {!p.page ? " — ingen produktside" : ""}
                {p.adGroupCount ? ` · ${p.adGroupCount} grupper` : ""}
              </option>
            ))}
          </select>
        </div>

        {product && (
          <div style={card}>
            <label style={label} htmlFor="termer">
              Søgetermer {data?.seededTerms && <em style={{ textTransform: "none" }}>— foreslået ud fra navnet</em>}
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <input
                id="termer"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                style={{ ...input, flex: "1 1 380px" }}
              />
              <button onClick={saveTerms} disabled={busy === "terms"} style={button}>
                {busy === "terms" ? "Gemmer…" : "Gem og byg om"}
              </button>
            </div>
            <p style={{ color: "#888", fontSize: "12px", margin: "8px 0 0" }}>
              Det folk skriver i søgefeltet — ikke produktnavnet. Adskil med komma. Tag stavemåderne med
              (soundboks og soundbox er to forskellige søgninger).
            </p>
          </div>
        )}

        {product &&
          drafts.map((d) => {
            const problems = problemsOf(d);
            return (
              <div key={d.themeKey} style={{ ...card, opacity: d.include ? 1 : 0.55 }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="checkbox"
                    checked={d.include}
                    onChange={(e) => update(d.themeKey, { include: e.target.checked })}
                    aria-label={`Tag ${d.label} med`}
                  />
                  <input
                    value={d.name}
                    onChange={(e) => update(d.themeKey, { name: e.target.value })}
                    aria-label="Gruppenavn"
                    style={{ ...input, flex: "1 1 320px", fontWeight: 600 }}
                  />
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    Bud{" "}
                    <input
                      type="number"
                      min={1}
                      max={50}
                      step={0.5}
                      value={kr(d.cpcBidMicros)}
                      onChange={(e) =>
                        update(d.themeKey, { cpcBidMicros: Math.round(Number(e.target.value) * 1_000_000) })
                      }
                      aria-label={`Bud for ${d.label}`}
                      style={{ ...input, width: "80px", display: "inline-block" }}
                    />{" "}
                    kr
                  </span>
                </div>

                {d.include && problems.length > 0 && (
                  <div style={{ ...banner("#fdecea", "#c0392b"), marginTop: "12px", marginBottom: 0 }}>
                    {problems.map((p) => (
                      <div key={p}>{p}</div>
                    ))}
                  </div>
                )}

                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
                  <thead>
                    <tr>
                      <th style={{ ...label, width: "28px" }} />
                      <th style={{ ...label, textAlign: "left" }}>Keyword (phrase)</th>
                      <th style={{ ...label, textAlign: "right", width: "110px" }}>Søgninger/md</th>
                      <th style={{ ...label, textAlign: "left" }}>Findes allerede i</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.keywords.map((k) => (
                      <tr key={k.text}>
                        <td style={{ padding: "4px 0" }}>
                          <input
                            type="checkbox"
                            checked={d.selected.has(k.text)}
                            onChange={() => toggleKeyword(d, k.text)}
                            aria-label={k.text}
                          />
                        </td>
                        <td style={{ padding: "4px 0", fontSize: "13px", color: k.bofu ? "#222" : "#999" }}>
                          {k.text}
                          {!k.bofu && <span style={{ fontSize: "11px", color: "#b58900" }}> · uden lejeord</span>}
                        </td>
                        <td style={{ padding: "4px 0", fontSize: "13px", textAlign: "right", color: k.volume ? "#222" : "#999" }}>
                          {k.volume === null ? "—" : k.volume}
                        </td>
                        <td style={{ padding: "4px 0", fontSize: "12px", color: "#c0392b" }}>
                          {k.duplicateIn ?? ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr", marginTop: "14px" }}>
                  <div>
                    <label style={label} htmlFor={`h-${d.themeKey}`}>
                      Overskrifter — én pr. linje, højst 30 tegn
                    </label>
                    <textarea
                      id={`h-${d.themeKey}`}
                      value={d.headlines.join("\n")}
                      onChange={(e) => update(d.themeKey, { headlines: lines(e.target.value) })}
                      rows={8}
                      style={{ ...input, fontFamily: "inherit", resize: "vertical" }}
                    />
                  </div>
                  <div>
                    <label style={label} htmlFor={`d-${d.themeKey}`}>
                      Beskrivelser — én pr. linje, højst 90 tegn
                    </label>
                    <textarea
                      id={`d-${d.themeKey}`}
                      value={d.descriptions.join("\n")}
                      onChange={(e) => update(d.themeKey, { descriptions: lines(e.target.value) })}
                      rows={8}
                      style={{ ...input, fontFamily: "inherit", resize: "vertical" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    Landingsside: <strong style={{ color: "#222" }}>{d.finalUrl}</strong>
                  </span>
                  <button onClick={() => regenerate(d)} style={{ ...button, padding: "5px 10px" }}>
                    Skriv teksten om efter valgte keywords
                  </button>
                </div>
              </div>
            );
          })}

        {product && (
          <div style={{ ...card, position: "sticky", bottom: 0 }}>
            {result.length > 0 && (
              <div style={banner(blocking.length || error ? "#fdecea" : "#e6f4ea", blocking.length || error ? "#c0392b" : "#1e7e34")}>
                {result.map((r) => (
                  <div key={r}>{r}</div>
                ))}
              </div>
            )}
            {blocking.length > 0 && (
              <div style={banner("#fff8e1", "#8a6d3b")}>
                {blocking.length} ting skal rettes, før der kan uploades.
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => send("validate")}
                disabled={!chosen.length || !!blocking.length || !!busy || !data?.adsConfigured}
                style={button}
              >
                {busy === "validate" ? "Spørger Google…" : "Valider hos Google"}
              </button>
              <button
                onClick={() => send("create")}
                disabled={!chosen.length || !!blocking.length || !!busy || !data?.adsConfigured}
                style={primaryButton}
              >
                {busy === "create" ? "Opretter…" : `Opret ${chosen.length} grupper (pauset)`}
              </button>
              <span style={{ fontSize: "12px", color: "#888" }}>
                {chosen.reduce((n, d) => n + d.selected.size, 0)} keywords i alt
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
