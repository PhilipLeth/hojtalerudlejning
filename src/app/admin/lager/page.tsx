"use client";

/**
 * Lager: hvor mange har vi af hvert produkt, og hvilke dage er spærret.
 *
 * Listen kommer fra produktkataloget — samme produkter, samme navne og samme
 * rækkefølge som /admin/produkter. Før stod her en hardkodet liste på ti
 * produkter med egne navne, mens kataloget havde ~60. De 50 andre kunne derfor
 * hverken tælles op eller blive udsolgt nogen steder.
 *
 * Pakker har ikke deres eget antal. Vi ejer ikke "en karaokepakke" — vi ejer en
 * karaokemaskine, en skærm og to højtalere — så pakkens tal er delenes mindste.
 */

import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";

import { useMemo, useState } from "react";
import { useAdminCatalog } from "@/lib/useAdminCatalog";
import { useLager } from "@/lib/useLager";
import {
  SECTION_LABELS,
  missingStock,
  stockItems,
  type StockItem,
  type StockSection,
} from "@/lib/stock";
import { DerivedStock, StockNumberInput } from "@/components/admin/StockField";

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  padding: "20px",
  marginBottom: "24px",
};

function StockRow({ item, stock, overbook, onSetStock, onSetOverbook }: {
  item: StockItem;
  stock: Record<string, number>;
  overbook: Record<string, number>;
  onSetStock: (id: string, v: number | null) => void;
  onSetOverbook: (id: string, v: number | null) => void;
}) {
  const owned = stock[item.id];
  const extra = overbook[item.id] ?? 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {item.name}
          {item.hidden && <span style={{ fontSize: "10px", color: "#dc3545", fontWeight: 700 }}>SKJULT</span>}
        </div>
        <div style={{ fontSize: "11px", color: "#aaa" }}>{item.id}</div>
      </div>
      {item.parts ? (
        // Pakken har ikke eget lager — den låner delenes
        <div style={{ textAlign: "right", maxWidth: "320px" }}>
          <DerivedStock parts={item.parts} stock={stock} overbook={overbook} />
        </div>
      ) : (
        <>
          <StockNumberInput value={owned ?? null} onCommit={(v) => onSetStock(item.id, v)} />
          <StockNumberInput
            value={overbook[item.id] ?? null}
            tone="overbook"
            onCommit={(v) => onSetOverbook(item.id, v)}
          />
          <div style={{ width: "120px", fontSize: "11px", color: owned === undefined ? "#b8860b" : "#bbb" }}>
            {owned === undefined
              ? "ubegrænset"
              : extra > 0
                ? `tager imod ${owned + extra}`
                : `${owned} stk. på lager`}
          </div>
        </>
      )}
    </div>
  );
}

