"use client";

/* ───── Find keywords og byg annoncegrupper af dem ─────
 *
 * Rækkefølgen er hele pointen. Siden viste tidligere syv færdige
 * annoncegrupper, bygget af permutationer over produktnavnet — for Mackie
 * Thump GO nitten keywords med nul søgninger hver. Nu vises først, hvad der
 * FAKTISK søges på: Googles idéer for produktsiden og de søgetermer, vi selv
 * har fået klik på. Man vælger dem der giver mening, og grupperne bygges af
 * udvalget.
 *
 * Grupperingen sker her i browseren med samme kode som serveren validerer
 * med, så man ser resultatet af et klik med det samme.
 */

import AdminLogin from "@/components/AdminLogin";
import AdminNav from "@/components/AdminNav";
import { buildAdCopy, validateAdCopy } from "@/lib/adsCopy";
import { adGroupName, clusterKeywords, THEME_LABELS, type ThemeKey } from "@/lib/adsIntent";
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

interface FoundKeyword {
  text: string;
  volume: number;
  competition: string | null;
  clicks: number;
  impressions: number;
  sources: string[];
  intent: ThemeKey;
  rental: boolean;
  duplicateIn: string | null;
  recommended: boolean;
}

interface BuildResponse {
  products: ProductRow[];
  product?: { id: string; name: string; price: number; page: string; contents: string[] };
  terms?: string[];
  seededTerms?: boolean;
  keywords?: FoundKeyword[];
  recommendedCount?: number;
  minVolume?: number;
  defaultBidMicros?: number;
  campaignId: string;
  existingAdGroupIds?: string[];
  knownPages?: string[];
  pausedPages?: string[];
  deliveryPrice?: number;
  englishPage?: boolean;
  adsConfigured?: boolean;
  adsError?: string | null;
  error?: string;
}

/** Redigeret annoncetekst pr. gruppe, når man har rettet i den. */
interface CopyEdit {
  name?: string;
  headlines?: string[];
  descriptions?: string[];
  bidMicros?: number;
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

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "6px 8px",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#888",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "6px 8px",
  fontSize: "13px",
  borderBottom: "1px solid #f4f4f4",
};

const banner = (bg: string, fg: string): React.CSSProperties => ({
  background: bg,
  color: fg,
  padding: "12px 14px",
  borderRadius: "8px",
  marginBottom: "14px",
  fontSize: "13px",
  lineHeight: 1.5,
});

const kr = (micros: number) => Math.round(micros / 10_000) / 100;
const lines = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);

