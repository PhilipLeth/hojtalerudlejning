"use client";

/* ───── Efterspørgselskortet: hvor kan kunderne komme fra? ─────
 *
 * Byggeren starter i produktet, idélisten i katalogets sider. Det her kort
 * starter i efterspørgslen selv: behovs- og anledningsfraser hos Google plus
 * alle kontoens egne søgetermer, klynget efter hvor kunden kommer fra.
 * Hver klynge peger på den bedste eksisterende landingsside — eller siger
 * "mangler side", og så er klyngen en side-opgave, ikke en annonce-opgave.
 */

import AdminLogin from "@/components/AdminLogin";
import AdminNav from "@/components/AdminNav";
import { THEME_LABELS, type ThemeKey } from "@/lib/adsIntent";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { useCallback, useEffect, useMemo, useState } from "react";

interface DemandKeyword {
  text: string;
  volume: number;
  clicks: number;
  impressions: number;
  intent: ThemeKey;
  sources: string[];
  coveredBy: string | null;
  outsideArea: string | null;
}

interface DemandCluster {
  occasion: string | null;
  label: string;
  keywords: DemandKeyword[];
  volume: number;
  clicks: number;
  productId: string | null;
  productName: string | null;
  page: string | null;
}

interface Svar {
  seeds: string[];
  seededDefaults: boolean;
  maxSeeds: number;
  minVolume: number;
  clusters: DemandCluster[];
  manglerSide: number;
  error?: string;
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e6e6e6",
  borderRadius: "10px",
  padding: "16px",
  marginBottom: "14px",
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

const td: React.CSSProperties = { padding: "7px 8px", fontSize: "13px", borderBottom: "1px solid #f4f4f4" };

const banner = (bg: string, fg: string): React.CSSProperties => ({
  background: bg, color: fg, padding: "12px 14px", borderRadius: "8px",
  marginBottom: "14px", fontSize: "13px", lineHeight: 1.5,
});

export default function AdsEfterspoergselPage() {
  const { secret, ready, isLoggedIn, unauthorized } = useAdminAuth();
  const [data, setData] = useState<Svar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skjulUdenfor, setSkjulUdenfor] = useState(true);
  const [redigerFrø, setRedigerFrø] = useState(false);
  const [frøTekst, setFrøTekst] = useState("");
  const [gemmer, setGemmer] = useState(false);

