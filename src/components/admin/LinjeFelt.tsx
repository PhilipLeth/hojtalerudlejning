"use client";

import { useState } from "react";

/**
 * Et tekstfelt, hvor hver linje er en ting: Indhold på produktkortet,
 * overskrifter og beskrivelser i annoncebyggeren.
 *
 * Feltet var ubrugeligt at skrive i. Værdien blev normaliseret ved HVERT
 * tastetryk — `.map(s => s.trim())` fjernede mellemrummet i enden i samme
 * øjeblik man skrev det, og `.filter(Boolean)` slettede den tomme linje, man
 * lige havde lavet med Enter. Teksten blev sendt retur uden dem, så man kunne
 * hverken sætte mellemrum eller linjeskifte.
 *
 * Nu holder feltet sin egen kladde, mens der skrives, og viser den råt.
 * Kataloget får stadig den rensede liste ved hvert tastetryk, så "Gem
 * ændringer" virker, uden at man først skal klikke ud af feltet. Ved blur
 * kastes kladden væk, og man ser præcis det, der bliver gemt — derfor står
 * der en linje om, at tomme linjer forsvinder, så oprydningen ikke ligner
 * endnu en fejl.
 *
 * Komponenten bor her og ikke i page.tsx, så den kan testes for det, den
 * gør, frem for hvordan den er skrevet — og så den samme fejl ikke skal
 * rettes tre steder. Annoncebyggeren havde den i forvejen, i to felter mere.
 *
 * Siderne har hver deres udseende på felter, så stilen kan overtages.
 */

/** Samme udseende som de øvrige felter på produktkortet. */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  boxSizing: "border-box",
  color: "#111",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#666",
  marginBottom: "4px",
};

export const INDHOLD_LABEL = "Indhold (én linje pr. ting — hover på kort)";

/** Linjerne som de gemmes: uden mellemrum i enderne og uden tomme linjer. */
export function rensLinjer(tekst: string): string[] {
  return tekst
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function LinjeFelt({
  label,
  value,
  onChange,
  hint = "Tomme linjer og mellemrum i enderne ryddes væk, når du klikker ud af feltet.",
  feltStil,
  labelStil,
  mindstRaekker = 3,
}: {
  label: string;
  value: string[] | undefined;
  onChange: (v: string[]) => void;
  /** Sæt til null for ingen forklaring under feltet */
  hint?: string | null;
  feltStil?: React.CSSProperties;
  labelStil?: React.CSSProperties;
  mindstRaekker?: number;
}) {
  const gemt = (value ?? []).join("\n");
  const [kladde, setKladde] = useState<string | null>(null);
  const tekst = kladde ?? gemt;

  return (
    <div>
      {/* Ingen id/htmlFor: feltet står flere gange på samme side, og ens
          id'er er ugyldig HTML. aria-label knytter navnet til feltet. */}
      <label style={{ ...labelStyle, ...labelStil }}>{label}</label>
      <textarea
        aria-label={label}
        rows={Math.min(14, Math.max(mindstRaekker, tekst.split("\n").length + 1))}
        value={tekst}
        onChange={(e) => {
          setKladde(e.target.value);
          onChange(rensLinjer(e.target.value));
        }}
        onBlur={() => setKladde(null)}
        style={{ ...inputStyle, ...feltStil, resize: "vertical", lineHeight: 1.5 }}
      />
      {hint && <p style={{ fontSize: "11px", color: "#888", margin: "2px 0 0" }}>{hint}</p>}
    </div>
  );
}
