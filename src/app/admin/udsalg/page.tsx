"use client";

import { useState, useEffect, useCallback } from "react";

interface SaleOffer {
  productId: string;
  name: string;
  price: number;
  salePrice: number;
  stock: number;
  freePerDay: number[];
  freeAllWeekend: number;
  onSale: boolean;
  because: string;
}

interface WeekendSale {
  weekend: { from: string; to: string; days: string[] };
  offers: SaleOffer[];
  unitsOnSale: number;
  valueAtListPrice: number;
  discountCost: number;
}

interface Campaign {
  pct: number;
  excluded: string[];
  note?: string;
}

interface SaleResponse {
  today: string;
  campaign: Campaign;
  weekends: WeekendSale[];
  live: boolean;
  note: string;
  error?: string;
}

const navLink: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: "13px",
  color: "#555",
  textDecoration: "none",
  border: "1px solid #ddd",
  borderRadius: "6px",
  background: "#fff",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#888",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "9px 10px",
  fontSize: "13px",
  borderBottom: "1px solid #f2f2f2",
  verticalAlign: "middle",
};

const DAY_LABELS = ["Fre", "Lør", "Søn"];

function dk(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    ...opts,
  });
}

function weekendLabel(days: string[]): string {
  return `${dk(days[0], { weekday: "short" })} – ${dk(days[days.length - 1], { weekday: "short", year: "numeric" })}`;
}

function kr(n: number): string {
  return `${n.toLocaleString("da-DK")} kr`;
}