/** "fre 21. aug 2026" */
function langDag(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function LagerPage() {
  const { secret, ready, isLoggedIn } = useAdminAuth();
  const catalog = useAdminCatalog();
  const lager = useLager(secret);
  const { stock } = lager;

  // Formularen til en ny blokering
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockProducts, setBlockProducts] = useState<string[]>([]);

  const items = useMemo(
    () => stockItems({ speakers: catalog.speakers, addons: catalog.addons, rentalProducts: catalog.rentalProducts }),
    [catalog.speakers, catalog.addons, catalog.rentalProducts],
  );
  const missing = useMemo(() => missingStock(items, stock), [items, stock]);

  const [filter, setFilter] = useState("");
  const shown = filter.trim()
    ? items.filter((i) => `${i.name} ${i.id}`.toLowerCase().includes(filter.trim().toLowerCase()))
    : items;

  const setOne = (id: string, v: number | null) => lager.saveStock({ [id]: v });
  const setOverbookOne = (id: string, v: number | null) => lager.saveOverbook({ [id]: v });

  /** Sæt alle produkter uden tal til 1 — det almindelige tilfælde: vi har én */
  const fillMissing = () => {
    if (!missing.length) return;
    if (!confirm(`Sæt lager til 1 for ${missing.length} produkter uden lagertal?\n\nDe kan derefter blive udsolgt som alle andre produkter.`)) return;
    lager.saveStock(Object.fromEntries(missing.map((i) => [i.id, 1])));
  };

  const addBlock = async () => {
    if (!blockDate) return;
    const ok = await lager.blockDate(blockDate, blockReason, blockProducts);
    if (ok) {
      setBlockDate("");
      setBlockReason("");
      setBlockProducts([]);
    }
  };

  const toggleBlockProduct = (id: string) =>
    setBlockProducts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Lager" />;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <AdminNav
        title="Lager"
        actions={<span style={{ fontSize: "12px", color: "#888" }}>{lager.saving ? "Gemmer…" : "Gemmes med det samme"}</span>}
      />

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
        {(catalog.error || lager.error) && (
          <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>
            {catalog.error || lager.error}
          </div>
        )}

        {/* Det vi allerede har taget imod ud over det vi ejer. En push er sendt da
            det skete, men en push kan swipes væk — den her liste bliver stående
            indtil udstyret er skaffet eller bookingen er væk. */}
        {lager.overbooked.length > 0 && (
          <div style={{ ...card, border: "2px solid #dc3545", background: "#fff8f7" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "18px", color: "#c0392b" }}>
              Skal skaffes ({lager.overbooked.length})
            </h2>
            <p style={{ fontSize: "13px", color: "#666", margin: "0 0 12px" }}>
              Overbooking vi har sagt ja til. Udstyret skal købes eller lejes ind inden dagen.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {lager.overbooked.map((h) => (
                <div key={`${h.id}_${h.day}`} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", padding: "8px 12px", background: "#fff", border: "1px solid #f3d0cd", borderRadius: "8px", fontSize: "14px" }}>
                  <strong>{h.name}</strong>
                  <span style={{ color: "#c0392b", fontWeight: 700 }}>
                    skaf {h.missing}
                  </span>
                  <span style={{ color: "#666" }}>
                    {h.booked} booket, vi har {h.owned}
                  </span>
                  <span style={{ marginLeft: "auto", color: "#888", fontSize: "13px" }}>{langDag(h.day)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={card}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap", marginBottom: "4px" }}>
            <h2 style={{ margin: 0, fontSize: "18px" }}>Lagerbeholdning</h2>
            <span style={{ fontSize: "12px", color: "#888" }}>{items.length} produkter fra kataloget</span>
          </div>
          <p style={{ fontSize: "13px", color: "#666", margin: "0 0 16px" }}>
            Antallet her er det, både booking-flowet, udsolgt-oversigten, kalenderen og
            annoncereglerne regner med. Navne og priser rettes under{" "}
            <a href="/admin/produkter" style={{ color: "#0070f3" }}>Produkter</a>, hvor de samme to tal står.
          </p>
          <p style={{ fontSize: "13px", color: "#666", margin: "0 0 16px" }}>
            <strong style={{ color: "#7c5cd6" }}>Overbooking</strong> er hvor mange vi tager imod ud over
            lageret, fordi de kan købes eller lejes ind til dagen. Sker det, kommer der en push —
            og produktet står i "Skal skaffes" til det er hjemme.
          </p>

          {missing.length > 0 && (
            <div style={{ background: "#fff8e1", border: "1px solid #f0c36d", borderRadius: "8px", padding: "12px 14px", marginBottom: "16px" }}>
              <strong style={{ fontSize: "13px" }}>{missing.length} produkter har ikke noget lagertal</strong>
              <p style={{ fontSize: "12px", color: "#665", margin: "4px 0 8px" }}>
                Uden et tal kan produktet bookes ubegrænset: hverken kunden, udsolgt-oversigten
                eller kalenderen kan se at det allerede er ude. Sæt et antal på hver af dem — eller
                sæt dem alle til 1, hvis vi har én af hver.
              </p>
              <button
                onClick={fillMissing}
                style={{ padding: "6px 14px", fontSize: "13px", fontWeight: 600, background: "#111", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                Sæt {missing.length} produkter til 1
              </button>
            </div>
          )}

          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Søg i produkter…"
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "8px", color: "#111" }}
          />

          {(catalog.loading || lager.loading) && <p style={{ color: "#888", fontSize: "13px" }}>Henter…</p>}

          {/* Hvad de to talfelter betyder — ellers er de bare to bokse */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#aaa", marginTop: "8px" }}>
            <span style={{ width: "72px", textAlign: "center" }}>Lager</span>
            <span style={{ width: "72px", textAlign: "center", color: "#7c5cd6" }}>Overbooking</span>
            <span style={{ width: "120px" }} />
          </div>

          <div aria-label="Lagerliste">
          {(["speakers", "rentals", "addons"] as StockSection[]).map((section) => {
            const rows = shown.filter((i) => i.section === section);
            if (!rows.length) return null;
            return (
              <div key={section} style={{ marginTop: "16px" }}>
                <h3 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#888", margin: "0 0 4px" }}>
                  {SECTION_LABELS[section]} ({rows.length})
                </h3>
                {rows.map((item) => (
                  <StockRow
                    key={item.id}
                    item={item}
                    stock={stock}
                    overbook={lager.overbook}
                    onSetStock={setOne}
                    onSetOverbook={setOverbookOne}
                  />
                ))}
              </div>
            );
          })}
          </div>
        </div>

        <div style={card}>
          <h2 style={{ margin: "0 0 4px", fontSize: "18px" }}>Blokerede datoer</h2>
          <p style={{ fontSize: "13px", color: "#666", margin: "0 0 16px" }}>
            En blokeret dato tæller som udsolgt. Vælger du ingen produkter, spærres alle.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>Dato</label>
              <input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                style={{ padding: "6px 10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "6px", color: "#111" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>Årsag</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="F.eks. vedligeholdelse"
                style={{ padding: "6px 10px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "6px", width: "200px", color: "#111" }}
              />
            </div>
            <button
              onClick={addBlock}
              disabled={!blockDate || lager.saving}
              style={{ padding: "6px 16px", fontSize: "14px", fontWeight: 600, background: !blockDate ? "#e0e0e0" : "#c0392b", color: "#fff", border: "none", borderRadius: "6px", cursor: lager.saving ? "wait" : "pointer", opacity: !blockDate ? 0.5 : 1 }}
            >
              {lager.saving ? "Blokerer..." : "Bloker"}
            </button>
          </div>

          {/* Produktvalget kommer fra kataloget — samme liste som lagertallene ovenfor */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>
              Produkter ({blockProducts.length === 0 ? "alle" : `${blockProducts.length} valgt`})
            </label>
            <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #eee", borderRadius: "8px", padding: "8px 10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {items.map((item) => {
                const on = blockProducts.includes(item.id);
                return (
                  <label
                    key={item.id}
                    style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", cursor: "pointer", padding: "3px 9px", border: `1px solid ${on ? "#c0392b" : "#ddd"}`, borderRadius: "20px", background: on ? "#fdecea" : "#fff", color: on ? "#c0392b" : "#555" }}
                  >
                    <input type="checkbox" checked={on} onChange={() => toggleBlockProduct(item.id)} />
                    {item.name}
                  </label>
                );
              })}
            </div>
          </div>

          {lager.blocked.length === 0 ? (
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Ingen blokerede datoer</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {lager.blocked.map((bd) => (
                <div key={bd.date} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", background: "#fef3f2", borderRadius: "8px", fontSize: "14px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600 }}>{bd.date}</span>
                  {bd.reason && <span style={{ color: "#666" }}>{bd.reason}</span>}
                  <span style={{ color: "#888", fontSize: "12px" }}>
                    {bd.products.length === 0
                      ? "(alle produkter)"
                      : `(${bd.products.map((p) => items.find((i) => i.id === p)?.name || p).join(", ")})`}
                  </span>
                  <button
                    onClick={() => lager.unblockDate(bd.date)}
                    style={{ marginLeft: "auto", padding: "2px 10px", fontSize: "12px", background: "#fff", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", color: "#c0392b" }}
                  >
                    Fjern
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
