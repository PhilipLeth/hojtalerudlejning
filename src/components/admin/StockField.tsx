"use client";

/**
 * Lagerfelterne — brugt både på /admin/produkter (på produktet) og /admin/lager
 * (i oversigten). Samme felter, samme regler, samme sted at gemme, så de to
 * sider ikke kan komme til at vise forskellige tal for det samme produkt.
 *
 * Der er to tal pr. produkt:
 *   Lager        — hvad vi ejer og har på hylden.
 *   Overbooking  — hvor mange vi derudover tager imod, fordi de kan købes eller
 *                  lejes ind til dagen (JIT). Sker det, kommer der en push.
 */

import { useState } from "react";
import { bookableMap, derivedStock } from "@/lib/stock";

/**
 * Et antal. Skriver først når feltet forlades — ellers ville hvert tastetryk
 * være en gemning. Tomt felt betyder "intet tal", og det skal man kunne vælge
 * igen: uden lagertal er produktet ubegrænset, uden overbooking tager vi kun
 * imod det vi ejer.
 */
export function StockNumberInput({ value, onCommit, tone = "stock", title }: {
  value: number | null;
  onCommit: (v: number | null) => void;
  /** "stock" = hvad vi ejer, "overbook" = hvad vi kan skaffe */
  tone?: "stock" | "overbook";
  title?: string;
}) {
  const asText = value === null ? "" : String(value);
  const [draft, setDraft] = useState(asText);
  const [editing, setEditing] = useState(false);
  // Serveren kan have rettet tallet (fx "sæt alle til 1") — følg med, men ikke
  // mens man selv står og skriver i feltet
  if (!editing && draft !== asText) setDraft(asText);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === "") {
      if (value !== null) onCommit(null);
      return;
    }
    const n = Math.max(0, Math.min(999, Math.round(Number(trimmed) || 0)));
    setDraft(String(n));
    if (n !== value) onCommit(n);
  };

  const tom = value === null;
  const farve = tone === "overbook"
    ? { border: tom ? "#ddd" : "#7c5cd6", bg: tom ? "#fff" : "#f6f2ff" }
    : { border: tom ? "#f0c36d" : "#ddd", bg: tom ? "#fffbf0" : "#fff" };

  return (
    <input
      type="number"
      min={0}
      max={999}
      value={draft}
      placeholder={tone === "overbook" ? "0" : "—"}
      aria-label={tone === "overbook" ? "Overbooking" : "Antal på lager"}
      title={title || (tone === "overbook"
        ? "Hvor mange vi tager imod ud over lageret, fordi de kan skaffes til dagen. Tom = ingen overbooking."
        : "Hvor mange vi har. Tomt felt = intet lagertal, produktet kan bookes ubegrænset.")}
      onChange={(e) => { setEditing(true); setDraft(e.target.value); }}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      style={{
        width: "72px", padding: "8px 10px", fontSize: "14px", textAlign: "center",
        border: `1px solid ${farve.border}`, borderRadius: "6px",
        color: "#111", background: farve.bg,
      }}
    />
  );
}

/** Pakkens tal kan ikke sættes — de er delenes mindste */
export function DerivedStock({ parts, stock, overbook }: {
  parts: string[];
  stock: Record<string, number>;
  overbook?: Record<string, number>;
}) {
  const owned = derivedStock(parts, stock);
  const bookable = overbook ? derivedStock(parts, bookableMap(stock, overbook)) : owned;
  const extra = owned !== null && bookable !== null ? bookable - owned : 0;

  return (
    <span style={{ fontSize: "13px", color: "#666" }}>
      <strong style={{ color: owned === null ? "#b8860b" : "#111" }}>
        {owned === null ? "ubegrænset" : `${owned} stk.`}
      </strong>
      {extra > 0 && <span style={{ color: "#7c5cd6", fontWeight: 700 }}> +{extra} JIT</span>}{" "}
      <span style={{ color: "#aaa" }}>følger delene: {parts.join(" + ")}</span>
    </span>
  );
}

/**
 * Lager og overbooking som de står på produktet i /admin/produkter. To celler i
 * produktets felt-grid; pakker får den udledte tekst i stedet for felter.
 */
export function StockField({ id, parts, stock, overbook, onSetStock, onSetOverbook, labelStyle }: {
  id: string;
  parts?: string[];
  stock: Record<string, number>;
  overbook: Record<string, number>;
  onSetStock: (id: string, v: number | null) => void;
  onSetOverbook: (id: string, v: number | null) => void;
  labelStyle?: React.CSSProperties;
}) {
  const owned = stock[id] ?? null;
  const extra = overbook[id] ?? null;

  if (parts) {
    return (
      <div>
        <label style={labelStyle}>Lager (antal)</label>
        <div style={{ paddingTop: "8px" }}>
          <DerivedStock parts={parts} stock={stock} overbook={overbook} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <label style={labelStyle}>Lager (antal)</label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <StockNumberInput value={owned} onCommit={(v) => onSetStock(id, v)} />
          <span style={{ fontSize: "11px", color: owned === null ? "#b8860b" : "#aaa" }}>
            {owned === null ? "ubegrænset — kan overbookes" : "gemmes med det samme"}
          </span>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Overbooking (kan skaffes)</label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <StockNumberInput value={extra} tone="overbook" onCommit={(v) => onSetOverbook(id, v)} />
          <span style={{ fontSize: "11px", color: "#888" }}>
            {owned === null
              ? "kræver et lagertal"
              : extra
                ? `tager imod ${owned + extra} — ${extra} skal købes/lejes ind`
                : "vi tager kun imod det vi ejer"}
          </span>
        </div>
      </div>
    </>
  );
}