export default function AdsOpretPage() {
  const { secret, ready, isLoggedIn, unauthorized } = useAdminAuth();

  const [data, setData] = useState<BuildResponse | null>(null);
  const [productId, setProductId] = useState("");
  const [valgte, setValgte] = useState<Set<string>>(new Set());
  const [edits, setEdits] = useState<Record<string, CopyEdit>>({});
  const [kunLeje, setKunLeje] = useState(true);
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
          if (res.status === 401) return unauthorized();
          setError(json.error || "Kunne ikke hente keywords");
          if (json.products) setData((d) => ({ ...(d ?? json), products: json.products }));
          return;
        }
        setData(json);
        setTerms((json.terms ?? []).join(", "));
        // Start med dem der har efterspørgsel og lejeintention
        setValgte(new Set((json.keywords ?? []).filter((k) => k.recommended).map((k) => k.text)));
        setEdits({});
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
  }, [load, productId]);

  const product = data?.product;
  const keywords = useMemo(() => data?.keywords ?? [], [data]);
  const knownPages = useMemo(() => data?.knownPages ?? [], [data]);
  const pausedPages = useMemo(() => data?.pausedPages ?? [], [data]);

  const synlige = useMemo(
    () => (kunLeje ? keywords.filter((k) => k.rental || valgte.has(k.text)) : keywords),
    [keywords, kunLeje, valgte],
  );

  /** Grupperne, som de ser ud lige nu. Regnes om ved hvert klik. */
  const grupper = useMemo(() => {
    if (!product) return [];
    const valgt = keywords.filter((k) => valgte.has(k.text));
    return clusterKeywords(valgt.map((k) => ({ text: k.text, volume: k.volume }))).map((c) => {
      const nøgle = `${c.key}|${c.head}`;
      const redigeret = edits[nøgle] ?? {};
      const genereret = buildAdCopy(
        { name: product.name, price: product.price, page: product.page, contents: product.contents },
        c,
        { deliveryPrice: data?.deliveryPrice },
      );
      const headlines = redigeret.headlines ?? genereret.headlines;
      const descriptions = redigeret.descriptions ?? genereret.descriptions;
      return {
        cluster: c,
        nøgle,
        name: redigeret.name ?? adGroupName(product.name, c),
        bidMicros: redigeret.bidMicros ?? data?.defaultBidMicros ?? 9_000_000,
        headlines,
        descriptions,
        finalUrl: genereret.finalUrl,
        path1: genereret.path1,
        problems: validateAdCopy(
          { headlines, descriptions, finalUrl: genereret.finalUrl, path1: genereret.path1 },
          c.primary,
          knownPages,
          pausedPages,
        ),
      };
    });
  }, [product, keywords, valgte, edits, data?.deliveryPrice, data?.defaultBidMicros, knownPages, pausedPages]);

  const blokerende = grupper.flatMap((g) => g.problems.map((p) => `${g.name}: ${p}`));

  function toggle(text: string) {
    setValgte((s) => {
      const next = new Set(s);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  }

  function patch(nøgle: string, p: CopyEdit) {
    setEdits((e) => ({ ...e, [nøgle]: { ...e[nøgle], ...p } }));
  }

  async function post(body: unknown, key: string) {
    setBusy(key);
    setError("");
    setResult([]);
    try {
      const res = await fetch(`/api/ads-build?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return { res, json: (await res.json()) as Record<string, unknown> };
    } catch {
      setError("Netværksfejl");
      return null;
    } finally {
      setBusy("");
    }
  }

  async function send(action: "validate" | "create") {
    if (!product || !grupper.length) return;
    const svar = await post(
      {
        action,
        productId: product.id,
        groups: grupper.map((g) => ({
          name: g.name.trim(),
          themeKey: g.cluster.key,
          primary: g.cluster.primary,
          cpcBidMicros: g.bidMicros,
          keywords: g.cluster.keywords.map((text) => ({ text })),
          headlines: g.headlines,
          descriptions: g.descriptions,
          finalUrl: g.finalUrl,
          path1: g.path1,
        })),
      },
      action,
    );
    if (!svar) return;
    const { res, json } = svar;
    if (!res.ok) {
      setError((json.error as string) ?? "");
      setResult((json.errors as string[]) ?? []);
      return;
    }
    if (action === "validate") {
      setResult([`Google godkendte alle ${json.groups} grupper. Intet er oprettet endnu.`]);
      return;
    }
    const oprettet = (json.created as Array<{ name: string; adGroupId: string; keywords: number }>) ?? [];
    setResult([
      ...oprettet.map((c) => `Oprettet (pauset): ${c.name} — ${c.keywords} keywords, id ${c.adGroupId}`),
      ...((json.warnings as string[]) ?? []),
    ]);
    await load(product.id);
  }

  async function saveTerms() {
    if (!product) return;
    const svar = await post(
      {
        action: "save_terms",
        productId: product.id,
        terms: terms.split(",").map((t) => t.trim()).filter(Boolean),
      },
      "terms",
    );
    if (svar?.res.ok) await load(product.id);
  }

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Byg annoncer" />;

  const ingenEfterspørgsel =
    !!product && data?.adsConfigured && !data.adsError && (data.recommendedCount ?? 0) === 0;

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
          Fraserne kommer fra Google og fra vores egne søgetermer — ingen er opfundet her.
          Vælg dem der giver mening; grupperne bygges af udvalget og oprettes <strong>pauset</strong>.
          Tænd dem på <a href="/admin/ads" style={{ color: "#1e7e34" }}>Ads-oversigten</a>.
        </p>

        {error && <div style={banner("#fdecea", "#c0392b")}>{error}</div>}

        {data && data.adsConfigured === false && (
          <div style={banner("#fff8e1", "#8a6d3b")}>
            <strong>Google Ads er ikke forbundet.</strong> {data.adsError} — uden forbindelsen findes
            der ingen keywords at vise, for det er Google der leverer dem.
          </div>
        )}
        {data?.adsConfigured && data.adsError && (
          <div style={banner("#fdecea", "#c0392b")}>Google svarede ikke: {data.adsError}</div>
        )}

        <div style={card}>
          <label style={label} htmlFor="produkt">Produkt</label>
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
              Frø til Google {data?.seededTerms && <em style={{ textTransform: "none" }}>— gættet ud fra navnet</em>}
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <input id="termer" value={terms} onChange={(e) => setTerms(e.target.value)} style={{ ...input, flex: "1 1 380px" }} />
              <button onClick={saveTerms} disabled={busy === "terms"} style={button}>
                {busy === "terms" ? "Gemmer…" : "Gem og søg igen"}
              </button>
            </div>
            <p style={{ color: "#888", fontSize: "12px", margin: "8px 0 0" }}>
              Frø er ikke keywords — det er de ord, Google skal lede ud fra. Produktsiden{" "}
              <code>{product.page}</code> bruges altid som frø; de her lægges oveni. Adskil med komma.
            </p>
          </div>
        )}

        {ingenEfterspørgsel && (
          <div style={banner("#fff8e1", "#8a6d3b")}>
            <strong>Ingen af fraserne har efterspørgsel nok til en egen annoncegruppe.</strong>{" "}
            Google finder ingen lejesøgninger med mindst {data?.minVolume} om måneden for{" "}
            {product?.name}, og vi har ingen egne klik på nogen.
            <br />
            Det er et rigtigt svar, ikke en fejl: folk søger sjældent på modelnavne. Slå
            <em> Vis også fraser uden lejeord</em> fra og se listen — er den også tom, hører produktet
            til i en bredere gruppe (fx højtalere) frem for sin egen.
          </div>
        )}

        {product && keywords.length > 0 && (
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
              <strong style={{ fontSize: "14px" }}>
                {keywords.length} fraser fundet · {valgte.size} valgt
              </strong>
              <label style={{ fontSize: "12px", color: "#555", display: "flex", gap: "6px", alignItems: "center" }}>
                <input type="checkbox" checked={!kunLeje} onChange={(e) => setKunLeje(!e.target.checked)} />
                Vis også fraser uden lejeord
              </label>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...th, width: "28px" }} />
                    <th style={th}>Søgefrase</th>
                    <th style={{ ...th, textAlign: "right" }}>Søgninger/md</th>
                    <th style={{ ...th, textAlign: "right" }}>Egne klik</th>
                    <th style={th}>Mønster</th>
                    <th style={th}>Kilde</th>
                    <th style={th}>Findes allerede i</th>
                  </tr>
                </thead>
                <tbody>
                  {synlige.map((k) => (
                    <tr key={k.text} style={{ background: valgte.has(k.text) ? "#f4fbf6" : undefined }}>
                      <td style={td}>
                        <input type="checkbox" checked={valgte.has(k.text)} onChange={() => toggle(k.text)} aria-label={k.text} />
                      </td>
                      <td style={{ ...td, color: k.rental ? "#222" : "#999" }}>
                        {k.text}
                        {!k.rental && <span style={{ fontSize: "11px", color: "#b58900" }}> · uden lejeord</span>}
                      </td>
                      <td style={{ ...td, textAlign: "right", fontWeight: k.volume >= (data?.minVolume ?? 10) ? 600 : 400, color: k.volume ? "#222" : "#bbb" }}>
                        {k.volume || "—"}
                      </td>
                      <td style={{ ...td, textAlign: "right", color: k.clicks ? "#1e7e34" : "#bbb", fontWeight: k.clicks ? 600 : 400 }}>
                        {k.clicks || "—"}
                      </td>
                      <td style={{ ...td, color: "#666", fontSize: "12px" }}>{THEME_LABELS[k.intent]}</td>
                      <td style={{ ...td, color: "#666", fontSize: "12px" }}>{k.sources.join(" + ")}</td>
                      <td style={{ ...td, color: "#c0392b", fontSize: "12px" }}>{k.duplicateIn ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {grupper.length > 0 && (
          <h2 style={{ fontSize: "15px", margin: "22px 0 10px" }}>
            {grupper.length} annoncegruppe{grupper.length === 1 ? "" : "r"} af de valgte fraser
          </h2>
        )}

        {grupper.map((g) => (
          <div key={g.nøgle} style={card}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                value={g.name}
                onChange={(e) => patch(g.nøgle, { name: e.target.value })}
                aria-label="Gruppenavn"
                style={{ ...input, flex: "1 1 340px", fontWeight: 600 }}
              />
              <span style={{ fontSize: "12px", color: "#888" }}>
                Bud{" "}
                <input
                  type="number"
                  min={1}
                  max={50}
                  step={0.5}
                  value={kr(g.bidMicros)}
                  onChange={(e) => patch(g.nøgle, { bidMicros: Math.round(Number(e.target.value) * 1_000_000) })}
                  aria-label={`Bud for ${g.name}`}
                  style={{ ...input, width: "80px", display: "inline-block" }}
                />{" "}
                kr
              </span>
              <span style={{ fontSize: "12px", color: g.cluster.volume ? "#1e7e34" : "#b58900", fontWeight: 600 }}>
                {g.cluster.volume || 0} søgninger/md
              </span>
            </div>

            <p style={{ fontSize: "13px", color: "#555", margin: "10px 0 0" }}>
              {g.cluster.keywords.join(" · ")}
            </p>

            {g.problems.length > 0 && (
              <div style={{ ...banner("#fdecea", "#c0392b"), marginTop: "12px", marginBottom: 0 }}>
                {g.problems.map((p) => <div key={p}>{p}</div>)}
              </div>
            )}

            <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr", marginTop: "14px" }}>
              <div>
                <label style={label} htmlFor={`h-${g.nøgle}`}>Overskrifter — én pr. linje, højst 30 tegn</label>
                <textarea
                  id={`h-${g.nøgle}`}
                  value={g.headlines.join("\n")}
                  onChange={(e) => patch(g.nøgle, { headlines: lines(e.target.value) })}
                  rows={8}
                  style={{ ...input, fontFamily: "inherit", resize: "vertical" }}
                />
              </div>
              <div>
                <label style={label} htmlFor={`d-${g.nøgle}`}>Beskrivelser — én pr. linje, højst 90 tegn</label>
                <textarea
                  id={`d-${g.nøgle}`}
                  value={g.descriptions.join("\n")}
                  onChange={(e) => patch(g.nøgle, { descriptions: lines(e.target.value) })}
                  rows={8}
                  style={{ ...input, fontFamily: "inherit", resize: "vertical" }}
                />
              </div>
            </div>

            <p style={{ fontSize: "12px", color: "#888", margin: "10px 0 0" }}>
              Landingsside: <strong style={{ color: "#222" }}>{g.finalUrl}</strong>
            </p>
          </div>
        ))}

        {grupper.length > 0 && (
          <div style={{ ...card, position: "sticky", bottom: 0 }}>
            {result.length > 0 && (
              <div style={banner(error ? "#fdecea" : "#e6f4ea", error ? "#c0392b" : "#1e7e34")}>
                {result.map((r) => <div key={r}>{r}</div>)}
              </div>
            )}
            {blokerende.length > 0 && (
              <div style={banner("#fff8e1", "#8a6d3b")}>
                {blokerende.length} ting skal rettes, før der kan uploades.
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => send("validate")} disabled={!!blokerende.length || !!busy || !data?.adsConfigured} style={button}>
                {busy === "validate" ? "Spørger Google…" : "Valider hos Google"}
              </button>
              <button onClick={() => send("create")} disabled={!!blokerende.length || !!busy || !data?.adsConfigured} style={primaryButton}>
                {busy === "create" ? "Opretter…" : `Opret ${grupper.length} grupper (pauset)`}
              </button>
              <span style={{ fontSize: "12px", color: "#888" }}>{valgte.size} keywords i alt</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