  const load = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/ads-demand?secret=${encodeURIComponent(secret)}`);
      const json: Svar = await res.json();
      if (!res.ok) {
        if (res.status === 401) return unauthorized();
        setError(json.error || "Kunne ikke hente efterspørgslen");
        return;
      }
      setData(json);
      setFrøTekst(json.seeds.join("\n"));
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret, unauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  const gemFrø = async () => {
    if (!secret) return;
    setGemmer(true);
    setError("");
    try {
      const seeds = frøTekst.split("\n").map((s) => s.trim()).filter(Boolean);
      const res = await fetch(`/api/ads-demand?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_seeds", seeds }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) return unauthorized();
        setError(json.error || "Kunne ikke gemme frøene");
        return;
      }
      setRedigerFrø(false);
      await load();
    } catch {
      setError("Netværksfejl");
    } finally {
      setGemmer(false);
    }
  };

  const synlige = useMemo(
    () =>
      (data?.clusters ?? [])
        .map((c) => ({
          ...c,
          keywords: skjulUdenfor ? c.keywords.filter((k) => !k.outsideArea) : c.keywords,
        }))
        .filter((c) => c.keywords.length > 0),
    [data, skjulUdenfor],
  );

  const udenfor = (data?.clusters ?? []).reduce(
    (sum, c) => sum + c.keywords.filter((k) => k.outsideArea).length,
    0,
  );

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Efterspørgsel" />;

  return (
    <>
      <AdminNav
        title="Efterspørgsel"
        actions={
          <button onClick={load} disabled={loading} style={button}>
            {loading ? "Henter…" : "↺ Opdater"}
          </button>
        }
      />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px" }}>
        <p style={{ color: "#888", fontSize: "12px", margin: "0 0 16px" }}>
          Hvor kan kunderne komme fra? Kortet starter i <strong>efterspørgslen</strong> — behovs- og
          anledningsfraser hos Google plus alle egne søgetermer — og klynger efter anledning eller
          produktord. Alt der allerede ligger som keyword er trukket fra. Hver klynge peger på den bedste
          eksisterende landingsside; <strong>„mangler side”</strong> betyder at klyngen er en side-opgave
          før den kan blive en annonce. Byg videre i{" "}
          <a href="/admin/ads/opret" style={{ color: "#1e7e34" }}>byggeren</a>.
        </p>

        {error && <div style={banner("#fdecea", "#c0392b")}>{error}</div>}

        {data && (
          <div style={card}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", color: "#666" }}>
                {data.seeds.length} frø{data.seededDefaults ? " (standard)" : ""} · {data.clusters.length} klynger
                {data.manglerSide > 0 && <> · <strong>{data.manglerSide} mangler side</strong></>}
              </span>
              <button onClick={() => setRedigerFrø((v) => !v)} style={button}>
                {redigerFrø ? "Luk" : "Redigér frø"}
              </button>
              {udenfor > 0 && (
                <label style={{ fontSize: "12px", color: "#555", display: "flex", gap: "6px", alignItems: "center" }}>
                  <input type="checkbox" checked={skjulUdenfor} onChange={(e) => setSkjulUdenfor(e.target.checked)} />
                  Skjul de {udenfor} uden for leveringsområdet
                </label>
              )}
            </div>
            {redigerFrø && (
              <div style={{ marginTop: "12px" }}>
                <p style={{ fontSize: "12px", color: "#888", margin: "0 0 6px" }}>
                  Ét frø pr. linje, højst {data.maxSeeds}. Frø er behov og anledninger („lyd til
                  konfirmation”), ikke produktnavne — Google leder ud fra dem.
                </p>
                <textarea
                  value={frøTekst}
                  onChange={(e) => setFrøTekst(e.target.value)}
                  rows={10}
                  style={{ width: "100%", fontSize: "13px", fontFamily: "inherit", padding: "8px", borderRadius: "7px", border: "1px solid #ddd", boxSizing: "border-box" }}
                />
                <button onClick={gemFrø} disabled={gemmer} style={{ ...button, marginTop: "8px", background: "#1e7e34", borderColor: "#1e7e34", color: "#fff" }}>
                  {gemmer ? "Gemmer…" : "Gem frø og hent igen"}
                </button>
              </div>
            )}
          </div>
        )}

        {data && !loading && synlige.length === 0 && (
          <div style={banner("#fff8e1", "#8a6d3b")}>
            <strong>Ingen udækket efterspørgsel på de her frø.</strong> Enten ejer kontoen allerede
            fraserne, eller også søger for få på dem ({data.minVolume}/md er nedre grænse for Googles
            estimater). Prøv andre frø.
          </div>
        )}

        {synlige.map((c) => (
          <div key={`${c.occasion ?? "produkt"}|${c.label}`} style={card}>
            <div style={{ display: "flex", gap: "10px", alignItems: "baseline", flexWrap: "wrap", marginBottom: "8px" }}>
              <strong style={{ fontSize: "15px" }}>
                {c.occasion ? `Anledning: ${c.label}` : c.label}
              </strong>
              <span style={{ fontSize: "12px", color: "#666" }}>
                {c.volume > 0 && <>{c.volume}/md</>}
                {c.volume > 0 && c.clicks > 0 && " · "}
                {c.clicks > 0 && <span style={{ color: "#1e7e34", fontWeight: 600 }}>{c.clicks} egne klik</span>}
              </span>
              {c.page ? (
                <span style={{ fontSize: "12px" }}>
                  → {c.productName} <span style={{ color: "#999" }}>{c.page}</span>{" "}
                  {c.productId ? (
                    <a
                      href={`/admin/ads/opret?produkt=${encodeURIComponent(c.productId)}`}
                      style={{ color: "#1e7e34", fontWeight: 600, whiteSpace: "nowrap" }}
                    >
                      Byg →
                    </a>
                  ) : (
                    <span style={{ color: "#8a6d3b" }} title="Byggeren er bundet til produkter — en gruppe mod en kategoriside laves i Google Ads-UI'et med fraserne her">
                      kategoriside — byg gruppen i Google Ads
                    </span>
                  )}
                </span>
              ) : (
                <span style={{ fontSize: "12px", color: "#8a6d3b", fontWeight: 600 }} title="Ingen side i kataloget kan besvare de her søgninger — byg siden før annoncen">
                  mangler side
                </span>
              )}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Søgefrase</th>
                    <th style={{ ...th, textAlign: "right" }}>Søgninger/md</th>
                    <th style={{ ...th, textAlign: "right" }}>Egne klik</th>
                    <th style={th}>Mønster</th>
                    <th style={th}>Kilde</th>
                    <th style={th}>Bemærk</th>
                  </tr>
                </thead>
                <tbody>
                  {c.keywords.map((k) => (
                    <tr key={k.text}>
                      <td style={{ ...td, fontWeight: k.clicks ? 600 : 400 }}>{k.text}</td>
                      <td style={{ ...td, textAlign: "right", color: k.volume ? "#222" : "#bbb" }}>{k.volume || "—"}</td>
                      <td style={{ ...td, textAlign: "right", color: k.clicks ? "#1e7e34" : "#bbb", fontWeight: k.clicks ? 600 : 400 }}>
                        {k.clicks || "—"}
                      </td>
                      <td style={{ ...td, color: "#666", fontSize: "12px" }}>{THEME_LABELS[k.intent]}</td>
                      <td style={{ ...td, color: "#666", fontSize: "12px" }}>{k.sources.join(" + ")}</td>
                      <td style={{ ...td, fontSize: "12px", color: "#8a6d3b" }}>
                        {k.outsideArea && (
                          <span style={{ color: "#c0392b" }}>Uden for området ({k.outsideArea}) — negativt keyword</span>
                        )}
                        {!k.outsideArea && k.coveredBy && `Fanges i dag af „${k.coveredBy}”`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
