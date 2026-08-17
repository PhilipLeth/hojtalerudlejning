"use client";

/**
 * Lagerfeltet — brugt både på /admin/produkter (på produktet) og /admin/lager
 * (i oversigten). Samme felt, samme regler, samme sted at gemme, så de to sider
 * ikke kan komme til at vise forskellige tal for det samme produkt.
 */

import { useState } from "react";
import { derivedStock } from "@/lib/stock";

/**
 * Antallet for ét produkt. Skriver først når feltet forlades — ellers ville
 * hvert tastetryk være en gemning. Tomt felt betyder "intet lagertal", altså
 * ubegrænset, og det skal man kunne vælge igen.
 */
export function StockNumberInput({ value, onCommit }: {
  value: number | null;
  onCommit: (v: number | null) => void;
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

  return (
    <input
      type="number"
      min={0}
      max={999}
      value={draft}
      placeholder="—"
      aria-label="Antal på lager"
      title="Hvor mange vi har. Tomt felt = intet lagertal, produktet kan bookes ubegrænset."
      onChange={(e) => { setEditing(true); setDraft(e.target.value); }}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      style={{
        width: "72px", padding: "8px 10px", fontSize: "14px", textAlign: "center",
        border: `1px solid ${value === null ? "#f0c36d" : "#ddd"}`, borderRadius: "6px",
        color: "#111", background: value === null ? "#fffbf0" : "#fff",
      }}
    />
  );
}

/** Pakkens lager kan ikke sættes — det er delenes mindste antal */
export function DerivedStock({ parts, stock }: { parts: string[]; stock: Record<string, number> }) {
  const derived = derivedStock(parts, stock);
  return (
    <span style={{ fontSize: "13px", color: "#666" }}>
      <strong style={{ color: derived === null ? "#b8860b" : "#111" }}>
        {derived === null ? "ubegrænset" : `${derived} stk.`}
      </strong>{" "}
      <span style={{ color: "#aaa" }}>følger delene: {parts.join(" + ")}</span>
    </span>
  );
}

/**
 * Lagerfeltet med label, som det står på produktet i /admin/produkter.
 * Pakker får den udledte tekst i stedet for et felt.
 */
export function StockField({ id, parts, stock, onSet, labelStyle }: {
  id: string;
  parts?: string[];
  stock: Record<string, number>;
  onSet: (id: string, v: number | null) => void;
  labelStyle?: React.CSSProperties;
}) {
  const value = stock[id] ?? null;
  return (
    <div>
      <label style={labelStyle}>Lager (antal)</label>
      {parts ? (
        <div style={{ paddingTop: "8px" }}>
          <DerivedStock parts={parts} stock={stock} />
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <StockNumberInput value={value} onCommit={(v) => onSet(id, v)} />
          <span style={{ fontSize: "11px", color: value === null ? "#b8860b" : "#aaa" }}>
            {value === null ? "ubegrænset — kan overbookes" : "gemmes med det samme"}
          </span>
        </div>
      )}
    </div>
  );
}