export default function UdsalgPage() {
  const [secret, setSecret] = useState("");
  const [data, setData] = useState<SaleResponse | null>(null);
  const [pct, setPct] = useState("20");
  const [excluded, setExcluded] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("admin_secret");
    if (stored) setSecret(stored);
    else window.location.href = "/admin";
  }, []);

  const load = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/udsalg?secret=${encodeURIComponent(secret)}&weekends=4`);
      const json: SaleResponse = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("admin_secret");
          window.location.href = "/admin";
          return;
        }
        setError(json.error || "Kunne ikke hente udsalget");
        return;
      }
      setData(json);
      setPct(String(json.campaign.pct));
      setExcluded(json.campaign.excluded);
      setNote(json.campaign.note ?? "");
      setDirty(false);
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => { load(); }, [load]);

  function toggleExcluded(id: string) {
    setExcluded((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/udsalg?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pct: Number(pct), excluded, note: note || undefined }),
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

  if (!secret) return null;

  // Produkterne til undtagelseslisten kommer fra lageret via første weekend
  const allProducts = (data?.weekends[0]?.offers ?? []).map((o) => ({ id: o.productId, name: o.name }));
  const first = data?.weekends[0];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "system-ui, sans-serif", color: "#111" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Fredagsudsalg</h1>
        <a href="/admin" style={navLink}>Bookinger</a>
        <a href="/admin/lager" style={navLink}>Lager</a>
        <a href="/admin/udsolgt" style={navLink}>Udsolgt</a>
        <a href="/admin/rabatkoder" style={navLink}>Rabatkoder</a>
        <button onClick={load} disabled={loading} style={{ ...navLink, cursor: "pointer" }}>
          {loading ? "Henter…" : "Opdater"}
        </button>
      </div>

      <div style={{ background: "#e8f0fe", color: "#174ea6", padding: "12px 14px", borderRadius: "8px", margin: "0 0 18px", fontSize: "13px" }}>
        <strong>Udsalget kører ikke.</strong> Ingen kunde kan bruge rabatten — hverken rabatkoder, booking-flowet
        eller Stripe kender kampagnen. Tallene viser, hvad du <em>ville</em> give rabat på, og hvad det ville koste.
      </div>

      {error && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
          {error}
        </div>
      )}

      {/* Kampagnens udkast */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "10px", padding: "14px 16px", marginBottom: "22px" }}>
        <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
            Rabat
            <input
              type="number"
              min={1}
              max={99}
              value={pct}
              onChange={(e) => { setPct(e.target.value); setDirty(true); }}
              style={{ width: "62px", padding: "5px 7px", fontSize: "13px", border: "1px solid #ddd", borderRadius: "6px", color: "#111" }}
            />
            %
          </label>
          <label style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", flex: "1 1 220px" }}>
            Note
            <input
              value={note}
              onChange={(e) => { setNote(e.target.value); setDirty(true); }}
              placeholder="Fx: kun når der er mindst 3 enheder tilbage"
              style={{ flex: 1, padding: "5px 7px", fontSize: "13px", border: "1px solid #ddd", borderRadius: "6px", color: "#111" }}
            />
          </label>
          <button
            onClick={save}
            disabled={saving || !dirty}
            style={{ padding: "6px 16px", fontSize: "13px", fontWeight: 600, background: dirty ? "#111" : "#eee", color: dirty ? "#fff" : "#999", border: "none", borderRadius: "6px", cursor: dirty ? "pointer" : "default" }}
          >
            {saving ? "Gemmer…" : dirty ? "Gem udkast" : "Gemt"}
          </button>
        </div>

        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f2f2f2" }}>
          <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>
            Undtag fra udsalg — dem der bliver udlejet til fuld pris alligevel
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {allProducts.length === 0 && <span style={{ fontSize: "13px", color: "#bbb" }}>Intet lager registreret</span>}
            {allProducts.map((p) => {
              const off = excluded.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleExcluded(p.id)}
                  style={{ padding: "4px 11px", fontSize: "12px", fontWeight: off ? 700 : 400, background: off ? "#fdecea" : "#f6f6f6", color: off ? "#c0392b" : "#555", border: `1px solid ${off ? "#dc3545" : "transparent"}`, borderRadius: "20px", cursor: "pointer" }}
                >
                  {off ? "⛔ " : ""}{p.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {first && first.unitsOnSale === 0 && (
        <div style={{ background: "#fff8e1", color: "#856404", padding: "12px 14px", borderRadius: "8px", marginBottom: "18px", fontSize: "13px" }}>
          <strong>Intet at sætte på udsalg i den kommende weekend.</strong> Alt er enten udlejet, undtaget eller
          kun ledigt en del af weekenden. Det er præcis de weekender, hvor et udsalg ville koste penge uden at
          flytte noget.
        </div>
      )}

      {(data?.weekends ?? []).map((w) => (
        <div key={w.weekend.from} style={{ marginBottom: "26px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
            <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>{weekendLabel(w.weekend.days)}</h2>
            <span style={{ fontSize: "13px", color: w.unitsOnSale > 0 ? "#0a7a43" : "#aaa" }}>
              {w.unitsOnSale} {w.unitsOnSale === 1 ? "enhed" : "enheder"} ledig hele weekenden
            </span>
            {w.unitsOnSale > 0 && (
              <span style={{ fontSize: "13px", color: "#888" }}>
                · {kr(w.valueAtListPrice)} til listepris · rabatten koster <strong>{kr(w.discountCost)}</strong>
              </span>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
              <thead>
                <tr>
                  <th style={th}>Produkt</th>
                  <th style={th}>Lager</th>
                  {DAY_LABELS.map((d) => <th key={d} style={{ ...th, textAlign: "center" }}>{d}</th>)}
                  <th style={{ ...th, textAlign: "center" }} title="Ledige enheder alle tre dage — det er dem der kan lejes til weekenden">Hele weekenden</th>
                  <th style={th}>Pris</th>
                  <th style={th}>Med rabat</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {w.offers.map((o) => (
                  <tr key={o.productId} style={{ opacity: o.onSale ? 1 : 0.55 }}>
                    <td style={{ ...td, fontWeight: o.onSale ? 600 : 400 }}>{o.name}</td>
                    <td style={td}>{o.stock}</td>
                    {o.freePerDay.map((free, i) => (
                      <td key={i} style={{ ...td, textAlign: "center", color: free > 0 ? "#111" : "#c0392b", fontWeight: free > 0 ? 400 : 700 }}>
                        {free > 0 ? free : "0"}
                      </td>
                    ))}
                    <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{o.freeAllWeekend}</td>
                    <td style={td}>{o.price > 0 ? kr(o.price) : "—"}</td>
                    <td style={{ ...td, fontWeight: o.onSale ? 700 : 400, color: o.onSale ? "#0a7a43" : "#aaa" }}>
                      {o.onSale ? kr(o.salePrice) : "—"}
                    </td>
                    <td style={td}>
                      {o.onSale ? (
                        <span style={{ padding: "2px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: "#d4edda", color: "#155724", border: "1px solid #28a745" }}>
                          På udsalg
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#999" }}>{o.because}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {data && (
        <p style={{ fontSize: "12px", color: "#aaa", marginTop: "24px", maxWidth: "760px", lineHeight: 1.6 }}>
          Beløbene er listepris pr. udlejning gange antal ledige enheder — uden dagstillæg, levering og tilvalg.
          De siger noget om størrelsesordenen, ikke om den faktiske omsætning. Tallene bruger samme
          lagerberegning som udsolgt-siden, så et produkt ikke kan være ledigt her og udsolgt der.
        </p>
      )}
    </div>
  );
}
