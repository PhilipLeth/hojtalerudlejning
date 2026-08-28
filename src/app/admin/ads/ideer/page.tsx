"use client";

/* ───── Find idéer til nye annoncegrupper ─────
 *
 * Byggeren svarer på "hvad skal jeg bruge til det her produkt". Den her
 * svarer på spørgsmålet man har, når man ikke ved hvor man skal starte:
 * hvor er der efterspørgsel, vi ikke dækker?
 *
 * Intet er valgt, og intet kan oprettes herfra. Listen peger — man går
 * videre i byggeren, hvis en idé er værd at forfølge.
 */

import AdminLogin from "@/components/AdminLogin";
import AdminNav from "@/components/AdminNav";
import { THEME_LABELS, type ThemeKey } from "@/lib/adsIntent";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Idea {
  text: string;
  volume: number;
  clicks: number;
  impressions: number;
  intent: ThemeKey;
  source: "google" | "egen";
  productId: string;
  productName: string;
  page: string;
  coveredBy: string | null;
  outsideArea: string | null;
}

interface Svar {
  round: number;
  pages: Array<{ id: string; name: string; page: string }>;
  totalPages: number;
  rounds: number;
  ideas: Idea[];
  minVolume: number;
  dækkedeProdukter: string[];
  error?: string;
}

const RUNDE_NØGLE = "ads-ideer-runde";

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

