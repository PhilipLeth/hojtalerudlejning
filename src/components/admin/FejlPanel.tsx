"use client";

/* ───── Fejl hos kunderne ─────
 *
 * Kunder skriver ikke, når noget går galt — de lukker fanen. Her står det, de
 * ikke fortalte: hvad der gik galt, hvornår, på hvilken enhed og i hvilket
 * trin. Grupperet, fordi ét mønster siger mere end tyve enkeltlinjer.
 */

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/useAdminAuth";

interface Opsummering {
  type: string;
  besked: string;
  antal: number;
  senest: string;
  enheder: string[];
}

interface Rapport {
  type: string;
  besked: string;
  enhed: string;
  side: string;
  tid: string;
  trin?: number;
  produkt?: string;
  fra?: string;
  til?: string;
  status?: number;
  svar?: string;
}

const ETIKET: Record<string, { tekst: string; farve: string }> = {
  booking_fejlede: { tekst: "Booking gik galt", farve: "#c0392b" },
  betaling_fejlede: { tekst: "Betaling gik galt", farve: "#c0392b" },
  ledighed_fejlede: { tekst: "Ledighed kunne ikke hentes", farve: "#8a6d3b" },
  udsolgt: { tekst: "Kunde mødt af udsolgt", farve: "#8a6d3b" },
  javascript: { tekst: "JavaScript-fejl", farve: "#666" },
  promise: { tekst: "Ubehandlet fejl", farve: "#666" },
};

const tid = (iso: string) =>
  new Date(iso).toLocaleString("da-DK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function FejlPanel({ secret }: { secret: string }) {
  const [opsummering, setOpsummering] = useState<Opsummering[]>([]);
  const [seneste, setSeneste] = useState<Rapport[]>([]);
  const [antal, setAntal] = useState(0);
  const [åben, setÅben] = useState(false);
  const [henter, setHenter] = useState(false);
  const [fejl, setFejl] = useState("");

  const hent = useCallback(async () => {
    if (!secret) return;
    setHenter(true);
    const r = await adminFetch("/api/fejl", secret);
    setHenter(false);
    if ("error" in r) {
      setFejl(r.error);
      return;
    }
    if (!r.res.ok) {
      setFejl(String(r.data.error || "Kunne ikke hente fejlene"));
      return;
    }
    setOpsummering((r.data.opsummering as Opsummering[]) ?? []);
    setSeneste((r.data.seneste as Rapport[]) ?? []);
    setAntal(Number(r.data.antal) || 0);
    setFejl("");
  }, [secret]);

  useEffect(() => {
    hent();
  }, [hent]);

  async function ryd() {
    if (!window.confirm("Ryd alle fejlrapporter? De kan ikke hentes tilbage.")) return;
    await adminFetch("/api/fejl", secret, { method: "DELETE" });
    await hent();
  }

  const alvorlige = opsummering.filter((o) => o.type === "booking_fejlede" || o.type === "betaling_fejlede");
  // Svarer på "er det kun mobil?" uden at man skal læse hver linje
  const påTelefon = seneste.filter((r) => r.enhed?.includes("telefon")).length;

  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "10px", padding: "14px 16px", marginBottom: "18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
        <strong style={{ fontSize: "14px" }}>Fejl hos kunderne</strong>
        {antal > 0 && (
          <span style={{ fontSize: "12px", color: alvorlige.length ? "#c0392b" : "#666" }}>
            {antal} rapport{antal === 1 ? "" : "er"} · {seneste.length > 0 ? `${påTelefon} af de seneste ${seneste.length} på telefon` : ""}
          </span>
        )}
        <button
          onClick={hent}
          disabled={henter}
          style={{ marginLeft: "auto", padding: "5px 11px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", color: "#555", cursor: "pointer" }}
        >
          {henter ? "Henter…" : "Opdater"}
        </button>
        {antal > 0 && (
          <button
            onClick={ryd}
            style={{ padding: "5px 11px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", color: "#999", cursor: "pointer" }}
          >
            Ryd
          </button>
        )}
      </div>

      <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
        Browseren melder selv ind, når noget går galt hos en kunde — mislykket booking eller betaling,
        ledighed der ikke kunne hentes, og JavaScript-fejl på sitet. Mislykkede bookinger giver også en push
        med det samme. Rapporterne indeholder hverken navn, mail eller telefon, og slettes efter 30 dage.
      </p>

      {fejl && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "8px 11px", borderRadius: "7px", fontSize: "12px", marginBottom: "10px" }}>
          {fejl}
        </div>
      )}

      {antal === 0 ? (
        <p style={{ fontSize: "12px", color: "#2f7a4d", margin: 0 }}>Ingen fejl registreret. 👍</p>
      ) : (
        <>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {opsummering.slice(0, 12).map((o, i) => {
              const e = ETIKET[o.type] ?? { tekst: o.type, farve: "#666" };
              return (
                <li key={i} style={{ padding: "6px 0", borderBottom: "1px solid #f5f5f5", fontSize: "12.5px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "baseline", flexWrap: "wrap" }}>
                    <span style={{ color: e.farve, fontWeight: 700 }}>{e.tekst}</span>
                    <span style={{ color: "#111" }}>{o.besked}</span>
                    <span style={{ marginLeft: "auto", color: "#aaa", fontSize: "11px" }}>
                      {o.antal}× · senest {tid(o.senest)}
                    </span>
                  </div>
                  {o.enheder.length > 0 && (
                    <div style={{ fontSize: "11px", color: "#999" }}>{o.enheder.slice(0, 4).join(" · ")}</div>
                  )}
                </li>
              );
            })}
          </ul>

          <button
            onClick={() => setÅben((v) => !v)}
            style={{ background: "none", border: "none", color: "#0070f3", cursor: "pointer", fontSize: "12px", padding: "10px 0 0" }}
          >
            {åben ? "Skjul detaljer" : "Vis de enkelte rapporter"}
          </button>

          {åben && (
            <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", fontSize: "11.5px", color: "#555" }}>
              {seneste.map((r, i) => (
                <li key={i} style={{ padding: "5px 0", borderTop: "1px solid #f5f5f5" }}>
                  <div>
                    <strong style={{ color: ETIKET[r.type]?.farve ?? "#666" }}>{ETIKET[r.type]?.tekst ?? r.type}</strong>
                    {" — "}
                    {r.besked}
                  </div>
                  <div style={{ color: "#999" }}>
                    {tid(r.tid)} · {r.enhed} · {r.side}
                    {r.trin != null ? ` · trin ${r.trin}` : ""}
                    {r.produkt ? ` · ${r.produkt}` : ""}
                    {r.fra ? ` · ${r.fra} → ${r.til}` : ""}
                    {r.status ? ` · HTTP ${r.status}` : ""}
                  </div>
                  {r.svar && <div style={{ color: "#c0392b" }}>{r.svar.slice(0, 160)}</div>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