export default function AdsIdeerPage() {
  const { secret, ready, isLoggedIn, unauthorized } = useAdminAuth();
  const [round, setRound] = useState(0);
  const [data, setData] = useState<Svar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kunEgne, setKunEgne] = useState(false);
  const [skjulUdenfor, setSkjulUdenfor] = useState(true);

  // Rotationen huskes, så man ikke starter forfra hver gang siden åbnes
  useEffect(() => {
    const gemt = Number(window.localStorage.getItem(RUNDE_NØGLE));
    if (Number.isFinite(gemt) && gemt > 0) setRound(gemt);
  }, []);

  const load = useCallback(
    async (r: number) => {
      if (!secret) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/ads-ideas?secret=${encodeURIComponent(secret)}&round=${r}`);
        const json: Svar = await res.json();
        if (!res.ok) {
          if (res.status === 401) return unauthorized();
          setError(json.error || "Kunne ikke hente idéer");
          return;
        }
        setData(json);
        window.localStorage.setItem(RUNDE_NØGLE, String(r));
      } catch {
        setError("Netværksfejl");
      } finally {
        setLoading(false);
      }
    },
    [secret, unauthorized],
  );

  useEffect(() => {
    load(round);
  }, [load, round]);

  const synlige = useMemo(
    () =>
      (data?.ideas ?? [])
        .filter((i) => (kunEgne ? i.source === "egen" : true))
        .filter((i) => (skjulUdenfor ? !i.outsideArea : true)),
    [data, kunEgne, skjulUdenfor],
  );

  const udenfor = (data?.ideas ?? []).filter((i) => i.outsideArea);

  const egneKlik = (data?.ideas ?? []).filter((i) => i.source === "egen").length;

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Find idéer" />;

  return (
    <>
      <AdminNav
        title="Find idéer"
        actions={
          <button onClick={() => load(round)} disabled={loading} style={button}>
            {loading ? "Henter…" : "↺ Opdater"}
          </button>
        }
      />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px" }}>
        <p style={{ color: "#888", fontSize: "12px", margin: "0 0 16px" }}>
          Efterspørgsel vi <strong>ikke</strong> dækker. Alt der allerede ligger som keyword i kontoen er
          trukket fra — en idé er noget, der ikke er gjort endnu. Intet er valgt, og intet oprettes
          herfra; klik videre til{" "}
          <a href="/admin/ads/opret" style={{ color: "#1e7e34" }}>byggeren</a>, hvis en idé er værd at forfølge.
        </p>

        {error && <div style={banner("#fdecea", "#c0392b")}>{error}</div>}

        {data && (
          <div style={card}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => setRound((r) => r + 1)} disabled={loading} style={{ ...button, background: "#1e7e34", borderColor: "#1e7e34", color: "#fff" }}>
                Næste runde →
              </button>
              {round > 0 && (
                <button onClick={() => setRound(0)} disabled={loading} style={button}>
                  Start forfra
                </button>
              )}
              <span style={{ fontSize: "12px", color: "#666" }}>
                Runde {(round % Math.max(1, data.rounds)) + 1} af {data.rounds} · {data.totalPages} sider i kataloget
              </span>
              {egneKlik > 0 && (
                <label style={{ fontSize: "12px", color: "#555", display: "flex", gap: "6px", alignItems: "center" }}>
                  <input type="checkbox" checked={kunEgne} onChange={(e) => setKunEgne(e.target.checked)} />
                  Kun fraser vi har betalt klik på ({egneKlik})
                </label>
              )}
              {udenfor.length > 0 && (
                <label style={{ fontSize: "12px", color: "#555", display: "flex", gap: "6px", alignItems: "center" }}>
                  <input type="checkbox" checked={skjulUdenfor} onChange={(e) => setSkjulUdenfor(e.target.checked)} />
                  Skjul de {udenfor.length} uden for leveringsområdet
                </label>
              )}
            </div>
            <p style={{ fontSize: "12px", color: "#888", margin: "10px 0 0" }}>
              Denne runde kigger på: {data.pages.map((p) => p.name).join(" · ")}
            </p>
          </div>
        )}

        {data && !loading && synlige.length === 0 && (
          <div style={banner("#fff8e1", "#8a6d3b")}>
            <strong>Ingen udækket efterspørgsel på de her sider.</strong> Enten ejer vi allerede fraserne,
            eller også søger for få på dem ({data.minVolume}/md er nedre grænse). Prøv næste runde.
          </div>
        )}

        {synlige.length > 0 && (
          <div style={{ ...card, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Søgefrase</th>
                  <th style={{ ...th, textAlign: "right" }}>Søgninger/md</th>
                  <th style={{ ...th, textAlign: "right" }}>Egne klik</th>
                  <th style={th}>Mønster</th>
                  <th style={th}>Hører til</th>
                  <th style={th}>Bemærk</th>
                  <th style={th} />
                </tr>
              </thead>
              <tbody>
                {synlige.map((i) => (
                  <tr key={`${i.productId}|${i.text}`}>
                    <td style={{ ...td, fontWeight: i.clicks ? 600 : 400 }}>{i.text}</td>
                    <td style={{ ...td, textAlign: "right", color: i.volume ? "#222" : "#bbb" }}>{i.volume || "—"}</td>
                    <td style={{ ...td, textAlign: "right", color: i.clicks ? "#1e7e34" : "#bbb", fontWeight: i.clicks ? 600 : 400 }}>
                      {i.clicks || "—"}
                    </td>
                    <td style={{ ...td, color: "#666", fontSize: "12px" }}>{THEME_LABELS[i.intent]}</td>
                    <td style={{ ...td, fontSize: "12px" }}>
                      {i.productName}
                      <span style={{ color: "#999" }}> {i.page}</span>
                    </td>
                    <td style={{ ...td, fontSize: "12px", color: "#8a6d3b" }}>
                      {i.outsideArea && (
                        <span style={{ color: "#c0392b" }}>Uden for området ({i.outsideArea})</span>
                      )}
                      {!i.outsideArea && i.coveredBy && `Fanges i dag af „${i.coveredBy}”`}
                    </td>
                    <td style={td}>
                      {i.outsideArea ? (
                        <span style={{ fontSize: "12px", color: "#999", whiteSpace: "nowrap" }}>negativt keyword</span>
                      ) : (
                        <a
                          href={`/admin/ads/opret?produkt=${encodeURIComponent(i.productId)}`}
                          style={{ fontSize: "12px", color: "#1e7e34", fontWeight: 600, whiteSpace: "nowrap" }}
                        >
                          Byg →
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
